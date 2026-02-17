# Qeetmart API Documentation

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

Currently, authentication is not implemented. All endpoints are publicly accessible.

**TODO**: Implement JWT authentication in future versions.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Window**: 1 minute
- **Scope**: All `/api/*` endpoints

---

## Endpoints

### Health Check

#### GET /health

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Products

### Get All Products

**GET** `/api/v1/products`

Get a list of all products.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "name": "Product Name",
      "description": "Product description",
      "price": 29.99,
      "stock": 100,
      "categoryId": "clx9876543210",
      "imageUrl": "https://example.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Product by ID

**GET** `/api/v1/products/:id`

Get a specific product by ID.

**Parameters:**
- `id` (path) - Product ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "stock": 100,
    "categoryId": "clx9876543210",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Product

**POST** `/api/v1/products`

Create a new product.

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "stock": 100,
  "categoryId": "clx9876543210",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "stock": 100,
    "categoryId": "clx9876543210",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Product

**PUT** `/api/v1/products/:id`

Update an existing product.

**Parameters:**
- `id` (path) - Product ID

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 39.99,
  "stock": 150,
  "categoryId": "clx9876543210",
  "imageUrl": "https://example.com/new-image.jpg"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "name": "Updated Product Name",
    "description": "Updated description",
    "price": 39.99,
    "stock": 150,
    "categoryId": "clx9876543210",
    "imageUrl": "https://example.com/new-image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

### Delete Product

**DELETE** `/api/v1/products/:id`

Delete a product.

**Parameters:**
- `id` (path) - Product ID

**Response:** `204 No Content`

---

## Orders

### Get All Orders

**GET** `/api/v1/orders`

Get a list of all orders.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "userId": "clx9876543210",
      "items": [
        {
          "productId": "clx1111111111",
          "quantity": 2,
          "price": 29.99,
          "subtotal": 59.98
        }
      ],
      "total": 59.98,
      "status": "pending",
      "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Order by ID

**GET** `/api/v1/orders/:id`

Get a specific order by ID.

**Parameters:**
- `id` (path) - Order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "userId": "clx9876543210",
    "items": [
      {
        "productId": "clx1111111111",
        "quantity": 2,
        "price": 29.99,
        "subtotal": 59.98
      }
    ],
    "total": 59.98,
    "status": "pending",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Orders by User ID

**GET** `/api/v1/orders/user/:userId`

Get all orders for a specific user.

**Parameters:**
- `userId` (path) - User ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "userId": "clx9876543210",
      "items": [...],
      "total": 59.98,
      "status": "pending",
      "shippingAddress": {...},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Order

**POST** `/api/v1/orders`

Create a new order.

