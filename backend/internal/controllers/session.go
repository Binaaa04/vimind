package controllers

import (
	"sync"

	"github.com/gofiber/fiber/v2"
)

// ============================================================
// In-memory test session cache
// Key bisa email (user login) ATAU session_id (guest)
// ============================================================

type TestSession struct {
	Answers     map[string]int `json:"answers"`      // questionID (string) → optionValue (1-4)
	CurrentPage int            `json:"current_page"`
}

var (
	sessionCache = make(map[string]*TestSession)
	sessionMu    sync.RWMutex
)

// resolveKey — ambil key dari query: email atau session_id
func resolveKey(c *fiber.Ctx) string {
	if email := c.Query("email"); email != "" {
		return "email:" + email
	}
	if sid := c.Query("session_id"); sid != "" {
		return "sid:" + sid
	}
	return ""
}

// POST /api/test-session — simpan progress tes
func (h *Handler) SaveTestSession(c *fiber.Ctx) error {
	key := resolveKey(c)
	if key == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email or session_id is required"})
	}

	var body TestSession
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	sessionMu.Lock()
	sessionCache[key] = &body
	sessionMu.Unlock()

	return c.JSON(fiber.Map{"status": "saved"})
}

// GET /api/test-session — ambil progress tes
func (h *Handler) GetTestSession(c *fiber.Ctx) error {
	key := resolveKey(c)
	if key == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email or session_id is required"})
	}

	sessionMu.RLock()
	session, exists := sessionCache[key]
	sessionMu.RUnlock()

	if !exists {
		return c.JSON(fiber.Map{"exists": false})
	}

	return c.JSON(fiber.Map{
		"exists":       true,
		"answers":      session.Answers,
		"current_page": session.CurrentPage,
	})
}

// DELETE /api/test-session — hapus session setelah selesai tes
func (h *Handler) DeleteTestSession(c *fiber.Ctx) error {
	key := resolveKey(c)
	if key == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email or session_id is required"})
	}

	sessionMu.Lock()
	delete(sessionCache, key)
	sessionMu.Unlock()

	return c.JSON(fiber.Map{"status": "deleted"})
}
