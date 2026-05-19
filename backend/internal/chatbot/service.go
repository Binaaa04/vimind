package chatbot

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type Service struct{}

func NewService() *Service {
	return &Service{}
}

type HistoryProvider interface {
	GetLatestDiagnosis(email string) (*DiagnosisSummary, error)
}

func (s *Service) GetReply(messages []ChatMessage, history DiagnosisSummary) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not configured")
	}

	var contextMsg string
	if history.Disease != "" {
		contextMsg = fmt.Sprintf(
			"Konteks Kondisi User Saat Ini:\n- Terdeteksi: %s\n- Tingkat: %s\n- Persentase: %.2f%%\n\nGunakan konteks ini HANYA JIKA RELEVAN untuk memberikan respon yang berempati dan personal. JANGAN MENGATAKAN 'berdasarkan data Anda' secara terang-terangan kecuali ditanya.",
			history.Disease, history.Level, history.Percentage,
		)
	} else {
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

	// Limit history to the last 10 messages to save tokens and avoid context overflow
	maxHistory := 10
	if len(messages) > maxHistory {
		messages = messages[len(messages)-maxHistory:]
	}

	var contents []GeminiContent
	for _, m := range messages {
		role := m.Role
		if role == "assistant" {
			role = "model"
		} else if role != "user" && role != "model" {
			role = "user"
		}

		contents = append(contents, GeminiContent{
			Role:  role,
			Parts: []GeminiPart{{Text: m.Content}},
		})
	}

	geminiReq := GeminiRequest{
		SystemInstruction: GeminiSystemInstruction{
			Parts: []GeminiPart{{Text: systemPrompt}},
		},
		Contents: contents,
	}

	reqBody, _ := json.Marshal(geminiReq)

	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("failed to contact Gemini API: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		return "Maaf, aku sedang mengalami kendala jaringan. Tolong coba beberapa saat lagi ya!", nil
	}

	var geminiResp GeminiResponse
	if err := json.Unmarshal(bodyBytes, &geminiResp); err != nil {
		return "", fmt.Errorf("failed to parse API response: %w", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("empty response from Gemini")
	}

	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}
