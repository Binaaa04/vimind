package controllers

import (
	"fmt"
	"log"
	"strings"

	"pbl-vimind/backend/internal/models"
	"pbl-vimind/backend/internal/repository"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Repo *repository.Repository
}

func NewHandler(repo *repository.Repository) *Handler {
	return &Handler{Repo: repo}
}

func (h *Handler) GetQuestions(c *fiber.Ctx) error {
	mode := c.Query("mode", "default")
	idsStr := c.Query("disease_ids")
	
	var diseaseIDs []int
	if idsStr != "" {
		parts := strings.Split(idsStr, ",")
		for _, p := range parts {
			var id int
			fmt.Sscanf(p, "%d", &id)
			if id > 0 {
				diseaseIDs = append(diseaseIDs, id)
			}
		}
	}

	questions, err := h.Repo.GetQuestions(mode, diseaseIDs)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions"})
	}
	return c.JSON(questions)
}

func (h *Handler) Diagnose(c *fiber.Ctx) error {
	var req models.DiagnosisRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if len(req.Answers) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "No answers provided"})
	}

	userAnswers := make(map[int]float64)
	for _, ans := range req.Answers {
		userAnswers[ans.SymptomID] = ans.Value
	}

	rules, err := h.Repo.GetAllRules()
	if err != nil {
		log.Printf("Error fetching diagnostic rules: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch diagnostic rules"})
	}

	resultsMap := make(map[int]*models.DiseaseCF)
	for _, r := range rules {
		if _, ok := resultsMap[r.DiseaseID]; !ok {
			resultsMap[r.DiseaseID] = &models.DiseaseCF{Name: r.Name, Description: r.Desc, Solutions: r.Solutions, CF: 0}
		}

		if userVal, answered := userAnswers[r.SymptomID]; answered {
			cfEntry := userVal * r.ExpertCF
			currentCF := resultsMap[r.DiseaseID].CF
			resultsMap[r.DiseaseID].CF = currentCF + cfEntry*(1-currentCF)
		}
	}

	var finalResults []models.DiagnosisResult
	for _, res := range resultsMap {
		if res.CF > 0 {
			finalResults = append(finalResults, models.DiagnosisResult{
				DiseaseName:     res.Name,
				Description:     res.Description,
				CFValue:         res.CF,
				Percentage:      res.CF * 100,
				Recommendations: res.Solutions,
			})
		}
	}

	// Sort manually (simple bubble sort as in previous main.go)
	for i := 0; i < len(finalResults); i++ {
		for j := i + 1; j < len(finalResults); j++ {
			if finalResults[i].CFValue < finalResults[j].CFValue {
				finalResults[i], finalResults[j] = finalResults[j], finalResults[i]
			}
		}
	}

	if len(finalResults) == 0 {
		return c.JSON(fiber.Map{"message": "No specific condition detected based on answers.", "results": []string{}})
	}

	top := finalResults[0]
	var internalUserID *int

	if req.UserEmail != "" {
		uid, err := h.Repo.GetUserIDByEmail(req.UserEmail)
		if err != nil {
			// Auto-create
			uid, err = h.Repo.CreateUser(req.UserEmail, strings.Split(req.UserEmail, "@")[0])
			if err == nil {
				internalUserID = &uid
			}
		} else {
			internalUserID = &uid
		}
	}

	if internalUserID != nil {
		levelID := 1
		if top.Percentage > 70 {
			levelID = 3
		} else if top.Percentage > 40 {
			levelID = 1
		}

		topDiseaseID, err := h.Repo.GetDiseaseIDByName(top.DiseaseName)
		if err == nil {
			diagnosisID, err := h.Repo.SaveDiagnosis(*internalUserID, topDiseaseID, levelID, top.CFValue, top.Percentage)
			if err == nil {
				for _, ans := range req.Answers {
					h.Repo.SaveDiagnosisDetail(diagnosisID, ans.SymptomID, ans.Value)
				}
			}
		}
	}

	return c.JSON(fiber.Map{
		"top_result":  top,
		"all_results": finalResults,
	})
}

func (h *Handler) GetProfile(c *fiber.Ctx) error {
	email := c.Query("email")
	if email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	id, name, userEmail, avatarURL, err := h.Repo.GetProfile(email)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(fiber.Map{
		"id":         id,
		"name":       name,
		"email":      userEmail,
		"avatar_url": avatarURL,
	})
}

func (h *Handler) UpdateProfile(c *fiber.Ctx) error {
	var pr models.ProfileReq
	if err := c.BodyParser(&pr); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	err := h.Repo.UpsertProfile(pr.Email, pr.Name, pr.AvatarURL)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update profile"})
	}

	return c.JSON(fiber.Map{"message": "Profile updated successfully"})
}

func (h *Handler) GetHistory(c *fiber.Ctx) error {
	email := c.Query("email")
	if email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	uid, err := h.Repo.GetUserIDByEmail(email)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	history, err := h.Repo.GetHistory(uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch history"})
	}

	return c.JSON(history)
}
