# qeetmart

Polyglot monorepo for Qeetmart applications and microservices.

## Workspace Layout

- `apps/` client applications (`web`, `admin`, `mobile`)
- `micros/` backend services (`api-gateway`, `auth-service`, `user-service`, `product-service`, `inventory-service`)
- `packages/` shared contracts and types
- `contracts/` OpenAPI contracts and governance checks
- `docs/` architecture and API docs
- `apps/docs/` Next.js documentation portal
- `platform/` Kubernetes and deployment platform assets
- `helm/` Helm chart for runtime deployment

## Local Development

Install workspace dependencies:

```bash
pnpm install
```

Run gateway + web + admin:

```bash
pnpm dev
```

Run the documentation portal:

```bash
pnpm dev:docs
```

Run full local microservice stack with Docker:

```bash
pnpm docker:up
```

Stop the local Docker stack:

```bash
pnpm docker:down
```

Validate API contracts:

```bash
pnpm contracts:lint
pnpm contracts:breaking
```

Validate documentation quality gates:

```bash
pnpm docs:drift:check
pnpm docs:validate
```

## CI

GitHub Actions workflows live in `.github/workflows`:

- `ci.yml`: path-aware Node/Java/Go build and test checks
- `deploy.yml`: manual deployment workflow scaffold for multi-environment promotion
