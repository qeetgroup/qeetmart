package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"inventory-service/internal/config"
	"inventory-service/internal/handlers"
	"inventory-service/internal/repository"
	"inventory-service/internal/routes"
	"inventory-service/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	gin.SetMode(cfg.GinMode)

	appCtx, appCancel := context.WithCancel(context.Background())
	defer appCancel()

	dbPool, err := pgxpool.New(appCtx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("failed to connect database", "error", err)
		os.Exit(1)
	}
	defer dbPool.Close()

	repo := repository.NewInventoryRepository(dbPool)
	if err = repo.Ping(appCtx); err != nil {
		logger.Error("database ping failed", "error", err)
		os.Exit(1)
	}

	if err = repo.RunMigrations(appCtx, "migrations"); err != nil {
		logger.Error("migration failed", "error", err)
		os.Exit(1)
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})
	defer func() {
		if closeErr := redisClient.Close(); closeErr != nil {
			logger.Error("failed to close redis client", "error", closeErr)
		}
	}()

	if err = redisClient.Ping(appCtx).Err(); err != nil {
		logger.Error("redis ping failed", "error", err)
		os.Exit(1)
	}

	service := services.NewInventoryService(repo, redisClient, logger, cfg.ReservationTTL, cfg.ExpirationPollInterval)
	service.StartExpirationWorker(appCtx)

	handler := handlers.NewInventoryHandler(service)
	router := routes.SetupRouter(logger, handler)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		logger.Info("inventory-service started", "port", cfg.Port)
		if serveErr := srv.ListenAndServe(); serveErr != nil && !errors.Is(serveErr, http.ErrServerClosed) {
			logger.Error("server failed", "error", serveErr)
			appCancel()
		}
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-sigCh:
		logger.Info("shutdown signal received", "signal", sig.String())
	case <-appCtx.Done():
		logger.Info("context cancelled, shutting down")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err = srv.Shutdown(shutdownCtx); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
	}

	logger.Info("inventory-service stopped")
}
