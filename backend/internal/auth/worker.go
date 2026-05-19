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
	if task.Email == "" || task.IP == "" || task.IP == "127.0.0.1" || task.IP == "::1" {
		return
	}

	var lastIP string
	err := p.repo.pool.QueryRow(context.Background(), "SELECT COALESCE(last_ip, '') FROM users WHERE email=$1", task.Email).Scan(&lastIP)
	if err != nil {
		return
	}

	region := ""
	if task.IP != lastIP {
		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Get("http://ip-api.com/json/" + task.IP)
		if err == nil {
			defer resp.Body.Close()
			var result struct {
				City   string `json:"city"`
				Region string `json:"regionName"`
			}
			if json.NewDecoder(resp.Body).Decode(&result) == nil {
				if result.City != "" {
					region = result.City + ", " + result.Region
				}
			}
		}
	}

	if region != "" {
		_, _ = p.repo.pool.Exec(context.Background(), "UPDATE users SET last_active_at = CURRENT_TIMESTAMP, last_ip = $1, last_region = $2 WHERE email = $3", task.IP, region, task.Email)
	} else {
		_, _ = p.repo.pool.Exec(context.Background(), "UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE email = $1", task.Email)
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
