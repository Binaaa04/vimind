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

type DiseaseStat struct {
	Rank       int    `json:"rank"`
	Name       string `json:"name"`
	Cases      int    `json:"cases"`
	Percentage string `json:"percentage"`
}

type AgeStat struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
	Color string `json:"color"`
}

type AnalyticsSummary struct {
	MostDisease     string        `json:"most_disease"`
	DiseaseRate     int           `json:"disease_rate"`
	AgeRange        string        `json:"age_range"`
	AverageRating   float64       `json:"average_rating"`
	TotalFeedbacks  int           `json:"total_feedbacks"`
	DeletedAccounts int           `json:"deleted_accounts"`
	MostMood        string        `json:"most_mood"`
	WeeklyActive    int           `json:"weekly_active"`
	TotalUsers      int           `json:"total_users"`
	TopRegion       string        `json:"top_region"`
	DiseaseList     []DiseaseStat `json:"disease_list"`
	AgeList         []AgeStat     `json:"age_list"`
}
