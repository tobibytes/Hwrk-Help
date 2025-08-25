import Fastify from 'fastify'
import Redis from 'ioredis'
import fs from 'node:fs/promises'
import path from 'node:path'
import mammoth from 'mammoth'
import { LocalFsProvider } from './storage/local.js'
import { AzureBlobProvider } from './storage/azure.js'
import type { StorageProvider } from './storage/provider.js'

const app = Fastify({ logger: { level: 'info' } })

// Env
const HOST = process.env.INGESTION_SERVICE_HOST ?? '0.0.0.0'
const PORT = Number(process.env.INGESTION_SERVICE_PORT ?? 4010)
const REDIS_URL = process.env.REDIS_URL ?? 'redis://redis:6379'
const STREAM = process.env.INGEST_STREAM ?? 'ingest.request'
const OUTPUT_DIR = process.env.INGEST_OUTPUT_DIR ?? path.resolve(process.cwd(), 'out')
const STORAGE_PROVIDER = process.env.INGEST_STORAGE_PROVIDER ?? 'local'
const AZURE_CS = process.env.AZURE_STORAGE_CONNECTION_STRING
const AZURE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER ?? 'talvra'

let storage: StorageProvider
if (STORAGE_PROVIDER === 'azure') {
  if (!AZURE_CS) {
    throw new Error('INGEST_STORAGE_PROVIDER=azure but AZURE_STORAGE_CONNECTION_STRING is missing')
  }
  storage = new AzureBlobProvider(AZURE_CS, AZURE_CONTAINER)
} else {
  storage = new LocalFsProvider(OUTPUT_DIR)
}

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

    // Persist outputs via storage provider
    const mdKey = `artifacts/${docId}/content.md`
    const structKey = `artifacts/${docId}/structure.json`
    await storage.put(mdKey, markdown, 'text/markdown; charset=utf-8')
    await storage.put(structKey, JSON.stringify(structure, null, 2), 'application/json; charset=utf-8')

    // Enqueue event with logical keys
    const msg = { request_id: id, ts: new Date().toISOString(), doc_id: docId, outputs: { markdown: mdKey, structure: structKey } }
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
  const mdKey = `artifacts/${docId}/content.md`
  const structKey = `artifacts/${docId}/structure.json`
  try {
    const existsMd = await storage.exists(mdKey)
    const existsStruct = await storage.exists(structKey)
    if (!existsMd || !existsStruct) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'results not found' } })
    // Expose fetchable URLs via gateway path (proxy maps /api/ingestion -> /ingestion)
    const base = '/api/ingestion'
    return { ok: true, outputs: {
      markdown: `${base}/blob/${encodeURIComponent(docId)}/markdown`,
      structure: `${base}/blob/${encodeURIComponent(docId)}/structure`
    } }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

// Serve markdown blob
app.get('/ingestion/blob/:doc_id/markdown', async (req, reply) => {
  const params = req.params as { doc_id: string }
  const docId = params.doc_id
  const mdKey = `artifacts/${docId}/content.md`
  try {
    const { body } = await storage.get(mdKey)
    reply.header('content-type', 'text/markdown; charset=utf-8')
    return body.toString('utf8')
  } catch (e: any) {
    if ((e as any)?.statusCode === 404 || (e as any)?.code === 'ENOENT') return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'markdown not found' } })
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

// Serve structure JSON blob
app.get('/ingestion/blob/:doc_id/structure', async (req, reply) => {
  const params = req.params as { doc_id: string }
  const docId = params.doc_id
  const structKey = `artifacts/${docId}/structure.json`
  try {
    const { body } = await storage.get(structKey)
    const json = JSON.parse(body.toString('utf8'))
    reply.header('content-type', 'application/json; charset=utf-8')
    return json
  } catch (e: any) {
    if ((e as any)?.statusCode === 404 || (e as any)?.code === 'ENOENT') return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'structure not found' } })
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
