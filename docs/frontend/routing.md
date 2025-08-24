# Routing

Library: React Router v6

Single source of truth: `src/app/routes.ts` defines all pages, metadata, and lazy loaders.

Contract
```ts
type FrontRoute = {
  key: string;
  path: string;
  area: "admin" | "courses" | "core";
  title?: string;
  requiresAuth?: boolean;
  component: React.LazyExoticComponent<() => JSX.Element>;
  params?: readonly string[];
};

export const FRONT_ROUTES: Record<string, FrontRoute> = { ... };

export function buildPath<K extends keyof typeof FRONT_ROUTES>(
  key: K,
  params?: Record<string, string | number>,
  query?: Record<string, string | number | boolean | undefined>
): string;

Composition
	•	AppRoutes.tsx renders <Route> items from FRONT_ROUTES.
	•	Route guards wrap elements when requiresAuth is true.
	•	Use buildPath or useTalvraNav to navigate. Never hardcode paths.

Code splitting
	•	Use lazy(() => import("...")) in the route constants.

---

## docs/frontend/ui-library.md

```markdown
# UI library

Location: `packages/talvra-ui`

Purpose
- Wrap raw HTML tags with styled-components.
- Only this package can contain raw tags.
- Export primitives and patterns.

Primitives
- `Surface`, `Stack`, `Text`, `Card`, `Button`, `Input`, `Table`, `Link`.

Contract
```ts
// pages must import from @ui, not react-dom tags.
import { Surface, Stack, Text, Card, Button } from "@ui";

Patterns
	•	Compose only from primitives inside Areas.
	•	Charts and Area widgets live under that Area and still use primitives.

Accessibility
	•	Provide focus states, aria labels, and keyboard nav where relevant.

---

## docs/frontend/styling-theming.md

```markdown
# Styling and theming

Library: styled-components

Theme source: `packages/talvra-constants/src/theme.ts`

Tokens
- colors, spacing, radius, typography scale.

Rules
- No Tailwind.
- Use theme tokens only, no hardcoded colors in pages.
- Put complex styles inside UI primitives. Pages stay declarative.

Provider
- `AppProvider.tsx` mounts ThemeProvider and react-query QueryClientProvider.