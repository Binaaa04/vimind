package diagnosis

import "time"

type Question struct {
	ID        int    `json:"id"`
	Code      string `json:"code"`
	Name      string `json:"name"`
	DiseaseID int    `json:"disease_id"`
}

type Answer struct {
	SymptomID int     `json:"symptom_id"`
	Value     float64 `json:"value"`
}

type DiagnosisRequest struct {
	Answers          []Answer `json:"answers"`
	UserEmail        string   `json:"user_email"`
	RefinedDiseaseID int      `json:"refined_disease_id"`
}

type DiagnosisResult struct {
	DiseaseName     string  `json:"disease_name"`
	Description     string  `json:"description"`
	CFValue         float64 `json:"cf_value"`
	Percentage      float64 `json:"percentage"`
	Recommendations string  `json:"recommendations"`
}

type DiseaseCF struct {
	Name        string
	Description string
	Solutions   string
	CF          float64
}

type Rule struct {
	DiseaseID int
	Name      string
	Desc      string
	SymptomID int
	ExpertCF  float64
	Solutions string
}

type HistoryItem struct {
	ID              int       `json:"id"`
	Disease         string    `json:"disease"`
	Description     string    `json:"description"`
	Recommendations string    `json:"recommendations"`
	Level           string    `json:"level"`
	Percentage      float64   `json:"percentage"`
	Date            time.Time `json:"date"`
}

type LevelCategory struct {
	LevelID   int     `json:"level_id"`
	LevelName string  `json:"level_name"`
	CFValue   float64 `json:"cf_value"`
}
