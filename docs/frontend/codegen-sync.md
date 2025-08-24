# Codegen and sync

Goal
- Keep frontend API route constants and types in sync with backend.

Plan
- Backend exposes OpenAPI spec.
- Script generates:
  - typed clients, request and response types into `packages/talvra-api`.
  - API route constants into `packages/talvra-routes`.
- Add `pnpm run codegen` to run in CI and on postinstall.

Frontend routes
- Frontend routes live in `src/app/routes.ts`.
- When adding a new page, add it to this file only and commit.