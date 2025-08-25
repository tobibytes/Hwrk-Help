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

    -- Documents synced from Canvas attachments/module items (minimal schema for dedupe and linkage)
    CREATE TABLE IF NOT EXISTS canvas_documents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      course_canvas_id text,
      assignment_canvas_id text,
      module_canvas_id text,
      module_item_canvas_id text,
      attachment_canvas_id text,
      title text,
      content_hash text UNIQUE,
      doc_id text UNIQUE,
      created_at timestamptz DEFAULT now()
    );
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

app.get('/canvas/courses', async (req, reply) => {
  const creds = await getUserCanvasCreds(req)
  if (creds) {
    const res = await fetch(`${creds.baseUrl.replace(/\/$/, '')}/api/v1/courses?per_page=50`, {
      headers: { authorization: `Bearer ${creds.token}` }
    })
    if (res.ok) {
      const data = (await res.json()) as Array<{ id: number; name: string }>
      const courses = data.map((c) => ({ id: String(c.id), name: c.name, term: null as string | null }))
      return { ok: true, courses }
    } else if (res.status === 401 || res.status === 403) {
      return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'invalid Canvas token' } })
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

app.post('/canvas/sync', async (req, reply) => {
  const creds = await getUserCanvasCreds(req)
  if (!creds) return reply.code(400).send({ error: { code: 'UNAUTHENTICATED', message: 'Canvas token/base URL not configured' } })

  // Fetch courses to sync
  const coursesRes = await fetch(`${creds.baseUrl.replace(/\/$/, '')}/api/v1/courses?per_page=50`, {
    headers: { authorization: `Bearer ${creds.token}` }
  })
  if (!coursesRes.ok) return reply.code(coursesRes.status).send({ error: { code: 'CANVAS_ERROR', message: 'failed to list courses' } })
  const courses = (await coursesRes.json()) as Array<{ id: number; name: string }>

  const results: Array<{ course_id: string; processed: number; skipped: number }> = []

  for (const course of courses) {
    const courseId = String(course.id)
    let processed = 0
    let skipped = 0

    // List modules with items (best-effort; ignores pagination for now)
    const modsRes = await fetch(`${creds.baseUrl.replace(/\/$/, '')}/api/v1/courses/${courseId}/modules?per_page=50&include%5B%5D=items`, {
      headers: { authorization: `Bearer ${creds.token}` }
    })
    if (!modsRes.ok) {
      app.log.warn({ status: modsRes.status }, 'failed to list modules')
      results.push({ course_id: courseId, processed, skipped })
      continue
    }
    const modules = (await modsRes.json()) as Array<any>

    for (const mod of modules) {
      const moduleCanvasId = String(mod.id)
      const items = Array.isArray(mod.items) ? mod.items as Array<any> : []
      for (const item of items) {
        try {
          if (item?.type !== 'File') { skipped++; continue }
          const moduleItemCanvasId = String(item.id)
          const fileId = String(item.content_id ?? '')

          // Fetch file metadata to get a download URL
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

          // Download file to compute content hash (best-effort; assume presigned URL may not need token)
          const fileResp = await fetch(downloadUrl, { headers: { authorization: `Bearer ${creds.token}` } })
          if (!fileResp.ok) { skipped++; continue }
          const buf = Buffer.from(await fileResp.arrayBuffer())
          const hash = createHash('sha256').update(buf).digest('hex')

          // Dedupe by content hash
          const existing = await pool.query('SELECT id, doc_id FROM canvas_documents WHERE content_hash = $1', [hash])
          if (existing.rowCount && existing.rows.length > 0) { skipped++; continue }

          // Create record and trigger ingestion
          const docId = `canvas-${courseId}-${moduleItemCanvasId}-${hash.slice(0, 8)}`
          await pool.query(
            'INSERT INTO canvas_documents (course_canvas_id, module_canvas_id, module_item_canvas_id, attachment_canvas_id, title, content_hash, doc_id) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (content_hash) DO NOTHING',
            [courseId, moduleCanvasId, moduleItemCanvasId, fileId, filename, hash, docId]
          )

          const ingestRes = await fetch(`${INGESTION_BASE.replace(/\/$/, '')}/ingestion/start`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              url: downloadUrl,
              filename,
              doc_id: docId,
              context: { course_id: courseId, module_id: moduleCanvasId, module_item_id: moduleItemCanvasId }
            })
          })
          if (!ingestRes.ok) {
            app.log.warn({ status: ingestRes.status }, 'ingestion start failed')
          } else {
            processed++
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

