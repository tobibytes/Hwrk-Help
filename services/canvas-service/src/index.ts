import Fastify from 'fastify'
import { Pool } from 'pg'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import cookie from '@fastify/cookie'
import { createHash } from 'node:crypto'

const app = Fastify({ logger: true })

// Env
const CANVAS_HOST = process.env.CANVAS_SERVICE_HOST ?? '0.0.0.0'
const CANVAS_PORT = Number(process.env.CANVAS_SERVICE_PORT ?? 4002)
// Always default to docker network host 'postgres' inside container
const DATABASE_URL = process.env.CANVAS_DATABASE_URL || 'postgresql://talvra:talvra@postgres:5432/talvra'
const INGESTION_BASE = process.env.INGESTION_SERVICE_URL || 'http://ingestion-service:4010'
const AI_BASE = process.env.AI_SERVICE_URL || 'http://ai-service:4020'

const pool = new Pool({ connectionString: DATABASE_URL })

async function bootstrapDb() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS courses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      canvas_id text UNIQUE,
      name text,
      term text,
      created_at timestamptz DEFAULT now()
    );
    -- Ensure columns exist on pre-existing tables
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS canvas_id text;
    CREATE UNIQUE INDEX IF NOT EXISTS courses_canvas_id_uq ON courses(canvas_id);
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS name text;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS term text;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at timestamptz;
    ALTER TABLE courses ALTER COLUMN created_at SET DEFAULT now();

    -- Documents synced from Canvas attachments/module items (schema with linkage & metadata)
    CREATE TABLE IF NOT EXISTS canvas_documents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      course_canvas_id text,
      assignment_canvas_id text,
      module_canvas_id text,
      module_item_canvas_id text,
      attachment_canvas_id text,
      title text,
      mime_type text,
      size_bytes bigint,
      content_hash text UNIQUE,
      doc_id text UNIQUE,
      created_at timestamptz DEFAULT now()
    );
    ALTER TABLE canvas_documents ADD COLUMN IF NOT EXISTS mime_type text;
    ALTER TABLE canvas_documents ADD COLUMN IF NOT EXISTS size_bytes bigint;
  `)
}

await app.register(cookie as any)

app.get('/canvas/health', async () => ({ ok: true }))

async function getUserCanvasCreds(req: any): Promise<{ token: string; baseUrl: string } | null> {
  const SESSION_COOKIE = process.env.AUTH_SESSION_COOKIE ?? 'talvra.sid'
  const sid = (req.cookies as any)?.[SESSION_COOKIE]
  const CANVAS_BASE_URL = process.env.CANVAS_BASE_URL || ''
  if (!sid) return null
  const sidRow = await pool.query('SELECT user_id FROM sessions WHERE id = $1', [sid])
  if (!sidRow.rowCount || sidRow.rows.length === 0) return null
  const userId = (sidRow.rows[0] as any).user_id as string
  const tokRow = await pool.query(
    'SELECT pgp_sym_decrypt(canvas_token_enc, $1) AS token, COALESCE(canvas_base_url, $2) AS base_url FROM users WHERE id = $3',
    [process.env.CANVAS_TOKEN_SECRET ?? 'dev-canvas-secret', CANVAS_BASE_URL || null, userId]
  )
  const token = (tokRow.rows?.[0] as any)?.token as string | null
  const baseUrl = ((tokRow.rows?.[0] as any)?.base_url as string | null) ?? CANVAS_BASE_URL
  if (token && baseUrl) return { token, baseUrl }
  return null
}

async function fetchAll<T>(url: string, token: string): Promise<T[]> {
  const items: T[] = []
  let nextUrl: string | null = url
  while (nextUrl) {
    const res = await fetch(nextUrl, { headers: { authorization: `Bearer ${token}` } })
    if (!res.ok) break
    const data = (await res.json()) as T[]
    items.push(...data)
    const link = res.headers.get('link') || res.headers.get('Link')
    if (!link) { nextUrl = null; break }
    const m = /<([^>]+)>;\s*rel=\"next\"/i.exec(link)
    nextUrl = m ? m[1] : null
  }
  return items
}

app.get('/canvas/courses', async (req, reply) => {
  const creds = await getUserCanvasCreds(req)
  if (creds) {
    const list = await fetchAll<Array<{ id: number; name: string }>>(
      `${creds.baseUrl.replace(/\/$/, '')}/api/v1/courses?per_page=50`,
      creds.token
    )
    if (list.length > 0) {
      const courses = list.map((c: any) => ({ id: String(c.id), name: c.name, term: null as string | null }))
      return { ok: true, courses }
    }
  }

  // Fallback: fixtures-backed DB
  const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS c FROM courses')
  const c = (countRows[0] as any).c as number
  if (c === 0) {
    const fixturesPath = resolve(process.cwd(), 'fixtures/courses.json')
    const json = JSON.parse(readFileSync(fixturesPath, 'utf8')) as Array<{ canvas_id: string; name: string; term?: string }>
    for (const f of json) {
      await pool.query('INSERT INTO courses (canvas_id, name, term) VALUES ($1, $2, $3) ON CONFLICT (canvas_id) DO NOTHING', [f.canvas_id, f.name, f.term ?? null])
    }
  }
  const { rows } = await pool.query('SELECT COALESCE(canvas_id, id::text) AS id, name, term FROM courses ORDER BY name ASC')
  return { ok: true, courses: rows }
})

app.get('/canvas/documents', async (req, reply) => {
  try {
    const q = (req.query as any) ?? {}
    const limitRaw = Number(q.limit ?? 50)
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 200)) : 50
    const courseId = (q.course_id ? String(q.course_id).trim() : '') || null
    let sql = 'SELECT doc_id, title, course_canvas_id, module_canvas_id, module_item_canvas_id, mime_type, size_bytes, created_at FROM canvas_documents'
    const params: any[] = []
    if (courseId) {
      sql += ' WHERE course_canvas_id = $1'
      params.push(courseId)
    }
    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1)
    params.push(limit)
    const { rows } = await pool.query(sql, params)
    return { ok: true, documents: rows }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app.get('/canvas/search', async (req, reply) => {
  try {
    const q = ((req.query as any)?.q ?? '').toString().trim()
    if (!q) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'q required' } })
    const courseId = ((req.query as any)?.course_id ?? '').toString().trim() || null
    const moduleId = ((req.query as any)?.module_id ?? '').toString().trim() || null
    const limitRaw = Number((req.query as any)?.limit ?? 10)
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 20)) : 10

    // Filter docs by course/module if provided
    const params: any[] = []
    let where = '1=1'
    if (courseId) { params.push(courseId); where += ` AND course_canvas_id = $${params.length}` }
    if (moduleId) { params.push(moduleId); where += ` AND module_canvas_id = $${params.length}` }

    const { rows } = await pool.query(
      `SELECT doc_id, title FROM canvas_documents WHERE ${where} ORDER BY created_at DESC LIMIT $${params.length + 1}`,
      [...params, limit]
    )

    const results: Array<{ doc_id: string; title: string | null; snippet: string }> = []
    const term = q.toLowerCase()

    for (const row of rows) {
      const docId = (row as any).doc_id as string
      // Fetch markdown via ingestion-service
      try {
        const mdRes = await fetch(`${INGESTION_BASE.replace(/\/$/, '')}/ingestion/blob/${encodeURIComponent(docId)}/markdown`)
        if (!mdRes.ok) continue
        const text = (await mdRes.text()) || ''
        const lower = text.toLowerCase()
        const idx = lower.indexOf(term)
        if (idx >= 0) {
          const start = Math.max(0, idx - 80)
          const end = Math.min(text.length, idx + q.length + 120)
          let snippet = text.slice(start, end).replace(/\s+/g, ' ').trim()
          if (start > 0) snippet = '… ' + snippet
          if (end < text.length) snippet = snippet + ' …'
          results.push({ doc_id: docId, title: (row as any).title ?? null, snippet })
        }
      } catch (_) {
        // ignore fetch failures
      }
    }

    return { ok: true, q, results }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app.get('/canvas/assignments', async (req, reply) => {
  try {
    const courseId = ((req.query as any)?.course_id ?? '').toString().trim()
    if (!courseId) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'course_id required' } })
    const creds = await getUserCanvasCreds(req)
    if (!creds) return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'Canvas token/base URL not configured' } })
    const list = await fetchAll<any>(`${creds.baseUrl.replace(/\/$/, '')}/api/v1/courses/${encodeURIComponent(courseId)}/assignments?per_page=50`, creds.token)
    const assignments = list.map((a: any) => ({
      id: String(a.id),
      name: a.name ?? a.name ?? 'Untitled',
      due_at: a.due_at ?? null,
      html_url: a.html_url ?? null,
      created_at: a.created_at ?? null,
      updated_at: a.updated_at ?? null,
    }))
    return { ok: true, assignments }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app.post('/canvas/sync', async (req, reply) => {
  const creds = await getUserCanvasCreds(req)
  if (!creds) return reply.code(400).send({ error: { code: 'UNAUTHENTICATED', message: 'Canvas token/base URL not configured' } })

  // Fetch all courses for user
  const courseList = await fetchAll<Array<{ id: number; name: string }>>(
    `${creds.baseUrl.replace(/\/$/, '')}/api/v1/courses?per_page=50`,
    creds.token
  )
  if (!courseList || courseList.length === 0) return { ok: true, results: [] }

  const results: Array<{ course_id: string; processed: number; skipped: number }> = []

  for (const course of courseList) {
    const courseId = String((course as any).id)
    let processed = 0
    let skipped = 0

    // Fetch modules (paginated)
    const modules = await fetchAll<any>(
      `${creds.baseUrl.replace(/\/$/, '')}/api/v1/courses/${courseId}/modules?per_page=50`,
      creds.token
    )

    for (const mod of modules) {
      const moduleCanvasId = String(mod.id)
      // Fetch module items separately with pagination
      const items = await fetchAll<any>(
        `${creds.baseUrl.replace(/\/$/, '')}/api/v1/courses/${courseId}/modules/${mod.id}/items?per_page=100`,
        creds.token
      )
      for (const item of items) {
        try {
          if (item?.type !== 'File') { skipped++; continue }
          const moduleItemCanvasId = String(item.id)
          const fileId = String(item.content_id ?? '')

          // Fetch file metadata to get a download URL and metadata
          let fileMeta: any = null
          const fileRes = await fetch(`${creds.baseUrl.replace(/\/$/, '')}/api/v1/courses/${courseId}/files/${fileId}`, {
            headers: { authorization: `Bearer ${creds.token}` }
          })
          if (fileRes.ok) {
            fileMeta = await fileRes.json()
          } else {
            // Fallback: try global files endpoint
            const alt = await fetch(`${creds.baseUrl.replace(/\/$/, '')}/api/v1/files/${fileId}`, { headers: { authorization: `Bearer ${creds.token}` } })
            if (alt.ok) fileMeta = await alt.json()
          }
          if (!fileMeta) { skipped++; continue }

          const downloadUrl: string | undefined = fileMeta?.url || fileMeta?.download_url
          const filename: string = fileMeta?.filename || fileMeta?.display_name || item?.title || `file-${fileId}`
          if (!downloadUrl) { skipped++; continue }

          // Download file to compute content hash
          const fileResp = await fetch(downloadUrl, { headers: { authorization: `Bearer ${creds.token}` } })
          if (!fileResp.ok) { skipped++; continue }
          const buf = Buffer.from(await fileResp.arrayBuffer())
          const hash = createHash('sha256').update(buf).digest('hex')

          // Dedupe by content hash
          const existing = await pool.query('SELECT id, doc_id FROM canvas_documents WHERE content_hash = $1', [hash])
          if (existing.rowCount && existing.rows.length > 0) { skipped++; continue }

          const mime = (((fileMeta?.["content-type"] ?? fileMeta?.content_type) ?? fileResp.headers.get('content-type')) ?? null) as string | null
          const size = (fileMeta?.size ?? Number(fileResp.headers.get('content-length') || '0')) as number | null

          // Create record and trigger ingestion
          const docId = `canvas-${courseId}-${moduleItemCanvasId}-${hash.slice(0, 8)}`
          await pool.query(
            'INSERT INTO canvas_documents (course_canvas_id, module_canvas_id, module_item_canvas_id, attachment_canvas_id, title, mime_type, size_bytes, content_hash, doc_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (content_hash) DO NOTHING',
            [courseId, moduleCanvasId, moduleItemCanvasId, fileId, filename, mime, size, hash, docId]
          )

          const ingestRes = await fetch(`${INGESTION_BASE.replace(/\/$/, '')}/ingestion/start`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              url: downloadUrl,
              filename,
              doc_id: docId,
              bearer_token: creds.token,
              context: { course_id: courseId, module_id: moduleCanvasId, module_item_id: moduleItemCanvasId }
            })
          })
          if (!ingestRes.ok) {
            app.log.warn({ status: ingestRes.status }, 'ingestion start failed')
          } else {
            processed++
            // Trigger embeddings for this doc (best-effort; idempotency handled by AI service; include simple retries)
            const reqId = (req.headers['x-request-id'] as string) || (req as any).id
            const embedUrl = `${AI_BASE.replace(/\/$/, '')}/ai/embed`
            const headers: Record<string, string> = { 'content-type': 'application/json' }
            if (reqId) headers['x-request-id'] = reqId
            for (let attempt = 1; attempt <= 3; attempt++) {
              try {
                const embedRes = await fetch(embedUrl, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ doc_id: docId })
                })
                if (embedRes.ok) break
                app.log.warn({ status: embedRes.status, attempt, docId }, 'ai embed trigger failed')
              } catch (e) {
                app.log.warn({ err: e, attempt, docId }, 'ai embed trigger error')
              }
              // backoff: 250ms, 500ms
              await new Promise((r) => setTimeout(r, 250 * attempt))
            }
          }
        } catch (err) {
          app.log.warn({ err }, 'item processing failed')
          skipped++
        }
      }
    }

    results.push({ course_id: courseId, processed, skipped })
  }

  return { ok: true, results }
})

app.addHook('onClose', async () => {
  await pool.end()
})

bootstrapDb()
  .then(() => app.listen({ host: CANVAS_HOST, port: CANVAS_PORT }))
  .then(() => app.log.info(`Canvas service listening on ${CANVAS_HOST}:${CANVAS_PORT}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })

