# Principles

- Areas based feature layout under `src/Areas`.
- Pages do not use raw HTML tags. Only custom primitives from `@ui`.
- UI components are dumb. Business logic and data live in hooks.
- Heavy typing everywhere. No `any` unless justified and documented.
- Files target 100 lines max. Break into smaller modules when needed.
- Shared things only in shared folders. Area specific things live inside the Area.
- Consistent styling via styled-components and a shared theme.
- All data fetching goes through `useAPI` on top of react-query.
- Frontend routes are a single source of truth in `src/app/routes.ts`.
- API routes are a single source of truth in `packages/talvra-routes`.