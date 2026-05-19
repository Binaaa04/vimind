package admin

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) GetBanners() ([]Banner, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT promotion_id, COALESCE(title,''), COALESCE(image_url,''), COALESCE(link_url,''), is_active, COALESCE(display_order,0)
		FROM promotion ORDER BY display_order ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var banners []Banner
	for rows.Next() {
		var b Banner
		if err := rows.Scan(&b.ID, &b.Title, &b.ImageURL, &b.LinkURL, &b.IsActive, &b.DisplayOrder); err != nil {
			continue
		}
		banners = append(banners, b)
	}
	return banners, nil
}

func (r *Repository) GetPublicBanners() ([]Banner, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT promotion_id, COALESCE(title,''), COALESCE(image_url,''), COALESCE(link_url,''), is_active, COALESCE(display_order,0)
		FROM promotion 
		WHERE is_active = true
		ORDER BY display_order ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var banners []Banner
	for rows.Next() {
		var b Banner
		if err := rows.Scan(&b.ID, &b.Title, &b.ImageURL, &b.LinkURL, &b.IsActive, &b.DisplayOrder); err != nil {
			continue
		}
		banners = append(banners, b)
	}
	return banners, nil
}

func (r *Repository) UpsertBanner(req BannerUpsertReq) error {
	if req.ID != "" {
		_, err := r.pool.Exec(context.Background(), `
			UPDATE promotion SET title=$1, image_url=$2, link_url=$3, is_active=$4, updated_at=NOW() WHERE promotion_id=$5
		`, req.Title, req.ImageURL, req.LinkURL, req.IsActive, req.ID)
		return err
	}
	_, err := r.pool.Exec(context.Background(), `
		INSERT INTO promotion (title, image_url, link_url, is_active, display_order)
		VALUES ($1, $2, $3, $4, $5)
	`, req.Title, req.ImageURL, req.LinkURL, req.IsActive, req.DisplayOrder)
	return err
}

func (r *Repository) DeleteBanner(id string) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM promotion WHERE promotion_id=$1", id)
	return err
}

// FAQ

func (r *Repository) GetFAQ() ([]FAQItem, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT faq_id, COALESCE(question,''), COALESCE(answer,'') FROM faq ORDER BY faq_id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []FAQItem
	for rows.Next() {
		var f FAQItem
		if err := rows.Scan(&f.ID, &f.Question, &f.Answer); err != nil {
			continue
		}
		items = append(items, f)
	}
	return items, nil
}

func (r *Repository) UpsertFAQ(req FAQUpsertReq) error {
	if req.ID != "" {
		_, err := r.pool.Exec(context.Background(), "UPDATE faq SET question=$1, answer=$2, updated_at=NOW() WHERE faq_id=$3", req.Question, req.Answer, req.ID)
		return err
	}
	_, err := r.pool.Exec(context.Background(), "INSERT INTO faq (question, answer) VALUES ($1, $2)", req.Question, req.Answer)
	return err
}

func (r *Repository) DeleteFAQ(id string) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM faq WHERE faq_id=$1", id)
	return err
}

// Articles

func (r *Repository) GetArticles(onlyActive bool) ([]Article, error) {
	query := `SELECT article_id, title, COALESCE(content,''), COALESCE(image_url,''), COALESCE(link_url,''), COALESCE(source,''), is_active, created_at FROM articles`
	if onlyActive {
		query += " WHERE is_active = true"
	}
	query += " ORDER BY created_at DESC"

	rows, err := r.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []Article
	for rows.Next() {
		var a Article
		if err := rows.Scan(&a.ID, &a.Title, &a.Content, &a.ImageURL, &a.LinkURL, &a.Source, &a.IsActive, &a.CreatedAt); err != nil {
			continue
		}
		articles = append(articles, a)
	}
	return articles, nil
}

func (r *Repository) UpsertArticle(req ArticleUpsertReq) error {
	if req.ID != "" {
		_, err := r.pool.Exec(context.Background(), `
			UPDATE articles SET title=$1, content=$2, image_url=$3, link_url=$4, source=$5, is_active=$6, updated_at=NOW() WHERE article_id=$7
		`, req.Title, req.Content, req.ImageURL, req.LinkURL, req.Source, req.IsActive, req.ID)
		return err
	}
	_, err := r.pool.Exec(context.Background(), `
		INSERT INTO articles (title, content, image_url, link_url, source, is_active) VALUES ($1, $2, $3, $4, $5, $6)
	`, req.Title, req.Content, req.ImageURL, req.LinkURL, req.Source, req.IsActive)
	return err
}

