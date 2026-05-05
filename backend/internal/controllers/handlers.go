package controllers

import (
	"fmt"
	"log"
	"strings"

	"pbl-vimind/backend/internal/models"
	"pbl-vimind/backend/internal/repository"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Repo *repository.Repository
}

func NewHandler(repo *repository.Repository) *Handler {
	return &Handler{Repo: repo}
}

func (h *Handler) GetQuestions(c *fiber.Ctx) error {
	mode := c.Query("mode", "default")
	idsStr := c.Query("disease_ids")
	email := c.Query("email")
	
	var diseaseIDs []int
	isRefined := false

	if mode == "refined" && email != "" {
		lastDiseaseID, err := h.Repo.GetLatestDiagnosisDiseaseID(email)
		if err == nil && lastDiseaseID > 0 && lastDiseaseID != 10 { // 10 is Normal/Sehat
			diseaseIDs = append(diseaseIDs, lastDiseaseID)
			isRefined = true // Confirmed: user has history → will get targeted questions
		} else {
			// Fallback to "all" if no history or history is Normal
			mode = "all"
		}
	} else if mode == "refined" && email == "" {
		// Guest user fallback
		mode = "all"
	} else if idsStr != "" {
		parts := strings.Split(idsStr, ",")
		for _, p := range parts {
			var id int
			fmt.Sscanf(p, "%d", &id)
			if id > 0 {
				diseaseIDs = append(diseaseIDs, id)
			}
		}
	}

	questions, err := h.Repo.GetQuestions(mode, diseaseIDs)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions"})
	}

	// If refined mode returned nothing (e.g. Guest or Invalid ID), fallback to "all"
	if len(questions) == 0 && mode == "refined" {
		questions, _ = h.Repo.GetQuestions("all", nil)
	}

	// Include is_refined flag and history_disease_id so frontend knows whether to skip Phase 2
	// and which disease ID to anchor the final diagnosis to
	historyDiseaseID := 0
	if isRefined && len(diseaseIDs) > 0 {
		historyDiseaseID = diseaseIDs[0]
	}
	return c.JSON(fiber.Map{
		"questions":          questions,
		"is_refined":         isRefined,
		"history_disease_id": historyDiseaseID,
	})
}

