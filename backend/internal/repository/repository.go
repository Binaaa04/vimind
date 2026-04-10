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
	} else if mode == "discovery" && len(diseaseIDs) > 0 {
		// Fase 2: Ambil gejala tambahan untuk penyakit spesifik yang dicurigai
		query = `
			SELECT DISTINCT s.symptoms_id, s.symptoms_code, s.symptoms_name, r.disease_id
			FROM symptoms s
			JOIN cf_rules r ON s.symptoms_id = r.symptoms_id
			WHERE r.disease_id = ANY($1)
			AND r.expert_cf_value >= 0.6
			ORDER BY RANDOM()
			LIMIT 8;
		`
		args = append(args, diseaseIDs)
	} else if mode == "refined" && len(diseaseIDs) > 0 {
		// Refined Diagnosis: Ambil soal spesifik untuk history penyakit user
		query = `
			SELECT DISTINCT s.symptoms_id, s.symptoms_code, s.symptoms_name, r.disease_id
			FROM symptoms s
			JOIN cf_rules r ON s.symptoms_id = r.symptoms_id
			WHERE r.disease_id = ANY($1)
			AND r.expert_cf_value >= 0.4
			ORDER BY RANDOM()
			LIMIT 10;
		`
		args = append(args, diseaseIDs)
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

func (r *Repository) GetProfile(email string) (int, string, string, string, error) {
	var id int
	var name, userEmail, avatarURL string
	err := r.pool.QueryRow(context.Background(), "SELECT user_id, name, email, COALESCE(avatar_url, '') FROM users WHERE email=$1", email).Scan(&id, &name, &userEmail, &avatarURL)
	return id, name, userEmail, avatarURL, err
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

