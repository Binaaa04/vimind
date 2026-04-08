package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Email    string        `json:"email"`
	Messages []ChatMessage `json:"messages"`
}

// Structs for Gemini API
type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiContent struct {
	Role  string       `json:"role,omitempty"`
	Parts []GeminiPart `json:"parts"`
}

type GeminiSystemInstruction struct {
	Parts []GeminiPart `json:"parts"`
}

type GeminiRequest struct {
	SystemInstruction GeminiSystemInstruction `json:"systemInstruction"`
	Contents          []GeminiContent         `json:"contents"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []GeminiPart `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func (h *Handler) Chatbot(c *fiber.Ctx) error {
	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return c.Status(500).JSON(fiber.Map{"error": "GEMINI_API_KEY not configured in backend/.env"})
	}

	// 1. Fetch latest test result
	var contextMsg string
	if req.Email != "" {
		uid, err := h.Repo.GetUserIDByEmail(req.Email)
		if err == nil {
			history, err := h.Repo.GetHistory(uid)
			if err == nil && len(history) > 0 {
				latest := history[0]
				contextMsg = fmt.Sprintf("Konteks Kondisi User Saat Ini:\n- Terdeteksi: %s\n- Tingkat: %s\n- Persentase: %.2f%%\n\nGunakan konteks ini HANYA JIKA RELEVAN untuk memberikan respon yang berempati dan personal. JANGAN MENGATAKAN 'berdasarkan data Anda' secara terang-terangan kecuali ditanya.", latest.Disease, latest.Level, latest.Percentage)
			}
		}
	}

	if contextMsg == "" {
		contextMsg = "Konteks Kondisi User Saat Ini: Belum ada data tes. Arahkan user untuk melakukan tes Cek Kondisi Mental jika mereka ingin tahu lebih detail."
	}

	systemPrompt := `Kamu adalah Vivi, asisten kesehatan mental virtual dari ViMind (platform deteksi kesehatan mental).
KEPRIBADIAN:
- Hangat, empatik, suportif, dan tidak menghakimi
- Berbicara dengan bahasa Indonesia yang santai tapi profesional (gunakan 'Aku' dan 'Kamu')
- Aktif mendengarkan

SCOPE & BATASAN:
- Boleh bahas soal stres, cemas, depresi ringan, dan support emosional
- DILARANG KERAS memberikan diagnosis medis, meresepkan obat, atau menggantikan peran profesional
- Harus mengarahkan ke layanan krisis/profesional jika user menunjukkan tanda gawat darurat (ingin bunuh diri, menyakiti diri)

` + contextMsg

	// 2. Prepare payload for Gemini
	var contents []GeminiContent
	for _, m := range req.Messages {
		role := m.Role
		if role == "assistant" {
			role = "model" // Gemini uses "model" instead of "assistant"
		} else if role != "user" && role != "model" {
			role = "user"
		}
		
		val := GeminiContent{
			Role: role,
			Parts: []GeminiPart{{Text: m.Content}},
		}
		contents = append(contents, val)
	}

	geminiReq := GeminiRequest{
		SystemInstruction: GeminiSystemInstruction{
			Parts: []GeminiPart{{Text: systemPrompt}},
		},
		Contents: contents,
	}

	reqBody, _ := json.Marshal(geminiReq)

	// 3. Forward to Gemini API Native Endpoint
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create request", "details": err.Error()})
	}

	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to contact Gemini API", "details": err.Error()})
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		fmt.Println("Gemini Error:", string(bodyBytes)) // Log for backend debugging
		return c.JSON(fiber.Map{
			"reply": "Maaf, aku sedang mengalami kendala jaringan. Tolong coba beberapa saat lagi ya! 🙏",
		})
	}

	var geminiResp GeminiResponse
	if err := json.Unmarshal(bodyBytes, &geminiResp); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to parse API response", "details": err.Error(), "body": string(bodyBytes)})
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return c.Status(500).JSON(fiber.Map{"error": "Empty response from Gemini", "body": string(bodyBytes)})
	}

	reply := geminiResp.Candidates[0].Content.Parts[0].Text

	return c.JSON(fiber.Map{
		"reply": reply,
	})
}
