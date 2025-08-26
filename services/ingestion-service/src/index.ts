import Fastify from 'fastify'
import Redis from 'ioredis'
import fs from 'node:fs/promises'
import path from 'node:path'
import mammoth from 'mammoth'
import TurndownService from 'turndown'
import { XMLParser } from 'fast-xml-parser'
import unzipper from 'unzipper'
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

async function extractFromBuffer(buf: Buffer, ext: string): Promise<{ markdown: string; structure: any }> {
  const lower = ext.toLowerCase()
  if (lower === '.docx') {
    const res = await mammoth.extractRawText({ buffer: buf })
    const text = res.value || ''
    return { markdown: text, structure: { type: 'docx', length: text.length } }
  }
  if (lower === '.pdf') {
    const pdfParse = await loadPdfParse()
    const res = await pdfParse(buf)
    const text = res.text || ''
    return { markdown: text, structure: { type: 'pdf', length: text.length, pages: res.numpages } }
  }
  if (lower === '.txt' || lower === '.md' || lower === '.markdown') {
    const text = buf.toString('utf8')
    return { markdown: text, structure: { type: lower === '.txt' ? 'txt' : 'md', length: text.length } }
  }
  if (lower === '.html' || lower === '.htm') {
    const html = buf.toString('utf8')
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
    const md = td.turndown(html)
    return { markdown: md, structure: { type: 'html', length: md.length } }
  }
  if (lower === '.pptx') {
    const slides = await extractPptxToMarkdown(buf)
    const md = slides.join('\n\n')
    return { markdown: md, structure: { type: 'pptx', slides: slides.length, length: md.length } }
  }
  throw new Error(`Unsupported file type: ${ext}`)
}

async function extractPptxToMarkdown(buf: Buffer): Promise<string[]> {
  // Open PPTX zip archive and extract text from slide XMLs
  const dir = await unzipper.Open.buffer(buf)
  const slideEntries = dir.files.filter((f) => f.path.startsWith('ppt/slides/slide') && f.path.endsWith('.xml'))
  slideEntries.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }))
  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true, trimValues: true })
  const slides: string[] = []
  for (let i = 0; i < slideEntries.length; i++) {
    const entry = slideEntries[i]
    const content = await entry.buffer()
    const xml = content.toString('utf8')
    const json = parser.parse(xml)
    // Text in DrawingML is usually under p:sld > p:cSld > p:spTree with runs a:r/a:t
    const texts: string[] = []
    function collect(node: any) {
      if (!node || typeof node !== 'object') return
      // a:t nodes contain text
      if (Object.prototype.hasOwnProperty.call(node, 't')) {
        const v = node.t
        if (typeof v === 'string' && v.trim()) texts.push(v.trim())
      }
      for (const k of Object.keys(node)) {
        const child = (node as any)[k]
        if (Array.isArray(child)) child.forEach(collect)
        else if (typeof child === 'object') collect(child)
      }
    }
    collect(json)
    const slideText = texts.join(' ')
    const md = `## Slide ${i + 1}\n\n${slideText}`
    slides.push(md)
  }
  if (slides.length === 0) return ['## Slide 1\n\n(No extractable text)']
  return slides
}

async function extractToMarkdown(filePath: string): Promise<{ markdown: string; structure: any }> {
  const ext = path.extname(filePath).toLowerCase()
  const buf = await fs.readFile(filePath)
  return extractFromBuffer(buf, ext)
}

function guessExtFromDataUrl(url: string): string {
  // Basic mapping for common types: html and pptx
  // data:[<mediatype>][;base64],<data>
  const m = /^data:([^;,]+)/.exec(url)
  const mt = (m?.[1] || '').toLowerCase()
  if (mt.includes('html')) return '.html'
  if (mt.includes('markdown')) return '.md'
  if (mt.includes('plain')) return '.txt'
  if (mt.includes('presentationml.presentation')) return '.pptx'
  return ''
}

app.post('/ingestion/start', async (req, reply) => {
  const id = (req.headers['x-request-id'] as string) || req.id
  const body = (req.body ?? {}) as {
    file?: string
    url?: string
    filename?: string
    doc_id?: string
    context?: { course_id?: string; assignment_id?: string; module_id?: string; module_item_id?: string }
    bearer_token?: string
  }

  try {
    let docId: string
    let markdown: string
    let structure: any

    if (body.file) {
      docId = body.doc_id || path.basename(body.file, path.extname(body.file))
      const res = await extractToMarkdown(body.file)
      markdown = res.markdown
      structure = res.structure
    } else if (body.url) {
      const url = body.url
      const filename = body.filename || new URL(url).pathname.split('/').pop() || 'document'
      const ext = path.extname(filename) || (url.startsWith('data:') ? guessExtFromDataUrl(url) : '')
      if (!ext) {
        return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'filename with extension required when using url' } })
      }
      const headers: Record<string, string> = {}
      if (body.bearer_token) headers['authorization'] = `Bearer ${body.bearer_token}`
      const res = await fetch(url, { headers })
      if (!res.ok) return reply.code(400).send({ error: { code: 'BAD_UPSTREAM', message: `failed to fetch url: ${res.status}` } })
      const arrayBuf = await res.arrayBuffer()
      const buf = Buffer.from(arrayBuf)
      const parsed = await extractFromBuffer(buf, ext)
      markdown = parsed.markdown
      structure = parsed.structure
      docId = body.doc_id || filename.replace(ext, '')
    } else {
      return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'file or url required' } })
    }

    // Persist outputs via storage provider
    const mdKey = `artifacts/${docId}/content.md`
    const structKey = `artifacts/${docId}/structure.json`
    await storage.put(mdKey, markdown, 'text/markdown; charset=utf-8')
    await storage.put(structKey, JSON.stringify(structure, null, 2), 'application/json; charset=utf-8')

    // Enqueue event with logical keys
    const msg = {
      request_id: id,
      ts: new Date().toISOString(),
      doc_id: docId,
      context: body.context ?? {},
      outputs: { markdown: mdKey, structure: structKey }
    }
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
