Awesome. I pulled the official Canvas API docs and turned the bits we need into a single, practical markdown you can drop in your repo. I kept it human, cited the key claims, and avoided auto submission or anything non compliant.

Below is the full file. Save it as docs/integrations/canvas-api.md.

⸻

Canvas REST API integration guide

Purpose
Make our app read a student’s Canvas data in a safe, compliant way so we can generate notes, slides, flashcards, videos and reminders. No auto submissions. No cheating. We only read content and create study aids that the student can download and submit themselves if an assignment asks for a file.

What this document covers
	•	How Canvas auth works in practice for our app
	•	Rate limits, pagination and safe request patterns
	•	The exact endpoints we will use and why
	•	How to fetch files correctly, including videos and audio
	•	How to handle media captions for transcripts when available
	•	Sync strategy and data mapping to Postgres
	•	Edge cases and compliance guardrails

⸻

Base URL and instances

Canvas is hosted per school. Every call goes to that school’s domain with the common path prefix /api/v1. Example pattern:

https://{school-domain}/api/v1/...

Canvas exposes a standard REST API surface for courses, modules, files, assignments and more. This is all documented in Instructure’s developer portal.  ￼

⸻

Authentication

We will use OAuth 2.0 with a Developer Key. This is the standard Canvas pattern for third party apps. Tokens created after Oct 2015 expire in one hour and you must use refresh tokens to get new access tokens. Store tokens securely and refresh when needed.  ￼

Key points we follow:
	•	Register a Developer Key in the school’s Canvas by an admin or request a global developer key if applicable. Scopes can restrict what endpoints a token can call. If scopes are enabled, the token must request scopes that are a subset of what the key allows.  ￼
	•	Access tokens expire and must be refreshed using the refresh token. When an access token expires the API will return 401. The docs note you can distinguish this 401 by checking the WWW-Authenticate header.  ￼
	•	We will request only read scopes we need. If includes are restricted by scopes, the key needs the option that allows include params. The scopes list is published in the docs.  ￼

Endpoints for OAuth:
	•	GET /login/oauth2/auth to start the flow
	•	POST /login/oauth2/token to exchange code and to refresh
	•	DELETE /login/oauth2/token to revoke
The overview and endpoint details are linked from the OAuth docs.  ￼

⸻

Pagination

Canvas paginates list endpoints. Default page size is 10. You can pass per_page but there is no guaranteed max, so always follow the Link header to traverse pages. Do not assume counts. Treat the Link values as opaque.  ￼

We will:
	•	Ask for a reasonable per_page like 50 but still follow Link: rel="next" until it disappears
	•	If auth is provided via query string access_token, Canvas will not echo it in Link headers, so re-append if you use that style. We will use Authorization headers instead.  ￼

⸻

Rate limiting and concurrency

Canvas throttles by cost and quota. A throttled request returns HTTP 403 with message Rate Limit Exceeded. Every response can include X-Request-Cost and when throttling applies you also get X-Rate-Limit-Remaining. Parallel requests incur a pre flight penalty. Quotas refill over time and per access token. Single threaded callers are unlikely to be throttled.  ￼

We will:
	•	Keep concurrency modest per user token
	•	Exponential backoff on 403 throttle with jitter
	•	Read X-Rate-Limit-Remaining and dial down if it gets low

⸻

What we need to fetch

We only need read access to the following resource families. These are the concrete endpoints we will call and the fields we care about.

Courses

Use this to list a user’s active courses and basic metadata for navigation and course context.
	•	GET /api/v1/courses filter by enrollment if needed
	•	Some responses can include a course_progress object when you ask for it which shows requirement counts and next requirement url. Helpful for reminders and study pacing.  ￼ ￼

Modules and Module Items

Modules represent the course content structure. Items are the actual content nodes such as files, pages, assignments, external links and more.
	•	GET /api/v1/courses/:course_id/modules?include=items for the outline
	•	Each item has a type like File, Page, Assignment, ExternalUrl and a reference id to fetch the real content.  ￼

Files and Folders

Where most PDFs, Word docs, PowerPoints and uploads live.
	•	GET /api/v1/courses/:course_id/files to list course files
	•	GET /api/v1/files/:id to retrieve file metadata. The file object includes a download url or public_url. Use that url to download the bytes. The url may contain a verifier token and can expire. Do not try to guess the pattern. Follow the value you receive.  ￼

Pages

Canvas pages are wiki style HTML content. We can fetch and convert to markdown for analysis.
	•	GET /api/v1/courses/:course_id/pages
	•	GET /api/v1/courses/:course_id/pages/:page_url for full HTML. Reference in the Resources index.

Assignments

We read assignments for due dates, allowed submission types and description context so we can generate the right study outputs and a draft file if the assignment asks for one. We will not submit on the student’s behalf.
	•	GET /api/v1/courses/:course_id/assignments
	•	Fields include due_at, submission_types, allowed_extensions, and more.

