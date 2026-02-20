package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"inventory-service/internal/models"
	"inventory-service/internal/repository"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/redis/go-redis/v9"
)

type AppError struct {
	Code       string
	Message    string
	StatusCode int
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(code, message string, statusCode int) *AppError {
	return &AppError{Code: code, Message: message, StatusCode: statusCode}
}

type InventoryService struct {
	repo               *repository.InventoryRepository
	redis              *redis.Client
	logger             *slog.Logger
	reservationTTL     time.Duration
	expirationInterval time.Duration
}

func NewInventoryService(
	repo *repository.InventoryRepository,
	redisClient *redis.Client,
	logger *slog.Logger,
	reservationTTL time.Duration,
	expirationInterval time.Duration,
) *InventoryService {
	return &InventoryService{
		repo:               repo,
		redis:              redisClient,
		logger:             logger,
		reservationTTL:     reservationTTL,
		expirationInterval: expirationInterval,
	}
}

func (s *InventoryService) StartExpirationWorker(ctx context.Context) {
	ticker := time.NewTicker(s.expirationInterval)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				s.logger.Info("expiration worker stopped")
				return
			case <-ticker.C:
				processed, err := s.ProcessExpiredReservations(ctx)
				if err != nil {
					s.logger.Error("failed to process expired reservations", "error", err)
					continue
				}
				if processed > 0 {
					s.logger.Info("expired reservations processed", "count", processed)
				}
			}
		}
	}()
}

func (s *InventoryService) ProcessExpiredReservations(ctx context.Context) (int, error) {
	ids, err := s.repo.ListExpiredReservationIDs(ctx, 100)
	if err != nil {
		return 0, err
	}

	processed := 0
	for _, id := range ids {
		_, releaseErr := s.releaseReservation(ctx, id, true)
		if releaseErr != nil {
			var appErr *AppError
			if errors.As(releaseErr, &appErr) && (appErr.Code == "RESERVATION_ALREADY_RELEASED" || appErr.Code == "RESERVATION_ALREADY_DEDUCTED") {
				continue
			}
			s.logger.Error("failed to release expired reservation", "reservationId", id, "error", releaseErr)
			continue
		}
		processed++
	}

	return processed, nil
}

func (s *InventoryService) InitInventory(ctx context.Context, productID string, quantity int) (*models.InventoryStock, error) {
	if productID == "" {
		return nil, NewAppError("INVALID_PRODUCT_ID", "productId is required", 400)
	}
	if quantity < 0 {
		return nil, NewAppError("INVALID_QUANTITY", "quantity must be >= 0", 400)
	}

	if err := s.repo.InitInventoryIfNotExists(ctx, productID, quantity); err != nil {
		return nil, err
	}

	stock, err := s.repo.GetStock(ctx, productID)
	if err != nil {
		return nil, err
	}
	return stock, nil
}

func (s *InventoryService) GetInventory(ctx context.Context, productID string) (*models.InventoryStock, error) {
	if productID == "" {
		return nil, NewAppError("INVALID_PRODUCT_ID", "productId is required", 400)
	}

	stock, err := s.repo.GetStock(ctx, productID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, NewAppError("PRODUCT_NOT_FOUND", "inventory record not found", 404)
		}
		return nil, err
	}
	return stock, nil
}

func (s *InventoryService) AddStock(ctx context.Context, productID string, quantity int) (*models.InventoryStock, error) {
	if productID == "" {
		return nil, NewAppError("INVALID_PRODUCT_ID", "productId is required", 400)
	}
	if quantity <= 0 {
		return nil, NewAppError("INVALID_QUANTITY", "quantity must be > 0", 400)
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer rollbackQuiet(ctx, tx)

	stock, err := s.repo.GetStockForUpdate(ctx, tx, productID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, NewAppError("PRODUCT_NOT_FOUND", "inventory record not found", 404)
		}
		return nil, err
	}

	stock.AvailableQuantity += quantity
	if err = s.repo.UpdateStock(ctx, tx, productID, stock.AvailableQuantity, stock.ReservedQuantity); err != nil {
		return nil, err
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}

	return s.repo.GetStock(ctx, productID)
}

