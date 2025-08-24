# Backend Product Doc

## Purpose
Build a compliant learning backend that ingests class content, generates study aids, and helps students stay on top of assignments. Keep students in control. Never auto submit work. Integrate with Canvas for context.

## Outcomes
- Less friction getting course materials into the app
- Faster understanding of lectures and readings
- Clear assignment awareness and reminders
- A backend that is modular, testable, and replaceable

## Target users
- Students who use Canvas and want summaries, slides, flashcards, and videos
- Builders of the frontend who need clean contracts and reliable services
- Operators who need logs, metrics, and safe deploys

## Success metrics
- Ingestion success rate above 98 percent across PDF, DOCX, PPTX
- Time to first note under 90 seconds for a 10 page PDF
- Reminder delivery success above 99 percent
- Error budget respected. P95 API latency under 300 ms for read endpoints

## Guardrails and compliance
- No auto submission to Canvas
- AI output is advisory. Students review and submit themselves
- Respect Canvas API terms
- Store secrets in env files. Docker compose wires them in
- GDPR style data handling. Delete on request. Encrypt tokens at rest

## Scope
- Pull courses, assignments, and files from Canvas
- Ingest files into Markdown plus JSON with media references
- Generate notes, slides, flashcards, and video scripts
- Create narrated MP4s from scripts and media
- Serve search across notes with embeddings
- Send reminders for due items
- Provide clean APIs to the React app

## Out of scope
- Grading
- Plagiarism detection
- Auto submission to LMS
- Proctoring

---

## Service map

Each service is small, typed, and replaceable. Any service can be rewritten in another language if it keeps the contract.

- API Gateway. Node TypeScript. Front door for the web app. Auth check. Request routing. No business logic.
- Auth Service. Node TypeScript. Email plus password. Google OAuth. Single student per school email. Sessions via cookies or JWT.
- Canvas Service. Node TypeScript. OAuth to Canvas. Sync courses, assignments, module items. Emits ingestion jobs.
- Ingestion Service. Python. Normalize files. Extract text, images, audio, video. Output Markdown plus JSON. Store media in Azure Blob.
- AI Service. Python. Summaries. Slides. Flashcards. Video scripts. Uses LLM APIs. Deterministic schemas.
- Media Service. Python first. Optional Rust core later. TTS and ffmpeg. Build MP4 and audio. Store in Blob.
- Notification Service. Node TypeScript. Sends email or push reminders for due items.
- Logging Service. Go or Rust. Collects structured logs. Writes to Postgres.

Shared infra
- Database. Neon Postgres. No ORM. Migrations folder is the source of truth
- Storage. Azure Blob Storage
- Queue. Redis Streams
- Search embeddings. Redis plus RediSearch

---

## High level flows

### First connect
1. Student signs up with Google or email and password
2. Student connects Canvas
3. Canvas Service syncs courses, assignments, and file metadata to Postgres
4. Canvas Service enqueues ingestion tasks for new files

### Ingest to study aids
1. Ingestion Service downloads a file, converts to Markdown plus JSON, extracts media
2. Writes outputs to Blob and metadata to Postgres
3. Emits AI tasks
4. AI Service generates notes, slides, flashcards, and a script
5. Media Service turns script plus media into MP4
6. API Gateway returns links and data to the frontend

### Reminders
1. Notification Service reads assignments and due dates
2. Schedules and sends reminders

---

## Data contracts

Keep payloads small and explicit. Examples are trimmed.

### Events on Redis Streams
- `ingest.request`  
  - `user_id` string  
  - `source` canvas or upload  
  - `file_id` string  
  - `file_url` string
- `ai.request`  
  - `user_id` string  
  - `doc_id` string  
  - `markdown_url` string  
  - `json_url` string
- `media.request`  
  - `user_id` string  
  - `doc_id` string  
  - `script` string  
  - `assets` array of blob urls

