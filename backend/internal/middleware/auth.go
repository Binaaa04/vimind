package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func AuthRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{"error": "Missing authorization header"})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid authorization header format"})
		}

		tokenString := parts[1]
		
		// Note: In Supabase, the JWT Secret is used to sign the tokens.
		// If using Supabase Auth, you can also verify against their JWKS.
		// For simplicity, we assume JWT_SECRET is set in the environment.
		jwtSecret := os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			// Fallback for development if not set, BUT WARN in logs
			// Ideally, this should be a hard failure in production.
			return c.Status(500).JSON(fiber.Map{"error": "Server configuration error: JWT_SECRET not set"})
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid or expired token"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid token claims"})
		}

		// Supabase stores email in the 'email' claim or inside 'user_metadata'
		email, _ := claims["email"].(string)
		if email == "" {
			// Check user_metadata if email is not top-level
			if metadata, ok := claims["user_metadata"].(map[string]interface{}); ok {
				email, _ = metadata["email"].(string)
			}
		}

		if email == "" {
			return c.Status(401).JSON(fiber.Map{"error": "Email not found in token"})
		}

		// Store email in context for later use in handlers
		c.Locals("user_email", email)
		return c.Next()
	}
}
