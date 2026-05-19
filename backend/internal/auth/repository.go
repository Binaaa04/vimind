package auth

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

func (r *Repository) GetProfile(email string) (int, string, string, string, string, string, error) {
	var id int
	var name, userEmail, avatarURL, role, birthDate string
	err := r.pool.QueryRow(context.Background(),
		"SELECT user_id, COALESCE(name,''), email, COALESCE(avatar_url, ''), COALESCE(role, 'user'), COALESCE(CAST(birth_date AS VARCHAR), '') FROM users WHERE email=$1",
		email,
	).Scan(&id, &name, &userEmail, &avatarURL, &role, &birthDate)
	return id, name, userEmail, avatarURL, role, birthDate, err
}

func (r *Repository) UpsertProfile(email, name, avatarURL, birthDate string) error {
	var err error
	if birthDate != "" {
		_, err = r.pool.Exec(context.Background(), `
			INSERT INTO users (email, name, avatar_url, birth_date) VALUES ($1, $2, $3, $4)
			ON CONFLICT (email) DO UPDATE SET name=$2, avatar_url=COALESCE(NULLIF($3, ''), users.avatar_url), birth_date=$4
		`, email, name, avatarURL, birthDate)
	} else {
		_, err = r.pool.Exec(context.Background(), `
			INSERT INTO users (email, name, avatar_url) VALUES ($1, $2, $3)
			ON CONFLICT (email) DO UPDATE SET name=$2, avatar_url=COALESCE(NULLIF($3, ''), users.avatar_url)
		`, email, name, avatarURL)
	}
	return err
}

func (r *Repository) DeleteUser(email string) error {
	uid, err := r.GetUserIDByEmail(email)
	if err != nil {
		return err
	}

	ctx := context.Background()
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Clean up related data first
	_, err = tx.Exec(ctx, "DELETE FROM diagnosis_detail WHERE diagnosis_id IN (SELECT diagnosis_id FROM diagnosis WHERE user_id=$1)", uid)
	if err != nil {
		return fmt.Errorf("failed to delete diagnosis details: %w", err)
	}

	_, err = tx.Exec(ctx, "DELETE FROM diagnosis WHERE user_id=$1", uid)
	if err != nil {
		return fmt.Errorf("failed to delete diagnosis records: %w", err)
	}

	_, err = tx.Exec(ctx, "DELETE FROM users WHERE user_id=$1", uid)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return tx.Commit(ctx)
}

func (r *Repository) CheckAdmin(email string) error {
	_, _, _, _, role, _, err := r.GetProfile(email)
	if err != nil {
		return err
	}
	if role != "admin" {
		return fmt.Errorf("user is not admin")
	}
	return nil
}
