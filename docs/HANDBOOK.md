Perfect. Here’s a single, consolidated doc you can drop in as docs/process.md.

# Process Handbook

One file to run the project. How we branch, review, test, release, and operate.

## 1. Pull requests

Principles
- One logical change per PR
- Keep PRs small
- Code, tests, and docs move together
- Update OpenAPI and run codegen when endpoints change

Branches
- Create a branch per task
- Name format examples
  - phase3/ingestion-pptx
  - frontend/courses-page
  - backend/auth-argon2

PR checklist
- Summary of what changed and why
- Scope of affected services or areas
- How it was tested
  - unit
  - contract
  - integration
  - screenshots or logs if UI changed
- Rollback plan
- Boxes to tick
  - [ ] Docs updated
  - [ ] OpenAPI updated and codegen ran
  - [ ] Lint and types pass
  - [ ] Tests added or updated
  - [ ] Frontend has no raw tags in Areas
  - [ ] Navigation uses FRONT_ROUTES and buildPath

Reviews
- At least one owner from each touched area
- CI must be green before merge

## 2. Commits

Format
`type(scope): short summary`

Types
- feat
- fix
- refactor
- perf
- test
- docs
- chore
- build
- ci

Rules
- Imperative mood
- Subject under 72 chars
- Reference an issue or task id when useful

Examples
- feat(auth): add Argon2id hashing
- fix(ingestion): handle ppt with embedded video
- docs(frontend): add routing constants guide

## 3. Ownership

Owners per path
- apps/web and packages/talvra-ui and talvra-api are frontend owners
- services/* and migrations/* are backend owners
- docs/* are product owners

Use a CODEOWNERS file if you prefer automation. This section is the single source of truth.

## 4. CI gates

Quality bars on every PR
- ESLint and formatting pass
- Type check pass
- Unit tests pass with 80 percent lines coverage
- Contract tests pass for touched endpoints
- Integration smoke passes for core flow
- OpenAPI diff approved when endpoints change
- Frontend guardrails enforced
  - no raw tags in Areas
  - routes use FRONT_ROUTES and buildPath

## 5. Error catalog

Shape
```json
{
  "error": {
    "code": "string",
    "message": "human readable",
    "details": {},
    "request_id": "uuid"
  }
}

Codes
	•	UNAUTHENTICATED 401
	•	FORBIDDEN 403
	•	NOT_FOUND 404
	•	INVALID_ARGUMENT 400
	•	CONFLICT 409
	•	RATE_LIMITED 429
	•	INTERNAL 500

Guidelines
	•	Do not leak internals
	•	Always include request_id
	•	Map validation failures to INVALID_ARGUMENT with field hints

6. Rate limits

Auth
	•	Login 5 per minute per ip
	•	OAuth callback 10 per minute per ip

Canvas sync
	•	Manual sync 2 per minute per user

Search
	•	60 per minute per user

Policy
	•	Return 429 with Retry After header
	•	Log structured event with user_id and route

7. Security and data

Secrets
	•	Only from env or secret manager
	•	Rotate on schedule

PII
	•	School email only
	•	Canvas tokens encrypted at rest

Retention
	•	Documents and media 180 days
	•	Logs 90 days
	•	Delete on request within 7 days

Access
	•	Clients get signed urls only
	•	Least privilege for service tokens

8. Runbooks

Reprocess a document
	•	Publish ingest.request with the same doc_id
	•	Workers are idempotent

Stuck consumer
	•	Claim pending messages older than timeout to a fresh consumer
	•	Restart worker and watch lag

High error rate on AI
	•	Switch API key in env
	•	Enable backoff and circuit breaker

Blob write failures
	•	Serve cached markdown from Postgres if available
	•	Queue write for later

Secret rotation
	•	Update env
	•	Restart service
	•	Verify health and smoke tests

Purge old logs
	•	Delete where ts is older than 90 days

9. Releases

Versioning
	•	Semantic versioning for services
	•	Tag images with semver and git sha

Changelog
	•	Generate from commit types
	•	Summarize features, fixes, and breaking changes

Flow
	•	Merge to main
	•	CI builds and tags images
	•	Deploy to staging
	•	Run smoke tests
	•	Promote to prod

10. ADRs

When to write
	•	New service
	•	New datastore or queue
	•	Cross cutting change

Template
	•	Context
	•	Options considered
	•	Decision
	•	Consequences

File location
	•	docs/process/adr/NNN-title.md

11. Frontend guardrails

Architecture
	•	React with Vite
	•	React Router v6
	•	styled components
	•	react query

Rules
	•	Areas folder for features
	•	No raw HTML tags in pages or Area components
	•	Use Talvra UI primitives from the shared UI package
	•	All data fetching uses useAPI on top of react query
	•	Frontend routes live in src/app/routes.ts as a single source of truth
	•	API routes live in packages/talvra-routes and come from OpenAPI codegen

Performance
	•	First load under 200 kb gzip
	•	Route chunk under 100 kb gzip
	•	Lazy load Areas
	•	Memoize heavy lists
	•	Avoid inline functions in hot paths

Accessibility
	•	Keyboard reachable controls
	•	Visible focus states
	•	Labels for inputs
	•	Contrast meets AA
	•	Use Text component with a semantic prop when needed

12. Backend guardrails
	•	No ORM. Raw SQL migrations
	•	Idempotent workers
	•	Small payloads on streams
	•	Encrypt Canvas tokens
	•	Rate limit auth and sync
	•	Request ids through logs
	•	Health endpoints per service

13. Codegen and sync

Backend to frontend
	•	API Gateway serves OpenAPI at /openapi.json
	•	Run codegen to produce
	•	typed clients and request or response types in talvra-api
	•	route constants in talvra-routes

Frontend routes
	•	Add new pages only in src/app/routes.ts
	•	Build React Router config from those constants

14. Checklists

Add a new backend endpoint
	•	Write handler and contract
	•	Update OpenAPI
	•	Add tests unit and contract
	•	Run codegen
	•	Update docs

Add a new frontend page
	•	Create component in the Area
	•	Add a route object in src/app/routes.ts
	•	Use Talvra UI primitives only
	•	Use useAPI for data
	•	Add tests and screenshots

Add a new stream message
	•	Define schema
	•	Validate on publish and on consume
	•	Make handlers idempotent
	•	Add integration test with Redis

PR for AI agent
	•	Create branch phaseX or frontend or backend
	•	Describe what changed and why
	•	Explain how you tested it and results
	•	Ensure CI is green
	•	I will review and merge

⸻
