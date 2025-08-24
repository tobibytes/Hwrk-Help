# Data access

Library: @tanstack/react-query

Abstraction: `useAPI` in `packages/talvra-api`

API routes
- `packages/talvra-routes` exports `RouteDef` objects.
- `useAPI` takes a route constant, optional query and body.
- Returns `{ data, isLoading, isError, error, run }`.

Contract
```ts
type RouteDef = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  auth?: boolean;
  description?: string;
};

export function useAPI<TResp = unknown, TBody = unknown>(opts: {
  route: RouteDef;
  query?: Record<string, string | number | boolean | undefined>;
  body?: TBody;
  enabled?: boolean;
}): {
  data: TResp | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null | undefined;
  run: (payload?: TBody) => Promise<TResp>;
};

Rules
- All network access uses useAPI. No direct fetch in pages.
- Errors and loading states handled uniformly through returned metadata.
