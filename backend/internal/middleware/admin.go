package middleware

import (
	"github.com/gofiber/fiber/v2"
)

type AdminChecker interface {
	CheckAdmin(email string) error
}

func AdminAuth(checker AdminChecker) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Prioritize email from JWT context (set by AuthRequired middleware)
		email, ok := c.Locals("user_email").(string)
		
		if !ok || email == "" {
			// Fallback to header/query for backward compatibility (DEPRECATED)
			email = c.Get("X-Admin-Email")
			if email == "" {
				email = c.Query("admin_email")
			}
		}

		if email == "" {
			return c.Status(403).JSON(fiber.Map{"error": "Unauthorized: Admin identification missing"})
		}

		if err := checker.CheckAdmin(email); err != nil {
			return c.Status(403).JSON(fiber.Map{"error": "Unauthorized: Admin access required"})
		}

		return c.Next()
	}
}
