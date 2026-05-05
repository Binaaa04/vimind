package repository

import (
	"context"

	"pbl-vimind/backend/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) GetQuestions(mode string, diseaseIDs []int) ([]models.Question, error) {
	var query string
	var args []interface{}

	if mode == "screening" {
		// Fase 1: Ambil 1 gejala terkuat untuk SETIAP penyakit
		query = `
			SELECT s.symptoms_id, s.symptoms_code, s.symptoms_name, r.disease_id
			FROM symptoms s
			JOIN (
				SELECT symptoms_id, disease_id,
					   ROW_NUMBER() OVER(PARTITION BY disease_id ORDER BY expert_cf_value DESC) as rank
				FROM cf_rules
			) r ON s.symptoms_id = r.symptoms_id
			WHERE r.rank = 1
			ORDER BY RANDOM();
		`
	} else if (mode == "discovery" || mode == "refined") && len(diseaseIDs) > 0 {
		// Ambil TOP 5 Gejala terkuat untuk setiap penyakit yang dicurigai
		query = `
			SELECT s.symptoms_id, s.symptoms_code, s.symptoms_name, r.disease_id
			FROM symptoms s
			JOIN (
				SELECT symptoms_id, disease_id,
					   ROW_NUMBER() OVER(PARTITION BY disease_id ORDER BY expert_cf_value DESC) as rank
				FROM cf_rules
				WHERE disease_id = ANY($1)
			) r ON s.symptoms_id = r.symptoms_id
			WHERE r.rank <= 5
			ORDER BY RANDOM();
		`
		args = append(args, diseaseIDs)
	} else if mode == "all" {
		// Ambil semua gejala beserta ID penyakitnya untuk di-chunk di frontend
		query = `
			SELECT s.symptoms_id, s.symptoms_code, s.symptoms_name, r.disease_id
			FROM symptoms s
			JOIN cf_rules r ON s.symptoms_id = r.symptoms_id
			ORDER BY r.disease_id ASC, s.symptoms_id ASC;
		`
	} else {
		// Default: Fallback ke random (logic lama)
		query = `
			SELECT symptoms_id, symptoms_code, symptoms_name, 0 as disease_id
			FROM symptoms
			ORDER BY RANDOM()
			LIMIT 10;
		`
	}

	rows, err := r.pool.Query(context.Background(), query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	questions := []models.Question{}
	for rows.Next() {
		var q models.Question
		if err := rows.Scan(&q.ID, &q.Code, &q.Name, &q.DiseaseID); err != nil {
			continue
		}
		questions = append(questions, q)
	}
	return questions, nil
}

func (r *Repository) GetAllRules() ([]models.Rule, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT r.disease_id, d.disease_name, d.description, r.symptoms_id, r.expert_cf_value, d.general_solutions
		FROM cf_rules r
		JOIN disease d ON r.disease_id = d.disease_id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []models.Rule
	for rows.Next() {
		var rule models.Rule
		if err := rows.Scan(&rule.DiseaseID, &rule.Name, &rule.Desc, &rule.SymptomID, &rule.ExpertCF, &rule.Solutions); err != nil {
			continue
		}
		rules = append(rules, rule)
	}
	return rules, nil
}

func (r *Repository) GetUserIDByEmail(email string) (int, error) {
	var uid int
	err := r.pool.QueryRow(context.Background(), "SELECT user_id FROM users WHERE email=$1", email).Scan(&uid)
	return uid, err
}

func (r *Repository) CreateUser(email, name string) (int, error) {
	var uid int
	err := r.pool.QueryRow(context.Background(), "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING user_id", email, name).Scan(&uid)
	return uid, err
}

func (r *Repository) GetDiseaseIDByName(name string) (int, error) {
	var id int
	err := r.pool.QueryRow(context.Background(), "SELECT disease_id FROM disease WHERE disease_name=$1", name).Scan(&id)
	return id, err
}

func (r *Repository) GetDiseaseNameByID(id int) (string, error) {
	var name string
	err := r.pool.QueryRow(context.Background(), "SELECT disease_name FROM disease WHERE disease_id=$1", id).Scan(&name)
	return name, err
}

func (r *Repository) GetSuspectDiseases(symptomIDs []int) ([]int, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT DISTINCT disease_id FROM cf_rules WHERE symptoms_id = ANY($1)
	`, symptomIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err == nil {
			ids = append(ids, id)
		}
	}
	return ids, nil
}

func (r *Repository) SaveDiagnosis(uid int, diseaseID int, levelID int, cfValue float64, percentage float64) (int, error) {
	var diagnosisID int
	err := r.pool.QueryRow(context.Background(), `
		INSERT INTO diagnosis (user_id, disease_id, level_id, date_of_diagnosis, total_cf_value, persentase)
		VALUES ($1, $2, $3, NOW(), $4, $5)
		RETURNING diagnosis_id
	`, uid, diseaseID, levelID, cfValue, percentage).Scan(&diagnosisID)
	return diagnosisID, err
}

func (r *Repository) SaveDiagnosisDetail(diagnosisID int, symptomID int, val float64) error {
	_, err := r.pool.Exec(context.Background(), `
		INSERT INTO diagnosis_detail (diagnosis_id, symptoms_id, user_cf_value)
		VALUES ($1, $2, $3)
	`, diagnosisID, symptomID, val)
	return err
}

func (r *Repository) GetProfile(email string) (int, string, string, string, string, error) {
	var id int
	var name, userEmail, avatarURL, role string
	err := r.pool.QueryRow(context.Background(), "SELECT user_id, COALESCE(name,''), email, COALESCE(avatar_url, ''), COALESCE(role, 'user') FROM users WHERE email=$1", email).Scan(&id, &name, &userEmail, &avatarURL, &role)
	return id, name, userEmail, avatarURL, role, err
}

func (r *Repository) UpsertProfile(email, name, avatarURL string) error {
	_, err := r.pool.Exec(context.Background(), `
		INSERT INTO users (email, name, avatar_url) VALUES ($1, $2, $3)
		ON CONFLICT (email) DO UPDATE SET name=$2, avatar_url=COALESCE(NULLIF($3, ''), users.avatar_url)
	`, email, name, avatarURL)
	return err
}

func (r *Repository) GetHistory(uid int) ([]models.HistoryItem, error) {
	query := `
		SELECT 
			d.diagnosis_id, 
			dis.disease_name, 
			lc.level_name, 
			d.persentase, 
			d.date_of_diagnosis
		FROM diagnosis d
		JOIN disease dis ON d.disease_id = dis.disease_id
		JOIN level_category lc ON d.level_id = lc.level_id
		WHERE d.user_id = $1
		ORDER BY d.date_of_diagnosis DESC
		LIMIT 10
	`
	rows, err := r.pool.Query(context.Background(), query, uid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []models.HistoryItem
	for rows.Next() {
		var hi models.HistoryItem
		if err := rows.Scan(&hi.ID, &hi.Disease, &hi.Level, &hi.Percentage, &hi.Date); err != nil {
			continue
		}
		history = append(history, hi)
	}

	return history, nil
}

// GetLatestDiagnosisDiseaseID gets the disease_id of the user's most recent diagnosis
func (r *Repository) GetLatestDiagnosisDiseaseID(email string) (int, error) {
	uid, err := r.GetUserIDByEmail(email)
	if err != nil {
		return 0, err
	}

	var diseaseID int
	query := `
		SELECT disease_id 
		FROM diagnosis 
		WHERE user_id = $1 
		ORDER BY date_of_diagnosis DESC 
		LIMIT 1
	`
	err = r.pool.QueryRow(context.Background(), query, uid).Scan(&diseaseID)
	return diseaseID, err
}

// DeleteUser removes a user and all their related diagnostic data
func (r *Repository) DeleteUser(email string) error {
	uid, err := r.GetUserIDByEmail(email)
	if err != nil {
		return err
	}

	// Manual cascade delete to ensure all records are wiped
	_, _ = r.pool.Exec(context.Background(), "DELETE FROM diagnosis_detail WHERE symptoms_id IN (SELECT symptoms_id FROM symptoms) AND diagnosis_id IN (SELECT diagnosis_id FROM diagnosis WHERE user_id=$1)", uid)
	_, _ = r.pool.Exec(context.Background(), "DELETE FROM diagnosis WHERE user_id=$1", uid)
	_, err = r.pool.Exec(context.Background(), "DELETE FROM users WHERE user_id=$1", uid)

	return err
}

// ============================================================
// Admin: Banners — uses existing `promotion` table in Supabase
// ============================================================

func (r *Repository) GetBanners() ([]models.Banner, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT promotion_id, COALESCE(title,''), COALESCE(image_url,''), COALESCE(link_url,''), is_active, COALESCE(display_order,0)
		FROM promotion ORDER BY display_order ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var banners []models.Banner
	for rows.Next() {
		var b models.Banner
		if err := rows.Scan(&b.ID, &b.Title, &b.ImageURL, &b.LinkURL, &b.IsActive, &b.DisplayOrder); err != nil {
			continue
		}
		banners = append(banners, b)
	}
	return banners, nil
}

func (r *Repository) GetPublicBanners() ([]models.Banner, error) {
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

	var banners []models.Banner
	for rows.Next() {
		var b models.Banner
		if err := rows.Scan(&b.ID, &b.Title, &b.ImageURL, &b.LinkURL, &b.IsActive, &b.DisplayOrder); err != nil {
			continue
		}
		banners = append(banners, b)
	}
	return banners, nil
}

func (r *Repository) UpsertBanner(req models.BannerUpsertReq) error {
	if req.ID != "" {
		// Update existing row
		_, err := r.pool.Exec(context.Background(), `
			UPDATE promotion
			SET title=$1, image_url=$2, link_url=$3, is_active=$4, updated_at=NOW()
			WHERE promotion_id=$5
		`, req.Title, req.ImageURL, req.LinkURL, req.IsActive, req.ID)
		return err
	}
	// Insert new row
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

// ============================================================
// Admin: Articles (News Management)
// ============================================================

func (r *Repository) GetArticles(onlyActive bool) ([]models.Article, error) {
	query := `SELECT article_id, title, COALESCE(content,''), COALESCE(image_url,''), COALESCE(link_url,''), COALESCE(source,''), is_active, created_at 
	          FROM articles`
	if onlyActive {
		query += " WHERE is_active = true"
	}
	query += " ORDER BY created_at DESC"

	rows, err := r.pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []models.Article
	for rows.Next() {
		var a models.Article
		if err := rows.Scan(&a.ID, &a.Title, &a.Content, &a.ImageURL, &a.LinkURL, &a.Source, &a.IsActive, &a.CreatedAt); err != nil {
			continue
		}
		articles = append(articles, a)
	}
	return articles, nil
}

func (r *Repository) UpsertArticle(req models.ArticleUpsertReq) error {
	if req.ID != "" {
		_, err := r.pool.Exec(context.Background(), `
			UPDATE articles SET title=$1, content=$2, image_url=$3, link_url=$4, source=$5, is_active=$6, updated_at=NOW()
			WHERE article_id=$7
		`, req.Title, req.Content, req.ImageURL, req.LinkURL, req.Source, req.IsActive, req.ID)
		return err
	}
	_, err := r.pool.Exec(context.Background(), `
		INSERT INTO articles (title, content, image_url, link_url, source, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, req.Title, req.Content, req.ImageURL, req.LinkURL, req.Source, req.IsActive)
	return err
}

func (r *Repository) DeleteArticle(id string) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM articles WHERE article_id=$1", id)
	return err
}

