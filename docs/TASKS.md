# Build Plan and Task Tracker

This file is the single source of truth for the build order. The AI works task by task, creates a branch, opens a PR, and marks each task as done in `docs/tasks.json` after merge.

You can run the app at each step and see something on screen or via a health endpoint.

## How to use this file

- The agent takes the next task with status todo
- Creates a branch named as specified in the task
- Follows the steps and acceptance checks
- Opens a PR with the title and body template
- After you merge, the agent flips the task to done in `docs/tasks.json` and continues

## Conventions

- Monorepo with pnpm workspaces
- Frontend is React with Vite and React Router
- No Tailwind
- Shared UI primitives live in `packages/talvra-ui` and are the only place where raw HTML tags exist
- Frontend uses `@tanstack/react-query` and a typed `useAPI` hook in `packages/talvra-api`
- Backend is microservices. Database is Neon Postgres. Storage is Azure Blob. Queue is Redis Streams
- No ORM. SQL migrations live under `/migrations/<bounded_context>`
- Process rules live in `docs/process.md` and `docs/process.json`. A validator ensures the JSON stays valid

---

## Phase 0 - Repo and CI basics

### T000 - Initialize monorepo and workspace
- Branch: tooling/init-monorepo
- Paths: `package.json`, `pnpm-workspace.yaml`, `.editorconfig`, `.gitignore`, `README.md`
- Steps
  - Create pnpm workspace at repo root
  - Add scripts placeholders
  - Add `@` path alias guidance in README
- Run checks
  - `pnpm -v`
  - `pnpm install`
- Acceptance
  - `pnpm install` succeeds at root
  - Workspace is recognized. `pnpm -r list` shows zero packages but no errors
- PR title
  - chore(repo) init pnpm workspace and repo meta
- PR body
  - Why: set the foundation for multi apps
  - What changed: workspace files and repo meta
  - Tests: install ok

### T001 - Add CI workflow skeleton
- Branch: tooling/ci-skeleton
- Paths: `.github/workflows/ci.yml`
- Steps
  - Add a single job that checks out code and runs `pnpm install`
- Acceptance
  - CI passes on PR
- PR title
  - ci: add workflow skeleton
- PR body
  - Why: early CI feedback
  - Tests: green run on PR

### T002 - Process handbook and validator
- Branch: tooling/process-handbook
- Paths: `docs/process.md`, `docs/process.json`, `scripts/validate-process-json.ts`, `package.json`, `.github/workflows/ci.yml`
- Steps
  - Add process handbook markdown and JSON
  - Create validator script with zod
  - Add `pnpm run validate:process` and call it in CI
- Run checks
  - `pnpm add -D tsx zod`
  - `pnpm run validate:process`
- Acceptance
  - Validator reports `process.json valid`
  - CI runs the validator
- PR title
  - docs(process) add handbook and JSON with validator
- PR body
  - Why: single source of truth for rules
  - Tests: validator pass and CI hook

---

## Phase 1 - Frontend base you can run

### T010 - Scaffold Vite React app and structure
- Branch: web/scaffold
- Paths: `apps/web/**`, `packages/configs/**`, `tsconfig.base.json`
- Steps
  - Create `apps/web` with Vite React TypeScript template
  - Add `vite.config.ts` with path aliases to `@`, `@ui`, `@hooks`, `@constants`, `@routes`, `@api`
  - Add `tsconfig.json` that maps those aliases
  - Add `src/Areas` folder with `Admin` and `Courses`
  - Add `src/app/AppProvider.tsx`, `src/app/AppRoutes.tsx`, `src/app/routes.ts`
- Run checks
  - `pnpm --filter web dev`
- Acceptance
  - Dev server starts and shows a simple Admin page
- PR title
  - feat(web) scaffold Vite app with Areas and routes skeleton
- PR body
  - What: Vite app, routes, Areas folders
  - Tests: `pnpm --filter web dev` shows Admin page

### T011 - Shared UI primitives package
- Branch: web/ui-primitives
- Paths: `packages/talvra-ui/**`, `apps/web/.eslintrc.cjs`, `packages/configs/.eslintrc.base.cjs`
- Steps
  - Create `talvra-ui` with primitives Surface, Stack, Text, Card, Button, Link using styled-components
  - Set ESLint rule that forbids raw tags in `apps/web/src` outside `talvra-ui`
- Acceptance
  - Admin page renders using only `@ui` imports
  - ESLint fails if a raw tag is used in Areas
- PR title
  - feat(ui) add Talvra UI primitives and lint guard
- PR body
  - What: primitives and guard
  - Tests: render Admin, lint rule triggers on raw tag sample

