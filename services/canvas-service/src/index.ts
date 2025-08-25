import Fastify from 'fastify'
import { Pool } from 'pg'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import cookie from '@fastify/cookie'

const app = Fastify({ logger: true })

// Env
const CANVAS_HOST = process.env.CANVAS_SERVICE_HOST ?? '0.0.0.0'
const CANVAS_PORT = Number(process.env.CANVAS_SERVICE_PORT ?? 4002)
// Always default to docker network host 'postgres' inside container
const DATABASE_URL = process.env.CANVAS_DATABASE_URL || 'postgresql://talvra:talvra@postgres:5432/talvra'

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
  `)
}

await app.register(cookie as any)

app.get('/canvas/health', async () => ({ ok: true }))

app.get('/canvas/courses', async (req, reply) => {
  // If a logged-in user has a Canvas token, fetch from Canvas API
  const SESSION_COOKIE = process.env.AUTH_SESSION_COOKIE ?? 'talvra.sid'
  const sid = (req.cookies as any)?.[SESSION_COOKIE]
  const CANVAS_BASE_URL = process.env.CANVAS_BASE_URL || (await (async () => {
    return '' as string
  })())

  if (sid) {
    const sidRow = await pool.query('SELECT user_id FROM sessions WHERE id = $1', [sid])
    if (sidRow.rowCount && sidRow.rows.length > 0) {
      const userId = (sidRow.rows[0] as any).user_id as string
      const tokRow = await pool.query(
        "SELECT pgp_sym_decrypt(canvas_token_enc, $1) AS token, COALESCE(canvas_base_url, $2) AS base_url FROM users WHERE id = $3",
        [process.env.CANVAS_TOKEN_SECRET ?? 'dev-canvas-secret', process.env.CANVAS_BASE_URL ?? null, userId]
      )
      const token = (tokRow.rows?.[0] as any)?.token as string | null
      const baseUrl = ((tokRow.rows?.[0] as any)?.base_url as string | null) ?? process.env.CANVAS_BASE_URL ?? ''
      if (token && baseUrl) {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1/courses?per_page=50`, {
          headers: { authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = (await res.json()) as Array<{ id: number; name: string }>
          const courses = data.map((c) => ({ id: String(c.id), name: c.name, term: null as string | null }))
          return { ok: true, courses }
        } else if (res.status === 401 || res.status === 403) {
          return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'invalid Canvas token' } })
        }
      }
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

