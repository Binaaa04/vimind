package feedback

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) GetPublicTestimonials(c *fiber.Ctx) error {
	list, err := h.repo.GetPublicTestimonials()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch testimonials"})
	}
	if list == nil {
		list = []Testimonial{}
	}
	return c.JSON(list)
}

func (h *Handler) SubmitTestimonial(c *fiber.Ctx) error {
	var t Testimonial
	if err := c.BodyParser(&t); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Use authenticated email if available
	email, ok := c.Locals("user_email").(string)
	if ok && email != "" {
		t.Email = email
	}

	if t.Email == "" || t.Name == "" || t.Comment == "" || t.Rating < 1 || t.Rating > 5 {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid testimonial data"})
	}
	if err := h.repo.InsertTestimonial(t); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to submit testimonial"})
	}
	return c.JSON(fiber.Map{"message": "Testimonial submitted successfully"})
}

func (h *Handler) SubmitAccountFeedback(c *fiber.Ctx) error {
	var body struct {
		Email  string `json:"email"`
		Reason string `json:"reason"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Use authenticated email if available
	email, ok := c.Locals("user_email").(string)
	if ok && email != "" {
		body.Email = email
	}

	if body.Email == "" || body.Reason == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email and reason are required"})
	}
	if err := h.repo.InsertAccountFeedback(body.Email, body.Reason); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to submit account feedback"})
	}
	return c.JSON(fiber.Map{"message": "Feedback submitted successfully"})
}

func (h *Handler) GetAllTestimonials(c *fiber.Ctx) error {
	list, err := h.repo.GetAllTestimonials()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch testimonials"})
	}
	if list == nil {
		list = []Testimonial{}
	}
	return c.JSON(list)
}

func (h *Handler) UpdateTestimonialDisplay(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid testimonial ID"})
	}
	var body struct {
		IsDisplayed bool `json:"is_displayed"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if err := h.repo.UpdateTestimonialDisplay(id, body.IsDisplayed); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update testimonial"})
	}
	return c.JSON(fiber.Map{"message": "Testimonial updated successfully"})
}

func (h *Handler) GetAllAccountFeedbacks(c *fiber.Ctx) error {
	list, err := h.repo.GetAllAccountFeedbacks()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch account feedbacks"})
	}
	if list == nil {
		list = []AccountFeedback{}
	}
	return c.JSON(list)
}



func (h *Handler) CheckRating(c *fiber.Ctx) error {
	// Use authenticated email if available
	email, ok := c.Locals("user_email").(string)
	if !ok || email == "" {
		email = c.Query("email")
	}

	if email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	hasRated, err := h.repo.HasRated(email)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to check rating"})
	}

	return c.JSON(fiber.Map{"has_rated": hasRated})
}
