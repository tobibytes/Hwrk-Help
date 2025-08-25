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

// Proxy to auth-service
const AUTH_UPSTREAM_HOST = process.env.AUTH_SERVICE_HOST ?? 'auth-service'
const AUTH_UPSTREAM_PORT = Number(process.env.AUTH_SERVICE_PORT ?? 4001)
const AUTH_UPSTREAM_DEFAULT = `http://${AUTH_UPSTREAM_HOST}:${AUTH_UPSTREAM_PORT}`
const AUTH_UPSTREAM = process.env.AUTH_SERVICE_URL ?? AUTH_UPSTREAM_DEFAULT

await app.register(httpProxy as any, {
  upstream: AUTH_UPSTREAM,
  prefix: '/api/auth',
  rewritePrefix: '/auth'
})

// Proxy to canvas-service
const CANVAS_UPSTREAM_HOST = process.env.CANVAS_SERVICE_HOST ?? 'canvas-service'
const CANVAS_UPSTREAM_PORT = Number(process.env.CANVAS_SERVICE_PORT ?? 4002)
const CANVAS_UPSTREAM_DEFAULT = `http://${CANVAS_UPSTREAM_HOST}:${CANVAS_UPSTREAM_PORT}`
const CANVAS_UPSTREAM = process.env.CANVAS_SERVICE_URL ?? CANVAS_UPSTREAM_DEFAULT

await app.register(httpProxy as any, {
  upstream: CANVAS_UPSTREAM,
  prefix: '/api/canvas',
  rewritePrefix: '/canvas'
})

// Proxy to ingestion-service
const INGEST_UPSTREAM_HOST = process.env.INGESTION_SERVICE_HOST ?? 'ingestion-service'
const INGEST_UPSTREAM_PORT = Number(process.env.INGESTION_SERVICE_PORT ?? 4010)
const INGEST_UPSTREAM_DEFAULT = `http://${INGEST_UPSTREAM_HOST}:${INGEST_UPSTREAM_PORT}`
const INGEST_UPSTREAM = process.env.INGESTION_SERVICE_URL ?? INGEST_UPSTREAM_DEFAULT

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
const AI_UPSTREAM_HOST = process.env.AI_SERVICE_HOST ?? 'ai-service'
const AI_UPSTREAM_PORT = Number(process.env.AI_SERVICE_PORT ?? 4020)
const AI_UPSTREAM_DEFAULT = `http://${AI_UPSTREAM_HOST}:${AI_UPSTREAM_PORT}`
const AI_UPSTREAM = process.env.AI_SERVICE_URL ?? AI_UPSTREAM_DEFAULT

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
const port = Number(process.env.API_GATEWAY_PORT ?? 3001)
const host = String(process.env.API_GATEWAY_HOST ?? '0.0.0.0')
app
  .listen({ port, host })
  .then(() => app.log.info(`API Gateway listening on ${host}:${port} (auth upstream: ${AUTH_UPSTREAM})`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
