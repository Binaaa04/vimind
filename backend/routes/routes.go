package routes

import (
	"fmt"

	"pbl-vimind/backend/internal/admin"
	"pbl-vimind/backend/internal/auth"
	"pbl-vimind/backend/internal/chatbot"
	"pbl-vimind/backend/internal/diagnosis"
	"pbl-vimind/backend/internal/feedback"
	"pbl-vimind/backend/internal/middleware"
	"pbl-vimind/backend/internal/news"
	"pbl-vimind/backend/internal/session"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type chatDiagnosisProvider struct {
	authRepo *auth.Repository
	diagRepo *diagnosis.Repository
}

func (p *chatDiagnosisProvider) GetLatestDiagnosisSummary(email string) (*chatbot.DiagnosisSummary, error) {
	uid, err := p.authRepo.GetUserIDByEmail(email)
	if err != nil {
		return nil, err
	}
	history, err := p.diagRepo.GetHistory(uid)
	if err != nil || len(history) == 0 {
		return nil, fmt.Errorf("no history")
	}
	latest := history[0]
	return &chatbot.DiagnosisSummary{
		Disease:    latest.Disease,
		Level:      latest.Level,
		Percentage: latest.Percentage,
	}, nil
}

func RegisterRoutes(app *fiber.App, db *pgxpool.Pool) {
	api := app.Group("/api")

	// ---- Repositories ----
	authRepo := auth.NewRepository(db)
	diagRepo := diagnosis.NewRepository(db)
	adminRepo := admin.NewRepository(db)
	feedbackRepo := feedback.NewRepository(db)

	// ---- Services ----
	diagSvc := diagnosis.NewService(diagRepo)
	chatSvc := chatbot.NewService()
	sessionCache := session.NewCache()

	newsSvc := news.NewService(func(limit int) ([]news.NewsItem, error) {
		articles, err := adminRepo.GetArticles(true)
		if err != nil {
			return nil, err
		}
		var items []news.NewsItem
		for i, a := range articles {
			if i >= limit {
				break
			}
			items = append(items, news.NewsItem{
				ID:        i + 1,
				Title:     a.Title,
				Link:      a.LinkURL,
				Image:     a.ImageURL,
				Source:    a.Source,
				Highlight: "Admin Choice",
			})
		}
		return items, nil
	})

	// ---- Handlers ----
	authHandler := auth.NewHandler(authRepo)
	diagHandler := diagnosis.NewHandler(diagRepo, diagSvc, authRepo)
	chatHandler := chatbot.NewHandler(chatSvc, &chatDiagnosisProvider{authRepo: authRepo, diagRepo: diagRepo})
	newsHandler := news.NewHandler(newsSvc)
	feedbackHandler := feedback.NewHandler(feedbackRepo)
	sessionHandler := session.NewHandler(sessionCache)
	adminHandler := admin.NewHandler(adminRepo)

	// ---- Middleware ----
	adminAuth := middleware.AdminAuth(authRepo)

	// ===================== PUBLIC =====================
	api.Get("/questions", diagHandler.GetQuestions)
	api.Post("/questions/discovery", diagHandler.GetDiscoveryQuestions)
	api.Post("/diagnose", diagHandler.Diagnose)
	api.Get("/profile", authHandler.GetProfile)
	api.Post("/profile", authHandler.UpdateProfile)
	api.Delete("/profile", authHandler.DeleteAccount)
	api.Get("/history", diagHandler.GetHistory)
	api.Get("/news", newsHandler.GetDynamicNews)
	api.Post("/chat", chatHandler.Chatbot)

	api.Get("/faq", adminHandler.GetFAQ)
	api.Get("/banners", adminHandler.GetPublicBanners)
	api.Get("/levels", diagHandler.GetLevelCategories)

	api.Post("/test-session", sessionHandler.SaveTestSession)
	api.Get("/test-session", sessionHandler.GetTestSession)
	api.Delete("/test-session", sessionHandler.DeleteTestSession)

	api.Get("/testimonials", feedbackHandler.GetPublicTestimonials)
	api.Post("/testimonials", feedbackHandler.SubmitTestimonial)
	api.Post("/account_feedbacks", feedbackHandler.SubmitAccountFeedback)
	api.Post("/mood", feedbackHandler.SaveMood)

	// ===================== ADMIN =====================
	admin := api.Group("/admin", adminAuth)

	admin.Get("/analytics", adminHandler.GetAnalyticsDashboard)

	admin.Get("/banners", adminHandler.GetBanners)
	admin.Post("/banners", adminHandler.UpsertBanner)
	admin.Delete("/banners/:id", adminHandler.DeleteBanner)

	admin.Get("/faq", adminHandler.GetFAQ)
	admin.Post("/faq", adminHandler.UpsertFAQ)
	admin.Delete("/faq/:id", adminHandler.DeleteFAQ)

	admin.Get("/symptoms", adminHandler.GetAdminSymptoms)
	admin.Post("/symptoms", adminHandler.UpsertAdminSymptom)
	admin.Delete("/symptoms/:id", adminHandler.DeleteAdminSymptom)

	admin.Get("/diseases", adminHandler.GetAdminDiseases)
	admin.Post("/diseases", adminHandler.UpsertAdminDisease)
	admin.Delete("/diseases/:id", adminHandler.DeleteAdminDisease)

	admin.Get("/rules", adminHandler.GetAdminRules)
	admin.Post("/rules", adminHandler.UpsertAdminRule)
	admin.Delete("/rules/:id", adminHandler.DeleteAdminRule)

	admin.Get("/testimonials", feedbackHandler.GetAllTestimonials)
	admin.Put("/testimonials/:id/display", feedbackHandler.UpdateTestimonialDisplay)
	admin.Get("/account_feedbacks", feedbackHandler.GetAllAccountFeedbacks)
}
