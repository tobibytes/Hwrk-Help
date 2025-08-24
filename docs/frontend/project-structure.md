# Project structure

Monorepo layout

repo-root/
apps/
web/
src/
Areas/
Admin/
index.tsx
Admin.routes.tsx
components/
hooks/
constants/
Courses/
index.tsx
Courses.routes.tsx
components/
hooks/
constants/
components/        # shared only
hooks/             # shared only
constants/         # shared only
app/
routes.ts
AppRoutes.tsx
AppProvider.tsx
main.tsx
vite.config.ts
tsconfig.json
packages/
talvra-ui/
talvra-hooks/
talvra-constants/
talvra-routes/
talvra-api/
configs/

Rules
- Area specific components in `Areas/<Area>/components`.
- Area specific hooks in `Areas/<Area>/hooks`.
- Promote to shared only when used by more than one Area.