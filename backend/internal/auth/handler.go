package auth

import (
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	repo   *Repository
	worker *WorkerPool
}

func NewHandler(repo *Repository, worker *WorkerPool) *Handler {
	return &Handler{repo: repo, worker: worker}
}

func getRealIP(c *fiber.Ctx) string {
	// Try X-Forwarded-For header first (standard for reverse proxies)
	if xff := c.Get("X-Forwarded-For"); xff != "" {
		// X-Forwarded-For can contain multiple IPs separated by comma (client, proxy1, proxy2)
		// We want the first one (the client IP)
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			ip := strings.TrimSpace(parts[0])
			if ip != "" {
				return ip
			}
		}
	}
	// Try X-Real-IP header next
	if xrip := c.Get("X-Real-IP"); xrip != "" {
		return xrip
	}
	// Fallback to Fiber's default IP detection
	return c.IP()
}

func (h *Handler) GetProfile(c *fiber.Ctx) error {
	// Strictly use authenticated email from JWT context
	email, ok := c.Locals("user_email").(string)
	if !ok || email == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Not authenticated"})
	}

	id, name, userEmail, avatarURL, role, birthDate, err := h.repo.GetProfile(email)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	realIP := getRealIP(c)

	// Debug logs to inspect headers and resolved IP
	log.Printf("[DEBUG IP] Resolved IP: %s | c.IP(): %s | X-Forwarded-For: %s | X-Real-IP: %s", realIP, c.IP(), c.Get("X-Forwarded-For"), c.Get("X-Real-IP"))

	// Submit task to worker pool instead of raw goroutine
	h.worker.Submit(email, realIP)

	return c.JSON(fiber.Map{
		"id":         id,
		"name":       name,
		"email":      userEmail,
		"avatar_url": avatarURL,
		"role":       role,
		"birth_date": birthDate,
	})
}

func (h *Handler) UpdateProfile(c *fiber.Ctx) error {
	var pr ProfileReq
	if err := c.BodyParser(&pr); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Override email from body with authenticated email from context
	email, ok := c.Locals("user_email").(string)
	if ok && email != "" {
		pr.Email = email
	}

	if pr.Email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	err := h.repo.UpsertProfile(pr.Email, pr.Name, pr.AvatarURL, pr.BirthDate)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update profile"})
	}

	return c.JSON(fiber.Map{"message": "Profile updated successfully"})
}

func (h *Handler) DeleteAccount(c *fiber.Ctx) error {
	// Strictly use authenticated email from JWT context
	email, ok := c.Locals("user_email").(string)
	if !ok || email == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Not authenticated"})
	}

	err := h.repo.DeleteUser(email)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete account"})
	}

	return c.JSON(fiber.Map{"message": "Account deleted successfully"})
}
