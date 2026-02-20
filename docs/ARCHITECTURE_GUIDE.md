# Microservices Architecture Guide

This guide helps you implement microservices for the Qeetmart application, allowing you to choose between **Java**, **Go**, and **TypeScript** for each service.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Language Selection Guide](#language-selection-guide)
3. [Service Structure](#service-structure)
4. [API Gateway Pattern](#api-gateway-pattern)
5. [Service Communication](#service-communication)
6. [Database Strategy](#database-strategy)
7. [Implementation Checklist](#implementation-checklist)

## Architecture Overview

### Recommended Structure

```
micros/
├── gateway/              # API Gateway (single entry point)
├── services/             # Individual microservices
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── inventory-service/
└── shared/               # Shared contracts and types
```

### Key Components

1. **API Gateway**: Routes client requests to appropriate microservices
2. **Microservices**: Independent services, each handling a specific domain
3. **Service Discovery**: Mechanism for services to find each other
4. **Shared Contracts**: Common API contracts and data types

## Language Selection Guide

### When to Choose TypeScript

**Best for:**
- Services requiring rapid development
- Real-time features (WebSockets, SSE)
- Integration with Node.js ecosystem
- Services with I/O-bound operations
- Team familiar with JavaScript/TypeScript

**Recommended services:**
- User Service (authentication, profiles)
- Product Service (catalog management)
- Notification Service (real-time updates)

**Tech Stack:**
- Framework: Express.js, Fastify, or NestJS
- Runtime: Node.js
- Database: Prisma ORM, TypeORM, or raw SQL

### When to Choose Java

**Best for:**
- Enterprise-grade requirements
- Complex business logic and transactions
- Integration with Java ecosystem (Spring)
- Strong type safety and tooling
- Services requiring JVM features

**Recommended services:**
- Payment Service (security, compliance)
- Order Service (complex workflows, transactions)
- Inventory Service (if complex business rules)

**Tech Stack:**
- Framework: Spring Boot
- Build Tool: Maven or Gradle
- Database: Spring Data JPA, Hibernate
- Java Version: 17+ (LTS)

### When to Choose Go

**Best for:**
- High performance requirements
- Low latency needs
- Concurrent processing
- Small memory footprint
- Services with CPU-bound operations

**Recommended services:**
- Inventory Service (high concurrency, real-time)
- Analytics Service (data processing)
- Search Service (performance-critical)

**Tech Stack:**
- Framework: Gin, Echo, or Fiber
- Database: GORM, sqlx, or database/sql
- Go Version: 1.21+

## Service Structure

### TypeScript Service Structure

```
service-name/
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/               # API routes
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic
│   ├── models/               # Data models
│   ├── middleware/           # Custom middleware
│   └── config/               # Configuration
├── package.json
├── tsconfig.json
└── .env
```

**Key Requirements:**
- Health check endpoint: `GET /health`
- Service info endpoint: `GET /info`
- Environment variable configuration
- Error handling middleware
- CORS configuration

### Java Service Structure

```
service-name/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/qeetmart/service/
│       │       ├── ServiceApplication.java
│       │       ├── controller/      # REST controllers
│       │       ├── service/          # Business logic
│       │       ├── repository/       # Data access
│       │       ├── model/            # Entities/DTOs
│       │       └── config/           # Configuration
│       └── resources/
│           └── application.properties
├── pom.xml (or build.gradle)
└── .env (optional)
```

**Key Requirements:**
- Spring Boot Actuator for health checks
- REST controllers with proper annotations
- Service layer for business logic
- Repository layer for data access
- Application properties for configuration

### Go Service Structure

```
service-name/
├── main.go                  # Entry point
├── handlers/                # HTTP handlers
├── services/                # Business logic
├── models/                  # Data models
├── middleware/              # Custom middleware
├── config/                  # Configuration
├── go.mod
├── go.sum
└── .env
```

**Key Requirements:**
- Health check handler: `GET /health`
- Service info handler: `GET /info`
- Router setup (Gin/Echo/Fiber)
- Error handling
- Environment variable loading

## API Gateway Pattern

### Purpose
- Single entry point for all client requests
- Request routing to appropriate services
- Cross-cutting concerns (auth, rate limiting, logging)
- Service aggregation

### Implementation Options

**TypeScript (Recommended for your stack):**
- Express.js with `http-proxy-middleware`
- Or use dedicated gateway: Kong, Tyk, or AWS API Gateway

**Java:**
- Spring Cloud Gateway
- Netflix Zuul (legacy)

**Go:**
- Custom gateway with `httputil.ReverseProxy`
- Or use Traefik, Caddy

### Gateway Responsibilities

1. **Routing**: Route `/api/v1/users/*` → User Service
2. **Load Balancing**: Distribute requests across service instances
3. **Authentication**: Validate tokens, forward to services
4. **Rate Limiting**: Protect services from overload
5. **Request/Response Transformation**: Modify requests/responses
6. **Service Discovery**: Find service instances dynamically

### Service Registry

**Simple Approach (Development):**
- Configuration file with service URLs
- Environment variables

**Production Approach:**
- **Consul**: Service discovery and health checking
- **Eureka**: Netflix service discovery
- **Kubernetes**: Native service discovery
- **etcd**: Distributed key-value store

## Service Communication

### Synchronous Communication (HTTP/REST)

**TypeScript → Any Service:**
```typescript
// Using fetch
const response = await fetch('http://service-name:port/api/endpoint');
const data = await response.json();

// Using axios
import axios from 'axios';
const response = await axios.get('http://service-name:port/api/endpoint');
```

**Java → Any Service:**
```java
// Using RestTemplate
RestTemplate restTemplate = new RestTemplate();
String url = "http://service-name:port/api/endpoint";
ResponseDTO response = restTemplate.getForObject(url, ResponseDTO.class);

// Using WebClient (reactive)
WebClient webClient = WebClient.create();
Mono<ResponseDTO> response = webClient.get()
    .uri("http://service-name:port/api/endpoint")
    .retrieve()
    .bodyToMono(ResponseDTO.class);
```

**Go → Any Service:**
```go
// Using net/http
resp, err := http.Get("http://service-name:port/api/endpoint")
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()

// Using resty
import "github.com/go-resty/resty/v2"
client := resty.New()
resp, err := client.R().Get("http://service-name:port/api/endpoint")
```

### Asynchronous Communication (Message Queue)

**Use Cases:**
- Order processing workflows
- Inventory updates
- Notification events
- Event sourcing

**Options:**
- **RabbitMQ**: Easy to use, good for most cases
- **Apache Kafka**: High throughput, event streaming
- **Redis Pub/Sub**: Simple, lightweight
- **AWS SQS/SNS**: Cloud-native

**Pattern:**
1. Service publishes event to queue
2. Other services subscribe to events
3. Services process events asynchronously

## Database Strategy

### Option 1: Database per Service (Recommended)

**Pros:**
- True service independence
- Technology flexibility per service
- Better scalability
- Isolated failures

**Cons:**
- More complex data consistency
- Distributed transactions needed
- More infrastructure

**Implementation:**
- Each service has its own database
- Services communicate via APIs
- Use Saga pattern for distributed transactions

### Option 2: Shared Database (Easier Migration)

**Pros:**
- Simpler migration path
- Easier data consistency
- Less infrastructure

**Cons:**
- Creates coupling between services
- Technology lock-in
- Harder to scale independently

**Implementation:**
- All services connect to same database
- Use different schemas/tables per service
- Still communicate via APIs (not direct DB access)

## Port Allocation

Standard local development port allocation for services:

- **Gateway**: 4000
- **Auth Service**: 8081
- **User Service**: 8082
- **Product Service**: 8083
- **Order Service**: 8084 (if implemented)
- **Payment Service**: 8085 (if implemented)
- **Inventory Service**: 8080

## Implementation Checklist

### For Each Microservice

- [ ] Choose appropriate language (TypeScript/Java/Go)
- [ ] Set up project structure
- [ ] Implement health check endpoint (`/health`)
- [ ] Implement service info endpoint (`/info`)
- [ ] Set up database connection (if needed)
- [ ] Implement API endpoints
- [ ] Add error handling
- [ ] Add logging
- [ ] Add environment variable configuration
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Register with API Gateway
- [ ] Document API (OpenAPI/Swagger)

### For API Gateway

- [ ] Choose gateway implementation
- [ ] Set up service registry
- [ ] Configure routing rules
- [ ] Add authentication/authorization
- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Add error handling
- [ ] Set up health checks for services
- [ ] Configure load balancing (if multiple instances)

### Cross-Cutting Concerns

- [ ] Service discovery mechanism
- [ ] Centralized logging (ELK, Loki, etc.)
- [ ] Distributed tracing (Jaeger, Zipkin)
- [ ] Monitoring and metrics (Prometheus, Grafana)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] CI/CD pipeline for each service
- [ ] Containerization (Docker)
- [ ] Orchestration (Kubernetes, Docker Compose)

## Best Practices

1. **API Versioning**: Use URL versioning (`/api/v1/`, `/api/v2/`)
2. **Error Handling**: Consistent error response format across all services
3. **Logging**: Structured logging with correlation IDs
4. **Security**: Authentication at gateway, authorization at services
5. **Testing**: Unit tests, integration tests, contract tests
6. **Documentation**: OpenAPI/Swagger for all APIs
7. **Monitoring**: Health checks, metrics, alerts
8. **Resilience**: Circuit breakers, retries, timeouts
9. **Deployment**: Independent deployment per service
10. **Data Consistency**: Eventual consistency, Saga pattern for transactions

## Migration Strategy

1. **Start Small**: Migrate one service at a time
2. **Keep Monolith Running**: Run both during migration
3. **Use Feature Flags**: Switch between monolith and microservices
4. **Gradual Traffic Migration**: Move traffic incrementally
5. **Monitor Closely**: Watch for issues during migration
6. **Have Rollback Plan**: Ability to revert if needed

## Resources

### TypeScript
- Express.js: https://expressjs.com/
- NestJS: https://nestjs.com/
- Fastify: https://www.fastify.io/

### Java
- Spring Boot: https://spring.io/projects/spring-boot
- Spring Cloud: https://spring.io/projects/spring-cloud

### Go
- Gin: https://gin-gonic.com/
- Echo: https://echo.labstack.com/
- Fiber: https://gofiber.io/

### API Gateway
- Kong: https://konghq.com/kong
- Traefik: https://traefik.io/
- Spring Cloud Gateway: https://spring.io/projects/spring-cloud-gateway

### Service Discovery
- Consul: https://www.consul.io/
- Eureka: https://github.com/Netflix/eureka

### Message Queues
- RabbitMQ: https://www.rabbitmq.com/
- Apache Kafka: https://kafka.apache.org/
