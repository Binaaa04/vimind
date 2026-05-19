package chatbot

import (
	"github.com/gofiber/fiber/v2"
)

type DiagnosisProvider interface {
	GetLatestDiagnosisSummary(email string) (*DiagnosisSummary, error)
}

type Handler struct {
	service  *Service
	diagInfo DiagnosisProvider
}

func NewHandler(service *Service, diagInfo DiagnosisProvider) *Handler {
	return &Handler{service: service, diagInfo: diagInfo}
}

func (h *Handler) Chatbot(c *fiber.Ctx) error {
	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var summary DiagnosisSummary
	// Use authenticated email from JWT context, NOT from request body (prevents IDOR)
	email, _ := c.Locals("user_email").(string)
	if email != "" {
		s, err := h.diagInfo.GetLatestDiagnosisSummary(email)
		if err == nil && s != nil {
			summary = *s
		}
	}

	reply, err := h.service.GetReply(req.Messages, summary)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Maaf, aku sedang tidak bisa diajak mengobrol sebentar. Coba lagi nanti ya!"})
	}

	return c.JSON(fiber.Map{
		"reply": reply,
	})
}
