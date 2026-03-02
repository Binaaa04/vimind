package main

import (
	"context"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using default environment variables")
	}

	// Database connection string
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	// Initialize database connection pool
	dbpool, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}
	defer dbpool.Close()

	// Test connection
	err = dbpool.Ping(context.Background())
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	log.Println("Connected to Supabase successfully!")

	app := fiber.New()

	// Default CORS config
	app.Use(cors.New())

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("ViMind Backend is running with Supabase connected.")
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		err := dbpool.Ping(context.Background())
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"status":   "unhealthy",
				"database": "disconnected",
			})
		}
		return c.JSON(fiber.Map{
			"status":   "healthy",
			"database": "connected",
		})
	})

	app.Post("/login", func(c *fiber.Ctx) error {
		type LoginRequest struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		var req LoginRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"message": "Invalid request"})
		}

		// Placeholder login logic for now
		if req.Email == "test@vimind.com" && req.Password == "password123" {
			return c.JSON(fiber.Map{"message": "Login successful", "user": req.Email})
		}
		return c.Status(401).JSON(fiber.Map{"message": "Login failed"})
	})

	log.Fatal(app.Listen(":8080"))
}
