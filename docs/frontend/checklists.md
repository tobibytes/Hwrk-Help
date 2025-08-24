# Checklists

Add a new Area
- create `src/Areas/<Area>/index.tsx`
- create `src/Areas/<Area>/<Area>.routes.tsx`
- add components, hooks, constants folders as needed
- add route object in `src/app/routes.ts`
- update tests

Add a new page
- create page component in Area
- add a new route object in `src/app/routes.ts`
- if params exist, list them in `params` and use `buildPath`

Call an API
- add or import RouteDef from `packages/talvra-routes`
- create a hook in Area that calls `useAPI`
- render in a page using UI primitives

PR rules for the AI agent
- create a branch named `frontend/<feature>`
- describe what changed and why
- list how it was tested
- include before and after screenshots if UI changed
- ensure lint and tests pass