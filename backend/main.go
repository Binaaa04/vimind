package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"pbl-vimind/backend/config"
	"pbl-vimind/backend/internal/controllers"
	"pbl-vimind/backend/internal/repository"
	"pbl-vimind/backend/routes"
)

func main() {
	// 1. Initialization
	config.LoadEnv()
	db := config.ConnectDB()
	defer db.Close()

	// 2. Setup Layer
	repo := repository.NewRepository(db)
	handler := controllers.NewHandler(repo)

	// 3. Setup Fiber
	app := fiber.New(fiber.Config{
		BodyLimit: 50 * 1024 * 1024, // 50MB (Bener-bener lega buat gambar Base64)
	})

	// Middlewares
	app.Use(recover.New()) // Prevent server from crashing on panics
	app.Use(helmet.New())  // Security headers (Anti-XSS, etc.)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "*", // ALLOW SEMUA HEADER BIAR GAK REWEL!
	}))

	// Rate Limiting (Anti-DDoS & Anti-Spam)
	app.Use(limiter.New(limiter.Config{
		Max:        50,               // 50 requests
		Expiration: 1 * time.Minute,  // per 1 minute
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{
				"error": "Mencurigakan! Kamu terlalu cepat, silakan istirahat 1 menit.",
			})
		},
	}))

	// Health Check
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("ViMind Backend is running modullary! 🚀")
	})

	// 4. Register Routes
	routes.RegisterRoutes(app, handler)

	// 5. Start Server
	log.Fatal(app.Listen("127.0.0.1:8080"))
}