### T012 - Frontend route constants as single source of truth
- Branch: web/front-routes-constants
- Paths: `apps/web/src/app/routes.ts`, `apps/web/src/app/AppRoutes.tsx`, `packages/talvra-hooks/src/useTalvraNav.ts`
- Steps
  - Define FRONT_ROUTES with lazy-loaded components and metadata
  - Add `buildPath` helper
  - Add `useTalvraNav` hook to navigate by key
- Acceptance
  - Navigating to courses and course detail works through constants
- PR title
  - feat(web) add FRONT_ROUTES constants and typed navigation
- PR body
  - What: routes file, helper, hook
  - Tests: dev server navigation

### T013 - React Query and useAPI hook package
- Branch: web/useapi
- Paths: `packages/talvra-api/src/useAPI.ts`, `apps/web/src/app/AppProvider.tsx`
- Steps
  - Add QueryClientProvider in AppProvider
  - Implement `useAPI` that takes a RouteDef and returns data, metadata, and run function
- Acceptance
  - A test route calling a mock endpoint returns data in a sample component
- PR title
  - feat(api) add typed useAPI on react query
- PR body
  - What: provider and hook
  - Tests: sample GET works

---

## Phase 2 - Backend base you can run

### T020 - Docker compose for local stack
- Branch: infra/compose-base
- Paths: `infra/docker-compose.yml`, `infra/redis/**`, `infra/azurite/**`, `.env.example`
- Steps
  - Add Postgres service for local dev or point to Neon via env
  - Add Redis and Azurite
  - Add networks and ports
- Acceptance
  - `docker compose up -d` brings up services
- PR title
  - infra: add compose for Postgres Redis Azurite
- PR body
  - What: compose file and env example
  - Tests: services healthy

### T021 - API Gateway service skeleton
- Branch: backend/gateway-skeleton
- Paths: `services/api-gateway/**`
- Steps
  - Node TypeScript service with GET `/health` and a proxy placeholder
  - Request id on each response
- Acceptance
  - `curl localhost:3001/health` returns ok true
- PR title
  - feat(gateway) skeleton with health and request id
- PR body
  - What: service base
  - Tests: curl result and logs

### T022 - Auth service skeleton
- Branch: backend/auth-skeleton
- Paths: `services/auth-service/**`, `migrations/auth/**`
- Steps
  - Add users and sessions tables migrations
  - Add POST `/auth/signup`, `/auth/login`, GET `/auth/session` with in memory session for now
- Acceptance
  - Sign up and login work against local Postgres
- PR title
  - feat(auth) service skeleton and basic auth endpoints
- PR body
  - What: endpoints and migrations
  - Tests: curl paths return expected

### T023 - Gateway to Auth integration with cookies
- Branch: backend/gateway-auth-integration
- Paths: `services/api-gateway/**`
- Steps
  - Proxy `/auth/*` to Auth
  - Set and read HttpOnly cookie session
- Acceptance
  - Login through gateway sets session cookie
  - GET `/auth/session` shows logged in state
- PR title
  - feat(gateway) proxy auth and session cookies
- PR body
  - What: reverse proxy and cookie handling

---

## Phase 3 - Canvas integration with fixtures first

### T030 - Canvas service skeleton and OAuth placeholders
- Branch: backend/canvas-skeleton
- Paths: `services/canvas-service/**`, `migrations/canvas/**`
- Steps
  - Tables for `canvas_courses` and `canvas_assignments`
  - Endpoints: POST `/canvas/connect` placeholder, POST `/canvas/sync`, GET `/canvas/courses`, GET `/canvas/assignments`
  - For now, `sync` reads fixture JSON and inserts rows
- Acceptance
  - GET courses and assignments return fixture data
- PR title
  - feat(canvas) service skeleton with fixture sync
- PR body
  - What: tables and endpoints
  - Tests: sync then read

### T031 - Gateway routes for Canvas
- Branch: backend/gateway-canvas-proxy
- Paths: `services/api-gateway/**`
- Steps
  - Proxy `/canvas/*` to Canvas service
- Acceptance
  - Frontend can call `/api/canvas/courses` and get fixture data
- PR title
  - feat(gateway) proxy canvas routes
- PR body
  - What: proxy rules

### T032 - Frontend Courses Area basic list
- Branch: web/courses-list
- Paths: `apps/web/src/Areas/Courses/**`
- Steps
  - Add `useTalvraCourses` hook that calls GET_ALL_COURSES route
  - Render a list using `@ui` primitives only
- Acceptance
  - Visiting `/courses` shows fixture courses
- PR title
  - feat(web) courses list using useAPI and route constants
- PR body
  - What: hook and list
  - Tests: manual route visit shows data

---

## Phase 4 - Ingestion pipeline start

