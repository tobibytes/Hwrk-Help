# Talvra UI Modernization Brief for Lovable

Audience: Lovable UI Agent (and human co-pilots)
Purpose: Redesign and polish the Talvra frontend while preserving all existing functionality and contracts. Produce high-quality, accessible, responsive UI built on our primitives. Your output should be drop-in compatible with the current codebase.

Key constraints in this repo
- Tech stack: Vite + React + TypeScript + React Router v6
- Structure: frontend/web/src/Areas/* contain pages. Avoid raw HTML in Areas—use our @ui primitives
- Shared UI: frontend/packages/talvra-ui provides primitives (Surface, Stack, Text, Card, Button, Link, Input, CodeBlock, Loading, Video, GlassPanel, theme)
- Routes: packages/talvra-routes exports FRONT_ROUTES and helpers; pages reference these constants. Please preserve existing paths and routing
- Data fetching: Use fetch with credentials: 'include' and adhere to API_BASE set via VITE_API_BASE (fallback http://localhost:3001)
- Gateway paths: All browser API calls must go through /api/* (proxied by API Gateway)
- Do not break code contracts or endpoint shapes; do not remove functional flows; your refactors should be additive/compatible

Design direction
- Tone: clean, academic, calm; progressive disclosure (avoid overwhelming users)
- Layout: App-wide glass header (already present via GlassPanel) with brand and primary navigation
- Content: cards, lists, and two-pane layouts for detail views. Ensure consistency across Areas
- Visual style: soft corners (8px radius), subtle shadows, micro-interactions (transitions 150–200ms, ease-out)
- Typography (example scale): 12, 14, 16 (base), 18, 20, 24, 32, 40. Prefer 16 base; headings with consistent line-height
- Spacing scale: 4, 8, 12, 16, 24, 32, 48. Prefer multiples of 4/8
- Color tokens: leverage theme.ts. Use neutral grays for text, accent for primary actions. Ensure accessible contrast
- Accessibility: keyboard nav, focus visible states, ARIA roles, labels. No information solely conveyed by color
- Responsiveness: mobile first. Breakpoints: ~<640 (mobile), 641–1024 (tablet), >1024 (desktop). Collapse multi-column into stacked on small screens

Core UI primitives (from @ui)
- TalvraSurface: page background wrapper
- TalvraStack: flex layout with gap
- TalvraText: text/typo
- TalvraCard: card container for content sections
- TalvraButton: primary action button
- TalvraLink: internal navigation and external anchors
- Input: text/number inputs
- CodeBlock: preformatted blocks (JSON, Markdown)
- Loading: spinner
- Video: wrapper around <video>
- GlassPanel: translucent panel for headers or special sections
- theme: shared tokens. You may extend theme (but preserve existing exports)

Pages and flows (must remain functionally equivalent)

1) Dashboard (Admin)
- Route: FRONT_ROUTES.ADMIN (/admin and /)
- Purpose: quick access to Sync, Courses, Documents, Settings; show recent documents and helpful guidance
- UI components:
  - Hero panel under glass header with project name and short description
  - Quick actions (buttons):
    - Sync Now (links to Settings sync if global; or to Courses for per-course)
    - Courses
    - Documents
    - Settings
  - Recent Documents: list of last processed documents with title, course chip, actions (Open, AI, Video)
- States:
  - Empty: show helpful getting-started copy
  - Loading: skeleton cards

2) Courses List
- Route: FRONT_ROUTES.COURSES (/courses)
- Data: GET /api/canvas/courses
- UI:
  - Search input (client-side filter by name)
  - Grid/list of course cards (Course name, optional term)
  - Card primary action: Open course detail
  - Secondary: Sync course (links to course detail’s sync action)
- States: loading skeleton; empty state copy if none

3) Course Detail
- Route: FRONT_ROUTES.COURSE_DETAIL (/courses/:courseId)
- Data:
  - Documents: GET /api/canvas/documents?course_id
  - Assignments: GET /api/canvas/assignments?course_id
  - (Optional) Modules: GET /api/canvas/modules?course_id
- Actions:
  - Sync now (per-course): POST /api/canvas/sync/course/:course_id/start then poll /api/canvas/sync/status/:job_id
- UI:
  - Header: course name, last sync indicator
  - Two-column (desktop):
    - Left: Assignments list (name, due_at, link)
    - Right: Documents list (title, kind/mime icon, size)
  - Document card actions: Open document detail, AI outputs, Video
  - Filters: by module (if available)
  - States: loading skeleton; empty lists; background job banner when syncing

4) Documents Area
- Route: FRONT_ROUTES.DOCUMENTS (/documents)
- UI:
  - List of documents across courses (if implemented); otherwise link from courses

5) Document Detail
- Route: FRONT_ROUTES.DOCUMENT_DETAIL (/documents/:documentId)
- Data:
  - Ingestion result: GET /api/ingestion/result/:doc_id -> { outputs: { markdown: path, structure: path } }
  - Load markdown text (fetch markdown path)
  - Load structure.json
  - Embeddings: POST /api/ai/embed (idempotent)
  - Per-doc search: GET /api/ai/search?doc_id=...&q=...&k=...
- UI restructuring proposal (must retain all features):
  - Tabs: Overview | AI | Search | Media
  - Overview: show basic metadata; Structure (CodeBlock JSON); Markdown (CodeBlock)
  - AI: link to AI page (see below) or embed an inline preview
  - Search (within this doc): query input, K, results list (score, snippet)
  - Media: link to Video page or embed a small player if available
  - Keep the existing embedding controls and search section; present them within the Search tab
- States: show loading and friendly empty states

6) Document AI outputs
- Route: FRONT_ROUTES.DOCUMENT_AI (/documents/:documentId/ai)
- Data:
  - Notes markdown: GET /api/ai/blob/:doc_id/notes
  - Flashcards JSON: GET /api/ai/blob/:doc_id/flashcards
- UI:
  - Two-pane layout (desktop): left scrollable Notes (Markdown), right interactive Flashcards
  - Flashcards:
    - Show Q, optionally hint, reveal Answer
    - Navigation (Prev/Next), Shuffle, Reveal All, Reset
    - Optional “Source” chips when cards include source references
  - Markdown rendering: heading hierarchy, inline citations
  - Accessibility: keyboard navigation for cards

7) Document Video
- Route: FRONT_ROUTES.DOCUMENT_VIDEO (/documents/:documentId/video)
- Data:
  - Build: POST /api/media/start { doc_id }
  - Result: GET /api/media/result/:doc_id -> { outputs: { mp4, thumbnail } }
  - Blob endpoints: /api/media/blob/:doc_id/mp4 and /thumbnail
- UI:
  - “Build Media” button with busy state
  - Player panel using @ui Video with poster as thumbnail
  - If no media yet, show call-to-action

8) Search (cross-document)
- Route: FRONT_ROUTES.SEARCH (/search)
- Data:
  - Cross-doc: GET /api/ai/search-all?q=...&k=...&course_id=&assignment_id=&module_id=
  - Course list: GET /api/canvas/courses
  - Assignments: GET /api/canvas/assignments?course_id
  - Modules: GET /api/canvas/modules?course_id
- UI:
  - Query input + K
  - Filters: Course, Assignment (depends on selected course), Module (depends on selected course)
  - Active filters shown as chips
  - Results list:
    - Title from doc metadata (fallback to doc_id)
    - Course chip
    - Score and snippet (highlight term if feasible)
    - Actions: Open Document | AI | Video
  - States: empty helpful copy, skeletons

9) Settings
- Route: FRONT_ROUTES.SETTINGS (/settings)
- Data/UI pieces:
  - Canvas Token Settings (existing component): Connect / configure token (no OAuth yet)
  - Reminders (notification-service):
    - Test email: POST /api/notify/test { to? }
    - Templates: GET /api/notify/templates, POST /api/notify/send-template { template, vars, to?, subject? }
    - Vars textarea accepts JSON (validate and show friendly error)
    - Explain SMTP optional: if not configured, service logs instead of sending
  - Async global sync controls:
    - Start: POST /api/canvas/sync/start -> returns job_id
    - Poll: GET /api/canvas/sync/status/:job_id
    - Show progress banner, disable while running, persist job_id in localStorage

API shapes and usage expectations
- Always call through gateway at API_BASE (VITE_API_BASE or http://localhost:3001)
- Use credentials: 'include'
- Rely on existing endpoints and shapes:
  - /api/canvas/courses -> { ok, courses: [{ id, name, term }] }
  - /api/canvas/assignments?course_id -> { ok, assignments: [{ id, name, due_at, html_url }] }
  - /api/canvas/modules?course_id -> { ok, modules: [{ id, name }] }
  - /api/canvas/documents?course_id&assignment_id&module_id&limit -> { ok, documents: [{ doc_id, title, course_canvas_id, assignment_canvas_id, module_canvas_id, ... }] }
  - /api/canvas/sync/start -> { ok, job_id }
  - /api/canvas/sync/status/:job_id -> { ok, job: { status, processed, skipped, errors, ... } }
  - /api/ingestion/result/:doc_id -> { ok, outputs: { markdown, structure } }
  - /api/ai/embed -> { ok, doc_id, count?; skipped?: 'exists' }
  - /api/ai/search?doc_id&q&k -> { ok, results: [{ id, doc_id, score, snippet }] }
  - /api/ai/search-all?q&k&course_id&assignment_id&module_id -> { ok, results: [{ id, doc_id, score, snippet }] }
  - /api/ai/blob/:doc_id/notes (text/markdown)
  - /api/ai/blob/:doc_id/flashcards (application/json)
  - /api/media/start { doc_id }
  - /api/media/result/:doc_id -> { ok, outputs: { mp4, thumbnail } }
  - /api/media/blob/:doc_id/mp4 and /thumbnail
  - /api/notify/test { to? }
  - /api/notify/templates -> { templates: [{ name, description, fields }] }
  - /api/notify/send-template { template, vars, to?, subject? }

Interaction patterns
- Loading: Use Loading spinner or simple skeleton placeholders in cards and lists
- Errors: Display with TalvraText in warning color; keep messages human-readable
- Forms: Use Input and Button; validate before calling endpoints
- Empty states: Provide friendly CTAs or instructions
- Toasts/feedback: You may introduce lightweight notifications (e.g., success banners) if consistent with theme

Accessibility and semantics
- Labels for inputs and selects
- Visible focus states for links, buttons, filters
- Landmarks: main content within TalvraSurface; header via GlassPanel nav region with role and aria-label
- Flashcards: ensure keyboard controls for flip/reveal and navigation

Performance and code organization
- Respect the Areas folder structure; pages should be clear and small where possible
- Use @ui primitives—do not introduce raw tags inside Areas
- If you add new @ui components (e.g., Tabs, Badge/Chip, Toast, Markdown renderer), place them in frontend/packages/talvra-ui and export from index.ts
- Keep bundle sizes reasonable: lazy-load heavy sub-areas if needed. Avoid heavy dependencies

What exists today (overview you must preserve)
- Dashboard/Admin: functional but minimal
- Courses list and Course detail with per-course sync, documents and assignments
- Documents Detail with:
  - Embeddings (compute)
  - Per-doc semantic search
  - Structure and Markdown panels
- Document AI page
  - Notes markdown rendering (server-provided)
  - Flashcards interactive UI (Q/A with hints)
- Document Video page
  - Build media and play MP4 with poster
- Search page
  - Cross-document search with Course/Assignment/Module filters
- Settings
  - Canvas token settings
  - Reminders (test + templated send)
  - Global async sync with progress banner and localStorage persistence

Proposed enhancements (visual/UX), non-breaking
- Global AppLayout with glass header + primary nav links (Dashboard, Courses, Documents, Search, Settings)
- Consistent page headers with breadcrumb (optional)
- Use Cards to group sections with clear titles
- Replace inline styles with theme-driven styles
- Improve spacing, alignment, and hierarchy across pages
- Introduce:
  - Tabs (@ui Tabs) for Document Detail (Overview | AI | Search | Media)
  - Chip/Badge component for course/module/assignment labels
  - Empty state components for lists and searches
  - A small helper for API error boundary or inline error panel

Implementation notes for Lovable
- Do not rename or move route constants or change route paths
- Keep all existing fetch calls and URL shapes as-is (you may wrap them for reuse but preserve behavior)
- Maintain 'credentials: include' on network requests
- Keep VITE_API_BASE usage pattern and default for local dev
- Preserve current functionality in Settings (Canvas token UI, test reminder, template send, sync job banner)
- Any new @ui components must be added to frontend/packages/talvra-ui and exported from index.ts
- Do not introduce CSS frameworks; use styled-components or inline styles within @ui components, reading from theme.ts
- Validate JSON fields (e.g., template vars) before POST, show user-friendly error when parsing fails

Acceptance checklist per page
- Dashboard: shows quick actions and recent documents; navigations work
- Courses: lists courses; clicking a course opens detail; per-course sync CTA visible
- Course Detail: shows documents and assignments; per-course sync kicks off and status is visible; module filter functional
- Documents Detail: Structure and Markdown visible; embed works with success/exists feedback; per-doc search returns results
- Document AI: markdown notes render elegantly; flashcards are interactive, keyboard accessible
- Document Video: build media triggers backend; player shows MP4 with poster
- Search: filters by course, assignment, module; results show correct titles and links
- Settings: Canvas token settings intact; test reminder works; templated send works; global sync progress persists and updates

File locations and integration points
- Pages to refactor (preserve exports and routes):
  - frontend/web/src/Areas/Admin/index.tsx (Dashboard)
  - frontend/web/src/Areas/Courses/index.tsx and /Detail.tsx
  - frontend/web/src/Areas/Documents/Detail.tsx, /AI.tsx, /Video.tsx
  - frontend/web/src/Areas/Search/index.tsx
  - frontend/web/src/Areas/Settings/index.tsx
- Shared UI additions:
  - frontend/packages/talvra-ui/src/Tabs.tsx (if added)
  - frontend/packages/talvra-ui/src/Chip.tsx (if added)
  - frontend/packages/talvra-ui/src/Toast.tsx (optional)
  - Update frontend/packages/talvra-ui/src/theme.ts as needed (keep existing exports backward compatible)

Testing plan
- Local dev: pnpm -C frontend --filter web dev
- Build: pnpm --dir frontend/web run build
- Manual checks for each page per Acceptance checklist
- Verify auth/session and CORS across gateway (calls through /api/* work with credentials)

Deliverables
- A PR that updates the UI with the above guidelines, keeping all existing features working
- Minimal code churn in Areas; most style moved into @ui components
- Consistent theme usage; no raw HTML tags in Areas

Notes
- If you need to fetch additional metadata (e.g., doc titles in Search), do so by calling existing endpoints (canvas/documents) and caching locally per session
- If you temporarily need small utility functions (format dates, truncate, highlight snippets), co-locate them in frontend/web/src/utils/
- Be cautious with large lists; prefer virtualization later if needed

Thank you! This brief aims to give maximum context so you can produce a beautiful, accessible UI without breaking current functionality. When you propose changes, keep functions and data contracts intact so we can integrate quickly.