func (r *Repository) DeleteArticle(id string) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM articles WHERE article_id=$1", id)
	return err
}

// Knowledge Base - Symptoms

func (r *Repository) GetAllSymptoms() ([]AdminSymptom, error) {
	rows, err := r.pool.Query(context.Background(), "SELECT symptoms_id, symptoms_code, symptoms_name FROM symptoms ORDER BY symptoms_id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []AdminSymptom
	for rows.Next() {
		var s AdminSymptom
		if err := rows.Scan(&s.ID, &s.Code, &s.Name); err != nil {
			continue
		}
		list = append(list, s)
	}
	return list, nil
}

func (r *Repository) UpsertSymptom(s AdminSymptom) error {
	if s.ID == 0 {
		_, err := r.pool.Exec(context.Background(), "INSERT INTO symptoms (symptoms_code, symptoms_name) VALUES ($1, $2)", s.Code, s.Name)
		return err
	}
	_, err := r.pool.Exec(context.Background(), "UPDATE symptoms SET symptoms_code=$1, symptoms_name=$2 WHERE symptoms_id=$3", s.Code, s.Name, s.ID)
	return err
}

func (r *Repository) DeleteSymptom(id int) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM symptoms WHERE symptoms_id=$1", id)
	return err
}

// Knowledge Base - Diseases

func (r *Repository) GetAllDiseases() ([]AdminDisease, error) {
	rows, err := r.pool.Query(context.Background(), "SELECT disease_id, disease_name, description, general_solutions FROM disease ORDER BY disease_id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []AdminDisease
	for rows.Next() {
		var d AdminDisease
		if err := rows.Scan(&d.ID, &d.Name, &d.Description, &d.Solutions); err != nil {
			continue
		}
		list = append(list, d)
	}
	return list, nil
}

func (r *Repository) UpsertDisease(d AdminDisease) error {
	if d.ID == 0 {
		_, err := r.pool.Exec(context.Background(), "INSERT INTO disease (disease_name, description, general_solutions) VALUES ($1, $2, $3)", d.Name, d.Description, d.Solutions)
		return err
	}
	_, err := r.pool.Exec(context.Background(), "UPDATE disease SET disease_name=$1, description=$2, general_solutions=$3 WHERE disease_id=$4", d.Name, d.Description, d.Solutions, d.ID)
	return err
}

func (r *Repository) DeleteDisease(id int) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM disease WHERE disease_id=$1", id)
	return err
}

// Knowledge Base - CF Rules

func (r *Repository) GetAllCFRules() ([]AdminRule, error) {
	rows, err := r.pool.Query(context.Background(), "SELECT rules_id, disease_id, symptoms_id, expert_cf_value FROM cf_rules ORDER BY rules_id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []AdminRule
	for rows.Next() {
		var rule AdminRule
		if err := rows.Scan(&rule.RuleID, &rule.DiseaseID, &rule.SymptomID, &rule.CFValue); err != nil {
			continue
		}
		list = append(list, rule)
	}
	return list, nil
}

func (r *Repository) UpsertRule(rule AdminRule) error {
	if rule.RuleID == 0 {
		_, err := r.pool.Exec(context.Background(), "INSERT INTO cf_rules (disease_id, symptoms_id, expert_cf_value) VALUES ($1, $2, $3)", rule.DiseaseID, rule.SymptomID, rule.CFValue)
		return err
	}
	_, err := r.pool.Exec(context.Background(), "UPDATE cf_rules SET disease_id=$1, symptoms_id=$2, expert_cf_value=$3 WHERE rules_id=$4", rule.DiseaseID, rule.SymptomID, rule.CFValue, rule.RuleID)
	return err
}

func (r *Repository) DeleteRule(id int) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM cf_rules WHERE rules_id=$1", id)
	return err
}

