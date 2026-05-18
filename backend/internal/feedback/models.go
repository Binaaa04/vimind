package feedback

type Testimonial struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Rating      int    `json:"rating"`
	Comment     string `json:"comment"`
	IsDisplayed bool   `json:"is_displayed"`
}

type AccountFeedback struct {
	ID        int    `json:"id"`
	Email     string `json:"email"`
	Reason    string `json:"reason"`
	CreatedAt string `json:"created_at"`
}

type MoodReq struct {
	Email string `json:"email"`
	Mood  string `json:"mood"`
}
