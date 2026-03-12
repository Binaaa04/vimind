package models

import "time"

type Question struct {
	ID        int    `json:"id"`
	Code      string `json:"code"`
	Name      string `json:"name"`
	DiseaseID int    `json:"disease_id"`
}

type Answer struct {
	SymptomID int     `json:"symptom_id"`
	Value     float64 `json:"value"` // 0.0 to 1.0
}

type DiagnosisRequest struct {
	Answers          []Answer `json:"answers"`
	UserEmail        string   `json:"user_email"`
	RefinedDiseaseID int      `json:"refined_disease_id"` // If set, anchor result to this disease
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

type ProfileReq struct {
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
}

type HistoryItem struct {
	ID         int       `json:"id"`
	Disease    string    `json:"disease"`
	Level      string    `json:"level"`
	Percentage float64   `json:"percentage"`
	Date       time.Time `json:"date"`
}

type Rule struct {
	DiseaseID int
	Name      string
	Desc      string
	SymptomID int
	ExpertCF  float64
	Solutions string
}

type NewsItem struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Link      string `json:"link"`
	Image     string `json:"image"`
	Source    string `json:"source"`
	Highlight string `json:"highlight"`
}
