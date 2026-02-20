# qeetmart

[![CI](https://github.com/qeetgroup/qeetmart/actions/workflows/ci.yml/badge.svg)](https://github.com/qeetgroup/qeetmart/actions/workflows/ci.yml)
[![Deploy Workflow](https://github.com/qeetgroup/qeetmart/actions/workflows/deploy.yml/badge.svg)](https://github.com/qeetgroup/qeetmart/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.x-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Java](https://img.shields.io/badge/java-17-007396?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Go](https://img.shields.io/badge/go-1.23+-00ADD8?logo=go&logoColor=white)](https://go.dev/)

Production-grade polyglot eCommerce platform built as a monorepo.

`qeetmart` combines a Node.js API Gateway, Spring Boot microservices, a Go inventory service, Next.js web apps, Expo mobile, OpenAPI governance, Docker local runtime, and Kubernetes deployment assets.

## Table of Contents

- [Platform Vision](#platform-vision)
- [Architecture](#architecture)
- [Technology Matrix](#technology-matrix)
- [Repository Layout](#repository-layout)
- [Quick Start (15 Minutes)](#quick-start-15-minutes)
- [Development Workflows](#development-workflows)
- [Service Catalog](#service-catalog)
- [Environment and Configuration](#environment-and-configuration)
- [API Contracts and Client References](#api-contracts-and-client-references)
- [Documentation Platform](#documentation-platform)
- [CI/CD and Quality Gates](#cicd-and-quality-gates)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Platform Vision

- Deliver scalable eCommerce capabilities via independently deployable services
- Keep APIs stable through contract-first governance
- Support fast onboarding for engineers across Node, Java, Go, and React/Expo stacks
- Provide production-grade platform controls (CI policy, deployment validation, docs operations)

## Architecture

```text
Clients
  ├─ Next.js Web (apps/web)
  ├─ Admin SPA (apps/admin)
  └─ Expo Mobile (apps/mobile)
        │
        ▼
API Gateway (micros/api-gateway :4000)
  ├─ Auth Service (Spring Boot :8081)     -> Postgres (auth_db)
  ├─ User Service (Spring Boot :8082)     -> Postgres (user_db)
  ├─ Product Service (Spring Boot :8083)  -> Postgres (product_db)
  └─ Inventory Service (Go/Gin :8080)     -> Postgres (inventory) + Redis
```

## Technology Matrix

| Area | Technology |
| --- | --- |
| Monorepo | `pnpm` workspace |
| API Gateway | Node.js + TypeScript + Express |
| Identity/Catalog/Profile Services | Spring Boot (Java 17) |
| Inventory Service | Go + Gin + PostgreSQL + Redis |
| Web Frontend | Next.js + React |
| Admin Frontend | React + Vite |
| Mobile App | Expo + React Native |
| Contract Governance | OpenAPI 3 + custom lint/breaking checks |
| Documentation | Next.js docs portal (`apps/docs`) |
| Local Runtime | Docker Compose (`docker-compose.dev.yml`) |
| CI/CD | GitHub Actions |
| Runtime Deployment | Kubernetes manifests + Helm chart |

## Repository Layout

| Path | Purpose |
| --- | --- |
| `apps/web` | Customer-facing web app |
| `apps/admin` | Admin frontend |
| `apps/mobile` | Expo mobile app |
| `apps/docs` | Production docs portal |
| `micros/api-gateway` | Node.js gateway |
| `micros/auth-service` | Spring Boot auth service |
| `micros/user-service` | Spring Boot user profile service |
| `micros/product-service` | Spring Boot product service |
| `micros/inventory-service` | Go inventory service |
| `packages/shared` | Shared workspace package |
| `packages/openapi-clients` | Generated TypeScript API references |
| `contracts/openapi` | OpenAPI source-of-truth specs |
| `tools/ci` | Contract governance scripts |
| `platform/k8s` | Kustomize-ready Kubernetes manifests |
| `helm/qeetmart` | Helm chart |
| `docs` | Supplemental architecture/project docs |

## Quick Start (15 Minutes)

### 1) Prerequisites

- Node.js `22.x`
- pnpm `10.x`
- Java `17`
- Go `1.23+`
- Docker + Docker Compose v2

### 2) Install dependencies

```bash
pnpm install
```

### 3) Create service environment files

```bash
cp micros/api-gateway/.env.example micros/api-gateway/.env
cp micros/auth-service/.env.example micros/auth-service/.env
cp micros/user-service/.env.example micros/user-service/.env
cp micros/product-service/.env.example micros/product-service/.env
cp micros/inventory-service/.env.example micros/inventory-service/.env
```

### 4) Start full backend stack

```bash
pnpm docker:up
```

### 5) Verify health

```bash
curl http://localhost:4000/health
curl http://localhost:4000/health/services
curl http://localhost:8080/health
```

### 6) Start apps (as needed)

```bash
pnpm dev:web
pnpm dev:admin
pnpm dev:mobile
pnpm dev:docs
```

### 7) Stop local stack

```bash
pnpm docker:down
```

## Development Workflows

### Core run commands

| Workflow | Command |
| --- | --- |
| Gateway + web + admin | `pnpm dev` |
| Gateway only | `pnpm dev:gateway` |
| Web only | `pnpm dev:web` |
| Admin only | `pnpm dev:admin` |
| Mobile only | `pnpm dev:mobile` |
| Docs portal | `pnpm dev:docs` |
| Full backend stack (Docker) | `pnpm docker:up` |
| Stop backend stack | `pnpm docker:down` |

### Build commands

```bash
pnpm build
pnpm build:gateway
pnpm build:web
pnpm build:admin
pnpm build:docs
```

### Service test commands

```bash
pnpm test:gateway
pnpm test:auth-service
pnpm test:user-service
pnpm test:product-service
pnpm test:inventory-service
```

## Service Catalog

| Service | Runtime | Port | Health Endpoint | Data Store | Env Example |
| --- | --- | --- | --- | --- | --- |
| API Gateway | Node.js / Express | `4000` | `/health` | N/A | `micros/api-gateway/.env.example` |
| Auth Service | Spring Boot | `8081` | `/actuator/health` | Postgres (`auth_db`) | `micros/auth-service/.env.example` |
| User Service | Spring Boot | `8082` | `/actuator/health` | Postgres (`user_db`) | `micros/user-service/.env.example` |
| Product Service | Spring Boot | `8083` | `/actuator/health` | Postgres (`product_db`) | `micros/product-service/.env.example` |
| Inventory Service | Go / Gin | `8080` | `/health` | Postgres + Redis | `micros/inventory-service/.env.example` |

## Environment and Configuration

- Each service has an `.env.example` file in its service directory
- Docker development values are defined in `docker-compose.dev.yml`
- Keep secrets out of VCS and use environment-specific secret managers in deployment environments
- Gateway/service URL alignment is required for local routing correctness

## API Contracts and Client References

OpenAPI specs are the source of truth under `contracts/openapi/*.openapi.json`.

### Contract checks

```bash
pnpm contracts:lint
pnpm contracts:breaking
```

Rules enforced by CI and local checks:

- Contract file deletion is breaking
- Removing paths or operations is breaking
- Adding new required params/fields is breaking
- Removing documented response codes is breaking

### Generated TypeScript references

```bash
pnpm docs:sync:openapi
pnpm docs:generate:clients
```

Output package:

- `packages/openapi-clients`

## Documentation Platform

Primary docs app: `apps/docs`

Capabilities:

- Versioned documentation content (`content/v1`)
- Interactive API reference pages from synced OpenAPI specs
- Environment variable catalog pages
- Search index generation
- Docs drift checks (OpenAPI/env/readme consistency)

Useful docs commands:

```bash
pnpm docs:sync:openapi
pnpm docs:sync:readmes
pnpm docs:search:index
pnpm docs:drift:check
pnpm docs:validate
```

See also: `apps/docs/README.md`

## CI/CD and Quality Gates

### CI workflow

- File: `.github/workflows/ci.yml`
- Trigger: push to `main`, pull requests
- Path-aware jobs: Node, Java, Go, contracts, docs, platform validation

Checks include:

- Node build and tests for gateway and frontend apps
- Java test matrix for `auth-service`, `user-service`, `product-service`
- Go tests for `inventory-service`
- OpenAPI lint and breaking-change checks
- Docs drift/content checks and docs build
- Helm lint and Kustomize render validation

### Deploy workflow

- File: `.github/workflows/deploy.yml`
- Trigger: manual (`workflow_dispatch`)
- Inputs: target environment and image tag
- Current job is a deployment integration placeholder for Argo CD/Helm automation

## Deployment

### Kubernetes assets

- Base manifests: `platform/k8s/base`
- Dev overlay: `platform/k8s/overlays/dev`
- Staging overlay: `platform/k8s/overlays/staging`
- Prod overlay: `platform/k8s/overlays/prod`

### Helm assets

- Chart root: `helm/qeetmart`

### Validate manifests

```bash
helm lint helm/qeetmart
kustomize build platform/k8s/overlays/dev > /tmp/kustomize-dev.yaml
kustomize build platform/k8s/overlays/staging > /tmp/kustomize-staging.yaml
kustomize build platform/k8s/overlays/prod > /tmp/kustomize-prod.yaml
```

## Troubleshooting

### Peer dependency warnings for React 19

Root `package.json` includes pnpm peer rules and package extensions to handle lagging upstream peer ranges (for example `swagger-ui-react` transitives).

### Ignored build scripts warning (`pnpm approve-builds`)

Root `package.json` includes `pnpm.onlyBuiltDependencies` to define approved build-script packages.

If you need to adjust approvals interactively:

```bash
pnpm approve-builds
```

### Docker stack issues

```bash
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs -f gateway
```

## Security Notes

- Never commit real secrets to `.env` files
- Rotate JWT secrets and DB credentials per environment
- Use strict CORS and auth settings in non-local environments
- Ensure staging/prod DB schema strategy does not use unsafe local defaults

## Roadmap

### Near term

- Add order and payment services with governed OpenAPI contracts
- Replace deploy placeholder with real progressive delivery pipeline
- Add service-level observability standards (traces, SLO dashboards, alerting)

### Mid term

- Extend docs versioning from `v1` to release-tracked branches
- Add end-to-end test stage across gateway + service stack
- Add environment-specific policy checks for config drift

### Long term

- Multi-region deployment patterns
- Event-driven integration patterns for cross-domain workflows
- Hardened zero-downtime release playbooks and automated rollback criteria

## Contributing

- Keep code, contracts, and docs updated in the same PR when behavior changes
- Run relevant local checks before opening a PR
- Prefer explicit commands and reproducible setup steps in docs

## License

MIT (`LICENSE`)
