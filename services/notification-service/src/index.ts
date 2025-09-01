import Fastify from 'fastify'

const app = Fastify({ logger: { level: 'info' } })

// Env
const HOST = process.env.NOTIFY_SERVICE_HOST ?? '0.0.0.0'
const PORT = Number(process.env.NOTIFY_SERVICE_PORT ?? 4040)

app.get('/notify/health', async () => ({ ok: true }))

// POST /notify/test { to?: string, subject?: string, text?: string }
app.post('/notify/test', async (req, reply) => {
  try {
    const body = (req.body ?? {}) as { to?: string; subject?: string; text?: string }
    const to = (body.to || process.env.NOTIFY_TEST_TO || '').trim()
    const subject = (body.subject || 'Talvra Test Reminder').trim()
    const text = (body.text || 'This is a test reminder from Talvra').trim()

    // If SMTP env configured, attempt to send email; otherwise, log
    const SMTP_HOST = process.env.SMTP_HOST || ''
    if (!SMTP_HOST) {
      req.log.info({ to, subject, text }, 'notify test (log only, no SMTP configured)')
      return { ok: true, sent: false, logged: true }
    }

    // Attempt to lazy-require nodemailer only at runtime
    const { createRequire } = await import('node:module')
    const require = createRequire(import.meta.url)
    let nm: any = null
    try { nm = require('nodemailer') } catch (_) { nm = null }
    if (!nm) {
      req.log.warn('nodemailer not installed; logging instead')
      req.log.info({ to, subject, text }, 'notify test (log only)')
      return { ok: true, sent: false, logged: true }
    }
    const transporter = nm.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
    const from = process.env.SMTP_FROM || 'no-reply@talvra.local'
    if (!to) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'to required (or set NOTIFY_TEST_TO)' } })
    await transporter.sendMail({ from, to, subject, text })
    return { ok: true, sent: true }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

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