// ============================================================
// Admin: FAQ — uses existing `faq` table in Supabase
// PK is faq_id, no position column
// ============================================================

func (r *Repository) GetFAQ() ([]models.FAQItem, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT faq_id, COALESCE(question,''), COALESCE(answer,'')
		FROM faq ORDER BY faq_id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.FAQItem
	for rows.Next() {
		var f models.FAQItem
		if err := rows.Scan(&f.ID, &f.Question, &f.Answer); err != nil {
			continue
		}
		items = append(items, f)
	}
	return items, nil
}

func (r *Repository) UpsertFAQ(req models.FAQUpsertReq) error {
	if req.ID != "" {
		// Update existing FAQ
		_, err := r.pool.Exec(context.Background(), `
			UPDATE faq SET question=$1, answer=$2, updated_at=NOW() WHERE faq_id=$3
		`, req.Question, req.Answer, req.ID)
		return err
	}
	// Insert new FAQ
	_, err := r.pool.Exec(context.Background(), `
		INSERT INTO faq (question, answer) VALUES ($1, $2)
	`, req.Question, req.Answer)
	return err
}

func (r *Repository) DeleteFAQ(id string) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM faq WHERE faq_id=$1", id)
	return err
}

// ============================================================
// Feedback (Testimonials & Account Deletion)
// ============================================================