### Ingestion JSON output
```json
{
  "title": "Week 3 Lecture",
  "sections": [
    {
      "heading": "Intro to Graphs",
      "text": "A graph is ...",
      "media": [
        { "type": "image", "url": "blob://image1.png" },
        { "type": "video", "url": "blob://clip1.mp4" }
      ],
      "source": { "kind": "pptx", "page": 3 }
    }
  ]
}
AI outputs
	•	Notes markdown url
	•	Slides markdown url for reveal.js
	•	Flashcards JSON
	•	q string
	•	a string
	•	hint optional string
	•	Video script string plus timing hints

⸻

API surfaces

Keep endpoints small and orthogonal. The gateway proxies to services.
	•	Auth
	•	POST /auth/signup
	•	POST /auth/login
	•	GET /auth/oauth/google/start
	•	GET /auth/oauth/google/callback
	•	POST /auth/logout
	•	Canvas
	•	POST /canvas/connect
	•	POST /canvas/sync
	•	GET /canvas/courses
	•	GET /canvas/assignments
	•	Ingestion
	•	POST /ingestion/start
	•	GET /documents/:id
	•	AI
	•	POST /ai/start
	•	GET /notes/:doc_id
	•	GET /flashcards/:doc_id
	•	Media
	•	POST /media/start
	•	GET /media/:doc_id
	•	Search
	•	GET /search?q=...
	•	Health
	•	GET /health

All endpoints require session cookies except health.

⸻

Database plan

Neon Postgres. No ORM. Migrations per service. JSONB where flexible.

Core tables
	•	users id, school_email unique, password_hash, google_id unique, canvas_user_id unique, created_at
	•	sessions id, user_id, token, expires_at
	•	canvas_courses id, user_id, canvas_course_id, name, term, start_date, end_date
	•	canvas_assignments id, course_id, canvas_assignment_id, title, due_at, status
	•	documents id, user_id, course_id, title, kind, blob_url, markdown_url, json_url, created_at
	•	notes id, doc_id, markdown_url, jsonb summary, created_at
	•	flashcards id, doc_id, jsonb cards
	•	media_assets id, doc_id, kind, blob_url, thumbnail_url
	•	logs id, ts, service, level, message, jsonb context

Add indexes on foreign keys and common filters like due_at.

⸻

Storage plan
	•	Azure Blob containers by service
	•	raw original uploads or Canvas fetches
	•	derived markdown and json
	•	media images, audio, videos
	•	Use signed urls server side. Clients never see account keys

⸻

Non functionals
	•	Reliability
	•	Idempotent ingestion. Safe reprocessing by doc id
	•	At least once delivery on streams. Handlers are idempotent
	•	Performance
	•	Stream large files to Blob
	•	Bounded concurrency per worker
	•	Security
	•	Encrypt Canvas tokens
	•	Rotate session on login
	•	Rate limit auth and sync routes
	•	Observability
	•	Structured logs in Postgres
	•	Request ids across services
	•	Health checks per service

⸻

Testing plan
	•	Unit tests
	•	Repos and adapters use fakes. No network in unit tests
	•	Contract tests
	•	API Gateway against service mocks
	•	Message schemas validated on publish and consume
	•	Integration tests
	•	docker compose up a stack with Postgres and Redis
	•	MSW or Prism mock for Canvas
	•	Fixtures
	•	Sample PDF, DOCX, PPTX in a test assets bucket
	•	CI gates
	•	Lint, type check, unit, contract, integration

⸻

Delivery rules for the AI agent
	•	Create a branch per task. Use phaseX/<task-name>
	•	Open a PR with
	•	What changed
	•	Why it changed
	•	How it was tested
	•	Results and logs or screenshots
	•	I will review and merge to main

⸻

Phasing
	•	Phase 1. Auth Service and API Gateway ready with health checks
	•	Phase 2. Canvas connect and sync with fixtures
	•	Phase 3. Ingestion for PDF, DOCX, PPTX to Markdown plus JSON
	•	Phase 4. AI summaries, slides, and flashcards with mocked LLM
	•	Phase 5. Media MP4 basics with TTS and a title card
	•	Phase 6. Reminders from assignments
	•	Phase 7. Logs and dashboards

⸻

Risks and mitigations
	•	Canvas payload variance. Use defensive parsing and fixtures
	•	Legacy formats. Convert to modern formats with LibreOffice headless
	•	Large media. Stream, do not buffer in memory
	•	Vendor limits. Backoff and retries. Queue at the edge of each service

⸻

Open questions
	•	Preferred push channel for reminders. Email or push
	•	Choice of TTS provider
	•	Exact retention policy for blobs and logs

⸻

Glossary
	•	Markdown. Human readable text for notes and slides
	•	JSON structure. Machine friendly sections and media map
	•	Blob. File in Azure Blob Storage
	•	Idempotent. Safe to run multiple times with the same input