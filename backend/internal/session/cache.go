package session

import "sync"

type TestSession struct {
	Answers     map[string]int `json:"answers"`
	CurrentPage int            `json:"current_page"`
	IsRefined   bool           `json:"is_refined"`
}

type Cache struct {
	mu   sync.RWMutex
	data map[string]*TestSession
}

func NewCache() *Cache {
	return &Cache{
		data: make(map[string]*TestSession),
	}
}

func (c *Cache) Get(key string) (*TestSession, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	session, exists := c.data[key]
	return session, exists
}

func (c *Cache) Set(key string, session *TestSession) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data[key] = session
}

func (c *Cache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.data, key)
}
