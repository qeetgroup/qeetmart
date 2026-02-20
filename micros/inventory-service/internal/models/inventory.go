package models

import "time"

type ReservationStatus string

const (
	ReservationStatusReserved ReservationStatus = "RESERVED"
	ReservationStatusReleased ReservationStatus = "RELEASED"
	ReservationStatusDeducted ReservationStatus = "DEDUCTED"
)

type InventoryStock struct {
	ProductID         string    `json:"productId"`
	AvailableQuantity int       `json:"availableQuantity"`
	ReservedQuantity  int       `json:"reservedQuantity"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

type InventoryReservation struct {
	ReservationID string            `json:"reservationId"`
	ProductID     string            `json:"productId"`
	OrderID       string            `json:"orderId"`
	Quantity      int               `json:"quantity"`
	Status        ReservationStatus `json:"status"`
	ExpiresAt     time.Time         `json:"expiresAt"`
	CreatedAt     time.Time         `json:"createdAt"`
}
