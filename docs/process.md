# Process Handbook

This document serves as the single source of truth for development processes, PR guidelines, and operational procedures for the Talvra project.

> **Note**: This handbook is also available as structured JSON at [`docs/process.json`](./process.json), which is validated automatically in CI.

## Pull Request Guidelines

### Principles
- **One logical change per PR**: Each PR should represent a single, coherent change
- **Keep PRs small**: Easier to review, faster to merge, lower risk
- **Code, tests, and docs move together**: Updates should be comprehensive
- **Update OpenAPI and run codegen when endpoints change**: Keep contracts in sync

### Branching Strategy
- **Rule**: Create a branch per task
- **Naming Examples**:
  - `phase3/ingestion-pptx`
  - `frontend/courses-page`
  - `backend/auth-argon2`

### PR Template Checklist
Every PR must include:
- [ ] Summary of what changed and why
- [ ] Scope of affected services or areas
- [ ] How it was tested: unit, contract, integration, screenshots or logs if UI changed
- [ ] Rollback plan
- [ ] Docs updated
- [ ] OpenAPI updated and codegen ran
- [ ] Lint and types pass
- [ ] Tests added or updated
- [ ] No raw tags in Areas
- [ ] Routes use FRONT_ROUTES and buildPath

### Review Requirements
- **Code owners required**: PRs must be reviewed by relevant owners
- **CI must be green**: All CI checks must pass before merge

## Commit Guidelines

