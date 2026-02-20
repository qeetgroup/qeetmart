package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port                   string
	GinMode                string
	DatabaseURL            string
	RedisAddr              string
	RedisPassword          string
	RedisDB                int
	ReservationTTL         time.Duration
	ExpirationPollInterval time.Duration
}

func Load() (Config, error) {
	cfg := Config{
		Port:                   getEnv("PORT", "8080"),
		GinMode:                getEnv("GIN_MODE", "release"),
		DatabaseURL:            getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/inventory?sslmode=disable"),
		RedisAddr:              getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:          getEnv("REDIS_PASSWORD", ""),
		RedisDB:                getEnvAsInt("REDIS_DB", 0),
		ReservationTTL:         getEnvAsDuration("RESERVATION_TTL", 10*time.Minute),
		ExpirationPollInterval: getEnvAsDuration("EXPIRATION_POLL_INTERVAL", 30*time.Second),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}

	return cfg, nil
}

func getEnv(key, defaultVal string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultVal
}

func getEnvAsInt(key string, defaultVal int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultVal
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultVal
	}
	return value
}

func getEnvAsDuration(key string, defaultVal time.Duration) time.Duration {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultVal
	}
	value, err := time.ParseDuration(valueStr)
	if err != nil {
		return defaultVal
	}
	return value
}
