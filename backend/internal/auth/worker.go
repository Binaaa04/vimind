package auth

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type ActivityTask struct {
	Email string
	IP    string
}

type WorkerPool struct {
	repo       *Repository
	taskQueue  chan ActivityTask
	numWorkers int
}

func NewWorkerPool(repo *Repository, bufferSize int, numWorkers int) *WorkerPool {
	return &WorkerPool{
		repo:       repo,
		taskQueue:  make(chan ActivityTask, bufferSize),
		numWorkers: numWorkers,
	}
}

func (p *WorkerPool) Start() {
	for i := 0; i < p.numWorkers; i++ {
		go p.worker()
	}
	log.Printf("Activity tracking worker pool started with %d workers", p.numWorkers)
}

func (p *WorkerPool) worker() {
	for task := range p.taskQueue {
		p.processTask(task)
	}
}

func (p *WorkerPool) processTask(task ActivityTask) {
	log.Printf("[Worker] Processing task: email=%s ip=%s", task.Email, task.IP)

	if task.Email == "" || task.IP == "" || task.IP == "127.0.0.1" || task.IP == "::1" {
		log.Printf("[Worker] Skipping: email or IP invalid (ip=%s)", task.IP)
		return
	}

	var lastIP string
	err := p.repo.pool.QueryRow(context.Background(), "SELECT COALESCE(last_ip, '') FROM users WHERE email=$1", task.Email).Scan(&lastIP)
	if err != nil {
		log.Printf("[Worker] DB query error for %s: %v", task.Email, err)
		return
	}

	log.Printf("[Worker] Current IP=%s, Last IP in DB=%s", task.IP, lastIP)

	region := ""
	if task.IP != lastIP {
		client := &http.Client{Timeout: 5 * time.Second}
		apiURL := "https://ipapi.co/" + task.IP + "/json/"
		log.Printf("[Worker] Calling geolocation API: %s", apiURL)
		resp, err := client.Get(apiURL)
		if err != nil {
			log.Printf("[Worker] Geolocation API error: %v", err)
		} else {
			defer resp.Body.Close()
			log.Printf("[Worker] Geolocation API status: %d", resp.StatusCode)
			var result struct {
				City   string `json:"city"`
				Region string `json:"region"`
				Error  bool   `json:"error"`
				Reason string `json:"reason"`
			}
			if json.NewDecoder(resp.Body).Decode(&result) == nil {
				log.Printf("[Worker] Geolocation result: city=%s region=%s error=%v reason=%s", result.City, result.Region, result.Error, result.Reason)
				if result.City != "" {
					region = result.City + ", " + result.Region
				}
			}
		}
	}

	// Always save IP, and save region if available
	if region != "" {
		_, err = p.repo.pool.Exec(context.Background(), "UPDATE users SET last_active_at = CURRENT_TIMESTAMP, last_ip = $1, last_region = $2 WHERE email = $3", task.IP, region, task.Email)
		log.Printf("[Worker] Updated IP + region for %s: ip=%s region=%s err=%v", task.Email, task.IP, region, err)
	} else {
		// Still save the IP even if region detection failed
		_, err = p.repo.pool.Exec(context.Background(), "UPDATE users SET last_active_at = CURRENT_TIMESTAMP, last_ip = $1 WHERE email = $2", task.IP, task.Email)
		log.Printf("[Worker] Updated IP (no region) for %s: ip=%s err=%v", task.Email, task.IP, err)
	}
}

func (p *WorkerPool) Submit(email, ip string) {
	select {
	case p.taskQueue <- ActivityTask{Email: email, IP: ip}:
	default:
		// Queue full, drop task to avoid blocking the main request
		log.Printf("Activity task queue full, dropping task for %s", email)
	}
}
