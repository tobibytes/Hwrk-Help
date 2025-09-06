import Fastify from 'fastify'
import httpProxy from '@fastify/http-proxy'
import cors from '@fastify/cors'
import { randomUUID } from 'node:crypto'

const app = Fastify({ logger: { level: 'info' } })

// Request ID hook - prefer incoming header, fallback to Fastify's req.id
app.addHook('onRequest', async (req, reply) => {
  const incoming = req.headers['x-request-id']
  const reqId = typeof incoming === 'string' ? incoming : req.id
  reply.header('x-request-id', reqId)
})

// CORS for browser requests
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'
await app.register(cors as any, {
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['content-type', 'x-request-id']
})

// Root route (smoke)
app.get('/', async () => {
  return { ok: true }
})

// Health endpoint - echo request id
app.get('/health', async (req, reply) => {
  const header = reply.getHeader('x-request-id')
  const requestId = (typeof header === 'string' ? header : undefined) ?? req.id ?? randomUUID()
  return { ok: true, request_id: requestId }
})

// Resolve upstream inside Docker reliably: if url/host is local, use Docker DNS service name
function resolveUpstream(opts: { url?: string; host?: string; port: number; dns: string }) {
  const { url, host, port, dns } = opts
  const isLocal = (v?: string) => !!v && /(localhost|127\.0\.0\.1|::1|0\.0\.0\.0)/i.test(v)
  if (url && !isLocal(url)) return url
  if (host && !isLocal(host)) return `http://${host}:${port}`
  return `http://${dns}:${port}`
}

// Proxy to auth-service
const AUTH_UPSTREAM = resolveUpstream({
  url: process.env.AUTH_SERVICE_URL,
  host: process.env.AUTH_SERVICE_HOST,
  port: Number(process.env.AUTH_SERVICE_PORT ?? 4001),
  dns: 'auth-service'
})

await app.register(httpProxy as any, {
  upstream: AUTH_UPSTREAM,
  prefix: '/api/auth',
  rewritePrefix: '/auth'
})

// Proxy to canvas-service
const CANVAS_UPSTREAM = resolveUpstream({
  url: process.env.CANVAS_SERVICE_URL,
  host: process.env.CANVAS_SERVICE_HOST,
  port: Number(process.env.CANVAS_SERVICE_PORT ?? 4002),
  dns: 'canvas-service'
})

await app.register(httpProxy as any, {
  upstream: CANVAS_UPSTREAM,
  prefix: '/api/canvas',
  rewritePrefix: '/canvas'
})

// Proxy to ingestion-service
const INGEST_UPSTREAM = resolveUpstream({
  url: process.env.INGESTION_SERVICE_URL,
  host: process.env.INGESTION_SERVICE_HOST,
  port: Number(process.env.INGESTION_SERVICE_PORT ?? 4010),
  dns: 'ingestion-service'
})

await app.register(httpProxy as any, {
  upstream: INGEST_UPSTREAM,
  prefix: '/api/ingestion',
  rewritePrefix: '/ingestion',
  rewriteHeaders: (headers: Record<string, string>, req: any) => {
    const origin = req.headers?.origin
    if (origin && origin === FRONTEND_ORIGIN) {
      headers['access-control-allow-origin'] = origin
      headers['access-control-allow-credentials'] = 'true'
    }
    return headers
  }
})

// Proxy to ai-service
const AI_UPSTREAM = resolveUpstream({
  url: process.env.AI_SERVICE_URL,
  host: process.env.AI_SERVICE_HOST,
  port: Number(process.env.AI_SERVICE_PORT ?? 4020),
  dns: 'ai-service'
})

await app.register(httpProxy as any, {
  upstream: AI_UPSTREAM,
  prefix: '/api/ai',
  rewritePrefix: '/ai',
  rewriteHeaders: (headers: Record<string, string>, req: any) => {
    const origin = req.headers?.origin
    if (origin && origin === FRONTEND_ORIGIN) {
      headers['access-control-allow-origin'] = origin
      headers['access-control-allow-credentials'] = 'true'
    }
    return headers
  }
})

// Proxy Homework endpoints to AI service
await app.register(httpProxy as any, {
  upstream: AI_UPSTREAM,
  prefix: '/api/homework',
  rewritePrefix: '/homework',
  rewriteHeaders: (headers: Record<string, string>, req: any) => {
    const origin = req.headers?.origin
    if (origin && origin === FRONTEND_ORIGIN) {
      headers['access-control-allow-origin'] = origin
      headers['access-control-allow-credentials'] = 'true'
    }
    return headers
  }
})

// Proxy to media-service
const MEDIA_UPSTREAM = resolveUpstream({
  url: process.env.MEDIA_SERVICE_URL,
  host: process.env.MEDIA_SERVICE_HOST,
  port: Number(process.env.MEDIA_SERVICE_PORT ?? 4030),
  dns: 'media-service'
})

await app.register(httpProxy as any, {
  upstream: MEDIA_UPSTREAM,
  prefix: '/api/media',
  rewritePrefix: '/media',
  rewriteHeaders: (headers: Record<string, string>, req: any) => {
    const origin = req.headers?.origin
    if (origin && origin === FRONTEND_ORIGIN) {
      headers['access-control-allow-origin'] = origin
      headers['access-control-allow-credentials'] = 'true'
    }
    return headers
  }
})

// Public search endpoint: proxy to AI search-all
app.get('/search', async (req, reply) => {
  try {
    const qs = req.url.includes('?') ? req.url.split('?')[1] : ''
    const url = `${AI_UPSTREAM.replace(/\/$/, '')}/ai/search-all${qs ? `?${qs}` : ''}`
    const res = await fetch(url)
    const text = await res.text()
    reply.code(res.status)
    for (const [k, v] of res.headers as any) {
      if (typeof k === 'string' && typeof v === 'string' && ['content-type'].includes(k.toLowerCase())) reply.header(k, v)
    }
    return text
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

// Proxy to notification-service
const NOTIFY_UPSTREAM = resolveUpstream({
  url: process.env.NOTIFY_SERVICE_URL,
  host: process.env.NOTIFY_SERVICE_HOST,
  port: Number(process.env.NOTIFY_SERVICE_PORT ?? 4040),
  dns: 'notification-service'
})

await app.register(httpProxy as any, {
  upstream: NOTIFY_UPSTREAM,
  prefix: '/api/notify',
  rewritePrefix: '/notify',
  rewriteHeaders: (headers: Record<string, string>, req: any) => {
    const origin = req.headers?.origin
    if (origin && origin === FRONTEND_ORIGIN) {
      headers['access-control-allow-origin'] = origin
      headers['access-control-allow-credentials'] = 'true'
    }
    return headers
  }
})

const port = Number(process.env.API_GATEWAY_PORT ?? 3001)
const host = String(process.env.API_GATEWAY_HOST ?? '0.0.0.0')
app
  .listen({ port, host })
  .then(() => app.log.info(`API Gateway listening on ${host}:${port} (auth upstream: ${AUTH_UPSTREAM})`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
