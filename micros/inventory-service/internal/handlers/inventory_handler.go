package handlers

import (
	"errors"
	"net/http"

	"inventory-service/internal/services"

	"github.com/gin-gonic/gin"
)

type InventoryHandler struct {
	service *services.InventoryService
}

func NewInventoryHandler(service *services.InventoryService) *InventoryHandler {
	return &InventoryHandler{service: service}
}

type initInventoryRequest struct {
	ProductID string `json:"productId" binding:"required"`
	Quantity  int    `json:"quantity" binding:"gte=0"`
}

type addStockRequest struct {
	ProductID string `json:"productId" binding:"required"`
	Quantity  int    `json:"quantity" binding:"gt=0"`
}

type reserveRequest struct {
	ProductID string `json:"productId" binding:"required"`
	OrderID   string `json:"orderId" binding:"required"`
	Quantity  int    `json:"quantity" binding:"gt=0"`
}

type reservationActionRequest struct {
	ReservationID string `json:"reservationId" binding:"required"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (h *InventoryHandler) HealthCheck(c *gin.Context) {
	if err := h.service.HealthCheck(c.Request.Context()); err != nil {
		respondError(c, err)
		return
	}
	respondSuccess(c, http.StatusOK, "service is healthy", gin.H{"status": "ok"})
}

func (h *InventoryHandler) InitInventory(c *gin.Context) {
	var req initInventoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	stock, err := h.service.InitInventory(c.Request.Context(), req.ProductID, req.Quantity)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusOK, "inventory initialized", stock)
}

func (h *InventoryHandler) GetInventory(c *gin.Context) {
	productID := c.Param("productId")

	stock, err := h.service.GetInventory(c.Request.Context(), productID)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusOK, "inventory fetched", stock)
}

func (h *InventoryHandler) AddStock(c *gin.Context) {
	var req addStockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	stock, err := h.service.AddStock(c.Request.Context(), req.ProductID, req.Quantity)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusOK, "stock added", stock)
}

func (h *InventoryHandler) Reserve(c *gin.Context) {
	var req reserveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	reservation, err := h.service.Reserve(c.Request.Context(), req.ProductID, req.OrderID, req.Quantity)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusCreated, "stock reserved", reservation)
}

func (h *InventoryHandler) Release(c *gin.Context) {
	var req reservationActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	reservation, err := h.service.Release(c.Request.Context(), req.ReservationID)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusOK, "reservation released", reservation)
}

func (h *InventoryHandler) Deduct(c *gin.Context) {
	var req reservationActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	reservation, err := h.service.Deduct(c.Request.Context(), req.ReservationID)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusOK, "reservation deducted", reservation)
}

func respondSuccess(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func respondValidationError(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    "VALIDATION_ERROR",
			Message: err.Error(),
		},
	})
}

func respondError(c *gin.Context, err error) {
	var appErr *services.AppError
	if errors.As(err, &appErr) {
		c.JSON(appErr.StatusCode, APIResponse{
			Success: false,
			Error:   &APIError{Code: appErr.Code, Message: appErr.Message},
		})
		return
	}

	c.JSON(http.StatusInternalServerError, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    "INTERNAL_ERROR",
			Message: "unexpected internal error",
		},
	})
}
