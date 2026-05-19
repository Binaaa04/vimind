package diagnosis

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type UserService interface {
	GetUserIDByEmail(email string) (int, error)
	CreateUser(email, name string) (int, error)
}

type Handler struct {
	repo    *Repository
	service *Service
	users   UserService
}

func NewHandler(repo *Repository, service *Service, users UserService) *Handler {
	return &Handler{repo: repo, service: service, users: users}
}

func (h *Handler) GetQuestions(c *fiber.Ctx) error {
	mode := c.Query("mode", "default")
	idsStr := c.Query("disease_ids")
	email := c.Query("email")

	var diseaseIDs []int
	isRefined := false

	if mode == "refined" && email != "" {
		uid, err := h.users.GetUserIDByEmail(email)
		if err == nil {
			lastDiseaseID, err := h.repo.GetLatestDiagnosisDiseaseID(uid)
			if err == nil && lastDiseaseID > 0 && lastDiseaseID != 10 {
				diseaseIDs = append(diseaseIDs, lastDiseaseID)
				isRefined = true
			} else {
				mode = "all"
			}
		} else {
			mode = "all"
		}
	} else if mode == "refined" && email == "" {
		mode = "all"
	} else if idsStr != "" {
		parts := strings.Split(idsStr, ",")
		for _, p := range parts {
			var id int
			fmt.Sscanf(p, "%d", &id)
			if id > 0 {
				diseaseIDs = append(diseaseIDs, id)
			}
		}
	}

	questions, err := h.repo.GetQuestions(mode, diseaseIDs)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions"})
	}

	if len(questions) == 0 && mode == "refined" {
		questions, _ = h.repo.GetQuestions("all", nil)
	}

	historyDiseaseID := 0
	if isRefined && len(diseaseIDs) > 0 {
		historyDiseaseID = diseaseIDs[0]
	}
	return c.JSON(fiber.Map{
		"questions":          questions,
		"is_refined":         isRefined,
		"history_disease_id": historyDiseaseID,
	})
}

func (h *Handler) GetDiscoveryQuestions(c *fiber.Ctx) error {
	var body struct {
		Answers []struct {
			SymptomID int     `json:"symptom_id"`
			Value     float64 `json:"value"`
			DiseaseID int     `json:"disease_id"`
		} `json:"answers"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var strongSymptomIDs []int
	for _, a := range body.Answers {
		if a.Value >= 0.5 {
			strongSymptomIDs = append(strongSymptomIDs, a.SymptomID)
		}
	}

	var finalSuspects []int
	if len(strongSymptomIDs) > 0 {
		ids, err := h.repo.GetSuspectDiseases(strongSymptomIDs)
		if err == nil {
			finalSuspects = ids
		}
	}

	if len(finalSuspects) == 0 {
		finalSuspects = []int{1, 2}
	}

	var filteredSuspects []int
	for _, id := range finalSuspects {
		if id > 0 {
			filteredSuspects = append(filteredSuspects, id)
		}
	}
	if len(filteredSuspects) == 0 {
		filteredSuspects = []int{1, 2}
	}

	questions, err := h.repo.GetQuestions("discovery", filteredSuspects)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch discovery questions"})
	}

	return c.JSON(fiber.Map{"questions": questions})
}

func (h *Handler) Diagnose(c *fiber.Ctx) error {
	var req DiagnosisRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if len(req.Answers) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "No answers provided"})
	}

	for _, ans := range req.Answers {
		if ans.Value < 0 || ans.Value > 1 {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid data: value must be between 0 and 1."})
		}
	}

	// Use authenticated email if available
	email, ok := c.Locals("user_email").(string)
	isAuthenticated := ok && email != ""
	
	if isAuthenticated {
		req.UserEmail = email
	}

	var internalUserID *int

	// Only attempt to find or create a user and save results if authenticated
	if isAuthenticated && req.UserEmail != "" {
		uid, err := h.users.GetUserIDByEmail(req.UserEmail)
		if err != nil {
			// Create user if they are authenticated but not in our DB yet
			uid, err = h.users.CreateUser(req.UserEmail, strings.Split(req.UserEmail, "@")[0])
			if err == nil {
				internalUserID = &uid
			}
		} else {
			internalUserID = &uid
		}
	}

	uid := 0
	if internalUserID != nil {
		uid = *internalUserID
	}

	finalResults, err := h.service.CalculateCF(req.Answers, req.RefinedDiseaseID, uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Diagnosis failed"})
	}

	top := finalResults[0]

	// Only save to DB if we have an authenticated user ID
	if internalUserID != nil {
		levelID := h.service.DetermineLevelID(top.Percentage)

		topDiseaseID, err := h.repo.GetDiseaseIDByName(top.DiseaseName)
		if err == nil {
			diagnosisID, err := h.repo.SaveDiagnosis(*internalUserID, topDiseaseID, levelID, top.CFValue, top.Percentage)
			if err == nil {
				for _, ans := range req.Answers {
					h.repo.SaveDiagnosisDetail(diagnosisID, ans.SymptomID, ans.Value)
				}
			}
		}
	}

	return c.JSON(fiber.Map{
		"top_result":  top,
		"all_results": finalResults,
	})
}

func (h *Handler) GetHistory(c *fiber.Ctx) error {
	// Strictly use authenticated email from JWT context
	email, ok := c.Locals("user_email").(string)
	if !ok || email == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Not authenticated"})
	}

	uid, err := h.users.GetUserIDByEmail(email)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	history, err := h.repo.GetHistory(uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch history"})
	}

	return c.JSON(history)
}

func (h *Handler) GetLevelCategories(c *fiber.Ctx) error {
	list, err := h.repo.GetLevelCategories()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch level categories"})
	}
	if list == nil {
		list = []LevelCategory{}
	}
	return c.JSON(list)
}
