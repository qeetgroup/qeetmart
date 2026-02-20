# API Contracts

This folder is the source of truth for service contracts.

## Files

- `contracts/openapi/*.openapi.json`: OpenAPI specs per service.

## Validation

Run locally:

```bash
pnpm contracts:lint
pnpm contracts:breaking
```

CI gates in `.github/workflows/ci.yml` enforce:

- structural contract linting
- breaking-change detection against the PR base branch

## Rules

- Do not delete an existing contract file.
- Removing paths/operations is treated as breaking.
- Adding new required request parameters/fields is treated as breaking.
- Removing documented response codes is treated as breaking.
