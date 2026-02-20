# Qeetmart API Gateway

API Gateway for the Qeetmart microservices architecture. This gateway serves as the single entry point for all client requests and routes them to the appropriate microservices.

## Features

- **Request Routing**: Routes requests to appropriate microservices based on URL patterns
- **Service Discovery**: Configurable service registry with health checks
- **Authentication**: Token forwarding and validation middleware
- **Rate Limiting**: Protects services from overload
- **Request Logging**: Comprehensive logging with correlation IDs
- **Health Monitoring**: Health check endpoints for gateway and services
- **Error Handling**: Centralized error handling and service failure management

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **http-proxy-middleware** - Request proxying
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

## Architecture

```
Client Request
    ↓
API Gateway (Port 4000)
    ↓
┌───┴───┬──────────┬──────────┬──────────┬──────────┐
│       │          │          │          │          │
Auth  User    Product   Order   Payment  Inventory
Service Service  Service  Service  Service  Service
(8081)  (8082)   (8083)   (8084)   (8085)   (8080)
```

## Setup

1. **Install dependencies:**
```bash
pnpm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your service URLs if different from defaults
```

3. **Start the gateway:**
```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

The gateway will be available at `http://localhost:4000`

## Configuration

### Service URLs

By default, services are expected at:
- Auth Service: `http://localhost:8081`
- User Service: `http://localhost:8082`
- Product Service: `http://localhost:8083`
- Order Service: `http://localhost:8084`
- Payment Service: `http://localhost:8085`
- Inventory Service: `http://localhost:8080`

Override these in `.env`:
```env
AUTH_SERVICE_URL=http://localhost:8081
USER_SERVICE_URL=http://localhost:8082
# ... etc
```

JWT validation settings:
```env
REQUIRE_AUTH=true
JWT_SECRET=CHANGE_ME_TO_A_STRONG_SECRET
JWT_ISSUER=http://localhost:8081
```

### Route Configuration

Routes are configured in `src/config/services.ts`. The gateway routes:

- `/api/v1/auth/*` → Auth Service
- `/api/v1/users/*` → User Service
- `/api/v1/products/*` → Product Service
- `/api/v1/orders/*` → Order Service
- `/api/v1/payments/*` → Payment Service
- `/api/v1/inventory/*` → Inventory Service

## API Endpoints

### Gateway Endpoints

- `GET /health` - Gateway health check
- `GET /health/services` - Health status of all registered services
- `GET /info` - Gateway information and registered services

### Proxied Endpoints

All requests to `/api/v1/*` are proxied to the appropriate microservice.

Example:
```bash
# Request to gateway
GET http://localhost:4000/api/v1/users

# Proxied to
GET http://localhost:8082/users
```

## Middleware

### Authentication Middleware

The gateway includes authentication middleware that:
- Extracts JWT tokens from `Authorization` headers
- Validates JWT signature and claims (issuer/expiration/audience)
- Forwards verified tokens to downstream services
- Allows public endpoints (health, info, register, login, refresh-token)

### Logging Middleware

All requests are logged with:
- Correlation ID (auto-generated or from `X-Correlation-ID` header)
- Request method and path
- Response status and duration
- Client IP and user agent

### Rate Limiting

Rate limiting is applied to all `/api/*` routes:
- 1000 requests per minute per IP (configurable)
- Prevents service overload

## Health Checks

### Gateway Health

```bash
curl http://localhost:4000/health
```

Response:
```json
{
  "status": "ok",
  "service": "api-gateway",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Service Health

```bash
curl http://localhost:4000/health/services
```

Response:
```json
{
  "status": "ok",
  "services": [
    {
      "name": "auth-service",
      "status": "healthy",
      "responseTime": 12
    },
    {
      "name": "user-service",
      "status": "healthy",
      "responseTime": 8
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

The gateway handles various error scenarios:

- **Service Unavailable (502)**: When a downstream service is unreachable
- **Timeout**: When a service doesn't respond within the configured timeout
- **Not Found (404)**: When a route doesn't match any service
- **Rate Limit (429)**: When rate limit is exceeded

## Development

### Project Structure

```
src/
├── config/
│   └── services.ts          # Service registry configuration
├── middleware/
│   ├── auth.middleware.ts   # Authentication middleware
│   ├── logging.middleware.ts # Request logging
│   └── error-handler.middleware.ts # Error handling
├── routes/
│   └── gateway.routes.ts    # Proxy route configuration
├── utils/
│   └── health-check.ts      # Service health check utilities
└── index.ts                 # Main entry point
```

### Adding a New Service

1. Add service configuration to `src/config/services.ts`:
```typescript
export const services: Record<string, ServiceConfig> = {
  // ... existing services
  newService: {
    name: 'new-service',
    baseUrl: process.env['NEW_SERVICE_URL'] || 'http://localhost:4007',
    healthCheckPath: '/health',
    timeout: 5000,
  },
};
```

2. Add route configuration:
```typescript
export const routeConfig = [
  // ... existing routes
  { path: '/api/v1/new-service', service: 'newService', stripPrefix: false },
];
```

3. Add environment variable to `.env.example`:
```env
NEW_SERVICE_URL=http://localhost:4007
```

## Production Considerations

- **Service Discovery**: Consider using Consul, Eureka, or Kubernetes service discovery
- **Load Balancing**: Add load balancing for multiple service instances
- **Circuit Breaker**: Implement circuit breaker pattern for resilience
- **Caching**: Add response caching for frequently accessed endpoints
- **Monitoring**: Integrate with Prometheus/Grafana for metrics
- **Tracing**: Add distributed tracing (Jaeger, Zipkin)
- **SSL/TLS**: Use HTTPS in production
- **Authentication**: Rotate JWT secrets and enforce issuer/audience claims

## Troubleshooting

### Service Not Responding

1. Check if service is running:
```bash
curl http://localhost:8082/actuator/health
```

2. Check gateway logs for errors

3. Verify service URL in `.env` matches actual service URL

### CORS Issues

Update `CORS_ORIGIN` in `.env` to match your frontend URL.

### Rate Limiting Issues

Adjust rate limit configuration in `src/index.ts`:
```typescript
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000, // Adjust this value
});
```

## License

MIT