### Format
```
type(scope): short summary
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructure without behavior change
- `perf`: Performance improvement
- `test`: Test additions or modifications
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI configuration changes

### Rules
- Use imperative mood ("add feature" not "added feature")
- Keep subject under 72 characters
- Reference issue or task ID when useful

### Examples
- `feat(auth): add Argon2id hashing`
- `fix(ingestion): handle ppt with embedded video`
- `docs(frontend): add routing constants guide`

## Code Ownership

### Path-Based Ownership
- `apps/web/**` → Frontend team
- `packages/talvra-ui/**` → Frontend team  
- `packages/talvra-api/**` → Frontend team
- `services/**` → Backend team
- `migrations/**` → Backend team
- `docs/**` → Product team

## CI Gates

### Required Checks
- **Lint**: Code style and quality checks
- **Typecheck**: TypeScript compilation
- **Unit Tests**: Minimum 80% line coverage
- **Contract Tests**: API contract validation
- **Integration Smoke**: End-to-end smoke tests
- **OpenAPI Diff**: API changes must be approved

### Frontend Guards
- No raw HTML tags in Areas
- Route constants only (use FRONT_ROUTES and buildPath)

## Error Handling

### Unified Error Shape
All API errors must follow this structure:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description",
    "details": {},
    "request_id": "uuid"
  }
}
```

### Standard Error Codes
- `UNAUTHENTICATED` (401): User not authenticated
- `FORBIDDEN` (403): User lacks required permissions
- `NOT_FOUND` (404): Resource doesn't exist
- `INVALID_ARGUMENT` (400): Request validation failed
- `CONFLICT` (409): Resource state conflict
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL` (500): Internal server error

### Guidelines
- Do not leak internal implementation details
- Always include request_id for traceability
- Map validation failures to INVALID_ARGUMENT with field hints

## Rate Limiting

### Endpoints
- **Auth**: 5 login attempts per minute per IP, 10 OAuth callbacks per minute per IP
- **Canvas Sync**: 2 manual syncs per minute per user
- **Search**: 60 queries per minute per user

### Policy
- Return HTTP 429 with Retry-After header
- Log rate limit violations with structured logs

## Security & Data

### Secrets Management
- Use environment variables or secret manager only
- Rotate secrets on schedule
- Never commit secrets to version control

### Personal Information
- Store school email only
- Encrypt Canvas tokens at rest
- Use signed URLs only for client access
- Apply least privilege for service tokens

### Data Retention
- **Documents & Media**: 180 days
- **Logs**: 90 days
- **Deletion on Request**: 7 days

## Operational Runbooks

### Reprocess Document
1. Publish `ingest.request` with same `doc_id`
2. Workers are idempotent and will handle reprocessing

### Stuck Consumer
1. Claim pending messages older than timeout to fresh consumer
2. Restart worker and monitor lag

### AI Error Spike
1. Rotate or switch AI API key
2. Enable backoff and circuit breaker

### Blob Write Failures
1. Serve cached markdown from Postgres if available
2. Queue write for later retry

### Secret Rotation
1. Update environment variables
2. Restart affected services
3. Verify health and run smoke tests

### Purge Old Logs
1. Delete logs where timestamp > 90 days old

## Release Process

### Versioning
- Use semantic versioning per service
- Tag images with both semver and git SHA

### Flow
1. Merge to main branch
2. CI builds and tags automatically
3. Deploy to staging environment
4. Run smoke tests
5. Promote to production

### Changelog
Generated automatically from commit types and conventional commits

## Architecture Decision Records (ADRs)

### When to Write
- New service introduction
- New datastore or queue technology
- Cross-cutting architectural changes

### Template
1. **Context**: Current situation and problem
2. **Options Considered**: Alternative approaches evaluated
3. **Decision**: What was chosen and why
4. **Consequences**: Expected outcomes and trade-offs

### Location
Store at `docs/process/adr/NNN-title.md`

## Frontend Guardrails

### Technology Stack
- React with Vite
- React Router v6
- styled-components
- react-query

### Rules
- Use Areas folder structure for features
- **No raw HTML tags** in pages or Area components
- Use Talvra UI primitives from `@ui`
- All data fetching uses `useAPI` on top of react-query
- Frontend routes live in `src/app/routes.ts`
- API routes live in `packages/talvra-routes` via OpenAPI codegen

### Performance Standards
- **First Load Bundle**: Max 200kb gzip
- **Route Chunks**: Max 100kb gzip each

### Performance Practices
- Lazy load Areas
- Memoize heavy lists
- Avoid inline functions in hot paths

### Accessibility Requirements
- Keyboard reachable controls
- Visible focus states
- Labels for all inputs
- AA contrast compliance
- Use Text component with semantic prop when needed

## Backend Guardrails

- **No ORM**: Use raw SQL migrations
- **Idempotent Workers**: Safe to retry processing
- **Small Payloads**: Keep stream messages lightweight
- **Encrypt Canvas Tokens**: At rest encryption required
- **Rate Limit**: Auth and sync endpoints
- **Request IDs**: Propagate through all logs
- **Health Endpoints**: Every service must have `/health`

## Code Generation & Sync

### Backend to Frontend
1. API Gateway serves OpenAPI at `/openapi.json`
2. Run codegen to produce typed clients in `talvra-api`
3. Generate route constants in `talvra-routes`

### Frontend Routes
1. Add new pages only in `src/app/routes.ts`
2. Build React Router config from route constants

## Development Checklists

### Adding Backend Endpoint
- [ ] Implement handler and contract
- [ ] Update OpenAPI specification
- [ ] Add unit and contract tests
- [ ] Run codegen to update frontend types
- [ ] Update documentation

### Adding Frontend Page
- [ ] Create component in appropriate Area
- [ ] Add route object in `src/app/routes.ts`
- [ ] Use Talvra UI primitives only
- [ ] Use `useAPI` for data fetching
- [ ] Add tests and screenshots

### Adding Stream Message
- [ ] Define message schema
- [ ] Validate on publish and consume
- [ ] Make handlers idempotent
- [ ] Add integration test with Redis

### AI Agent PR
- [ ] Create branch with appropriate prefix
- [ ] Describe what changed and why
- [ ] Explain how it was tested with results
- [ ] Ensure CI is green

---

This handbook is a living document. Updates should be made through the standard PR process and must pass JSON validation.
