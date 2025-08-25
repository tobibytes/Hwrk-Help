import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import '@fastify/cookie'
import { Pool } from 'pg'
import argon2 from 'argon2'
import { randomBytes, createHash } from 'node:crypto'
import { URLSearchParams } from 'node:url'

const app = Fastify({ logger: true })

// Env
const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://talvra:talvra@localhost:5432/talvra'
const AUTH_HOST = process.env.AUTH_SERVICE_HOST ?? '0.0.0.0'
const AUTH_PORT = Number(process.env.AUTH_SERVICE_PORT ?? 4001)
const SESSION_COOKIE = process.env.AUTH_SESSION_COOKIE ?? 'talvra.sid'

// Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ''
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3001/api/auth/google/callback'
const GOOGLE_SCOPES = (process.env.AUTH_GOOGLE_SCOPES ?? 'openid email profile').split(' ')
const GOOGLE_ALLOWED_HD = process.env.AUTH_GOOGLE_ALLOWED_HD ?? 'morgan.edu'

function b64url(buf: Buffer) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

// PG
const pool = new Pool({ connectionString: DATABASE_URL })

async function bootstrapDb() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      google_sub text UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    -- Ensure columns exist on pre-existing tables
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub text UNIQUE;
    CREATE TABLE IF NOT EXISTS sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `)
}

await app.register(cookie as any, { secret: process.env.AUTH_COOKIE_SECRET ?? 'dev-secret' })

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

// Current user info
app.get('/auth/me', async (req, reply) => {
  const sid = (req.cookies ?? {})[SESSION_COOKIE]
  if (!sid) return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'missing session' } })

  const { rows } = await pool.query(
    'SELECT u.id, u.email, u.google_sub, u.created_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = $1',
    [sid]
  )
  if (rows.length === 0) return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'invalid session' } })

  const u = rows[0] as { id: string; email: string; google_sub: string | null; created_at: string }
  return { ok: true, user: { id: u.id, email: u.email, google_sub: u.google_sub, created_at: u.created_at } }
})

// Logout (clear session)
app.post('/auth/logout', async (req, reply) => {
  const sid = (req.cookies ?? {})[SESSION_COOKIE]
  if (sid) {
    await pool.query('DELETE FROM sessions WHERE id = $1', [sid])
    reply.clearCookie(SESSION_COOKIE, { path: '/' })
  }
  return { ok: true }
})

// Google OAuth - start
app.get('/auth/google/start', async (req, reply) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return reply.code(500).send({ error: { code: 'INTERNAL', message: 'Google OAuth not configured' } })

  const state = b64url(randomBytes(16))
  const codeVerifier = b64url(randomBytes(32))
  const codeChallenge = b64url(createHash('sha256').update(codeVerifier).digest())
  const next = typeof (req.query as any)?.redirect === 'string' ? (req.query as any).redirect : '/'

  reply.setCookie('g_state', state, { httpOnly: true, sameSite: 'lax', path: '/api/auth/google', signed: true })
  reply.setCookie('g_code_v', codeVerifier, { httpOnly: true, sameSite: 'lax', path: '/api/auth/google', signed: true })
  reply.setCookie('g_next', next, { httpOnly: true, sameSite: 'lax', path: '/api/auth/google', signed: true })

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    include_granted_scopes: 'true',
    hd: GOOGLE_ALLOWED_HD,
    prompt: 'consent'
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  reply.redirect(authUrl)
})

// Google OAuth - callback
app.get('/auth/google/callback', async (req, reply) => {
  const query = req.query as any
  const code: string | undefined = query?.code
  const state: string | undefined = query?.state
  if (!code || !state) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'missing code/state' } })

  const sState = req.unsignCookie ? req.unsignCookie((req.cookies ?? {}).g_state ?? '') : { valid: false as boolean, value: '' }
  const sCodeV = req.unsignCookie ? req.unsignCookie((req.cookies ?? {}).g_code_v ?? '') : { valid: false as boolean, value: '' }
  const sNext = req.unsignCookie ? req.unsignCookie((req.cookies ?? {}).g_next ?? '') : { valid: false as boolean, value: '' }

  if (!sState.valid || !sCodeV.valid) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'invalid oauth state' } })
  if ((sState as any).value !== state) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'state mismatch' } })
  const codeVerifier = (sCodeV as any).value as string
  const next = (sNext.valid ? ((sNext as any).value as string) : '/') || '/'

  // Exchange code
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: codeVerifier,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  })
  if (!tokenRes.ok) return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'token exchange failed' } })
  const tokenJson = (await tokenRes.json()) as { access_token: string; id_token?: string }

  // Fetch userinfo
  const uiRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { authorization: `Bearer ${tokenJson.access_token}` }
  })
  if (!uiRes.ok) return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'userinfo fetch failed' } })
  const userinfo = (await uiRes.json()) as { sub: string; email?: string; hd?: string }
  const email = userinfo.email ?? ''
  const hd = userinfo.hd ?? (email.includes('@') ? email.split('@')[1] : '')
  if (GOOGLE_ALLOWED_HD && hd.toLowerCase() !== GOOGLE_ALLOWED_HD.toLowerCase()) {
    return reply.code(403).send({ error: { code: 'FORBIDDEN', message: `only ${GOOGLE_ALLOWED_HD} accounts are allowed` } })
  }

  // Determine current session
  const sid = (req.cookies ?? {})[SESSION_COOKIE]
  if (sid) {
    // Link Google to existing user
    const r = await pool.query('SELECT user_id FROM sessions WHERE id = $1', [sid])
    if (r.rows.length === 0) return reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'invalid session' } })
    const userId = (r.rows[0] as { user_id: string }).user_id
    try {
      await pool.query('UPDATE users SET google_sub = $1 WHERE id = $2', [userinfo.sub, userId])
    } catch (e) {
      return reply.code(409).send({ error: { code: 'CONFLICT', message: 'google account already linked' } })
    }
    // Cleanup cookies
    reply.clearCookie('g_state', { path: '/api/auth/google' })
    reply.clearCookie('g_code_v', { path: '/api/auth/google' })
    reply.clearCookie('g_next', { path: '/api/auth/google' })
    return reply.redirect(next)
  }

  // Login or sign up via Google
  let userId: string | null = null
  const bySub = await pool.query('SELECT id FROM users WHERE google_sub = $1', [userinfo.sub])
  if (bySub.rows.length > 0) {
    userId = (bySub.rows[0] as { id: string }).id
  } else if (email) {
    const byEmail = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (byEmail.rows.length > 0) {
      userId = (byEmail.rows[0] as { id: string }).id
      await pool.query('UPDATE users SET google_sub = $1 WHERE id = $2', [userinfo.sub, userId])
    } else {
      // Create a new user with random password hash
      const rand = b64url(randomBytes(16))
      const hash = await argon2.hash(rand)
      const ins = await pool.query('INSERT INTO users (email, password_hash, google_sub) VALUES ($1, $2, $3) RETURNING id', [email || `${userinfo.sub}@${GOOGLE_ALLOWED_HD}`, hash, userinfo.sub])
      userId = (ins.rows[0] as { id: string }).id
    }
  } else {
    return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'no email on Google account' } })
  }

  const sCreated = await pool.query('INSERT INTO sessions (user_id) VALUES ($1) RETURNING id', [userId])
  const newSid = (sCreated.rows[0] as { id: string }).id
  reply.setCookie(SESSION_COOKIE, newSid, { path: '/', httpOnly: true, sameSite: 'lax' })

  // Cleanup cookies and redirect
  reply.clearCookie('g_state', { path: '/api/auth/google' })
  reply.clearCookie('g_code_v', { path: '/api/auth/google' })
  reply.clearCookie('g_next', { path: '/api/auth/google' })
  return reply.redirect(next)
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
