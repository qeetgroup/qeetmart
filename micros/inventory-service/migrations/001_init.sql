CREATE TABLE IF NOT EXISTS inventory_stock (
    product_id VARCHAR PRIMARY KEY,
    available_quantity INT NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_reservations (
    reservation_id UUID PRIMARY KEY,
    product_id VARCHAR NOT NULL REFERENCES inventory_stock(product_id),
    order_id VARCHAR NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR NOT NULL CHECK (status IN ('RESERVED', 'RELEASED', 'DEDUCTED')),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_id
    ON inventory_reservations(product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_status_expires_at
    ON inventory_reservations(status, expires_at);
