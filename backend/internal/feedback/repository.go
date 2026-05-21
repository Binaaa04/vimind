package feedback

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

func (r *Repository) GetPublicTestimonials() ([]Testimonial, error) {
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

	var list []Testimonial
	for rows.Next() {
		var t Testimonial
		if err := rows.Scan(&t.ID, &t.Name, &t.Email, &t.Rating, &t.Comment); err != nil {
			continue
		}
		list = append(list, t)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *Repository) GetAllTestimonials() ([]Testimonial, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT testimonial_id, name, email, rating, comment, is_displayed
		FROM testimonials ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Testimonial
	for rows.Next() {
		var t Testimonial
		if err := rows.Scan(&t.ID, &t.Name, &t.Email, &t.Rating, &t.Comment, &t.IsDisplayed); err != nil {
			continue
		}
		list = append(list, t)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *Repository) InsertTestimonial(t Testimonial) error {
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

func (r *Repository) GetAllAccountFeedbacks() ([]AccountFeedback, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT feedback_id, email, reason, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS')
		FROM account_feedbacks ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []AccountFeedback
	for rows.Next() {
		var f AccountFeedback
		if err := rows.Scan(&f.ID, &f.Email, &f.Reason, &f.CreatedAt); err != nil {
			continue
		}
		list = append(list, f)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}



func (r *Repository) HasRated(email string) (bool, error) {
	var count int
	err := r.pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM testimonials WHERE email=$1", email,
	).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

