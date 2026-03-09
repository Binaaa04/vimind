package main

import (
	"context"
	"log"
	"os"

	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
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

	// Security Middlewares
	app.Use(helmet.New()) // Adds standard security headers
	app.Use(cors.New())

	// Rate Limiting: 100 requests per 15 minutes per IP
	app.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: 15 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{
				"message": "Too many requests, please try again later.",
			})
		},
	}))

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
			return c.Status(400).JSON(fiber.Map{"message": "Invalid request body"})
		}

		// Basic Validation (Pre-SQL)
		if req.Email == "" || req.Password == "" {
			return c.Status(400).JSON(fiber.Map{"message": "Email and password are required"})
		}

		// SECURE SQL PATTERN (Anti SQL Injection)
		// Instead of "SELECT * FROM users WHERE email = '"+req.Email+"'"
		// We use placeholders ($1, $2, etc.)
		var dbEmail string
		err := dbpool.QueryRow(context.Background(), "SELECT email FROM users WHERE email=$1", req.Email).Scan(&dbEmail)

		// If table doesn't exist yet or user not found
		if err != nil {
			log.Printf("Login security check: %v", err)
			return c.Status(401).JSON(fiber.Map{"message": "Unauthorized access"})
		}

		return c.JSON(fiber.Map{"message": "User session validated", "email": dbEmail})
	})

	log.Fatal(app.Listen(":8080"))
}
