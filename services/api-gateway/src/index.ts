import Fastify from 'fastify'
import { randomUUID } from 'node:crypto'

const app = Fastify({ logger: true })

// Request ID hook - prefer incoming header, fallback to Fastify's req.id
app.addHook('onRequest', async (req, reply) => {
  const incoming = req.headers['x-request-id']
  const reqId = typeof incoming === 'string' ? incoming : req.id
  reply.header('x-request-id', reqId)
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

const port = Number(process.env.API_GATEWAY_PORT ?? 3001)
const host = String(process.env.API_GATEWAY_HOST ?? '0.0.0.0')
app
  .listen({ port, host })
  .then(() => app.log.info(`API Gateway listening on ${host}:${port}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
