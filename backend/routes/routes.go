package routes

import (
	"pbl-vimind/backend/internal/controllers"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *controllers.Handler) {
	api := app.Group("/api")

	// ===================== PUBLIC =====================
	api.Get("/questions", handler.GetQuestions)
	api.Post("/questions/discovery", handler.GetDiscoveryQuestions) // NEW: Hidden logic
	api.Post("/diagnose", handler.Diagnose)
	api.Get("/profile", handler.GetProfile)
	api.Post("/profile", handler.UpdateProfile)
	api.Delete("/profile", handler.DeleteAccount)
	api.Get("/history", handler.GetHistory)
	api.Get("/news", handler.GetDynamicNews)
	api.Post("/chat", handler.Chatbot)

	// Public FAQ (untuk Home page)
	api.Get("/faq", handler.GetFAQ)

	// Public Banners (untuk Dashboard carousel)
	api.Get("/banners", handler.GetPublicBanners)

	// Feedback & Testimonials (Public)
	api.Get("/testimonials", handler.GetPublicTestimonials)
	api.Post("/testimonials", handler.SubmitTestimonial)
	api.Post("/account_feedbacks", handler.SubmitAccountFeedback)

	// ===================== ADMIN =====================
	// Satpam (Middleware) Admin: Cek role di database sebelum memproses request
	adminOnly := func(c *fiber.Ctx) error {
		email := c.Get("X-Admin-Email") // Frontend harus kirim header ini untuk identifikasi
		if email == "" {
			email = c.Query("admin_email") // Fallback ke query param
		}

		if email == "" {
			return c.Status(403).JSON(fiber.Map{"error": "Unauthorized: Admin identification missing"})
		}

		// Cek ke DB
		_, _, _, _, role, err := handler.Repo.GetProfile(email)
		if err != nil || role != "admin" {
			return c.Status(403).JSON(fiber.Map{"error": "Unauthorized: Admin access required"})
		}

		return c.Next()
	}

	admin := api.Group("/admin", adminOnly)

	// Banners
	admin.Get("/banners", handler.GetBanners)
	admin.Post("/banners", handler.UpsertBanner)
	admin.Delete("/banners/:id", handler.DeleteBanner)

	// FAQ
	admin.Get("/faq", handler.GetFAQ)
	admin.Post("/faq", handler.UpsertFAQ)
	admin.Delete("/faq/:id", handler.DeleteFAQ)

	// Knowledge Base
	admin.Get("/symptoms", handler.GetAdminSymptoms)
	admin.Post("/symptoms", handler.UpsertAdminSymptom)
	admin.Delete("/symptoms/:id", handler.DeleteAdminSymptom)

	admin.Get("/diseases", handler.GetAdminDiseases)
	admin.Post("/diseases", handler.UpsertAdminDisease)
	admin.Delete("/diseases/:id", handler.DeleteAdminDisease)

	admin.Get("/rules", handler.GetAdminRules)
	admin.Post("/rules", handler.UpsertAdminRule)
	admin.Delete("/rules/:id", handler.DeleteAdminRule)


	// Feedbacks & Testimonials (Admin)
	admin.Get("/testimonials", handler.GetAllTestimonials)
	admin.Put("/testimonials/:id/display", handler.UpdateTestimonialDisplay)
	admin.Get("/account_feedbacks", handler.GetAllAccountFeedbacks)
}