func (r *Repository) GetAllUsers() ([]AdminUser, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT 
			user_id, 
			email, 
			COALESCE(name, ''), 
			role, 
			COALESCE(TO_CHAR(birth_date, 'YYYY-MM-DD'), ''), 
			COALESCE(TO_CHAR(last_active_at, 'YYYY-MM-DD HH24:MI'), ''), 
			COALESCE(last_region, ''),
			COALESCE(TO_CHAR(created_at, 'YYYY-MM-DD'), '')
		FROM users ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []AdminUser
	for rows.Next() {
		var u AdminUser
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Role, &u.BirthDate, &u.LastActiveAt, &u.LastRegion, &u.CreatedAt); err != nil {
			continue
		}
		list = append(list, u)
	}
	return list, nil
}

func (r *Repository) GetDashboardAnalytics() (AnalyticsSummary, error) {
	var summary AnalyticsSummary

	// Query 1: Most Disease
	rows, err := r.pool.Query(context.Background(), `
		SELECT d.disease_name, COUNT(diag.diagnosis_id) as cnt
		FROM diagnosis diag
		JOIN disease d ON diag.disease_id = d.disease_id
		GROUP BY d.disease_name
		ORDER BY cnt DESC
	`)
	if err == nil {
		var list []DiseaseStat
		var total int
		rank := 1
		for rows.Next() {
			var name string
			var count int
			if err := rows.Scan(&name, &count); err == nil {
				list = append(list, DiseaseStat{Rank: rank, Name: name, Cases: count})
				total += count
				rank++
			}
		}
		rows.Close()
		for i := range list {
			if total > 0 {
				list[i].Percentage = fmt.Sprintf("%.1f%%", float64(list[i].Cases)*100/float64(total))
			} else {
				list[i].Percentage = "0%"
			}
		}
		
		if len(list) > 0 {
			summary.MostDisease = list[0].Name
			summary.DiseaseRate = list[0].Cases
		}
		summary.DiseaseList = list
	}

	// Query 2: Age Range Mode
	rows2, err := r.pool.Query(context.Background(), `
		WITH age_data AS (
			SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, birth_date)) AS age
			FROM users WHERE birth_date IS NOT NULL
		),
		ranges AS (
			SELECT CASE 
				WHEN age < 18 THEN '13-17'
				WHEN age BETWEEN 18 AND 24 THEN '18-24'
				WHEN age BETWEEN 25 AND 34 THEN '25-34'
				WHEN age BETWEEN 35 AND 44 THEN '35-44'
				WHEN age BETWEEN 45 AND 54 THEN '45-54'
				ELSE '55+' END AS age_range
			FROM age_data WHERE age IS NOT NULL
		)
		SELECT age_range, COUNT(*) FROM ranges GROUP BY age_range ORDER BY age_range ASC
	`)
	if err == nil {
		var list []AgeStat
		colors := map[string]string{
			"13-17": "#8b5cf6", "18-24": "#c4b5fd", "25-34": "#3b0764",
			"35-44": "#f3e8ff", "45-54": "#a855f7", "55+": "#5b21b6",
		}
		var maxCount int
		var mostAge string
		for rows2.Next() {
			var name string
			var count int
			if err := rows2.Scan(&name, &count); err == nil {
				color := colors[name]
				if color == "" { color = "#8b5cf6" }
				list = append(list, AgeStat{Name: name, Value: count, Color: color})
				if count > maxCount {
					maxCount = count
					mostAge = name
				}
			}
		}
		rows2.Close()
		summary.AgeList = list
		summary.AgeRange = mostAge
	}

	// Query 3: Average Rating & Total Feedbacks
	_ = r.pool.QueryRow(context.Background(), `SELECT COALESCE(AVG(rating), 0), COUNT(*) FROM testimonials`).Scan(&summary.AverageRating, &summary.TotalFeedbacks)

	// Query 4: Deleted Accounts
	_ = r.pool.QueryRow(context.Background(), `SELECT COUNT(*) FROM account_feedbacks`).Scan(&summary.DeletedAccounts)

	// Query 6: Weekly Active
	_ = r.pool.QueryRow(context.Background(), `
		SELECT 
		  COUNT(*) FILTER (WHERE last_active_at >= CURRENT_DATE - INTERVAL '7 days'),
		  COUNT(*)
		FROM users
	`).Scan(&summary.WeeklyActive, &summary.TotalUsers)

	// Query 7: Top Region
	_ = r.pool.QueryRow(context.Background(), `
		SELECT last_region FROM users 
		WHERE last_region IS NOT NULL AND last_region != ''
		GROUP BY last_region ORDER BY COUNT(*) DESC LIMIT 1
	`).Scan(&summary.TopRegion)

	return summary, nil
}
