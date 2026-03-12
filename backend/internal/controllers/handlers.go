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
	email := c.Query("email")
	
	var diseaseIDs []int

	if mode == "refined" && email != "" {
		lastDiseaseID, err := h.Repo.GetLatestDiagnosisDiseaseID(email)
		if err == nil && lastDiseaseID > 0 && lastDiseaseID != 10 { // 10 is Normal/Sehat
			diseaseIDs = append(diseaseIDs, lastDiseaseID)
		} else {
			// Fallback to screening if no history or history is Normal
			mode = "screening"
		}
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

	var lastDiseaseID int
	if req.UserEmail != "" {
		if id, err := h.Repo.GetLatestDiagnosisDiseaseID(req.UserEmail); err == nil {
			lastDiseaseID = id
		}
	}

	resultsMap := make(map[int]*models.DiseaseCF)
	for _, r := range rules {
		if _, ok := resultsMap[r.DiseaseID]; !ok {
			initialCF := 0.0
			if r.DiseaseID == lastDiseaseID && lastDiseaseID != 10 { // 10 is Kondisi Stabil
				initialCF = 0.3 // Historical Weight base padding
			}
			resultsMap[r.DiseaseID] = &models.DiseaseCF{Name: r.Name, Description: r.Desc, Solutions: r.Solutions, CF: initialCF}
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
		finalResults = append(finalResults, models.DiagnosisResult{
			DiseaseName:     "Kondisi Mental Stabil (Sehat)",
			Description:     "Berdasarkan jawaban Anda, tidak terdeteksi adanya indikasi masalah kesehatan mental yang signifikan. Kondisi mental Anda saat ini tergolong stabil dan sehat.",
			CFValue:         0,
			Percentage:      0,
			Recommendations: "Tetap jaga pola makan tidur yang cukup, berolahraga secara teratur, dan luangkan waktu untuk relaksasi atau hobi Anda.",
		})
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
		levelID := 1 // Default: Low
		if top.Percentage > 70 {
			levelID = 3 // High
		} else if top.Percentage > 40 {
			levelID = 2 // Moderate
		} else {
			levelID = 1 // Low
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