Quizzes

Classic Quizzes are available under the REST API. New Quizzes has separate resources and capability differences. Treat quizzes like read only metadata for planning and review. We do not fetch question banks unless the institution allows it and the scope permits it. Refer to Quizzes pages in the docs.  ￼

Calendar and planner

For reminders we can read upcoming events or planner items for a user to prompt study cadence without touching grades.
	•	Use Calendar Events or Planner resources. See Resources section in the docs.  ￼

⸻

Media and captions for video and audio

If a module item or file points to a video or audio, Canvas may represent it as a file link, a page with an embedded player, an external url, or a Canvas Media Object when the school uses Kaltura or Studio. For transcripts we prefer official captions if available.
	•	The Media Objects API lets you list media tracks such as caption tracks and retrieve their content when available. This can give us text for transcripts without running our own ASR. Endpoints include listing media objects and listing media tracks for a media object or attachment.  ￼ ￼
	•	If tracks are not accessible or there is only an embedded player, we capture the file url when present and fall back to local transcription with our speech pipeline. We never try to scrape private players.

Submissions API notes: the API allows adding media comments or file uploads for submissions, but there is no API to generate or list media comments broadly and we are not submitting anyway. Good to know when reading docs so we do not rely on it.  ￼

⸻

File uploads and why we avoid submission

Canvas has a multi step upload workflow with signed URLs. There are two supported modes.
	•	Upload via POST in three steps
	•	Upload via providing a public URL that Canvas clones
The docs describe where to POST and the final confirmation step. We will not use these to submit assignments on a student’s behalf. We may use uploads only if the user explicitly chooses to upload their generated file to their own User Files, not to an assignment.  ￼

⸻

End to end sync plan

We want a fast, respectful, resumable sync. Here is the baseline routine.
	1.	After OAuth, detect the base Canvas domain and store tokens with encryption.
	2.	List user courses and keep only current or enrolled courses. Paginate.  ￼
	3.	For each course, fetch modules with include=items. Paginate.  ￼
	4.	For each module item:
	•	If File, call Files API to get metadata and the download url. Download and store to Azure Blob.  ￼
	•	If Page, fetch HTML and convert to markdown.
	•	If Assignment, fetch details for due date and instructions.
	•	If ExternalUrl, record the link for context.
	•	If media object or attachment has tracks, try Media Objects tracks for captions. If available, store transcript text.  ￼
	5.	Respect rate limits. If you see 403 Rate Limit Exceeded, back off and retry later. Watch X-Request-Cost and X-Rate-Limit-Remaining.  ￼
	6.	Convert everything to our canonical content model for AI.
	7.	Generate notes, slides, flashcards and optional study videos.
	8.	Index the analysis text for semantic search.

Incremental sync
Use updated_at fields where available. Since not all resources expose ETags, keep a last seen timestamp per resource type per course and re crawl with filters where supported. If no filters exist, use a cheap head list and diff IDs.

Optional near real time
Canvas provides Live Events for institutions that enable it. If available, we can subscribe and push deltas to our queue. This is optional and varies by school.  ￼

⸻

Data mapping to Postgres

We switched to Postgres on Neon. No ORM. We keep migrations that define these tables at minimum. The AI agent will generate the exact DDL.
	•	canvas_accounts minimal info if needed for domain binding
	•	canvas_users stores the Canvas user id per app user
	•	courses core fields, enrollment role, term and timestamps
	•	modules and module_items layout with type and native id
	•	files file metadata including content type, size, Canvas file id, source url and our blob url
	•	pages page id, url, title and HTML snapshot
	•	assignments id, name, due_at, submission_types, allowed_extensions
	•	media_tracks if captions are fetched, keep locale, kind and text
	•	ingest_runs track sync state, rate limit pauses and cursors

⸻

Our canonical content model

We keep both formats so the AI has structure and the UI has portable text.
	•	Markdown for human readable notes and slides input
	•	JSON for machine friendly segments. Example:

{
  "source_id": "canvas:file:12345",
  "kind": "document",
  "title": "Week 3 Thermodynamics",
  "chunks": [
    { "type": "heading", "level": 2, "text": "First Law" },
    { "type": "text", "text": "Energy is conserved..." },
    { "type": "media_ref", "media_type": "video", "canvas_file_id": 6789, "transcript_ref": "media_track:abc" }
  ],
  "metadata": {
    "course_id": 1111,
    "module_item_id": 2222,
    "content_type": "File",
    "content_format": "pdf"
  }
}


⸻

