package news

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetDynamicNews(c *fiber.Ctx) error {
	newsList, err := h.service.GetNews()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch news"})
	}
	return c.JSON(newsList)
}
