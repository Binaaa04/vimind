package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"

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
	app := fiber.New()

	// Middlewares
	app.Use(helmet.New())
	app.Use(cors.New())
	app.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: 15 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
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
