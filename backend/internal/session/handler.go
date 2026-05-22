package session

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	cache *Cache
}

func NewHandler(cache *Cache) *Handler {
	return &Handler{cache: cache}
}

func (h *Handler) SaveTestSession(c *fiber.Ctx) error {
	key := resolveKey(c)
	if key == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email or session_id is required"})
	}

	var body TestSession
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	h.cache.Set(key, &body)
	return c.JSON(fiber.Map{"status": "saved"})
}

func (h *Handler) GetTestSession(c *fiber.Ctx) error {
	key := resolveKey(c)
	if key == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email or session_id is required"})
	}

	session, exists := h.cache.Get(key)
	if !exists {
		return c.JSON(fiber.Map{"exists": false})
	}

	return c.JSON(fiber.Map{
		"exists":       true,
		"answers":      session.Answers,
		"current_page": session.CurrentPage,
	})
}

func (h *Handler) DeleteTestSession(c *fiber.Ctx) error {
	key := resolveKey(c)
	if key == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email or session_id is required"})
	}

	h.cache.Delete(key)
	return c.JSON(fiber.Map{"status": "deleted"})
}

func resolveKey(c *fiber.Ctx) string {
	// Use authenticated email if available
	authEmail, _ := c.Locals("user_email").(string)
	if authEmail != "" {
		return "email:" + authEmail
	}
	
	// If querying for email, ensure it matches the authenticated user
	if email := c.Query("email"); email != "" {
		if authEmail == email {
			return "email:" + authEmail
		}
		return ""
	}
	if sid := c.Query("session_id"); sid != "" {
		return "sid:" + sid
	}
	return ""
}
