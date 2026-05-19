package middleware

import (
	"github.com/gofiber/fiber/v2"
)

type AdminChecker interface {
	CheckAdmin(email string) error
}

func AdminAuth(checker AdminChecker) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Email is always set by AuthRequired middleware which runs before this
		email, ok := c.Locals("user_email").(string)
		if !ok || email == "" {
			return c.Status(403).JSON(fiber.Map{"error": "Unauthorized: Admin identification missing"})
		}

		if err := checker.CheckAdmin(email); err != nil {
			return c.Status(403).JSON(fiber.Map{"error": "Unauthorized: Admin access required"})
		}

		return c.Next()
	}
}
