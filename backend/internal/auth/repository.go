package auth

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

func (r *Repository) GetProfile(email string) (int, string, string, string, string, error) {
	var id int
	var name, userEmail, avatarURL, role string
	err := r.pool.QueryRow(context.Background(),
		"SELECT user_id, COALESCE(name,''), email, COALESCE(avatar_url, ''), COALESCE(role, 'user') FROM users WHERE email=$1",
		email,
	).Scan(&id, &name, &userEmail, &avatarURL, &role)
	return id, name, userEmail, avatarURL, role, err
}

func (r *Repository) UpsertProfile(email, name, avatarURL string) error {
	_, err := r.pool.Exec(context.Background(), `
		INSERT INTO users (email, name, avatar_url) VALUES ($1, $2, $3)
		ON CONFLICT (email) DO UPDATE SET name=$2, avatar_url=COALESCE(NULLIF($3, ''), users.avatar_url)
	`, email, name, avatarURL)
	return err
}

func (r *Repository) DeleteUser(email string) error {
	uid, err := r.GetUserIDByEmail(email)
	if err != nil {
		return err
	}

	_, _ = r.pool.Exec(context.Background(), "DELETE FROM diagnosis_detail WHERE symptoms_id IN (SELECT symptoms_id FROM symptoms) AND diagnosis_id IN (SELECT diagnosis_id FROM diagnosis WHERE user_id=$1)", uid)
	_, _ = r.pool.Exec(context.Background(), "DELETE FROM diagnosis WHERE user_id=$1", uid)
	_, err = r.pool.Exec(context.Background(), "DELETE FROM users WHERE user_id=$1", uid)
	return err
}

func (r *Repository) CheckAdmin(email string) error {
	_, _, _, _, role, err := r.GetProfile(email)
	if err != nil {
		return err
	}
	if role != "admin" {
		return err
	}
	return nil
}
