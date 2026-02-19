# API Contracts and Service Communication

This guide covers how to design and maintain API contracts between microservices.

## API Contract Design

### RESTful API Design

#### URL Structure
```
/api/v1/{resource}/{id}/{sub-resource}
```

Examples:
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

#### HTTP Methods
- **GET**: Retrieve resources (idempotent)
- **POST**: Create resources
- **PUT**: Update resources (idempotent, full update)
- **PATCH**: Partial update
- **DELETE**: Delete resources (idempotent)

#### Status Codes
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Not authorized
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service down

### Request/Response Format

#### Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

#### Error Response Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

#### Pagination Format
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## Service-to-Service Communication

### Synchronous Communication (HTTP)

#### Request Headers
Always include:
- `Content-Type: application/json`
- `Accept: application/json`
- `X-Request-ID`: Correlation ID for tracing
- `Authorization`: Bearer token (if authenticated)

#### Timeout Configuration
- **Short operations**: 1-5 seconds
- **Medium operations**: 5-30 seconds
- **Long operations**: Consider async pattern instead

#### Retry Strategy
- **Exponential backoff**: 1s, 2s, 4s, 8s
- **Max retries**: 3-5 attempts
- **Retry on**: 5xx errors, network errors
- **Don't retry on**: 4xx errors (except 429)

#### Circuit Breaker Pattern
- **Open**: Stop calling service after failures
- **Half-open**: Test if service recovered
- **Closed**: Normal operation

### Asynchronous Communication (Events)

#### Event Naming Convention
```
{domain}.{entity}.{action}
```

Examples:
- `order.created`
- `payment.processed`
- `inventory.updated`
- `user.registered`

#### Event Schema
```json
{
  "eventId": "uuid",
  "eventType": "order.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "source": "order-service",
  "data": { ... },
  "metadata": {
    "correlationId": "uuid",
    "userId": "uuid"
  }
}
```

#### Event Handling
- **Idempotency**: Handle duplicate events
- **Ordering**: Maintain event order if needed
- **Error Handling**: Dead letter queue for failed events

## API Versioning

### URL Versioning (Recommended)
```
/api/v1/users
/api/v2/users
```

### Header Versioning
```
Accept: application/vnd.qeetmart.v1+json
```

### Versioning Strategy
- **Major version**: Breaking changes
- **Minor version**: New features (backward compatible)
- **Deprecation**: Announce 6 months before removal

## API Documentation

### OpenAPI/Swagger
Document all APIs using OpenAPI 3.0 specification:

```yaml
openapi: 3.0.0
info:
  title: User Service API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

### Documentation Requirements
- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Error responses
- Examples

## Data Transfer Objects (DTOs)

### Design Principles
- **Separate from domain models**: DTOs for API, models for business logic
- **Versioning**: DTOs can evolve independently
- **Validation**: Validate at API boundary
- **Documentation**: Document all fields

### Example DTO Structure

**TypeScript:**
```typescript
export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
```

**Java:**
```java
public class CreateUserDTO {
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String name;
    
    @NotBlank
    @Size(min = 8)
    private String password;
}

public class UserDTO {
    private String id;
    private String email;
    private String name;
    private LocalDateTime createdAt;
}
```

**Go:**
```go
type CreateUserDTO struct {
    Email    string `json:"email" validate:"required,email"`
    Name     string `json:"name" validate:"required"`
    Password string `json:"password" validate:"required,min=8"`
}

type UserDTO struct {
    ID        string    `json:"id"`
    Email     string    `json:"email"`
    Name      string    `json:"name"`
    CreatedAt time.Time `json:"createdAt"`
}
```

## Validation

### Input Validation
- **Required fields**: Validate presence
- **Format validation**: Email, URL, date formats
- **Range validation**: Min/max values
- **Type validation**: String, number, boolean

### Validation Libraries

**TypeScript:**
- Zod
- Joi
- class-validator

**Java:**
- Bean Validation (JSR-303)
- Hibernate Validator

**Go:**
- go-playground/validator
- Custom validation

## Error Handling

### Error Categories

#### Client Errors (4xx)
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing/invalid auth
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource conflict
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded

#### Server Errors (5xx)
- **500 Internal Server Error**: Unexpected error
- **502 Bad Gateway**: Upstream service error
- **503 Service Unavailable**: Service down
- **504 Gateway Timeout**: Upstream timeout

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "field": "id",
    "details": {
      "userId": "123"
    }
  }
}
```

## Security

### Authentication
- **JWT Tokens**: Stateless authentication
- **API Keys**: Service-to-service authentication
- **OAuth 2.0**: Third-party authentication

### Authorization
- **Role-Based Access Control (RBAC)**: Roles and permissions
- **Resource-Based**: Check resource ownership
- **Policy-Based**: Fine-grained policies

### Security Headers
- `X-Request-ID`: Request tracking
- `X-Forwarded-For`: Client IP
- `Authorization`: Bearer token
- `X-API-Key`: Service API key

## Performance Considerations

### Caching
- **Response caching**: Cache GET requests
- **Cache headers**: `Cache-Control`, `ETag`
- **Cache invalidation**: Invalidate on updates

### Pagination
- **Limit results**: Default 20, max 100
- **Cursor-based**: For large datasets
- **Offset-based**: For simple cases

### Compression
- **Gzip compression**: Compress responses
- **Content-Encoding**: `gzip`, `deflate`

## Testing API Contracts

### Contract Testing
- **Pact**: Consumer-driven contracts
- **Postman**: API testing
- **Schema validation**: Validate against OpenAPI spec

### Integration Testing
- Test service-to-service communication
- Mock external services
- Test error scenarios
- Test timeout scenarios

## Best Practices

1. **Consistency**: Use consistent patterns across services
2. **Documentation**: Keep API docs up to date
3. **Versioning**: Plan for API evolution
4. **Validation**: Validate at boundaries
5. **Error Handling**: Consistent error format
6. **Security**: Authenticate and authorize
7. **Performance**: Optimize for common use cases
8. **Monitoring**: Log and monitor API calls
9. **Testing**: Test contracts thoroughly
10. **Evolution**: Plan for breaking changes

## Example Service Communication

### User Service → Order Service

**Request:**
```http
GET /api/v1/users/123/orders
Authorization: Bearer {token}
X-Request-ID: {uuid}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "order-1",
        "userId": "123",
        "total": 99.99,
        "status": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Order Service → Payment Service (Event)

**Event:**
```json
{
  "eventId": "evt-123",
  "eventType": "order.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "source": "order-service",
  "data": {
    "orderId": "order-1",
    "userId": "123",
    "total": 99.99
  },
  "metadata": {
    "correlationId": "req-456"
  }
}
```
