# Testing

Tools
- Vitest for unit tests.
- React Testing Library for components.
- Playwright for e2e later.

What to test
- UI primitives render with theme and basic accessibility.
- `useAPI` handles success, error, and retry.
- Area hooks return shaped data and call routes with correct params.
- Routing renders each page from `FRONT_ROUTES`.
- No raw tags slip into Areas. Lint runs in CI.

Data
- Mock fetch with MSW. Provide fixtures for common endpoints.