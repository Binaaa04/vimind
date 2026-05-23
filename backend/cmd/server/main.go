package main

import (
	"log"
	"os"
	"time"

	"pbl-vimind/backend/pkg/config"
	"pbl-vimind/backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	config.LoadEnv()

	db := config.ConnectDB()
	defer db.Close()

	app := fiber.New(fiber.Config{
		BodyLimit:   50 * 1024 * 1024,
		ProxyHeader: "X-Forwarded-For",
	})

	app.Use(recover.New())
	app.Use(helmet.New())
	
	// Restrict CORS to authorized origins
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "*" // Fallback for dev, but warn
		log.Println("Warning: FRONTEND_URL not set, allowing all origins (*)")
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins: frontendURL,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Admin-Email",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	app.Use(limiter.New(limiter.Config{
		Max:        100, // Increased slightly for production
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{
				"error": "Terlalu banyak permintaan! Silakan coba lagi dalam 1 menit.",
			})
		},
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("ViMind Backend is running modullary! ")
	})

	routes.RegisterRoutes(app, db)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
