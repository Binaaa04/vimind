package routes

import (
	"pbl-vimind/backend/internal/controllers"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *controllers.Handler) {
	api := app.Group("/api")

	api.Get("/questions", handler.GetQuestions)
	api.Post("/diagnose", handler.Diagnose)
	api.Get("/profile", handler.GetProfile)
	api.Post("/profile", handler.UpdateProfile)
	api.Get("/history", handler.GetHistory)
	api.Get("/news", handler.GetDynamicNews)
	api.Post("/chat", handler.Chatbot)
}
