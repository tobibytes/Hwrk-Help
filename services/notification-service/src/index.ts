import Fastify from 'fastify'

const app = Fastify({ logger: { level: 'info' } })

// Env
const HOST = process.env.NOTIFY_SERVICE_HOST ?? '0.0.0.0'
const PORT = Number(process.env.NOTIFY_SERVICE_PORT ?? 4040)

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

import { renderTemplate, listTemplates } from './templates'

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

// Simple schedule endpoint placeholder
app.post('/notify/schedule', async (req, reply) => {
  try {
    const body = (req.body ?? {}) as { course_id?: string; assignment_id?: string; remind_at?: string; user_id?: string }
    // In a real implementation, persist to DB and a worker would deliver at remind_at
    req.log.info({ schedule: body }, 'schedule reminder (placeholder)')
    return { ok: true, scheduled: true }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app
  .listen({ host: HOST, port: PORT })
  .then(() => app.log.info(`Notification service listening on ${HOST}:${PORT}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })

