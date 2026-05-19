package middleware

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// JWKS structures
type jwkKey struct {
	Kty string `json:"kty"`
	Kid string `json:"kid"`
	Crv string `json:"crv"`
	X   string `json:"x"`
	Y   string `json:"y"`
	Alg string `json:"alg"`
}

type jwksResponse struct {
	Keys []jwkKey `json:"keys"`
}

// Cached JWKS keys
var (
	cachedKeys   map[string]*ecdsa.PublicKey
	cachedKeysMu sync.RWMutex
	jwksURL      string
)

func init() {
	cachedKeys = make(map[string]*ecdsa.PublicKey)
}

func jwkToPublicKey(jwk jwkKey) (*ecdsa.PublicKey, error) {
	xBytes, err := base64.RawURLEncoding.DecodeString(jwk.X)
	if err != nil {
		return nil, fmt.Errorf("failed to decode x: %w", err)
	}
	yBytes, err := base64.RawURLEncoding.DecodeString(jwk.Y)
	if err != nil {
		return nil, fmt.Errorf("failed to decode y: %w", err)
	}

	return &ecdsa.PublicKey{
		Curve: elliptic.P256(),
		X:     new(big.Int).SetBytes(xBytes),
		Y:     new(big.Int).SetBytes(yBytes),
	}, nil
}

func loadKeysFromJSON(jsonData string) error {
	var jwks jwksResponse
	if err := json.Unmarshal([]byte(jsonData), &jwks); err != nil {
		return fmt.Errorf("failed to parse JWKS JSON: %w", err)
	}

	newKeys := make(map[string]*ecdsa.PublicKey)
	for _, key := range jwks.Keys {
		if key.Kty == "EC" && key.Crv == "P-256" {
			pubKey, err := jwkToPublicKey(key)
			if err != nil {
				log.Printf("Warning: failed to parse JWK kid=%s: %v", key.Kid, err)
				continue
			}
			newKeys[key.Kid] = pubKey
		}
	}

	cachedKeysMu.Lock()
	cachedKeys = newKeys
	cachedKeysMu.Unlock()

	log.Printf("JWKS loaded from JSON: %d keys cached", len(newKeys))
	return nil
}

func fetchJWKS(url string) error {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	var jwks jwksResponse
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return fmt.Errorf("failed to decode JWKS: %w", err)
	}

	newKeys := make(map[string]*ecdsa.PublicKey)
	for _, key := range jwks.Keys {
		if key.Kty == "EC" && key.Crv == "P-256" {
			pubKey, err := jwkToPublicKey(key)
			if err != nil {
				log.Printf("Warning: failed to parse JWK kid=%s: %v", key.Kid, err)
				continue
			}
			newKeys[key.Kid] = pubKey
		}
	}

	cachedKeysMu.Lock()
	cachedKeys = newKeys
	cachedKeysMu.Unlock()

	log.Printf("JWKS fetched from %s: %d keys cached", url, len(newKeys))
	return nil
}

func startJWKSRefresh(url string) {
	// Fetch immediately at startup
	if err := fetchJWKS(url); err != nil {
		log.Printf("Warning: initial JWKS fetch failed: %v (will retry in background)", err)
	}

	// Background refresh every 30 minutes
	go func() {
		ticker := time.NewTicker(30 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			if err := fetchJWKS(url); err != nil {
				log.Printf("Warning: JWKS refresh failed: %v", err)
			}
		}
	}()
}

func getKeyFunc(jwtSecret string) jwt.Keyfunc {
	return func(token *jwt.Token) (interface{}, error) {
		// Check if it's ECDSA (ES256) - use JWKS
		if _, ok := token.Method.(*jwt.SigningMethodECDSA); ok {
			kid, ok := token.Header["kid"].(string)
			if !ok {
				return nil, fmt.Errorf("kid not found in token header")
			}

			cachedKeysMu.RLock()
			pubKey, exists := cachedKeys[kid]
			cachedKeysMu.RUnlock()

			if !exists {
				// Try refreshing JWKS once in case of key rotation
				if jwksURL != "" {
					_ = fetchJWKS(jwksURL)
					cachedKeysMu.RLock()
					pubKey, exists = cachedKeys[kid]
					cachedKeysMu.RUnlock()
				}
				if !exists {
					return nil, fmt.Errorf("unknown kid: %s", kid)
				}
			}
			return pubKey, nil
		}

		// Check if it's HMAC (HS256) - use JWT_SECRET (legacy fallback)
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); ok {
			if jwtSecret == "" {
				return nil, fmt.Errorf("JWT_SECRET not configured for HMAC tokens")
			}
			return []byte(jwtSecret), nil
		}

		return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
	}
}

func AuthRequired() fiber.Handler {
	jwtSecret := os.Getenv("JWT_SECRET")

	// Method 1: Try SUPABASE_JWKS_JSON env var (direct JSON, no network needed)
	jwksJSON := os.Getenv("SUPABASE_JWKS_JSON")
	if jwksJSON != "" {
		if err := loadKeysFromJSON(jwksJSON); err != nil {
			log.Printf("Warning: failed to load SUPABASE_JWKS_JSON: %v", err)
		}
	}

	// Method 2: Determine Supabase URL for JWKS fetch
	supabaseURL := os.Getenv("SUPABASE_URL")
	if supabaseURL == "" {
		// Try to infer from DATABASE_URL
		dbURL := os.Getenv("DATABASE_URL")
		if strings.Contains(dbURL, ".supabase.") {
			parts := strings.Split(dbURL, "@")
			if len(parts) >= 1 {
				userPart := strings.Split(parts[0], "//")
				if len(userPart) >= 2 {
					userInfo := strings.Split(userPart[1], ":")
					if len(userInfo) >= 1 {
						dotParts := strings.Split(userInfo[0], ".")
						if len(dotParts) >= 2 {
							projectRef := dotParts[1]
							supabaseURL = fmt.Sprintf("https://%s.supabase.co", projectRef)
						}
					}
				}
			}
		}
	}

	if supabaseURL != "" {
		jwksURL = supabaseURL + "/auth/v1/.well-known/jwks.json"
		log.Printf("JWKS endpoint configured: %s", jwksURL)
		// Only start background refresh if we don't already have keys loaded
		cachedKeysMu.RLock()
		hasKeys := len(cachedKeys) > 0
		cachedKeysMu.RUnlock()
		if !hasKeys {
			startJWKSRefresh(jwksURL)
		}
	}

	cachedKeysMu.RLock()
	hasKeys := len(cachedKeys) > 0
	cachedKeysMu.RUnlock()

	if !hasKeys && jwtSecret == "" {
		log.Println("WARNING: No JWKS keys loaded and no JWT_SECRET set. Auth will fail!")
		log.Println("Set SUPABASE_JWKS_JSON or SUPABASE_URL or JWT_SECRET in your .env")
	}

	keyFunc := getKeyFunc(jwtSecret)

	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{"error": "Missing authorization header"})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid authorization header format"})
		}

		tokenString := parts[1]

		token, err := jwt.Parse(tokenString, keyFunc)
		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid or expired token"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid token claims"})
		}

		// Supabase stores email in the 'email' claim or inside 'user_metadata'
		email, _ := claims["email"].(string)
		if email == "" {
			// Check user_metadata if email is not top-level
			if metadata, ok := claims["user_metadata"].(map[string]interface{}); ok {
				email, _ = metadata["email"].(string)
			}
		}

		if email == "" {
			return c.Status(401).JSON(fiber.Map{"error": "Email not found in token"})
		}

		// Store email in context for later use in handlers
		c.Locals("user_email", email)
		return c.Next()
	}
}
