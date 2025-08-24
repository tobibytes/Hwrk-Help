import Fastify from 'fastify'
import httpProxy from '@fastify/http-proxy'
import cors from '@fastify/cors'
import { randomUUID } from 'node:crypto'

const app = Fastify({ logger: true })

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
  methods: ['GET', 'POST', 'OPTIONS'],
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
const AUTH_UPSTREAM_HOST = process.env.AUTH_SERVICE_HOST ?? '127.0.0.1'
const AUTH_UPSTREAM_PORT = Number(process.env.AUTH_SERVICE_PORT ?? 4001)
const AUTH_UPSTREAM = `http://${AUTH_UPSTREAM_HOST}:${AUTH_UPSTREAM_PORT}`

await app.register(httpProxy as any, {
  upstream: AUTH_UPSTREAM,
  prefix: '/api/auth',
  rewritePrefix: '/auth'
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