// GetDiscoveryQuestions - Logic pemilihan tersangka pindah ke backend untuk keamanan
func (h *Handler) GetDiscoveryQuestions(c *fiber.Ctx) error {
	var body struct {
		Answers []struct {
			SymptomID int     `json:"symptom_id"`
			Value     float64 `json:"value"`
			DiseaseID int     `json:"disease_id"`
		} `json:"answers"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// 1. Identifikasi gejala yang dijawab "Mungkin" ke atas (>= 0.7)
	var strongSymptomIDs []int
	for _, a := range body.Answers {
		if a.Value >= 0.7 {
			strongSymptomIDs = append(strongSymptomIDs, a.SymptomID)
		}
	}

	// 2. Cari penyakit apa saja yang berhubungan dengan gejala-gejala tersebut di DB
	// Ini jauh lebih aman karena tidak bergantung pada disease_id dari frontend (yang bisa jadi 0)
	var finalSuspects []int
	if len(strongSymptomIDs) > 0 {
		ids, err := h.Repo.GetSuspectDiseases(strongSymptomIDs)
		if err == nil {
			finalSuspects = ids
		}
	}

	// 3. Fallback jika tidak ada tersangka kuat (ambil default ID penyakit 1 dan 2)
	// Pastikan finalSuspects TIDAK berisi 0
	if len(finalSuspects) == 0 {
		finalSuspects = []int{1, 2}
	}

	// Filter out ID 0 just in case
	var filteredSuspects []int
	for _, id := range finalSuspects {
		if id > 0 {
			filteredSuspects = append(filteredSuspects, id)
		}
	}
	if len(filteredSuspects) == 0 {
		filteredSuspects = []int{1, 2}
	}

	questions, err := h.Repo.GetQuestions("discovery", filteredSuspects)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch discovery questions"})
	}

	return c.JSON(fiber.Map{"questions": questions})
}

func (h *Handler) Diagnose(c *fiber.Ctx) error {
	var req models.DiagnosisRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if len(req.Answers) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "No answers provided"})
	}

	userAnswers := make(map[int]float64)
	for _, ans := range req.Answers {
		// Security: Validate that value is between 0 and 1
		if ans.Value < 0 || ans.Value > 1 {
			return c.Status(400).JSON(fiber.Map{"error": "Manipulasi data terdeteksi! Nilai harus antara 0 dan 1."})
		}
		userAnswers[ans.SymptomID] = ans.Value
	}

	// REFINED MODE: If anchoring to a specific disease, only evaluate that disease.
	// This prevents other diseases (which share overlapping symptoms) from outscoring
	// the anchored disease and causing an inconsistent result label for the user.
	isRefinedAnchor := req.RefinedDiseaseID > 0 && req.RefinedDiseaseID != 10

	rules, err := h.Repo.GetAllRules()
	if err != nil {
		log.Printf("Error fetching diagnostic rules: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch diagnostic rules"})
	}

	resultsMap := make(map[int]*models.DiseaseCF)
	for _, r := range rules {
		// In refined mode, skip any rule not belonging to the anchored disease
		if isRefinedAnchor && r.DiseaseID != req.RefinedDiseaseID {
			continue
		}

		if _, ok := resultsMap[r.DiseaseID]; !ok {
			resultsMap[r.DiseaseID] = &models.DiseaseCF{Name: r.Name, Description: r.Desc, Solutions: r.Solutions, CF: 0.0}
		}

		if userVal, answered := userAnswers[r.SymptomID]; answered {
			cfEntry := userVal * r.ExpertCF
			currentCF := resultsMap[r.DiseaseID].CF
			resultsMap[r.DiseaseID].CF = currentCF + cfEntry*(1-currentCF)
		}
	}

	// Only apply historical weight IF we are in refined/anchored mode (Tracking)
	if isRefinedAnchor && req.UserEmail != "" {
		if lastDiseaseID, err := h.Repo.GetLatestDiagnosisDiseaseID(req.UserEmail); err == nil && lastDiseaseID > 0 && lastDiseaseID != 10 {
			if entry, ok := resultsMap[lastDiseaseID]; ok {
				// Add historical bias: combine 0.5 prior with current CF
				// This makes the tracking consistent but doesn't override new diseases in 'New Test' mode
				combined := 0.5 + entry.CF*(1-0.5)
				entry.CF = combined
			}
		}
	}

	var finalResults []models.DiagnosisResult
	for _, res := range resultsMap {
		if res.CF > 0 {
			finalResults = append(finalResults, models.DiagnosisResult{
				DiseaseName:     res.Name,
				Description:     res.Description,
				CFValue:         res.CF,
				Percentage:      res.CF * 100,
				Recommendations: res.Solutions,
			})
		}
	}

	// Sort manually (simple bubble sort)
	for i := 0; i < len(finalResults); i++ {
		for j := i + 1; j < len(finalResults); j++ {
			if finalResults[i].CFValue < finalResults[j].CFValue {
				finalResults[i], finalResults[j] = finalResults[j], finalResults[i]
			}
		}
	}

	if len(finalResults) == 0 {
		if isRefinedAnchor {
			// If tracking a specific disease but CF is 0, still return that disease with 0%
			diseaseName, _ := h.Repo.GetDiseaseNameByID(req.RefinedDiseaseID)
			finalResults = append(finalResults, models.DiagnosisResult{
				DiseaseName:     diseaseName,
				Description:     "Based on your recent answers, the symptoms for this condition are minimal or no longer detected.",
				CFValue:         0,
				Percentage:      0,
				Recommendations: "Maintain a healthy lifestyle and continue to monitor your condition independently.",
			})
		} else {
			finalResults = append(finalResults, models.DiagnosisResult{
				DiseaseName:     "Mentally Stable (Healthy)",
				Description:     "Based on your answers, there are no significant indications of mental health issues. Your current mental condition is considered stable and healthy.",
				CFValue:         0,
				Percentage:      0,
				Recommendations: "Continue to maintain adequate sleep, exercise regularly, and make time for relaxation or hobbies.",
			})
		}
	}

	top := finalResults[0]
	var internalUserID *int

	if req.UserEmail != "" {
		uid, err := h.Repo.GetUserIDByEmail(req.UserEmail)
		if err != nil {
			// Auto-create
			uid, err = h.Repo.CreateUser(req.UserEmail, strings.Split(req.UserEmail, "@")[0])
			if err == nil {
				internalUserID = &uid
			}
		} else {
			internalUserID = &uid
		}
	}

	if internalUserID != nil {
		levelID := 1 // Default: Low
		if top.Percentage > 70 {
			levelID = 3 // High
		} else if top.Percentage > 40 {
			levelID = 2 // Moderate
		} else {
			levelID = 1 // Low
		}

		topDiseaseID, err := h.Repo.GetDiseaseIDByName(top.DiseaseName)
		if err == nil {
			diagnosisID, err := h.Repo.SaveDiagnosis(*internalUserID, topDiseaseID, levelID, top.CFValue, top.Percentage)
			if err == nil {
				for _, ans := range req.Answers {
					h.Repo.SaveDiagnosisDetail(diagnosisID, ans.SymptomID, ans.Value)
				}
			}
		}
	}

	return c.JSON(fiber.Map{
		"top_result":  top,
		"all_results": finalResults,
	})
}

func (h *Handler) GetProfile(c *fiber.Ctx) error {
	email := c.Query("email")
	if email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	id, name, userEmail, avatarURL, role, err := h.Repo.GetProfile(email)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(fiber.Map{
		"id":         id,
		"name":       name,
		"email":      userEmail,
		"avatar_url": avatarURL,
		"role":       role,
	})
}

func (h *Handler) UpdateProfile(c *fiber.Ctx) error {
	var pr models.ProfileReq
	if err := c.BodyParser(&pr); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	err := h.Repo.UpsertProfile(pr.Email, pr.Name, pr.AvatarURL)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update profile"})
	}

	return c.JSON(fiber.Map{"message": "Profile updated successfully"})
}

func (h *Handler) GetHistory(c *fiber.Ctx) error {
	email := c.Query("email")
	if email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	uid, err := h.Repo.GetUserIDByEmail(email)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	history, err := h.Repo.GetHistory(uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch history"})
	}

	return c.JSON(history)
}

func (h *Handler) DeleteAccount(c *fiber.Ctx) error {
	email := c.Query("email")
	if email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	err := h.Repo.DeleteUser(email)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete account"})
	}

	return c.JSON(fiber.Map{"message": "Account deleted successfully"})
}

func (h *Handler) GetPublicBanners(c *fiber.Ctx) error {
	list, err := h.Repo.GetPublicBanners()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch banners"})
	}
	if list == nil {
		list = []models.Banner{}
	}
	return c.JSON(list)
}

// ============================================================
// Level Category (CF User Weights)
// ============================================================

func (h *Handler) GetLevelCategories(c *fiber.Ctx) error {
	list, err := h.Repo.GetLevelCategories()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch level categories"})
	}
	if list == nil {
		list = []models.LevelCategory{}
	}
	return c.JSON(list)
}
