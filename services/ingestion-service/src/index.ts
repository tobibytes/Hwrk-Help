import Fastify from 'fastify'
import Redis from 'ioredis'
import fs from 'node:fs/promises'
import path from 'node:path'
import mammoth from 'mammoth'

const app = Fastify({ logger: { level: 'info' } })

// Env
const HOST = process.env.INGESTION_SERVICE_HOST ?? '0.0.0.0'
const PORT = Number(process.env.INGESTION_SERVICE_PORT ?? 4010)
const REDIS_URL = process.env.REDIS_URL ?? 'redis://redis:6379'
const STREAM = process.env.INGEST_STREAM ?? 'ingest.request'
const OUTPUT_DIR = process.env.INGEST_OUTPUT_DIR ?? path.resolve(process.cwd(), 'out')

const redis = new Redis(REDIS_URL)

app.get('/ingestion/health', async () => ({ ok: true }))

async function loadPdfParse(): Promise<(data: Buffer) => Promise<any>> {
  // Try known internal entry first (avoids top-level test file reads in some releases)
  try {
    const mod = (await import('pdf-parse/lib/pdf-parse.js').catch(() => import('pdf-parse/lib/pdf-parse')));
    const fn = (mod as any).default ?? (mod as any)
    if (typeof fn === 'function') return fn
  } catch (_) {
    // ignore and fallback below
  }
  // Fallback to package main
  const main = await import('pdf-parse')
  const fn = (main as any).default ?? (main as any)
  if (typeof fn !== 'function') throw new Error('Failed to resolve pdf-parse function export')
  return fn
}

async function extractToMarkdown(filePath: string): Promise<{ markdown: string; structure: any }> {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.docx') {
    const buf = await fs.readFile(filePath)
    const res = await mammoth.extractRawText({ buffer: buf })
    const text = res.value || ''
    return { markdown: text, structure: { type: 'docx', length: text.length } }
  }
  if (ext === '.pdf') {
    const buf = await fs.readFile(filePath)
    const pdfParse = await loadPdfParse()
    const res = await pdfParse(buf)
    const text = res.text || ''
    return { markdown: text, structure: { type: 'pdf', length: text.length, pages: res.numpages } }
  }
  throw new Error(`Unsupported file type: ${ext}`)
}

app.post('/ingestion/start', async (req, reply) => {
  const id = (req.headers['x-request-id'] as string) || req.id
  const body = (req.body ?? {}) as { file?: string; doc_id?: string }
  if (!body.file) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'file path required' } })
  const docId = body.doc_id || path.basename(body.file, path.extname(body.file))

  try {
    const { markdown, structure } = await extractToMarkdown(body.file)

    // Write outputs to local out dir (mocking blob storage for now)
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
    const mdPath = path.join(OUTPUT_DIR, `${docId}.md`)
    const structPath = path.join(OUTPUT_DIR, `${docId}.structure.json`)
    await fs.writeFile(mdPath, markdown, 'utf8')
    await fs.writeFile(structPath, JSON.stringify(structure, null, 2), 'utf8')

    // Enqueue event
    const msg = { request_id: id, ts: new Date().toISOString(), doc_id: docId, outputs: { markdown: mdPath, structure: structPath } }
    await redis.xadd(STREAM, '*', 'json', JSON.stringify(msg))

    return { ok: true, doc_id: docId, outputs: msg.outputs }
  } catch (e: any) {
    req.log.error({ err: e }, 'extraction failed')
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app.get('/ingestion/result/:doc_id', async (req, reply) => {
  const params = req.params as { doc_id: string }
  const docId = params.doc_id
  const mdPath = path.join(OUTPUT_DIR, `${docId}.md`)
  const structPath = path.join(OUTPUT_DIR, `${docId}.structure.json`)
  try {
    const existsMd = await fs.access(mdPath).then(() => true).catch(() => false)
    const existsStruct = await fs.access(structPath).then(() => true).catch(() => false)
    if (!existsMd || !existsStruct) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'results not found' } })
    return { ok: true, outputs: { markdown: mdPath, structure: structPath } }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app.addHook('onClose', async () => {
  await redis.quit()
})

app
  .listen({ host: HOST, port: PORT })
  .then(() => app.log.info(`Ingestion service listening on ${HOST}:${PORT}, redis=${REDIS_URL}, stream=${STREAM}, out=${OUTPUT_DIR}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
