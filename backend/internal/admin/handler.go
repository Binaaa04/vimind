package admin

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

// Public endpoints

func (h *Handler) GetPublicBanners(c *fiber.Ctx) error {
	list, err := h.repo.GetPublicBanners()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch banners"})
	}
	if list == nil {
		list = []Banner{}
	}
	return c.JSON(list)
}

func (h *Handler) GetFAQ(c *fiber.Ctx) error {
	items, err := h.repo.GetFAQ()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch FAQ"})
	}
	if items == nil {
		items = []FAQItem{}
	}
	return c.JSON(items)
}

// Admin endpoints - Banners

func (h *Handler) GetBanners(c *fiber.Ctx) error {
	banners, err := h.repo.GetBanners()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch banners"})
	}
	if banners == nil {
		banners = []Banner{}
	}
	return c.JSON(banners)
}

func (h *Handler) UpsertBanner(c *fiber.Ctx) error {
	var req BannerUpsertReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if err := h.repo.UpsertBanner(req); err != nil {
		log.Printf("ERROR UpsertBanner: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save banner"})
	}
	return c.JSON(fiber.Map{"message": "Banner saved successfully"})
}

func (h *Handler) DeleteBanner(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Banner ID is required"})
	}
	if err := h.repo.DeleteBanner(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete banner"})
	}
	return c.JSON(fiber.Map{"message": "Banner deleted successfully"})
}

// Admin endpoints - FAQ

func (h *Handler) UpsertFAQ(c *fiber.Ctx) error {
	var req FAQUpsertReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Question == "" || req.Answer == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Question and answer are required"})
	}
	if err := h.repo.UpsertFAQ(req); err != nil {
		log.Printf("ERROR UpsertFAQ: %v", err)
		_ = os.WriteFile("admin_error.log", []byte(err.Error()), 0644)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save FAQ"})
	}
	return c.JSON(fiber.Map{"message": "FAQ saved successfully"})
}

func (h *Handler) DeleteFAQ(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "FAQ ID is required"})
	}
	if err := h.repo.DeleteFAQ(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete FAQ"})
	}
	return c.JSON(fiber.Map{"message": "FAQ deleted successfully"})
}

// Admin endpoints - Knowledge Base

func (h *Handler) GetAdminSymptoms(c *fiber.Ctx) error {
	list, err := h.repo.GetAllSymptoms()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch symptoms"})
	}
	if list == nil {
		list = []AdminSymptom{}
	}
	return c.JSON(list)
}

func (h *Handler) UpsertAdminSymptom(c *fiber.Ctx) error {
	var s AdminSymptom
	if err := c.BodyParser(&s); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if err := h.repo.UpsertSymptom(s); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save symptom"})
	}
	return c.JSON(fiber.Map{"message": "Symptom saved successfully"})
}

func (h *Handler) DeleteAdminSymptom(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	if err := h.repo.DeleteSymptom(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete symptom"})
	}
	return c.JSON(fiber.Map{"message": "Symptom deleted successfully"})
}

func (h *Handler) GetAdminDiseases(c *fiber.Ctx) error {
	list, err := h.repo.GetAllDiseases()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch diseases"})
	}
	if list == nil {
		list = []AdminDisease{}
	}
	return c.JSON(list)
}

func (h *Handler) UpsertAdminDisease(c *fiber.Ctx) error {
	var d AdminDisease
	if err := c.BodyParser(&d); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if err := h.repo.UpsertDisease(d); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save disease"})
	}
	return c.JSON(fiber.Map{"message": "Disease saved successfully"})
}

func (h *Handler) DeleteAdminDisease(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	if err := h.repo.DeleteDisease(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete disease"})
	}
	return c.JSON(fiber.Map{"message": "Disease deleted successfully"})
}

func (h *Handler) GetAdminRules(c *fiber.Ctx) error {
	list, err := h.repo.GetAllCFRules()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch rules"})
	}
	if list == nil {
		list = []AdminRule{}
	}
	return c.JSON(list)
}

func (h *Handler) UpsertAdminRule(c *fiber.Ctx) error {
	var rule AdminRule
	if err := c.BodyParser(&rule); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if rule.CFValue < 0 || rule.CFValue > 1 {
		return c.Status(400).JSON(fiber.Map{"error": "CF value must be between 0 and 1"})
	}
	if err := h.repo.UpsertRule(rule); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save rule"})
	}
	return c.JSON(fiber.Map{"message": "Rule saved successfully"})
}

func (h *Handler) DeleteAdminRule(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	if err := h.repo.DeleteRule(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete rule"})
	}
	return c.JSON(fiber.Map{"message": "Rule deleted successfully"})
}

// Admin endpoints - Articles

func (h *Handler) GetAdminArticles(c *fiber.Ctx) error {
	list, err := h.repo.GetArticles(false)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch articles"})
	}
	if list == nil {
		list = []Article{}
	}
	return c.JSON(list)
}

func (h *Handler) UpsertAdminArticle(c *fiber.Ctx) error {
	var req ArticleUpsertReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Title == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Title is required"})
	}
	if err := h.repo.UpsertArticle(req); err != nil {
		log.Printf("ERROR UpsertAdminArticle: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save article"})
	}
	return c.JSON(fiber.Map{"message": "Article saved successfully"})
}

func (h *Handler) DeleteAdminArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Article ID is required"})
	}
	if err := h.repo.DeleteArticle(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete article"})
	}
	return c.JSON(fiber.Map{"message": "Article deleted successfully"})
}

func (h *Handler) GetAnalyticsDashboard(c *fiber.Ctx) error {
	summary, err := h.repo.GetDashboardAnalytics()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to load analytics"})
	}
	return c.JSON(summary)
}

func (h *Handler) GetAdminUsers(c *fiber.Ctx) error {
	list, err := h.repo.GetAllUsers()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch users"})
	}
	if list == nil {
		list = []AdminUser{}
	}
	return c.JSON(list)
}
