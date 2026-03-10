package main

import (
	"context"
	"log"
	"os"
	"strings"

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

	// Fix for "prepared statement already exists" errors in pooled/Supabase environments
	if !strings.Contains(connStr, "?") {
		connStr += "?default_query_exec_mode=exec"
	} else {
		connStr += "&default_query_exec_mode=exec"
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

	// --- CERTAINTY FACTOR MODELS ---
	type Question struct {
		ID   int    `json:"id"`
		Code string `json:"code"`
		Name string `json:"name"`
	}

	type Answer struct {
		SymptomID int     `json:"symptom_id"`
		Value     float64 `json:"value"` // 0.0 to 1.0
	}

	type DiagnosisRequest struct {
		Answers   []Answer `json:"answers"`
		UserEmail string   `json:"user_email"`
	}

	type DiagnosisResult struct {
		DiseaseName     string  `json:"disease_name"`
		Description     string  `json:"description"`
		CFValue         float64 `json:"cf_value"`
		Percentage      float64 `json:"percentage"`
		Recommendations string  `json:"recommendations"`
	}

	// --- CERTAINTY FACTOR ENDPOINTS ---

	// GET /api/questions - Fetch up to 5 representative symptoms for each of the 9 diseases
	app.Get("/api/questions", func(c *fiber.Ctx) error {
		query := `
			WITH RankedSymptoms AS (
				SELECT 
					s.symptoms_id, 
					s.symptoms_code, 
					s.symptoms_name,
					r.disease_id,
					ROW_NUMBER() OVER(PARTITION BY r.disease_id ORDER BY r.expert_cf_value DESC) as rank
				FROM symptoms s
				JOIN cf_rules r ON s.symptoms_id = r.symptoms_id
			)
			SELECT DISTINCT symptoms_id, symptoms_code, symptoms_name
			FROM RankedSymptoms
			WHERE rank <= 5
			ORDER BY symptoms_id ASC;
		`
		rows, err := dbpool.Query(context.Background(), query)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions"})
		}
		defer rows.Close()

		var questions []Question
		for rows.Next() {
			var q Question
			if err := rows.Scan(&q.ID, &q.Code, &q.Name); err != nil {
				continue
			}
			questions = append(questions, q)
		}

		return c.JSON(questions)
	})

	// POST /api/diagnose - Calculate CF based on user answers & SAVE TO DB
	app.Post("/api/diagnose", func(c *fiber.Ctx) error {
		var req DiagnosisRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		if len(req.Answers) == 0 {
			return c.Status(400).JSON(fiber.Map{"error": "No answers provided"})
		}

		// Map answers for quick lookup
		userAnswers := make(map[int]float64)
		for _, ans := range req.Answers {
			userAnswers[ans.SymptomID] = ans.Value
		}

		// Fetch all rules
		rows, err := dbpool.Query(context.Background(), `
			SELECT r.disease_id, d.disease_name, d.description, r.symptoms_id, r.expert_cf_value, d.general_solutions
			FROM cf_rules r
			JOIN disease d ON r.disease_id = d.disease_id
		`)
		if err != nil {
			log.Printf("Error fetching diagnostic rules: %v", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch diagnostic rules"})
		}
		defer rows.Close()

		type DiseaseCF struct {
			Name        string
			Description string
			Solutions   string
			CF          float64
		}
		resultsMap := make(map[int]*DiseaseCF)

		for rows.Next() {
			var disID, symID int
			var disName, disDesc, disSol string
			var expertCF float64
			if err := rows.Scan(&disID, &disName, &disDesc, &symID, &expertCF, &disSol); err != nil {
				continue
			}

			if _, ok := resultsMap[disID]; !ok {
				resultsMap[disID] = &DiseaseCF{Name: disName, Description: disDesc, Solutions: disSol, CF: 0}
			}

			// If user answered this symptom
			if userVal, answered := userAnswers[symID]; answered {
				cfEntry := userVal * expertCF

				// CF Combine formula: CF_comb = CF_old + CF_new * (1 - CF_old)
				currentCF := resultsMap[disID].CF
				resultsMap[disID].CF = currentCF + cfEntry*(1-currentCF)
			}
		}

		// Sort and find top result
		var finalResults []DiagnosisResult
		for _, res := range resultsMap {
			if res.CF > 0 {
				finalResults = append(finalResults, DiagnosisResult{
					DiseaseName:     res.Name,
					Description:     res.Description,
					CFValue:         res.CF,
					Percentage:      res.CF * 100,
					Recommendations: res.Solutions,
				})
			}
		}

		// Sort by CFValue descending
		for i := 0; i < len(finalResults); i++ {
			for j := i + 1; j < len(finalResults); j++ {
				if finalResults[i].CFValue < finalResults[j].CFValue {
					finalResults[i], finalResults[j] = finalResults[j], finalResults[i]
				}
			}
		}

		if len(finalResults) == 0 {
			return c.JSON(fiber.Map{"message": "No specific condition detected based on answers.", "results": []string{}})
		}

		// --- SAVE HISTORY TO DB (Only if Logged In) ---
		top := finalResults[0]

		var internalUserID *int
		if req.UserEmail != "" {
			var uid int
			err := dbpool.QueryRow(context.Background(), "SELECT user_id FROM users WHERE email=$1", req.UserEmail).Scan(&uid)
			if err == nil {
				internalUserID = &uid
			}
		}

		if internalUserID != nil {
			// 2. Map CF level
			levelID := 1
			if top.Percentage > 70 {
				levelID = 3
			} else if top.Percentage > 40 {
				levelID = 1
			}

			// 3. Insert track_progress
			var trackID int
			err = dbpool.QueryRow(context.Background(), `
				INSERT INTO track_progress (user_id, level_id, total_cf_value, persentase, created_at, updated_at)
				VALUES ($1, $2, $3, $4, NOW(), NOW())
				RETURNING track_id
			`, internalUserID, levelID, top.CFValue, top.Percentage).Scan(&trackID)

			if err != nil {
				log.Printf("Error saving track_progress: %v", err)
			} else {
				// 4. Insert track_detail (answers)
				for _, ans := range req.Answers {
					_, err = dbpool.Exec(context.Background(), `
						INSERT INTO track_detail (track_id, symptoms_id, intensity_value)
						VALUES ($1, $2, $3)
					`, trackID, ans.SymptomID, ans.Value)
					if err != nil {
						log.Printf("Error saving track_detail (sym %d): %v", ans.SymptomID, err)
					}
				}
			}
		}

		return c.JSON(fiber.Map{
			"top_result":  top,
			"all_results": finalResults,
		})
	})

	log.Fatal(app.Listen(":8080"))
}