Download rules
	•	Always follow the file’s url or public_url from Files API. Do not attempt to build URLs yourself. These can contain verifier parameters.  ￼
	•	Cache files in Azure Blob with a stable key. Keep original content type and size for reproducibility.
	•	For pages, store original HTML and our markdown conversion.
	•	For media, prefer caption tracks from Media Objects when the school exposes them. Otherwise treat as normal files and let our transcription handle it. Do not bypass auth walls.  ￼

⸻

Compliance guardrails
	•	Do not call submission APIs for students. We only generate study outputs and leave submission to the user.
	•	Keep scopes minimal and read focused. If scopes are enabled and include parameters are blocked, ask the admin to turn on the include option for the key so we can use include=items on modules.  ￼
	•	Handle throttling gracefully. No aggressive retry loops.  ￼
	•	Privacy. Store only what we need. Encrypt tokens at rest. Support logout and token revocation. Token storage and logout guidance is covered in OAuth docs.  ￼

⸻

Minimal endpoint cookbook

The quick list our services will actually call.

Courses
	•	GET /api/v1/courses

Modules
	•	GET /api/v1/courses/:course_id/modules?include=items
	•	GET /api/v1/courses/:course_id/modules/:module_id/items

Files
	•	GET /api/v1/courses/:course_id/files
	•	GET /api/v1/files/:id then download using the file’s url or public_url  ￼

Pages
	•	GET /api/v1/courses/:course_id/pages
	•	GET /api/v1/courses/:course_id/pages/:page_url

Assignments
	•	GET /api/v1/courses/:course_id/assignments for due dates and instructions.

Media objects and tracks
	•	GET /api/v1/media_objects
	•	GET /api/v1/media_objects/:media_object_id/media_tracks
	•	GET /api/v1/media_attachments/:attachment_id/media_tracks to fetch caption content when available.  ￼

OAuth
	•	GET /login/oauth2/auth
	•	POST /login/oauth2/token
	•	DELETE /login/oauth2/token for revocation. Tokens expire in one hour and require refresh.  ￼

Pagination
	•	Always parse Link headers and follow rel="next". Default page size is 10.  ￼

Throttling
	•	Watch for HTTP 403 Rate Limit Exceeded. Use X-Request-Cost and X-Rate-Limit-Remaining to adapt.  ￼

⸻

Service responsibilities
	•	Canvas Connector service
	•	Owns OAuth flow and token storage
	•	Crawls courses, modules, items
	•	Expands files and pages
	•	Optional media track fetch
	•	Emits normalized content to the ingest queue
	•	File Fetcher
	•	Downloads files using the file url from Canvas
	•	Stores bytes in Azure Blob and records metadata
	•	Hands off to text extraction
	•	Text Extraction
	•	Converts PDFs, docs, slides to markdown and JSON chunks
	•	Detects embedded media references
	•	Study Builder
	•	Creates notes, slides, flashcards, and optional explainer videos
	•	Indexes analysis text for semantic search
	•	Reminder engine
	•	Uses assignment due_at and calendar items to schedule reminders
	•	No write to Canvas grades or submissions

⸻

Error handling patterns
	•	401 with WWW-Authenticate means token expired or revoked. Re run OAuth.  ￼
	•	403 Rate Limit Exceeded. Back off and retry later.  ￼
	•	404 on a file that was moved. Remove local reference and resync the course files list.

⸻

Quick test plan
	•	Authenticate a test user against a demo Canvas instance
	•	Pull one course with modules and items
	•	Verify pagination handling by forcing small per_page and walking Link headers.  ￼
	•	Download a PDF and a PPTX file through Files API. Confirm bytes saved and checksum.  ￼
	•	Fetch a Canvas page and convert to markdown
	•	Read assignments and verify due dates render in the UI.
	•	If the instance supports Media Objects, list tracks for a known media attachment and store caption text.  ￼
	•	Simulate throttling by parallelizing calls in a staging account and confirm backoff logic.  ￼

⸻

Notes and caveats
	•	Some schools disable or restrict scopes. Work with admins to enable the minimum read scopes we listed. The scopes list and scope behavior are documented.  ￼
	•	New Quizzes has different behaviors than Classic Quizzes. Treat quizzes as schedule and context only unless the institution grants specific read access.  ￼
	•	File upload flows exist but we will not auto submit work. The upload flow is three step and supports cloning by URL. Keep this in mind only for optional user file uploads outside of submissions.  ￼

⸻

References
	•	Canvas LMS developer portal entry point and basics.  ￼
	•	OAuth overview and lifetime notes.  ￼
	•	Developer keys and scopes.  ￼
	•	Pagination details and Link header behavior.  ￼
	•	Throttling behavior and headers.  ￼
	•	Modules and items.  ￼
	•	Files resource and file URLs.  ￼
	•	Assignments resource.
	•	Media Objects and tracks.  ￼

⸻

If you want, I can also drop a companion canvas-api.checklist.md with scope names to request and a copy paste Postman collection, but this gets you a clean, compliant spec to feed your agent today.