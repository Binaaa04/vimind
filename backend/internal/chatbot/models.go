package chatbot

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Email    string        `json:"email"`
	Messages []ChatMessage `json:"messages"`
}

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

type DiagnosisSummary struct {
	Disease    string
	Level      string
	Percentage float64
}