func (s *InventoryService) Reserve(ctx context.Context, productID, orderID string, quantity int) (*models.InventoryReservation, error) {
	if productID == "" {
		return nil, NewAppError("INVALID_PRODUCT_ID", "productId is required", 400)
	}
	if orderID == "" {
		return nil, NewAppError("INVALID_ORDER_ID", "orderId is required", 400)
	}
	if quantity <= 0 {
		return nil, NewAppError("INVALID_QUANTITY", "quantity must be > 0", 400)
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer rollbackQuiet(ctx, tx)

	stock, err := s.repo.GetStockForUpdate(ctx, tx, productID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, NewAppError("PRODUCT_NOT_FOUND", "inventory record not found", 404)
		}
		return nil, err
	}

	if stock.AvailableQuantity < quantity {
		return nil, NewAppError("INSUFFICIENT_STOCK", "not enough available stock", 409)
	}

	stock.AvailableQuantity -= quantity
	stock.ReservedQuantity += quantity
	if err = s.repo.UpdateStock(ctx, tx, productID, stock.AvailableQuantity, stock.ReservedQuantity); err != nil {
		return nil, err
	}

	reservation := &models.InventoryReservation{
		ReservationID: uuid.NewString(),
		ProductID:     productID,
		OrderID:       orderID,
		Quantity:      quantity,
		Status:        models.ReservationStatusReserved,
		ExpiresAt:     time.Now().UTC().Add(s.reservationTTL),
	}

	if err = s.repo.InsertReservation(ctx, tx, reservation); err != nil {
		return nil, err
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}

	if cacheErr := s.cacheReservation(ctx, reservation); cacheErr != nil {
		s.logger.Error("failed to cache reservation", "reservationId", reservation.ReservationID, "error", cacheErr)
	}

	return reservation, nil
}

func (s *InventoryService) Release(ctx context.Context, reservationID string) (*models.InventoryReservation, error) {
	if reservationID == "" {
		return nil, NewAppError("INVALID_RESERVATION_ID", "reservationId is required", 400)
	}

	return s.releaseReservation(ctx, reservationID, false)
}

func (s *InventoryService) releaseReservation(ctx context.Context, reservationID string, fromExpiryWorker bool) (*models.InventoryReservation, error) {
	cachedReservation, cacheErr := s.getReservationFromCache(ctx, reservationID)
	if cacheErr != nil {
		s.logger.Warn("failed to read reservation from cache", "reservationId", reservationID, "error", cacheErr)
	} else if cachedReservation != nil {
		s.logger.Debug("reservation details loaded from cache", "reservationId", reservationID)
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer rollbackQuiet(ctx, tx)

	reservation, err := s.repo.GetReservationByIDForUpdate(ctx, tx, reservationID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, NewAppError("RESERVATION_NOT_FOUND", "reservation not found", 404)
		}
		return nil, err
	}

	if reservation.Status == models.ReservationStatusReleased {
		if fromExpiryWorker {
			return reservation, nil
		}
		return reservation, NewAppError("RESERVATION_ALREADY_RELEASED", "reservation already released", 409)
	}
	if reservation.Status == models.ReservationStatusDeducted {
		return reservation, NewAppError("RESERVATION_ALREADY_DEDUCTED", "reservation already deducted", 409)
	}

	stock, err := s.repo.GetStockForUpdate(ctx, tx, reservation.ProductID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, NewAppError("PRODUCT_NOT_FOUND", "inventory record not found", 404)
		}
		return nil, err
	}

	if stock.ReservedQuantity < reservation.Quantity {
		return nil, NewAppError("INVALID_STOCK_STATE", "reserved stock is less than reservation quantity", 409)
	}

	stock.AvailableQuantity += reservation.Quantity
	stock.ReservedQuantity -= reservation.Quantity
	if err = s.repo.UpdateStock(ctx, tx, stock.ProductID, stock.AvailableQuantity, stock.ReservedQuantity); err != nil {
		return nil, err
	}

	if err = s.repo.UpdateReservationStatus(ctx, tx, reservation.ReservationID, models.ReservationStatusReleased); err != nil {
		return nil, err
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}

	reservation.Status = models.ReservationStatusReleased
	if cacheErr = s.deleteReservationCache(ctx, reservationID); cacheErr != nil {
		s.logger.Warn("failed to delete reservation cache", "reservationId", reservationID, "error", cacheErr)
	}

	return reservation, nil
}

