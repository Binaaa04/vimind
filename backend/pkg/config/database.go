package config

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func LoadEnv() {
	envPaths := []string{
		".env",
		"backend/.env",
		"../.env",
		"../../.env",
	}

	for _, path := range envPaths {
		if err := godotenv.Load(path); err == nil {
			return
		}
	}
	
	log.Println("Warning: .env file not found, using system environment variables")
}

func ConnectDB() *pgxpool.Pool {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	if !strings.Contains(connStr, "?") {
		connStr += "?default_query_exec_mode=exec"
	} else {
		connStr += "&default_query_exec_mode=exec"
	}

	db, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}

	err = db.Ping(context.Background())
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	log.Println("Connected to Supabase successfully!")
	return db
}
