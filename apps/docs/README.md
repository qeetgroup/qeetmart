# qeetmart Documentation App

Production documentation portal for qeetmart.

## Commands

```bash
pnpm --filter docs dev
pnpm --filter docs build
pnpm --filter docs sync:openapi
pnpm --filter docs sync:readmes
pnpm --filter docs search:index
pnpm --filter docs check:content
pnpm --filter docs check:drift
pnpm --filter docs generate:clients
```

## Content model

- Versioned docs content: `content/v1/**`
- OpenAPI specs for rendering: `openapi/v1/*.json`
- Environment variable source of truth: `src/data/env-vars.v1.json`