func (s *InventoryService) Deduct(ctx context.Context, reservationID string) (*models.InventoryReservation, error) {
	if reservationID == "" {
		return nil, NewAppError("INVALID_RESERVATION_ID", "reservationId is required", 400)
	}

	_, cacheErr := s.getReservationFromCache(ctx, reservationID)
	if cacheErr != nil {
		s.logger.Warn("failed to read reservation from cache", "reservationId", reservationID, "error", cacheErr)
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer rollbackQuiet(ctx, tx)

	reservation, err := s.repo.GetReservationByIDForUpdate(ctx, tx, reservationID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, NewAppError("RESERVATION_NOT_FOUND", "reservation not found", 404)
		}
		return nil, err
	}

	if reservation.Status == models.ReservationStatusDeducted {
		return reservation, NewAppError("RESERVATION_ALREADY_DEDUCTED", "reservation already deducted", 409)
	}
	if reservation.Status == models.ReservationStatusReleased {
		return reservation, NewAppError("RESERVATION_ALREADY_RELEASED", "reservation already released", 409)
	}

	stock, err := s.repo.GetStockForUpdate(ctx, tx, reservation.ProductID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, NewAppError("PRODUCT_NOT_FOUND", "inventory record not found", 404)
		}
		return nil, err
	}

	if stock.ReservedQuantity < reservation.Quantity {
		return nil, NewAppError("INVALID_STOCK_STATE", "reserved stock is less than reservation quantity", 409)
	}

	stock.ReservedQuantity -= reservation.Quantity
	if err = s.repo.UpdateStock(ctx, tx, stock.ProductID, stock.AvailableQuantity, stock.ReservedQuantity); err != nil {
		return nil, err
	}

	if err = s.repo.UpdateReservationStatus(ctx, tx, reservation.ReservationID, models.ReservationStatusDeducted); err != nil {
		return nil, err
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}

	reservation.Status = models.ReservationStatusDeducted
	if cacheErr = s.deleteReservationCache(ctx, reservationID); cacheErr != nil {
		s.logger.Warn("failed to delete reservation cache", "reservationId", reservationID, "error", cacheErr)
	}

	return reservation, nil
}

func (s *InventoryService) HealthCheck(ctx context.Context) error {
	if err := s.repo.Ping(ctx); err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}
	if err := s.redis.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("redis ping failed: %w", err)
	}
	return nil
}

func (s *InventoryService) cacheReservation(ctx context.Context, reservation *models.InventoryReservation) error {
	payload, err := json.Marshal(reservation)
	if err != nil {
		return err
	}
	return s.redis.Set(ctx, reservationCacheKey(reservation.ReservationID), payload, s.reservationTTL).Err()
}

func (s *InventoryService) getReservationFromCache(ctx context.Context, reservationID string) (*models.InventoryReservation, error) {
	payload, err := s.redis.Get(ctx, reservationCacheKey(reservationID)).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, nil
		}
		return nil, err
	}

	reservation := &models.InventoryReservation{}
	if err = json.Unmarshal(payload, reservation); err != nil {
		return nil, err
	}
	return reservation, nil
}

func (s *InventoryService) deleteReservationCache(ctx context.Context, reservationID string) error {
	return s.redis.Del(ctx, reservationCacheKey(reservationID)).Err()
}

func reservationCacheKey(reservationID string) string {
	return "reservation:" + reservationID
}

func rollbackQuiet(ctx context.Context, tx pgx.Tx) {
	if tx == nil {
		return
	}
	_ = tx.Rollback(ctx)
}
