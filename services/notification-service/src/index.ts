import Fastify from 'fastify'
import pg from 'pg'

const app = Fastify({ logger: { level: 'info' } })

// Env
const HOST = process.env.NOTIFY_SERVICE_HOST ?? '0.0.0.0'
const PORT = Number(process.env.NOTIFY_SERVICE_PORT ?? 4040)
const DATABASE_URL = process.env.DATABASE_URL || ''
const SCHED_INTERVAL_MS = Number(process.env.NOTIFY_SCHEDULER_INTERVAL_MS || 30000)
const pool = DATABASE_URL ? new pg.Pool({ connectionString: DATABASE_URL }) : null

app.get('/notify/health', async () => ({ ok: true }))

// POST /notify/test { to?: string, subject?: string, text?: string }
async function sendEmail(req: any, msg: { to?: string; subject: string; text: string; html?: string }) {
  const to = (msg.to || process.env.NOTIFY_TEST_TO || '').trim()
  const SMTP_HOST = process.env.SMTP_HOST || ''
  if (!SMTP_HOST) {
    req.log.info({ to, subject: msg.subject, text: msg.text, html: !!msg.html }, 'notify send (log only, no SMTP configured)')
    return { ok: true, sent: false, logged: true }
  }
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  let nm: any = null
  try { nm = require('nodemailer') } catch (_) { nm = null }
  if (!nm) {
    req.log.warn('nodemailer not installed; logging instead')
    req.log.info({ to, subject: msg.subject, text: msg.text, html: !!msg.html }, 'notify send (log only)')
    return { ok: true, sent: false, logged: true }
  }
  const transporter = nm.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  const from = process.env.SMTP_FROM || 'no-reply@talvra.local'
  if (!to) throw Object.assign(new Error('to required (or set NOTIFY_TEST_TO)'), { code: 'INVALID_ARGUMENT' })
  await transporter.sendMail({ from, to, subject: msg.subject, text: msg.text, html: msg.html })
  return { ok: true, sent: true }
}

app.post('/notify/test', async (req, reply) => {
  try {
    const body = (req.body ?? {}) as { to?: string; subject?: string; text?: string }
    const to = (body.to || process.env.NOTIFY_TEST_TO || '').trim()
    const subject = (body.subject || 'Talvra Test Reminder').trim()
    const text = (body.text || 'This is a test reminder from Talvra').trim()
    const result = await sendEmail(req, { to, subject, text })
    return result
  } catch (e: any) {
    const code = (e as any)?.code === 'INVALID_ARGUMENT' ? 400 : 500
    return reply.code(code).send({ error: { code: code === 400 ? 'INVALID_ARGUMENT' : 'INTERNAL', message: String(e?.message || e) } })
  }
})

import { renderTemplate, listTemplates } from './templates.js'

// Send a templated notification
app.post('/notify/send-template', async (req, reply) => {
  try {
    const body = (req.body ?? {}) as { to?: string; template: string; vars?: Record<string, any>; subject?: string }
    const name = String(body.template || '').trim()
    if (!name) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'template required' } })
    let rendered: { subject: string; text: string; html?: string }
    try {
      rendered = renderTemplate(name as any, body.vars || {})
    } catch (e: any) {
      return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: String(e?.message || e) } })
    }
    const subject = (body.subject && body.subject.trim()) || rendered.subject
    const res = await sendEmail(req, { to: body.to, subject, text: rendered.text, html: rendered.html })
    return res
  } catch (e: any) {
    const code = (e as any)?.code === 'INVALID_ARGUMENT' ? 400 : 500
    return reply.code(code).send({ error: { code: code === 400 ? 'INVALID_ARGUMENT' : 'INTERNAL', message: String(e?.message || e) } })
  }
})

// List available templates
app.get('/notify/templates', async () => ({ ok: true, templates: listTemplates() }))

// Create a reminder schedule row
app.post('/notify/schedule', async (req, reply) => {
  try {
    if (!pool) return reply.code(500).send({ error: { code: 'INTERNAL', message: 'DATABASE_URL not configured' } })
    const body = (req.body ?? {}) as { user_id?: string; course_canvas_id?: string; assignment_canvas_id?: string; remind_at?: string; to?: string; template?: string; vars?: any; subject?: string }
    const remind_at = body.remind_at ? new Date(body.remind_at) : null
    if (!remind_at || isNaN(remind_at.getTime())) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'valid remind_at required (ISO timestamp)' } })
    const tpl = (body.template || 'assignment_reminder').trim()
    const vars = (typeof body.vars === 'object' && body.vars) ? body.vars : {}
    const to = (body.to || process.env.NOTIFY_TEST_TO || '').trim()
    const subject = (body.subject || '').trim()

    const q = `INSERT INTO reminder_schedules (user_id, course_canvas_id, assignment_canvas_id, remind_at, to_email, template_name, vars, subject, status, created_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending', now())
               RETURNING id`;
    const params = [body.user_id || null, body.course_canvas_id || null, body.assignment_canvas_id || null, remind_at.toISOString(), to || null, tpl, JSON.stringify(vars), subject || null]
    const r = await pool.query(q, params)
    return { ok: true, id: r.rows[0]?.id }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

// Get schedule status
app.get('/notify/status/:id', async (req: any, reply) => {
  try {
    if (!pool) return reply.code(500).send({ error: { code: 'INTERNAL', message: 'DATABASE_URL not configured' } })
    const id = req.params?.id
    const r = await pool.query('SELECT id, remind_at, status, sent_at, attempts, last_error FROM reminder_schedules WHERE id = $1', [id])
    if (r.rowCount === 0) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'schedule not found' } })
    return { ok: true, schedule: r.rows[0] }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

// --- Scheduler worker ---
async function tickScheduler() {
  if (!pool) return
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const r = await client.query(
      `SELECT id, to_email, template_name, subject, vars
       FROM reminder_schedules
       WHERE status = 'pending' AND remind_at <= now()
       ORDER BY remind_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT 10`
    )
    for (const row of r.rows) {
      const id = row.id
      const to = row.to_email as string
      const tpl = row.template_name as string
      const subject = row.subject as string | null
      const vars = (typeof row.vars === 'object') ? row.vars : (() => { try { return JSON.parse(row.vars) } catch { return {} } })()
      try {
const { renderTemplate } = await import('./templates.js')
        const rendered = renderTemplate(tpl as any, vars)
        const res = await sendEmail({ log: app.log } as any, { to, subject: subject || rendered.subject, text: rendered.text, html: rendered.html })
        if ((res as any)?.sent) {
          await client.query('UPDATE reminder_schedules SET status = $2, sent_at = now(), attempts = attempts + 1 WHERE id = $1', [id, 'sent'])
        } else {
          await client.query('UPDATE reminder_schedules SET attempts = attempts + 1 WHERE id = $1', [id])
        }
      } catch (e: any) {
        await client.query('UPDATE reminder_schedules SET attempts = attempts + 1, last_error = $2 WHERE id = $1', [id, String(e?.message || e)])
      }
    }
    await client.query('COMMIT')
  } catch (e) {
    try { await client.query('ROLLBACK') } catch {}
  } finally {
    client.release()
  }
}

if (SCHED_INTERVAL_MS > 0) setInterval(tickScheduler, SCHED_INTERVAL_MS)

app
  .listen({ host: HOST, port: PORT })
  .then(() => app.log.info(`Notification service listening on ${HOST}:${PORT} (scheduler ${SCHED_INTERVAL_MS}ms)`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })

