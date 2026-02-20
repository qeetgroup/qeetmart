package repository

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"inventory-service/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type InventoryRepository struct {
	pool *pgxpool.Pool
}

func NewInventoryRepository(pool *pgxpool.Pool) *InventoryRepository {
	return &InventoryRepository{pool: pool}
}

func (r *InventoryRepository) BeginTx(ctx context.Context) (pgx.Tx, error) {
	return r.pool.BeginTx(ctx, pgx.TxOptions{})
}

func (r *InventoryRepository) Ping(ctx context.Context) error {
	return r.pool.Ping(ctx)
}

func (r *InventoryRepository) InitInventoryIfNotExists(ctx context.Context, productID string, quantity int) error {
	query := `
		INSERT INTO inventory_stock (product_id, available_quantity, reserved_quantity, created_at, updated_at)
		VALUES ($1, $2, 0, NOW(), NOW())
		ON CONFLICT (product_id) DO NOTHING`
	_, err := r.pool.Exec(ctx, query, productID, quantity)
	return err
}

func (r *InventoryRepository) GetStock(ctx context.Context, productID string) (*models.InventoryStock, error) {
	query := `
		SELECT product_id, available_quantity, reserved_quantity, created_at, updated_at
		FROM inventory_stock
		WHERE product_id = $1`

	stock := &models.InventoryStock{}
	err := r.pool.QueryRow(ctx, query, productID).Scan(
		&stock.ProductID,
		&stock.AvailableQuantity,
		&stock.ReservedQuantity,
		&stock.CreatedAt,
		&stock.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return stock, nil
}

func (r *InventoryRepository) GetStockForUpdate(ctx context.Context, tx pgx.Tx, productID string) (*models.InventoryStock, error) {
	query := `
		SELECT product_id, available_quantity, reserved_quantity, created_at, updated_at
		FROM inventory_stock
		WHERE product_id = $1
		FOR UPDATE`

	stock := &models.InventoryStock{}
	err := tx.QueryRow(ctx, query, productID).Scan(
		&stock.ProductID,
		&stock.AvailableQuantity,
		&stock.ReservedQuantity,
		&stock.CreatedAt,
		&stock.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return stock, nil
}

func (r *InventoryRepository) UpdateStock(ctx context.Context, tx pgx.Tx, productID string, availableQty, reservedQty int) error {
	query := `
		UPDATE inventory_stock
		SET available_quantity = $2,
			reserved_quantity = $3,
			updated_at = NOW()
		WHERE product_id = $1`

	cmdTag, err := tx.Exec(ctx, query, productID, availableQty, reservedQty)
	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *InventoryRepository) InsertReservation(ctx context.Context, tx pgx.Tx, reservation *models.InventoryReservation) error {
	query := `
		INSERT INTO inventory_reservations (
			reservation_id,
			product_id,
			order_id,
			quantity,
			status,
			expires_at,
			created_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())`

	_, err := tx.Exec(ctx, query,
		reservation.ReservationID,
		reservation.ProductID,
		reservation.OrderID,
		reservation.Quantity,
		reservation.Status,
		reservation.ExpiresAt,
	)
	return err
}

func (r *InventoryRepository) GetReservationByID(ctx context.Context, reservationID string) (*models.InventoryReservation, error) {
	query := `
		SELECT reservation_id, product_id, order_id, quantity, status, expires_at, created_at
		FROM inventory_reservations
		WHERE reservation_id = $1`

	reservation := &models.InventoryReservation{}
	err := r.pool.QueryRow(ctx, query, reservationID).Scan(
		&reservation.ReservationID,
		&reservation.ProductID,
		&reservation.OrderID,
		&reservation.Quantity,
		&reservation.Status,
		&reservation.ExpiresAt,
		&reservation.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return reservation, nil
}

func (r *InventoryRepository) GetReservationByIDForUpdate(ctx context.Context, tx pgx.Tx, reservationID string) (*models.InventoryReservation, error) {
	query := `
		SELECT reservation_id, product_id, order_id, quantity, status, expires_at, created_at
		FROM inventory_reservations
		WHERE reservation_id = $1
		FOR UPDATE`

	reservation := &models.InventoryReservation{}
	err := tx.QueryRow(ctx, query, reservationID).Scan(
		&reservation.ReservationID,
		&reservation.ProductID,
		&reservation.OrderID,
		&reservation.Quantity,
		&reservation.Status,
		&reservation.ExpiresAt,
		&reservation.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return reservation, nil
}

func (r *InventoryRepository) UpdateReservationStatus(ctx context.Context, tx pgx.Tx, reservationID string, status models.ReservationStatus) error {
	query := `
		UPDATE inventory_reservations
		SET status = $2
		WHERE reservation_id = $1`

	cmdTag, err := tx.Exec(ctx, query, reservationID, status)
	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *InventoryRepository) ListExpiredReservationIDs(ctx context.Context, limit int) ([]string, error) {
	query := `
		SELECT reservation_id
		FROM inventory_reservations
		WHERE status = $1
		  AND expires_at <= NOW()
		ORDER BY expires_at ASC
		LIMIT $2`

	rows, err := r.pool.Query(ctx, query, models.ReservationStatusReserved, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make([]string, 0, limit)
	for rows.Next() {
		var id string
		if scanErr := rows.Scan(&id); scanErr != nil {
			return nil, scanErr
		}
		ids = append(ids, id)
	}

	return ids, rows.Err()
}

func (r *InventoryRepository) RunMigrations(ctx context.Context, migrationsDir string) error {
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("read migrations directory: %w", err)
	}

	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Name() < entries[j].Name()
	})

	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".sql" {
			continue
		}

		path := filepath.Join(migrationsDir, entry.Name())
		content, readErr := os.ReadFile(path)
		if readErr != nil {
			return fmt.Errorf("read migration %s: %w", entry.Name(), readErr)
		}

		sql := strings.TrimSpace(string(content))
		if sql == "" {
			continue
		}

		if _, execErr := r.pool.Exec(ctx, sql); execErr != nil {
			return fmt.Errorf("execute migration %s: %w", entry.Name(), execErr)
		}
	}

	return nil
}
