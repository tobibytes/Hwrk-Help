# State and hooks

Rules
- UI is dumb. Logic sits in hooks.
- Name hooks with project context. Example: `useTalvraState`, `useTalvraAuth`, `useTalvraCourses`.

Placement
- Shared hooks in `packages/talvra-hooks`.
- Area hooks in `Areas/<Area>/hooks`.

Examples
- `useTalvraCourses` wraps `useAPI(GET_ALL_COURSES)`.
- `useTalvraAuth` exposes `user`, `signIn`, `signOut`.
