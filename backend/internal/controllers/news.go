package controllers

import (
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"pbl-vimind/backend/internal/models"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
)

var (
	newsCache      []models.NewsItem
	cacheLastUpdate time.Time
	cacheMutex      sync.Mutex
)

type RSS struct {
	XMLName xml.Name `xml:"rss"`
	Channel Channel  `xml:"channel"`
}

type Channel struct {
	Title string `xml:"title"`
	Items []Item `xml:"item"`
}

type Item struct {
	Title       string    `xml:"title"`
	Link        string    `xml:"link"`
	Description string    `xml:"description"`
	Content     string    `xml:"encoded"`
	PubDate     string    `xml:"pubDate"`
	Enclosure   Enclosure `xml:"enclosure"`
}

type Enclosure struct {
	URL string `xml:"url,attr"`
}

func (h *Handler) GetDynamicNews(c *fiber.Ctx) error {
	// 1. Fetch managed articles from DB first
	dbArticles, err := h.Repo.GetArticles(true)
	var newsList []models.NewsItem

	if err == nil && len(dbArticles) > 0 {
		for i, a := range dbArticles {
			if i >= 3 {
				break
			}
			newsList = append(newsList, models.NewsItem{
				ID:        i + 1,
				Title:     a.Title,
				Link:      a.LinkURL,
				Image:     a.ImageURL,
				Source:    a.Source,
				Highlight: "Admin Choice",
			})
		}
	}

	// 2. If we have enough articles, return early
	if len(newsList) >= 3 {
		return c.JSON(newsList)
	}

	// 3. Fallback to RSS if less than 3
	query := "kesehatan+mental"
	url := fmt.Sprintf("https://news.google.com/rss/search?q=%s&hl=id&gl=ID&ceid=ID:id", query)

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create request"})
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "application/rss+xml, application/xml, text/xml, */*")

	resp, err := client.Do(req)
	if err != nil {
		if len(newsList) > 0 {
			return c.JSON(newsList)
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch news from source"})
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		if len(newsList) > 0 {
			return c.JSON(newsList)
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to read response body"})
	}

	var rss RSS
	if err := xml.Unmarshal(body, &rss); err == nil {
		fallbacks := []string{
			"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1493839523149-2864fca44919?q=80&w=1000&auto=format&fit=crop",
		}

		for i, item := range rss.Channel.Items {
			if len(newsList) >= 3 || i >= 3 {
				break
			}

			image := item.Enclosure.URL
			if image == "" {
				image = fallbacks[i%len(fallbacks)]
			}

			newsList = append(newsList, models.NewsItem{
				ID:        len(newsList) + 1,
				Title:     item.Title,
				Link:      item.Link,
				Image:     image,
				Source:    "Google News",
				Highlight: "Trending",
			})
		}
	}

	return c.JSON(newsList)
}
