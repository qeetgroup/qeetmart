# Qeetmart API

Backend API for the Qeetmart ecommerce application built with Express.js and TypeScript.

## Architecture

This is a **modular monolithic** application, meaning:
- All modules (products, orders, users, payments, inventory) are in a single codebase
- Each module is self-contained with its own routes, controllers, and services
- Easy to evolve to microservices later if needed
- Simpler deployment and development compared to microservices

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database management
- **PostgreSQL** - Database (can be changed to MySQL or SQLite)

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database connection string
```

3. Set up the database:
```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (for development)
pnpm db:push

# Or run migrations (for production)
pnpm db:migrate
```

4. Start the development server:
```bash
pnpm dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/user/:userId` - Get orders by user ID
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/order/:orderId` - Get payments by order ID
- `POST /api/payments` - Create payment
- `PATCH /api/payments/:id/status` - Update payment status

### Inventory
- `GET /api/inventory/product/:productId` - Get inventory for product
- `PATCH /api/inventory/product/:productId` - Update inventory
- `POST /api/inventory/product/:productId/reserve` - Reserve inventory
- `POST /api/inventory/product/:productId/release` - Release reserved inventory

### Health Check
- `GET /health` - Health check endpoint

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts              # Main server file
│   ├── common/               # Shared utilities
│   │   ├── database.ts       # Prisma client
│   │   └── error-handler.ts  # Error handling middleware
│   └── modules/              # Feature modules
│       ├── products/         # Product module
│       ├── orders/           # Order module
│       ├── users/            # User module
│       ├── payments/         # Payment module
│       └── inventory/       # Inventory module
└── prisma/
    └── schema.prisma        # Database schema
```

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models:
- **User** - User accounts with roles (customer, admin, seller)
- **Product** - Product catalog
- **Order** - Customer orders
- **OrderItem** - Items in an order
- **Payment** - Payment records

## Development

- Run in development mode: `pnpm dev`
- Build for production: `pnpm build`
- Start production server: `pnpm start`
- Open Prisma Studio: `pnpm db:studio`

## Notes

- Passwords are currently stored in plain text. **TODO**: Implement password hashing with bcrypt
- Inventory reservations are simplified. **TODO**: Implement proper reservation tracking
- Authentication/Authorization is not yet implemented. **TODO**: Add JWT authentication
