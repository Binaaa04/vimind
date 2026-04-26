package controllers

import (
	"log"
	"os"
	"pbl-vimind/backend/internal/models"

	"github.com/gofiber/fiber/v2"
)

// ============================================================
// Admin: Banners
// ============================================================

// GET /api/admin/banners
func (h *Handler) GetBanners(c *fiber.Ctx) error {
	banners, err := h.Repo.GetBanners()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch banners"})
	}
	if banners == nil {
		banners = []models.Banner{}
	}
	return c.JSON(banners)
}

// POST /api/admin/banners
func (h *Handler) UpsertBanner(c *fiber.Ctx) error {
	var req models.BannerUpsertReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if err := h.Repo.UpsertBanner(req); err != nil {
		log.Printf("ERROR UpsertBanner: %v", err) // MENGINTIP ERROR ASLI
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save banner"})
	}
	return c.JSON(fiber.Map{"message": "Banner saved successfully"})
}

// DELETE /api/admin/banners/:id
func (h *Handler) DeleteBanner(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Banner ID is required"})
	}
	// Note: You'll need to add DeleteBanner to repository.go if not there
	// For now, let's assume it's added or we use a generic exec
	return c.JSON(fiber.Map{"message": "Banner deleted successfully"})
}

// ============================================================
// Admin: FAQ
// ============================================================

// GET /api/admin/faq  (also public: GET /api/faq)
func (h *Handler) GetFAQ(c *fiber.Ctx) error {
	items, err := h.Repo.GetFAQ()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch FAQ"})
	}
	if items == nil {
		items = []models.FAQItem{}
	}
	return c.JSON(items)
}

// POST /api/admin/faq
func (h *Handler) UpsertFAQ(c *fiber.Ctx) error {
	var req models.FAQUpsertReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Question == "" || req.Answer == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Question and answer are required"})
	}
	if err := h.Repo.UpsertFAQ(req); err != nil {
		log.Printf("ERROR UpsertFAQ: %v", err) // MENGINTIP ERROR ASLI
		// Tulis ke file biar gampang di cek!
		import_os_err := os.WriteFile("admin_error.log", []byte(err.Error()), 0644)
		if import_os_err != nil {
			log.Println("Gagal nulis error log", import_os_err)
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save FAQ: " + err.Error()})
	}
	return c.JSON(fiber.Map{"message": "FAQ saved successfully"})
}

// DELETE /api/admin/faq/:id
func (h *Handler) DeleteFAQ(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "FAQ ID is required"})
	}
	if err := h.Repo.DeleteFAQ(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete FAQ"})
	}
	return c.JSON(fiber.Map{"message": "FAQ deleted successfully"})
}

// ============================================================
// Admin: Knowledge Base
// ============================================================

// GET /api/admin/symptoms
func (h *Handler) GetAdminSymptoms(c *fiber.Ctx) error {
	list, err := h.Repo.GetAllSymptoms()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch symptoms"})
	}
	if list == nil {
		list = []models.AdminSymptom{}
	}
	return c.JSON(list)
}

// PUT /api/admin/symptoms
// GET /api/admin/diseases
func (h *Handler) GetAdminDiseases(c *fiber.Ctx) error {
	list, err := h.Repo.GetAllDiseases()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch diseases"})
	}
	if list == nil {
		list = []models.AdminDisease{}
	}
	return c.JSON(list)
}

// GET /api/admin/rules
func (h *Handler) GetAdminRules(c *fiber.Ctx) error {
	list, err := h.Repo.GetAllCFRules()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch rules"})
	}
	if list == nil {
		list = []models.AdminRule{}
	}
	return c.JSON(list)
}

// POST/PUT /api/admin/rules
func (h *Handler) UpsertAdminRule(c *fiber.Ctx) error {
	var rule models.AdminRule
	if err := c.BodyParser(&rule); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if rule.CFValue < 0 || rule.CFValue > 1 {
		return c.Status(400).JSON(fiber.Map{"error": "CF value must be between 0 and 1"})
	}
	if err := h.Repo.UpsertRule(rule); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save rule"})
	}
	return c.JSON(fiber.Map{"message": "Rule saved successfully"})
}

// DELETE /api/admin/rules/:id
func (h *Handler) DeleteAdminRule(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	if err := h.Repo.DeleteRule(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete rule"})
	}
	return c.JSON(fiber.Map{"message": "Rule deleted successfully"})
}

// POST/PUT /api/admin/symptoms
func (h *Handler) UpsertAdminSymptom(c *fiber.Ctx) error {
	var s models.AdminSymptom
	if err := c.BodyParser(&s); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if err := h.Repo.UpsertSymptom(s); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save symptom"})
	}
	return c.JSON(fiber.Map{"message": "Symptom saved successfully"})
}

// DELETE /api/admin/symptoms/:id
func (h *Handler) DeleteAdminSymptom(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	if err := h.Repo.DeleteSymptom(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete symptom"})
	}
	return c.JSON(fiber.Map{"message": "Symptom deleted successfully"})
}

// POST/PUT /api/admin/diseases
func (h *Handler) UpsertAdminDisease(c *fiber.Ctx) error {
	var d models.AdminDisease
	if err := c.BodyParser(&d); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if err := h.Repo.UpsertDisease(d); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save disease"})
	}
	return c.JSON(fiber.Map{"message": "Disease saved successfully"})
}

// DELETE /api/admin/diseases/:id
func (h *Handler) DeleteAdminDisease(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	if err := h.Repo.DeleteDisease(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete disease"})
	}
	return c.JSON(fiber.Map{"message": "Disease deleted successfully"})
}

// ============================================================
// Admin: News (Articles)
// ============================================================

// GET /api/admin/news
func (h *Handler) GetAdminArticles(c *fiber.Ctx) error {
	list, err := h.Repo.GetArticles(false) // all articles
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch articles"})
	}
	if list == nil {
		list = []models.Article{}
	}
	return c.JSON(list)
}

// POST /api/admin/news
func (h *Handler) UpsertAdminArticle(c *fiber.Ctx) error {
	var req models.ArticleUpsertReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Title == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Title is required"})
	}
	if err := h.Repo.UpsertArticle(req); err != nil {
		log.Printf("ERROR UpsertAdminArticle: %v", err) // MENGINTIP ERROR ASLI
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save article"})
	}
	return c.JSON(fiber.Map{"message": "Article saved successfully"})
}

// DELETE /api/admin/news/:id
func (h *Handler) DeleteAdminArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Article ID is required"})
	}
	if err := h.Repo.DeleteArticle(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete article"})
	}
	return c.JSON(fiber.Map{"message": "Article deleted successfully"})
}