func (r *Repository) GetPublicTestimonials() ([]models.Testimonial, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT testimonial_id, name, email, rating, comment
		FROM testimonials
		WHERE is_displayed = true
		ORDER BY rating DESC, created_at DESC LIMIT 6
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Testimonial
	for rows.Next() {
		var t models.Testimonial
		if err := rows.Scan(&t.ID, &t.Name, &t.Email, &t.Rating, &t.Comment); err != nil {
			continue
		}
		list = append(list, t)
	}
	return list, nil
}

func (r *Repository) GetAllTestimonials() ([]models.Testimonial, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT testimonial_id, name, email, rating, comment, is_displayed
		FROM testimonials ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Testimonial
	for rows.Next() {
		var t models.Testimonial
		if err := rows.Scan(&t.ID, &t.Name, &t.Email, &t.Rating, &t.Comment, &t.IsDisplayed); err != nil {
			continue
		}
		list = append(list, t)
	}
	return list, nil
}

func (r *Repository) InsertTestimonial(t models.Testimonial) error {
	_, err := r.pool.Exec(context.Background(), `
		INSERT INTO testimonials (name, email, rating, comment)
		VALUES ($1, $2, $3, $4)
	`, t.Name, t.Email, t.Rating, t.Comment)
	return err
}

func (r *Repository) UpdateTestimonialDisplay(id int, isDisplayed bool) error {
	_, err := r.pool.Exec(context.Background(), `
		UPDATE testimonials SET is_displayed = $1 WHERE testimonial_id = $2
	`, isDisplayed, id)
	return err
}

