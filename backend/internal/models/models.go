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

// ============================================================
// Admin Models
// ============================================================

// Matches existing `promotion` table in Supabase
type Banner struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	ImageURL     string `json:"image_url"`
	LinkURL      string `json:"link_url"`
	IsActive     bool   `json:"is_active"`
	DisplayOrder int    `json:"display_order"`
}

type BannerUpsertReq struct {
	ID           string `json:"id"` // Empty = insert, Else = update
	Title        string `json:"title"`
	ImageURL     string `json:"image_url"`
	LinkURL      string `json:"link_url"`
	IsActive     bool   `json:"is_active"`
	DisplayOrder int    `json:"display_order"`
}

// Matches existing `faq` table in Supabase
type FAQItem struct {
	ID       string `json:"id"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type FAQUpsertReq struct {
	ID       string `json:"id"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

// 📰 Article models for News management
type Article struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	ImageURL  string    `json:"image_url"`
	LinkURL   string    `json:"link_url"`
	Source    string    `json:"source"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

type ArticleUpsertReq struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	ImageURL string `json:"image_url"`
	LinkURL  string `json:"link_url"`
	Source   string `json:"source"`
	IsActive bool   `json:"is_active"`
}

// ============================================================
// Feedback Models
// ============================================================

type Testimonial struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Rating      int    `json:"rating"`
	Comment     string `json:"comment"`
	IsDisplayed bool   `json:"is_displayed"`
}

type AccountFeedback struct {
	ID        int    `json:"id"`
	Email     string `json:"email"`
	Reason    string `json:"reason"`
	CreatedAt string `json:"created_at"`
}

type AdminSymptom struct {
	ID   int    `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

type AdminDisease struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Solutions   string `json:"solutions"`
}

type AdminRule struct {
	RuleID    int     `json:"rule_id"`
	DiseaseID int     `json:"disease_id"`
	SymptomID int     `json:"symptom_id"`
	CFValue   float64 `json:"cf_value"`
}
