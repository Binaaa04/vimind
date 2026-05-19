package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

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

	_, _ = r.pool.Exec(context.Background(), "DELETE FROM diagnosis_detail WHERE symptoms_id IN (SELECT symptoms_id FROM symptoms) AND diagnosis_id IN (SELECT diagnosis_id FROM diagnosis WHERE user_id=$1)", uid)
	_, _ = r.pool.Exec(context.Background(), "DELETE FROM diagnosis WHERE user_id=$1", uid)
	_, err = r.pool.Exec(context.Background(), "DELETE FROM users WHERE user_id=$1", uid)
	return err
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

func (r *Repository) TrackUserActivity(email, ip string) {
	if email == "" || ip == "" || ip == "127.0.0.1" || ip == "::1" {
		return
	}

	var lastIP string
	err := r.pool.QueryRow(context.Background(), "SELECT COALESCE(last_ip, '') FROM users WHERE email=$1", email).Scan(&lastIP)
	if err != nil {
		return
	}

	region := ""
	if ip != lastIP {
		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Get("http://ip-api.com/json/" + ip)
		if err == nil {
			defer resp.Body.Close()
			var result struct {
				City   string `json:"city"`
				Region string `json:"regionName"`
			}
			if json.NewDecoder(resp.Body).Decode(&result) == nil {
				if result.City != "" {
					region = result.City + ", " + result.Region
				}
			}
		}
	}

	if region != "" {
		_, _ = r.pool.Exec(context.Background(), "UPDATE users SET last_active_at = CURRENT_TIMESTAMP, last_ip = $1, last_region = $2 WHERE email = $3", ip, region, email)
	} else {
		_, _ = r.pool.Exec(context.Background(), "UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE email = $1", email)
	}
}
