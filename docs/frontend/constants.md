# Constants

Shared constants
- `packages/talvra-constants` for theme, sizes, enums.

Frontend route constants
- `src/app/routes.ts` holds FRONT_ROUTES.

Backend route constants
- `packages/talvra-routes` holds API endpoints.
- Keep in sync through codegen. See codegen-sync.md.

Import style
- Use aliases `@`, `@ui`, `@hooks`, `@constants`, `@routes`, `@api`.
- No deep relative imports.