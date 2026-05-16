package diagnosis

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CalculateCF(answers []Answer, refinedDiseaseID int, userUID int) ([]DiagnosisResult, error) {
	userAnswers := make(map[int]float64)
	for _, ans := range answers {
		if ans.Value < 0 || ans.Value > 1 {
			continue
		}
		userAnswers[ans.SymptomID] = ans.Value
	}

	isRefinedAnchor := refinedDiseaseID > 0 && refinedDiseaseID != 10

	rules, err := s.repo.GetAllRules()
	if err != nil {
		return nil, err
	}

	resultsMap := make(map[int]*DiseaseCF)
	for _, r := range rules {
		if isRefinedAnchor && r.DiseaseID != refinedDiseaseID {
			continue
		}

		if _, ok := resultsMap[r.DiseaseID]; !ok {
			resultsMap[r.DiseaseID] = &DiseaseCF{Name: r.Name, Description: r.Desc, Solutions: r.Solutions, CF: 0.0}
		}

		if userVal, answered := userAnswers[r.SymptomID]; answered {
			cfEntry := userVal * r.ExpertCF
			currentCF := resultsMap[r.DiseaseID].CF
			resultsMap[r.DiseaseID].CF = currentCF + cfEntry*(1-currentCF)
		}
	}

	if isRefinedAnchor && userUID > 0 {
		if lastDiseaseID, err := s.repo.GetLatestDiagnosisDiseaseID(userUID); err == nil && lastDiseaseID > 0 && lastDiseaseID != 10 {
			if entry, ok := resultsMap[lastDiseaseID]; ok {
				combined := 0.5 + entry.CF*(1-0.5)
				entry.CF = combined
			}
		}
	}

	var finalResults []DiagnosisResult
	for _, res := range resultsMap {
		if res.CF > 0 {
			finalResults = append(finalResults, DiagnosisResult{
				DiseaseName:     res.Name,
				Description:     res.Description,
				CFValue:         res.CF,
				Percentage:      res.CF * 100,
				Recommendations: res.Solutions,
			})
		}
	}

	for i := 0; i < len(finalResults); i++ {
		for j := i + 1; j < len(finalResults); j++ {
			if finalResults[i].CFValue < finalResults[j].CFValue {
				finalResults[i], finalResults[j] = finalResults[j], finalResults[i]
			}
		}
	}

	if len(finalResults) == 0 {
		if isRefinedAnchor {
			diseaseName, _ := s.repo.GetDiseaseNameByID(refinedDiseaseID)
			finalResults = append(finalResults, DiagnosisResult{
				DiseaseName:     diseaseName,
				Description:     "Based on your recent answers, the symptoms for this condition are minimal or no longer detected.",
				CFValue:         0,
				Percentage:      0,
				Recommendations: "Maintain a healthy lifestyle and continue to monitor your condition independently.",
			})
		} else {
			finalResults = append(finalResults, DiagnosisResult{
				DiseaseName:     "Mental Stabil (Healthy)",
				Description:     "Based on your answers, there are no significant indications of mental health issues. Your current mental condition is considered stable and healthy.",
				CFValue:         0,
				Percentage:      0,
				Recommendations: "Continue to maintain adequate sleep, exercise regularly, and make time for relaxation or hobbies.",
			})
		}
	}

	return finalResults, nil
}

func (s *Service) DetermineLevelID(percentage float64) int {
	if percentage > 70 {
		return 1
	} else if percentage > 40 {
		return 2
	} else if percentage > 20 {
		return 3
	}
	return 4
}