func (r *Repository) InsertAccountFeedback(email, reason string) error {
	_, err := r.pool.Exec(context.Background(), `
		INSERT INTO account_feedbacks (email, reason) VALUES ($1, $2)
	`, email, reason)
	return err
}

func (r *Repository) GetAllAccountFeedbacks() ([]models.AccountFeedback, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT feedback_id, email, reason, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS')
		FROM account_feedbacks ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.AccountFeedback
	for rows.Next() {
		var f models.AccountFeedback
		if err := rows.Scan(&f.ID, &f.Email, &f.Reason, &f.CreatedAt); err != nil {
			continue
		}
		list = append(list, f)
	}
	return list, nil
}

// ============================================================
// Admin: Knowledge Base (Symptoms, Diseases, Rules)
// ============================================================

func (r *Repository) GetAllSymptoms() ([]models.AdminSymptom, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT symptoms_id, symptoms_code, symptoms_name FROM symptoms ORDER BY symptoms_id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.AdminSymptom
	for rows.Next() {
		var s models.AdminSymptom
		if err := rows.Scan(&s.ID, &s.Code, &s.Name); err != nil {
			continue
		}
		list = append(list, s)
	}
	return list, nil
}

func (r *Repository) UpsertSymptom(s models.AdminSymptom) error {
	if s.ID == 0 {
		_, err := r.pool.Exec(context.Background(), `
			INSERT INTO symptoms (symptoms_code, symptoms_name) VALUES ($1, $2)
		`, s.Code, s.Name)
		return err
	}
	_, err := r.pool.Exec(context.Background(), `
		UPDATE symptoms SET symptoms_code=$1, symptoms_name=$2 WHERE symptoms_id=$3
	`, s.Code, s.Name, s.ID)
	return err
}

