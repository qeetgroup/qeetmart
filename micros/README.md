# Microservices Workspace

Backend services for qeetmart, including API Gateway and domain microservices.

## Service Topology

```text
Clients -> API Gateway -> Auth/User/Product/Inventory services
```

## Service Catalog

| Service | Path | Runtime | Port | Health Endpoint | Data Store |
| --- | --- | --- | --- | --- | --- |
| API Gateway | `micros/api-gateway` | Node.js + TypeScript | `4000` | `/health` | N/A |
| Auth Service | `micros/auth-service` | Spring Boot (Java 17) | `8081` | `/actuator/health` | Postgres |
| User Service | `micros/user-service` | Spring Boot (Java 17) | `8082` | `/actuator/health` | Postgres |
| Product Service | `micros/product-service` | Spring Boot (Java 17) | `8083` | `/actuator/health` | Postgres |
| Inventory Service | `micros/inventory-service` | Go + Gin | `8080` | `/health` | Postgres + Redis |

## Environment Files

- `micros/api-gateway/.env.example`
- `micros/auth-service/.env.example`
- `micros/user-service/.env.example`
- `micros/product-service/.env.example`
- `micros/inventory-service/.env.example`

## Local Runtime

Preferred full-stack startup:

```bash
pnpm docker:up
```

Stop stack:

```bash
pnpm docker:down
```

## Tests

From repository root:

```bash
pnpm test:gateway
pnpm test:auth-service
pnpm test:user-service
pnpm test:product-service
pnpm test:inventory-service
```

## Development Rules

- Gateway is the only public entrypoint for client applications
- Service API changes must be reflected in `contracts/openapi`
- Breaking API changes require explicit contract/version strategy
- Operational changes should include docs/runbook updates

## Related Docs

- Root guide: `README.md`
- Contracts guide: `contracts/README.md`
- Gateway detail: `micros/api-gateway/README.md`
- Inventory detail: `micros/inventory-service/README.md`
