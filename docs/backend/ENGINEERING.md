Here is a complete technical.md you can drop into docs/backend/.

# Backend Technical Engineering Doc

Scope
- Microservices that ingest course content, generate study aids, and expose clean APIs to the React app.
- Services are replaceable, small, and testable. No service depends on a live external in unit tests.
- Database is Neon Postgres with SQL migrations. No ORM.
- Storage is Azure Blob Storage.
- Queue is Redis Streams. Embedding search can use RediSearch.

## 1. Stack and conventions

Languages
- Node TypeScript for API Gateway, Auth, Canvas, Notification.
- Python for Ingestion, AI, Media.
- Go or Rust optional for Logging service.

Common rules
- Files target 100 lines max. Split modules aggressively.
- Strict typing. No implicit any.
- All external calls go through adapter interfaces with fakes for tests.
- Config from env. Docker compose wires env to containers.
- Import aliases use "@/..." across services for shared code clarity.

Ports
- API Gateway 3001
- Auth 4001
- Canvas 4002
- Ingestion 4003
- AI 4004
- Media 4005
- Notification 4006
- Logging 4010

## 2. Repository layout

repo-root/
services/
api-gateway/
auth-service/
canvas-service/
ingestion-service/
ai-service/
media-service/
notification-service/
logging-service/
packages/
backend-configs/        # eslint, tsconfig bases, mypy, ruff, pre-commit
backend-shared/         # small cross service utils, ids, json, http, typing
infra/
docker-compose.yml
redis/
azurite/
docs/
backend/
product.md
technical.md
migrations/
auth/
canvas/
documents/
ai/
media/
notifications/
logs/

Each service has

src/
app/            # http handlers or cli entrypoints
domain/         # pure logic, use cases
infra/          # adapters: db, blob, queue, http
contracts/      # request and response types, validation
tests/          # unit and contract tests

## 3. Environment variables

Global
- POSTGRES_URL
- REDIS_URL
- AZURE_STORAGE_CONNECTION_STRING
- LOG_LEVEL

Auth
- JWT_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

Canvas
- CANVAS_BASE_URL
- CANVAS_CLIENT_ID
- CANVAS_CLIENT_SECRET

AI
- OPENAI_API_KEY

Media
- TTS_PROVIDER
- ELEVENLABS_API_KEY or AWS_POLLY_REGION etc
- FFMPEG_PATH if not on PATH

Notification
- SMTP_HOST SMTP_USER SMTP_PASS or PUSH keys

## 4. Database schemas and migrations

Principles
- One schema folder per bounded context under /migrations.
- Use raw SQL files with increasing numeric prefixes.
- Prefer explicit indexes. Use JSONB only for flexible payloads.
- Ids are UUID v4 generated in the service.

Tables