### T040 - Ingestion service skeleton and migrations
- Branch: backend/ingestion-skeleton
- Paths: `services/ingestion-service/**`, `migrations/documents/**`
- Steps
  - Tables for documents
  - Endpoints: POST `/ingestion/start`, GET `/documents/:id`
  - Add Redis stream names and consumer group
- Acceptance
  - Posting start returns a doc id and enqueues a message
- PR title
  - feat(ingestion) service skeleton with Redis stream
- PR body
  - What: endpoints and queue

### T041 - Minimal extractor for PDF and DOCX to Markdown plus JSON
- Branch: backend/ingestion-extractor
- Paths: `services/ingestion-service/src/**`
- Steps
  - Implement adapters to extract text and headings
  - Save markdown and structure.json to Azurite
  - Upsert `documents` row
- Acceptance
  - `POST /ingestion/start` with a PDF fixture produces blob files
  - `GET /documents/:id` returns blob urls
- PR title
  - feat(ingestion) extract PDF and DOCX to md and json
- PR body
  - What: adapters and blob store
  - Tests: run with fixture

### T042 - Frontend: view generated notes for a document
- Branch: web/documents-view
- Paths: `apps/web/src/Areas/Courses/**`, `packages/talvra-routes/**`
- Steps
  - Add route constants to fetch documents and notes
  - Add page under Courses to show a document’s title and markdown link using `@ui`
- Acceptance
  - Clicking a sample course shows a document with links
- PR title
  - feat(web) document view screen
- PR body
  - What: page and routes

---

## Phase 5 - AI outputs

### T050 - AI service skeleton with mocked LLM
- Branch: backend/ai-skeleton
- Paths: `services/ai-service/**`, `migrations/ai/**`
- Steps
  - Add tables `notes`, `flashcards`
  - Endpoint POST `/ai/start` takes doc and produces markdown notes, slides markdown, and flashcards JSON with a mock LLM
- Acceptance
  - Calling start writes rows and blob files
- PR title
  - feat(ai) service skeleton with mock outputs
- PR body
  - What: endpoints and tables

### T051 - Frontend slides and flashcards screens
- Branch: web/slides-flashcards
- Paths: `apps/web/src/Areas/Courses/**`
- Steps
  - Render slides markdown with reveal.js client side
  - Render flashcards with simple flip cards using `@ui`
- Acceptance
  - A processed document shows notes, slides, and flashcards
- PR title
  - feat(web) slides and flashcards views
- PR body
  - What: pages wired to AI outputs

---

## Phase 6 - Media pipeline

### T060 - Media service skeleton and TTS adapter interface
- Branch: backend/media-skeleton
- Paths: `services/media-service/**`, `migrations/media/**`
- Steps
  - Endpoint POST `/media/start` and GET `/media/:doc_id`
  - Store MP4 and thumbnail in Blob
  - Use a stub TTS that speaks a short phrase per slide
- Acceptance
  - Calling start generates an MP4 and a thumbnail
- PR title
  - feat(media) service skeleton with stub TTS
- PR body
  - What: MP4 pipeline and storage

### T061 - Frontend: watch generated video
- Branch: web/video-player
- Paths: `apps/web/src/Areas/Courses/**`, `@ui` Video component
- Steps
  - Add `Video` primitive that wraps the player
  - Course document page shows a playable MP4
- Acceptance
  - MP4 plays in browser
- PR title
  - feat(web) video playback for document
- PR body
  - What: primitive and page

---

## Phase 7 - Search and reminders

### T070 - Embedding search with Redis
- Branch: backend/search-embeddings
- Paths: `services/ai-service/**` or a new search worker, `services/api-gateway/**`
- Steps
  - Chunk notes and store embeddings in RedisSearch
  - GET `/search?q=` returns matches with doc ids
- Acceptance
  - A known term returns the right note chunk
- PR title
  - feat(search) semantic search over notes
- PR body
  - What: embedding index and endpoint

### T071 - Notification service and assignment reminders
- Branch: backend/notify-reminders
- Paths: `services/notification-service/**`, `migrations/notifications/**`
- Steps
  - Read assignments due_at and schedule reminders
  - Send email via SMTP or provider
- Acceptance
  - A task creates a scheduled reminder and sends a test email to dev inbox
- PR title
  - feat(notify) assignment reminders
- PR body
  - What: scheduler and sender

### T072 - Frontend: reminders settings screen
- Branch: web/reminders-settings
- Paths: `apps/web/src/Areas/Admin/**`
- Steps
  - Simple toggle and schedule settings using `@ui` and `useAPI`
- Acceptance
  - Saving settings hits notify service and persists
- PR title
  - feat(web) reminders settings UI
