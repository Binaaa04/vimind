package diagnosis

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) GetQuestions(mode string, diseaseIDs []int) ([]Question, error) {
	var query string
	var args []interface{}

	if mode == "screening" {
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
		query = `
			SELECT s.symptoms_id, s.symptoms_code, s.symptoms_name, r.disease_id
			FROM symptoms s
			JOIN cf_rules r ON s.symptoms_id = r.symptoms_id
			ORDER BY r.disease_id ASC, s.symptoms_id ASC;
		`
	} else {
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

	var questions []Question
	for rows.Next() {
		var q Question
		if err := rows.Scan(&q.ID, &q.Code, &q.Name, &q.DiseaseID); err != nil {
			continue
		}
		questions = append(questions, q)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *Repository) GetAllRules() ([]Rule, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT r.disease_id, d.disease_name, d.description, r.symptoms_id, r.expert_cf_value, d.general_solutions
		FROM cf_rules r
		JOIN disease d ON r.disease_id = d.disease_id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []Rule
	for rows.Next() {
		var rule Rule
		if err := rows.Scan(&rule.DiseaseID, &rule.Name, &rule.Desc, &rule.SymptomID, &rule.ExpertCF, &rule.Solutions); err != nil {
			continue
		}
		rules = append(rules, rule)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return rules, nil
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
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return ids, nil
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

func (r *Repository) GetHistory(uid int) ([]HistoryItem, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT 
			d.diagnosis_id, 
			dis.disease_name, 
			dis.description,
			dis.general_solutions,
			lc.level_name, 
			d.persentase, 
			d.date_of_diagnosis
		FROM diagnosis d
		JOIN disease dis ON d.disease_id = dis.disease_id
		JOIN level_category lc ON d.level_id = lc.level_id
		WHERE d.user_id = $1
		ORDER BY d.date_of_diagnosis DESC
		LIMIT 10
	`, uid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []HistoryItem
	for rows.Next() {
		var hi HistoryItem
		if err := rows.Scan(&hi.ID, &hi.Disease, &hi.Description, &hi.Recommendations, &hi.Level, &hi.Percentage, &hi.Date); err != nil {
			continue
		}
		history = append(history, hi)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return history, nil
}

func (r *Repository) GetLatestDiagnosisDiseaseID(uid int) (int, error) {
	var diseaseID int
	err := r.pool.QueryRow(context.Background(), `
		SELECT disease_id 
		FROM diagnosis 
		WHERE user_id = $1 
		ORDER BY date_of_diagnosis DESC 
		LIMIT 1
	`, uid).Scan(&diseaseID)
	return diseaseID, err
}

func (r *Repository) GetLevelCategories() ([]LevelCategory, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT level_id, COALESCE(level_name,''), COALESCE(cf_value, 0)
		FROM level_category
		ORDER BY level_id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var levels []LevelCategory
	for rows.Next() {
		var l LevelCategory
		if err := rows.Scan(&l.LevelID, &l.LevelName, &l.CFValue); err != nil {
			return nil, err
		}
		levels = append(levels, l)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return levels, nil
}