func (r *Repository) DeleteSymptom(id int) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM symptoms WHERE symptoms_id=$1", id)
	return err
}

func (r *Repository) GetAllDiseases() ([]models.AdminDisease, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT disease_id, disease_name, description, general_solutions FROM disease ORDER BY disease_id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.AdminDisease
	for rows.Next() {
		var d models.AdminDisease
		if err := rows.Scan(&d.ID, &d.Name, &d.Description, &d.Solutions); err != nil {
			continue
		}
		list = append(list, d)
	}
	return list, nil
}

func (r *Repository) UpsertDisease(d models.AdminDisease) error {
	if d.ID == 0 {
		_, err := r.pool.Exec(context.Background(), `
			INSERT INTO disease (disease_name, description, general_solutions) VALUES ($1, $2, $3)
		`, d.Name, d.Description, d.Solutions)
		return err
	}
	_, err := r.pool.Exec(context.Background(), `
		UPDATE disease SET disease_name=$1, description=$2, general_solutions=$3 WHERE disease_id=$4
	`, d.Name, d.Description, d.Solutions, d.ID)
	return err
}

func (r *Repository) DeleteDisease(id int) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM disease WHERE disease_id=$1", id)
	return err
}

func (r *Repository) GetAllCFRules() ([]models.AdminRule, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT rules_id, disease_id, symptoms_id, expert_cf_value FROM cf_rules ORDER BY rules_id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.AdminRule
	for rows.Next() {
		var rule models.AdminRule
		if err := rows.Scan(&rule.RuleID, &rule.DiseaseID, &rule.SymptomID, &rule.CFValue); err != nil {
			continue
		}
		list = append(list, rule)
	}
	return list, nil
}

func (r *Repository) UpsertRule(rule models.AdminRule) error {
	if rule.RuleID == 0 {
		_, err := r.pool.Exec(context.Background(), `
			INSERT INTO cf_rules (disease_id, symptoms_id, expert_cf_value) VALUES ($1, $2, $3)
		`, rule.DiseaseID, rule.SymptomID, rule.CFValue)
		return err
	}
	_, err := r.pool.Exec(context.Background(), `
		UPDATE cf_rules SET disease_id=$1, symptoms_id=$2, expert_cf_value=$3 WHERE rules_id=$4
	`, rule.DiseaseID, rule.SymptomID, rule.CFValue, rule.RuleID)
	return err
}

func (r *Repository) DeleteRule(id int) error {
	_, err := r.pool.Exec(context.Background(), "DELETE FROM cf_rules WHERE rules_id=$1", id)
	return err
}

// ============================================================
// Level Category (CF User Weights)
// ============================================================

func (r *Repository) GetLevelCategories() ([]models.LevelCategory, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT level_id, COALESCE(level_name,''), COALESCE(cf_value, 0)
		FROM level_category
		ORDER BY level_id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var levels []models.LevelCategory
	for rows.Next() {
		var l models.LevelCategory
		if err := rows.Scan(&l.LevelID, &l.LevelName, &l.CFValue); err != nil {
			return nil, err
		}
		levels = append(levels, l)
	}
	return levels, nil
}