– migrations/auth/001_users.sql
CREATE TABLE users (
id UUID PRIMARY KEY,
school_email TEXT UNIQUE NOT NULL,
password_hash TEXT,
google_id TEXT UNIQUE,
canvas_user_id TEXT UNIQUE,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

– migrations/auth/002_sessions.sql
CREATE TABLE sessions (
id UUID PRIMARY KEY,
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
token TEXT UNIQUE NOT NULL,
expires_at TIMESTAMP NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

– migrations/canvas/001_courses.sql
CREATE TABLE canvas_courses (
id UUID PRIMARY KEY,
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
canvas_course_id TEXT,
name TEXT,
term TEXT,
start_date DATE,
end_date DATE
);
CREATE INDEX idx_courses_user ON canvas_courses(user_id);

– migrations/canvas/002_assignments.sql
CREATE TABLE canvas_assignments (
id UUID PRIMARY KEY,
course_id UUID REFERENCES canvas_courses(id) ON DELETE CASCADE,
canvas_assignment_id TEXT,
title TEXT,
due_at TIMESTAMP,
status TEXT
);
CREATE INDEX idx_assignments_course ON canvas_assignments(course_id);
CREATE INDEX idx_assignments_due ON canvas_assignments(due_at);

– migrations/documents/001_documents.sql
CREATE TABLE documents (
id UUID PRIMARY KEY,
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
course_id UUID REFERENCES canvas_courses(id),
title TEXT,
kind TEXT,                        – pdf docx pptx etc
blob_url TEXT,
markdown_url TEXT,
json_url TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_documents_user ON documents(user_id);

– migrations/ai/001_notes.sql
CREATE TABLE notes (
id UUID PRIMARY KEY,
doc_id UUID REFERENCES documents(id) ON DELETE CASCADE,
markdown_url TEXT,
summary JSONB,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_notes_doc ON notes(doc_id);

– migrations/ai/002_flashcards.sql
CREATE TABLE flashcards (
id UUID PRIMARY KEY,
doc_id UUID REFERENCES documents(id) ON DELETE CASCADE,
cards JSONB
);
CREATE INDEX idx_flashcards_doc ON flashcards(doc_id);

– migrations/media/001_media_assets.sql
CREATE TABLE media_assets (
id UUID PRIMARY KEY,
doc_id UUID REFERENCES documents(id) ON DELETE CASCADE,
kind TEXT,                        – image audio video
blob_url TEXT,
thumbnail_url TEXT
);
CREATE INDEX idx_media_doc ON media_assets(doc_id);

– migrations/logs/001_logs.sql
CREATE TABLE logs (
id UUID PRIMARY KEY,
ts TIMESTAMP DEFAULT NOW(),
service TEXT,
level TEXT,
message TEXT,
context JSONB
);
CREATE INDEX idx_logs_ts ON logs(ts);

## 5. Messaging with Redis Streams

Stream names
- ingest.request
- ingest.result
- ai.request
- ai.result
- media.request
- media.result
- notify.request

Consumer groups
- ingestion:group
- ai:group
- media:group
- notify:group

Message contract examples

```json
// ingest.request
{
  "user_id": "uuid",
  "doc_id": "uuid",
  "source": "canvas",
  "file_url": "blob-url",
  "kind": "pdf|docx|pptx"
}

// ai.request
{
  "user_id": "uuid",
  "doc_id": "uuid",
  "markdown_url": "blob-url",
  "json_url": "blob-url"
}

// media.request
{
  "user_id": "uuid",
  "doc_id": "uuid",
  "script": "string",
  "assets": ["blob-url"]
}

Idempotency
	•	Use doc_id as the natural id. Reprocessing is safe. Workers should upsert by doc_id.
	•	Persist a dedupe key per message id if needed.

Retry
	•	Use XCLAIM after a visibility timeout.
	•	Dead letter list per stream on repeated failures.

6. Service contracts

All endpoints are behind API Gateway. Gateway validates session and injects X-User-Id header and a short lived HMAC service token.

API Gateway

Responsibilities
	•	Session auth with Auth Service.
	•	Request routing and simple aggregation.
	•	Rate limiting and request id.

HTTP
	•	GET /health
	•	Proxies
	•	/auth/*
	•	/canvas/*
	•	/ingestion/*
	•	/ai/*
	•	/media/*
	•	/notify/*
	•	/search

Headers
	•	X-Request-Id generated at edge.
	•	X-User-Id from session.
	•	X-Service-Token signed HMAC for downstream.

Auth Service

Endpoints
	•	POST /auth/signup
	•	POST /auth/login
	•	GET /auth/oauth/google/start
	•	GET /auth/oauth/google/callback
	•	POST /auth/logout
	•	GET /auth/session

Responses
	•	On login or signup set HttpOnly cookie session. Optionally return a short lived JWT for mobile.

Security
	•	Argon2id for password hashing with versioned params.
	•	Lockout after repeated failures. Rate limit endpoints.

Canvas Service

Endpoints
	•	POST /canvas/connect
	•	POST /canvas/sync
	•	GET /canvas/courses
	•	GET /canvas/assignments

Behavior
	•	OAuth2 with Canvas. Store access and refresh tokens encrypted.
	•	Sync pulls courses, assignments, module items. Writes to Postgres.
	•	Emits ingest.request for files to process.

Ingestion Service

Endpoints
	•	POST /ingestion/start
	•	body: { doc_id, file_url, kind }
	•	GET /documents/:id
	•	returns document metadata, markdown_url, json_url, media list

Workers
	•	Normalize legacy formats with LibreOffice headless when needed.
	•	Extract text, images, audio, video.
	•	Write Markdown and JSON to Blob. Upsert documents row.

JSON shape from extraction

{
  "title": "string",
  "sections": [
    {
      "heading": "string",
      "text": "string",
      "media": [
        { "type": "image|audio|video", "url": "blob-url", "alt": "optional" }
      ],
      "source": { "kind": "pdf|docx|pptx", "page": 3 }
    }
  ]
}

AI Service

Endpoints
	•	POST /ai/start
	•	body: { doc_id, markdown_url, json_url }
	•	GET /notes/:doc_id
	•	GET /flashcards/:doc_id

Workers
	•	Summaries to notes.summary JSONB and notes.markdown_url.
	•	Slides markdown to Blob.
	•	Flashcards to flashcards.cards JSONB.

Deterministic schemas for prompts. Validate before write.

Media Service

Endpoints
	•	POST /media/start
	•	body: { doc_id }
	•	GET /media/:doc_id

Workers
	•	TTS provider adapter interface. Choose provider via env.
	•	Compose video with ffmpeg. Store mp4 blob and thumbnail.

Notification Service

Endpoints
	•	POST /notify/test
	•	POST /notify/schedule
	•	GET /notify/status/:id

Workers
	•	Read assignments due_at, schedule reminders.
	•	Send via SMTP or push provider.

Logging Service

Endpoints
	•	POST /logs
	•	body: structured log message
	•	GET /logs/query
	•	filters by service, level, time

Storage
	•	Insert into logs table. Consider weekly partitions if volume grows.

7. Storage layout in Azure Blob

Containers
	•	raw
	•	derived
	•	media

Path patterns
	•	raw/{user_id}/{doc_id}/{original_filename}
	•	derived/{user_id}/{doc_id}/{artifact}.md
	•	derived/{user_id}/{doc_id}/structure.json
	•	media/{user_id}/{doc_id}/{asset_id}.{ext}
	•	media/{user_id}/{doc_id}/thumb_{asset_id}.jpg

Access
	•	Services request short lived SAS for read or write as needed.
	•	Clients only receive signed urls. Never share account keys.

8. Security
	•	Secrets only in env and secret managers. Never commit.
	•	Encrypt Canvas tokens at rest. AES GCM with key from env or vault.
	•	HttpOnly SameSite Lax cookies. Set Secure in production.
	•	Validate all inbound JSON with zod or pydantic classes in contracts.
	•	Strict CORS at the gateway.
	•	Rate limit login, sync, and any expensive endpoints.
	•	Request id flows through logs across services.

9. Observability

Logging format

{
  "ts": "2025-01-01T12:34:56Z",
  "service": "ingestion",
  "level": "info",
  "message": "extracted markdown",
  "context": { "doc_id": "uuid", "duration_ms": 842 }
}

Metrics
	•	Expose /metrics per service if you add Prometheus later.

Health
	•	GET /health on every service returns { ok: true, uptime_ms, version }

10. Testing strategy

Unit
	•	Domain and adapters use fakes for db, blob, queue, http.
	•	No network in unit tests.

Contract
	•	Validate request and response shapes for each endpoint.
	•	Validate stream message shapes on publish and on consume.

Integration
	•	docker compose up Postgres, Redis, Azurite.
	•	Start a subset of services and run end to end scenarios.
	•	Mock Canvas with fixtures or a small stub server.

Fixtures
	•	Place sample PDF, DOCX, PPTX in a test bucket or local folder for Azurite.

CI
	•	Lint, type check, unit, contract, integration.
	•	Build images. Optionally smoke test compose up.

11. Code generation

Backend to frontend sync
	•	API Gateway exposes OpenAPI spec at /openapi.json.
	•	Codegen script generates:
	•	typed clients and request or response types for frontend
	•	route constant file for frontend API calls

12. Versioning and compatibility
	•	Prefix public endpoints with /v1.
	•	Add new fields without breaking existing clients.
	•	Migrations are forward only. Provide backfill jobs when needed.

13. Performance targets
	•	P95 API read under 300 ms at gateway.
	•	Ingest a 10 page PDF to first note under 90 seconds.
	•	Reminder enqueue under 1 second after due window check.

14. Error model

HTTP error

{
  "error": {
    "code": "string",
    "message": "human readable",
    "details": { "field": "info" },
    "request_id": "uuid"
  }
}

Common codes
	•	UNAUTHENTICATED
	•	FORBIDDEN
	•	NOT_FOUND
	•	INVALID_ARGUMENT
	•	CONFLICT
	•	RATE_LIMITED
	•	INTERNAL

15. Delivery rules for the AI agent
	•	Create a branch per task. Use phaseX/.
	•	Open a PR that lists:
	•	what changed
	•	why it changed
	•	how it was tested
	•	results and logs or screenshots
	•	I will review and merge to main.

16. Runbook snippets

Reprocess a document
	•	Publish ingest.request with the same doc_id. Workers are idempotent.

Reset a stuck consumer
	•	XAUTOCLAIM messages older than N seconds to a fresh consumer.

Rotate a secret
	•	Update env and restart affected service. Sessions are rotated on next login.

Purge old logs
	•	Delete from logs where ts < now minus interval ‘90 days’.
