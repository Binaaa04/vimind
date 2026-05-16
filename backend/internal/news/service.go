package news

import (
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

var (
	cache      []NewsItem
	cacheTime  time.Time
	cacheMu    sync.Mutex
)

type FetchArticles func(limit int) ([]NewsItem, error)

type Service struct {
	fetchArticles FetchArticles
}

func NewService(fn FetchArticles) *Service {
	return &Service{fetchArticles: fn}
}

func (s *Service) GetNews() ([]NewsItem, error) {
	var newsList []NewsItem

	dbArticles, err := s.fetchArticles(3)
	if err == nil && len(dbArticles) > 0 {
		newsList = append(newsList, dbArticles...)
	}

	if len(newsList) >= 3 {
		return newsList, nil
	}

	rssItems, err := fetchRSS()
	if err != nil {
		if len(newsList) > 0 {
			return newsList, nil
		}
		return nil, err
	}

	remaining := 3 - len(newsList)
	for i, item := range rssItems {
		if i >= remaining {
			break
		}
		newsList = append(newsList, item)
	}

	return newsList, nil
}

func fetchRSS() ([]NewsItem, error) {
	cacheMu.Lock()
	if len(cache) > 0 && time.Since(cacheTime) < 10*time.Minute {
		cacheMu.Unlock()
		return cache, nil
	}
	cacheMu.Unlock()

	query := "kesehatan+mental"
	url := fmt.Sprintf("https://news.google.com/rss/search?q=%s&hl=id&gl=ID&ceid=ID:id", query)

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Accept", "application/rss+xml, application/xml, text/xml, */*")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var rss RSS
	if err := xml.Unmarshal(body, &rss); err != nil {
		return nil, err
	}

	fallbacks := []string{
		"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1493839523149-2864fca44919?q=80&w=1000&auto=format&fit=crop",
	}

	var items []NewsItem
	for i, item := range rss.Channel.Items {
		if i >= 3 {
			break
		}
		image := item.Enclosure.URL
		if image == "" {
			image = fallbacks[i%len(fallbacks)]
		}
		items = append(items, NewsItem{
			ID:        i + 1,
			Title:     item.Title,
			Link:      item.Link,
			Image:     image,
			Source:    "Google News",
			Highlight: "Trending",
		})
	}

	cacheMu.Lock()
	cache = items
	cacheTime = time.Now()
	cacheMu.Unlock()

	return items, nil
}
