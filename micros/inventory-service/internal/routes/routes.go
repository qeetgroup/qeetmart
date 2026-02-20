package routes

import (
	"log/slog"

	"inventory-service/internal/handlers"
	"inventory-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(logger *slog.Logger, handler *handlers.InventoryHandler) *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.StructuredLogger(logger))

	r.GET("/health", handler.HealthCheck)

	inv := r.Group("/inventory")
	{
		inv.POST("/init", handler.InitInventory)
		inv.GET("/:productId", handler.GetInventory)
		inv.POST("/add-stock", handler.AddStock)
		inv.POST("/reserve", handler.Reserve)
		inv.POST("/release", handler.Release)
		inv.POST("/deduct", handler.Deduct)
	}

	return r
}
