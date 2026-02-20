# Apps Workspace

Application layer for qeetmart clients and developer documentation.

## Scope

This folder contains all user-facing applications and the internal docs portal:

- Customer web experience
- Admin operations UI
- Mobile app
- Engineering documentation platform

## Application Catalog

| App | Path | Stack | Local Command | Default Port |
| --- | --- | --- | --- | --- |
| Web | `apps/web` | Next.js + React | `pnpm dev:web` | `3000` |
| Admin | `apps/admin` | React + Vite | `pnpm dev:admin` | `5173` (Vite default) |
| Mobile | `apps/mobile` | Expo + React Native | `pnpm dev:mobile` | Expo dev server |
| Docs | `apps/docs` | Next.js + MDX | `pnpm dev:docs` | `3000` (when run standalone) |

## Local Development

From repository root:

```bash
pnpm install
pnpm dev:web
pnpm dev:admin
pnpm dev:mobile
pnpm dev:docs
```

Run combined gateway + web + admin development mode:

```bash
pnpm dev
```

## Build Commands

```bash
pnpm build:web
pnpm build:admin
pnpm build:docs
```

## App-Level Conventions

- Keep environment-specific values out of source control
- When API behavior changes, update contracts and docs in the same PR
- Keep UI routes and API integration assumptions aligned with gateway behavior
- Prefer explicit error states for backend dependency failures

## Related Docs

- Root guide: `README.md`
- Docs portal guide: `apps/docs/README.md`
- Service workspace guide: `micros/README.md`
