# Linting and guards

Purpose
- Enforce no raw HTML tags in pages.
- Enforce use of route helpers, not string paths.

Rules
- ESLint override blocks `div`, `span`, `section`, headings, inputs, and list tags in `apps/web/src` except inside `packages/talvra-ui`.
- ESLint rule warns on literal paths like `/admin` or `/courses` in app code.

Config lives in `packages/configs` and is shared by the web app.