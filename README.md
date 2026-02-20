# qeetmart

Polyglot monorepo for Qeetmart applications and microservices.

## Workspace Layout

- `apps/` client applications (`web`, `admin`, `mobile`)
- `micros/` backend services (`api-gateway`, `auth-service`, `user-service`, `product-service`, `inventory-service`)
- `packages/` shared contracts and types
- `docs/` architecture and API docs

## Local Development

Install workspace dependencies:

```bash
pnpm install
```

Run gateway + web + admin:

```bash
pnpm dev
```

Run full local microservice stack with Docker:

```bash
pnpm docker:up
```

Stop the local Docker stack:

```bash
pnpm docker:down
```

## CI

GitHub Actions workflows live in `.github/workflows`:

- `ci.yml`: path-aware Node/Java/Go build and test checks
- `deploy.yml`: manual deployment workflow scaffold for multi-environment promotion