**Request Body:**
```json
{
  "userId": "clx9876543210",
  "items": [
    {
      "productId": "clx1111111111",
      "quantity": 2
    },
    {
      "productId": "clx2222222222",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "userId": "clx9876543210",
    "items": [
      {
        "productId": "clx1111111111",
        "quantity": 2,
        "price": 29.99,
        "subtotal": 59.98
      }
    ],
    "total": 59.98,
    "status": "pending",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** The order total is automatically calculated based on current product prices.

### Update Order Status

**PATCH** `/api/v1/orders/:id/status`

Update the status of an order.

**Parameters:**
- `id` (path) - Order ID

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "userId": "clx9876543210",
    "items": [...],
    "total": 59.98,
    "status": "confirmed",
    "shippingAddress": {...},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

---

## Users

### Get All Users

**GET** `/api/v1/users`

Get a list of all users.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get User by ID

**GET** `/api/v1/users/:id`

Get a specific user by ID.

**Parameters:**
- `id` (path) - User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create User

**POST** `/api/v1/users`

Create a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** Password is currently stored in plain text. Password hashing will be implemented in a future update.

### Update User

**PUT** `/api/v1/users/:id`

Update an existing user.

**Parameters:**
- `id` (path) - User ID

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "name": "Jane Doe",
  "password": "newpassword123"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "email": "newemail@example.com",
    "name": "Jane Doe",
    "role": "customer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

**Valid Role Values:**
- `customer` (default)
- `admin`
- `seller`

---

## Payments

### Get All Payments

**GET** `/api/v1/payments`

Get a list of all payments.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "orderId": "clx9876543210",
      "amount": 59.98,
      "status": "pending",
      "method": "credit_card",
      "transactionId": "txn_1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Payment by ID

**GET** `/api/v1/payments/:id`

Get a specific payment by ID.

**Parameters:**
- `id` (path) - Payment ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "orderId": "clx9876543210",
    "amount": 59.98,
    "status": "pending",
    "method": "credit_card",
    "transactionId": "txn_1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Payments by Order ID

**GET** `/api/v1/payments/order/:orderId`

Get all payments for a specific order.

**Parameters:**
- `orderId` (path) - Order ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "orderId": "clx9876543210",
      "amount": 59.98,
      "status": "pending",
      "method": "credit_card",
      "transactionId": "txn_1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Payment

**POST** `/api/v1/payments`

Create a new payment for an order.

**Request Body:**
```json
{
  "orderId": "clx9876543210",
  "amount": 59.98,
  "method": "credit_card"
}
```

**Valid Payment Methods:**
- `credit_card`
- `debit_card`
- `paypal`
- `bank_transfer`

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "orderId": "clx9876543210",
    "amount": 59.98,
    "status": "pending",
    "method": "credit_card",
    "transactionId": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** The payment amount must match the order total. Payment status starts as `pending`.

### Update Payment Status

**PATCH** `/api/v1/payments/:id/status`

Update the status of a payment.

**Parameters:**
- `id` (path) - Payment ID

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Status Values:**
- `pending`
- `processing`
- `completed`
- `failed`
- `refunded`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "orderId": "clx9876543210",
    "amount": 59.98,
    "status": "completed",
    "method": "credit_card",
    "transactionId": "txn_1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Inventory

### Get Inventory by Product ID

**GET** `/api/v1/inventory/product/:productId`

Get inventory information for a specific product.

**Parameters:**
- `productId` (path) - Product ID

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "clx1234567890",
    "quantity": 100,
    "reserved": 10,
    "available": 90,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Inventory

**PATCH** `/api/v1/inventory/product/:productId`

Update inventory for a specific product.

**Parameters:**
- `productId` (path) - Product ID

**Request Body:**
```json
{
  "quantity": 150,
  "reserved": 5
}
```

**Note:** Both fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "clx1234567890",
    "quantity": 150,
    "reserved": 5,
    "available": 145,
    "lastUpdated": "2024-01-01T01:00:00.000Z"
  }
}
```

**Note:** Updating `quantity` will also update the product's stock field to keep them in sync.

### Reserve Inventory

**POST** `/api/v1/inventory/product/:productId/reserve`

Reserve inventory for a product (e.g., when an order is placed).

**Parameters:**
- `productId` (path) - Product ID

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "clx1234567890",
    "quantity": 100,
    "reserved": 15,
    "available": 85,
    "lastUpdated": "2024-01-01T01:00:00.000Z"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "message": "Insufficient inventory. Available: 90, Requested: 100",
    "code": "BAD_REQUEST"
  }
}
```

### Release Reserved Inventory

**POST** `/api/v1/inventory/product/:productId/release`

Release previously reserved inventory (e.g., when an order is cancelled).

**Parameters:**
- `productId` (path) - Product ID

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "clx1234567890",
    "quantity": 100,
    "reserved": 10,
    "available": 90,
    "lastUpdated": "2024-01-01T01:00:00.000Z"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "message": "Cannot release more than reserved. Reserved: 10, Requested: 15",
    "code": "BAD_REQUEST"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Resource not found |
| `BAD_REQUEST` | Invalid request data or business logic violation |
| `INTERNAL_ERROR` | Server error |

---

## Example cURL Requests

### Create a Product
```bash
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "stock": 50,
    "categoryId": "clx9876543210",
    "imageUrl": "https://example.com/laptop.jpg"
  }'
```

### Create an Order
```bash
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clx9876543210",
    "items": [
      {
        "productId": "clx1111111111",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

### Reserve Inventory
```bash
curl -X POST http://localhost:3001/api/v1/inventory/product/clx1111111111/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

---

## Versioning

The API uses URL versioning. The current version is **v1**.

- Current: `/api/v1/*`
- Future: `/api/v2/*` (when available)

When v2 is released, v1 will remain available for backward compatibility.

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary values are in decimal format (e.g., `29.99`)
- Product IDs, Order IDs, User IDs, etc. are CUID strings
- The API is stateless and follows RESTful principles
- Rate limiting applies to all API endpoints (100 requests/minute)

---

## Future Enhancements

- [ ] JWT Authentication
- [ ] Password hashing (bcrypt)
- [ ] Input validation with Zod schemas
- [ ] Request logging
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Pagination for list endpoints
- [ ] Filtering and sorting
- [ ] Webhooks for order/payment events