- PR body
  - What: admin UI and routes

---

## Phase 8 - Canvas real OAuth and file ingestion

### T080 - Canvas OAuth connect flow
- Branch: backend/canvas-oauth
- Paths: `services/canvas-service/**`
- Steps
  - Real OAuth handshake with Canvas
  - Encrypt and store tokens
- Acceptance
  - Connect flow completes and tokens live in DB
- PR title
  - feat(canvas) real OAuth and token storage
- PR body
  - What: OAuth endpoints and crypto

### T081 - Canvas sync to ingestion bridge
- Branch: backend/canvas-to-ingestion
- Paths: `services/canvas-service/**`, `services/ingestion-service/**`
- Steps
  - On sync, enumerate module items and enqueue `ingest.request` for new files
- Acceptance
  - New files appear as documents after pipeline runs
- PR title
  - feat(canvas) enqueue ingestion for new module items
- PR body
  - What: event emission and dedupe

---

## Phase 9 - Logging and observability

### T090 - Logging service and structured logs to Postgres
- Branch: backend/logging-service
- Paths: `services/logging-service/**`, `migrations/logs/**`
- Steps
  - POST `/logs` inserts log rows
  - Add simple query endpoint for ops
- Acceptance
  - Services can log and you can query by request id
- PR title
  - feat(logs) structured logs service and storage
- PR body
  - What: endpoint and schema

### T091 - Request id through all services
- Branch: backend/request-id-plumbing
- Paths: services gateways and clients
- Steps
  - Gateway injects X-Request-Id
  - Downstream logs include it
- Acceptance
  - One request’s logs are traceable across services
- PR title
  - chore(observability) request id propagation
- PR body
  - What: header and logging

---

## Phase 10 - Compliance and hardening

### T100 - Rate limits and error model
- Branch: backend/rate-limits-errors
- Paths: gateway and services where needed
- Steps
  - Implement rate limits per `docs/process.json`
  - Return error shape as defined
- Acceptance
  - Hitting limits yields 429 with Retry After
  - Errors include request_id
- PR title
  - chore(security) rate limits and unified error shape
- PR body
  - What: middleware and handlers

### T101 - Data retention jobs
- Branch: backend/retention-jobs
- Paths: any worker service, migrations for retention tables if needed
- Steps
  - Scheduled jobs to prune old logs and stale blobs
- Acceptance
  - Dry run shows counts, then prune works on dev
- PR title
  - chore(data) retention jobs for logs and blobs
- PR body
  - What: scheduled tasks and safety checks

---

## Phase 11 - Codegen and sync

### T110 - OpenAPI in gateway and frontend codegen
- Branch: tooling/openapi-codegen
- Paths: `services/api-gateway/**`, `packages/talvra-routes/**`, `packages/talvra-api/**`, `scripts/**`
- Steps
  - Serve `/openapi.json` that aggregates downstream specs or hand write a v1 spec
  - Script to generate API route constants and types for the frontend
- Acceptance
  - `pnpm run codegen` updates routes and types
- PR title
  - tooling: OpenAPI and frontend codegen
- PR body
  - What: spec, generator, and wiring

---

## Phase 12 - Polishing and e2e

### T120 - End to end demo data and flows
- Branch: demo/e2e-flow
- Paths: seed scripts and fixtures
- Steps
  - Seed a student, a course, a PDF, and produce notes and a video
  - Document a one command demo in README
- Acceptance
  - One command brings up the stack and a clickable demo
- PR title
  - feat(demo) one command e2e with sample content
- PR body
  - What: seeds and demo script

### T121 - Accessibility pass on core pages
- Branch: web/a11y-pass
- Paths: `apps/web/**`, `packages/talvra-ui/**`
- Steps
  - Ensure focus, roles, labels, contrast per rules
- Acceptance
  - Automated a11y checks pass on core pages
- PR title
  - chore(web) a11y improvements on core pages
- PR body
  - What: focus, labels, roles

### T122 - Performance pass and lazy chunks
- Branch: web/perf-chunks
- Paths: `apps/web/**`
- Steps
  - Audit bundle sizes and ensure lazy Areas
- Acceptance
  - First load under 200 kb gzip, route chunks under 100 kb
- PR title
  - chore(web) code split Areas and tune bundles
- PR body
  - What: lazy routes and cleanup

---

## Running at each phase

- Frontend dev
  - `pnpm --filter web dev`
- Gateway health
  - `curl localhost:3001/health`
- Auth test
  - `curl -X POST localhost:4001/auth/signup`
- Compose stack
  - `docker compose -f infra/docker-compose.yml up -d`

Each task above leaves the repo runnable. You will always see a page, an endpoint, or a result.