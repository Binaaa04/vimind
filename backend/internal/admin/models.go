package admin

import "time"

type Banner struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	ImageURL     string `json:"image_url"`
	LinkURL      string `json:"link_url"`
	IsActive     bool   `json:"is_active"`
	DisplayOrder int    `json:"display_order"`
}

type BannerUpsertReq struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	ImageURL     string `json:"image_url"`
	LinkURL      string `json:"link_url"`
	IsActive     bool   `json:"is_active"`
	DisplayOrder int    `json:"display_order"`
}

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
