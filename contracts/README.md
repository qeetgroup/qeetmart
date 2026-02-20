# API Contracts Workspace

OpenAPI contracts are the source of truth for qeetmart backend APIs.

## Contract Files

| Service | Contract Path |
| --- | --- |
| Auth Service | `contracts/openapi/auth-service.openapi.json` |
| User Service | `contracts/openapi/user-service.openapi.json` |
| Product Service | `contracts/openapi/product-service.openapi.json` |
| Inventory Service | `contracts/openapi/inventory-service.openapi.json` |

## Validation Commands

Run from repository root:

```bash
pnpm contracts:lint
pnpm contracts:breaking
```

CI also enforces these checks via `.github/workflows/ci.yml`.

## Breaking Change Policy

The following changes are treated as breaking:

- Deleting an existing contract file
- Removing existing paths or operations
- Adding new required request parameters
- Adding new required JSON request body fields
- Removing documented response status codes

## Authoring Guidelines

- Keep `openapi` at `3.x`
- Ensure `info.title` and `info.version` are present
- Provide unique `operationId` per operation
- Add `summary` and at least one response per operation
- Keep examples and docs synchronized with behavior changes

## Recommended Workflow

1. Modify service behavior.
2. Update corresponding OpenAPI contract.
3. Run local contract checks.
4. Update docs and examples if request/response behavior changed.
5. Open PR with code + contract + docs updates together.

## Related Docs

- Root guide: `README.md`
- Services guide: `micros/README.md`
- Docs portal guide: `apps/docs/README.md`
