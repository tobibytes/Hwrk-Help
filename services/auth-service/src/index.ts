import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import { Pool } from 'pg'
import argon2 from 'argon2'

const app = Fastify({ logger: true })

// Env
const DB_USER = process.env.POSTGRES_USER ?? 'talvra'
const DB_PASSWORD = process.env.POSTGRES_PASSWORD ?? 'talvra'
const DB_NAME = process.env.POSTGRES_DB ?? 'talvra'
const DB_PORT = Number(process.env.POSTGRES_PORT ?? 5432)
const DB_HOST = process.env.POSTGRES_HOST ?? '127.0.0.1'
const AUTH_HOST = process.env.AUTH_SERVICE_HOST ?? '0.0.0.0'
const AUTH_PORT = Number(process.env.AUTH_SERVICE_PORT ?? 4001)
const SESSION_COOKIE = process.env.AUTH_SESSION_COOKIE ?? 'talvra.sid'

// PG
const pool = new Pool({ user: DB_USER, password: DB_PASSWORD, database: DB_NAME, port: DB_PORT, host: DB_HOST })

async function bootstrapDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `)
}

app.register(cookie, { secret: process.env.AUTH_COOKIE_SECRET ?? 'dev-secret', hook: 'onRequest' })

app.post('/auth/signup', async (req, reply) => {
  const body = (req.body ?? {}) as { email?: string; password?: string }
  if (!body.email || !body.password) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'email and password required' } })

  const hash = await argon2.hash(body.password)
  try {
    await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [body.email, hash])
    return reply.code(201).send({ ok: true })
  } catch (e) {
    return reply.code(409).send({ error: { code: 'CONFLICT', message: 'email already exists' } })
  }
})

app.post('/auth/login', async (req, reply) => {
  const body = (req.body ?? {}) as { email?: string; password?: string }
  if (!body.email || !body.password) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'email and password required' } })

  const { rows } = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [body.email])
  if (rows.length === 0) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'user not found' } })

  const user = rows[0] as { id: string; password_hash: string }
  const ok = await argon2.verify(user.password_hash, body.password)
  if (!ok) return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'invalid credentials' } })

  const { rows: srows } = await pool.query('INSERT INTO sessions (user_id) VALUES ($1) RETURNING id', [user.id])
  const sid = (srows[0] as { id: string }).id
  reply.setCookie(SESSION_COOKIE, sid, { path: '/', httpOnly: true, sameSite: 'lax' })
  return { ok: true }
})

app.get('/auth/session', async (req, reply) => {
  const sid = (req.cookies ?? {})[SESSION_COOKIE]
  if (!sid) return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'missing session' } })

  const { rows } = await pool.query('SELECT user_id FROM sessions WHERE id = $1', [sid])
  if (rows.length === 0) return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'invalid session' } })

  return { ok: true, user_id: (rows[0] as { user_id: string }).user_id }
})

app.addHook('onClose', async () => {
  await pool.end()
})

bootstrapDb()
  .then(() => app.listen({ host: AUTH_HOST, port: AUTH_PORT }))
  .then(() => app.log.info(`Auth service listening on ${AUTH_HOST}:${AUTH_PORT}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
