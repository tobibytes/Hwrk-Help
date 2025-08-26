import Fastify from 'fastify'
import fs from 'node:fs/promises'
import path from 'node:path'

const app = Fastify({ logger: { level: 'info' } })

// Env
const HOST = process.env.AI_SERVICE_HOST ?? '0.0.0.0'
const PORT = Number(process.env.AI_SERVICE_PORT ?? 4020)
const OUTPUT_DIR = process.env.AI_OUTPUT_DIR ?? path.resolve(process.cwd(), 'out')
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small'
const INGESTION_BASE = process.env.INGESTION_SERVICE_URL || 'http://ingestion-service:4010'

app.get('/ai/health', async () => ({ ok: true }))

app.post('/ai/start', async (req, reply) => {
  const id = (req.headers['x-request-id'] as string) || req.id
  const body = (req.body ?? {}) as { doc_id?: string; markdown?: string }
  const docId = body.doc_id || 'unknown'

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
    const notes = `# Notes for ${docId}\n\nThis is a mock summary.\n`
    const flashcards = [{ q: 'What is X?', a: 'X is Y.' }]

    const notesPath = path.join(OUTPUT_DIR, `${docId}.notes.md`)
    const cardsPath = path.join(OUTPUT_DIR, `${docId}.flashcards.json`)
    await fs.writeFile(notesPath, notes, 'utf8')
    await fs.writeFile(cardsPath, JSON.stringify(flashcards, null, 2), 'utf8')

    return { ok: true, doc_id: docId, outputs: { notes: notesPath, flashcards: cardsPath } }
  } catch (e: any) {
    req.log.error({ err: e }, 'ai start failed')
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app.get('/ai/result/:doc_id', async (req, reply) => {
  const params = req.params as { doc_id: string }
  const docId = params.doc_id
  const notesPath = path.join(OUTPUT_DIR, `${docId}.notes.md`)
  const cardsPath = path.join(OUTPUT_DIR, `${docId}.flashcards.json`)
  try {
    const existsNotes = await fs.access(notesPath).then(() => true).catch(() => false)
    const existsCards = await fs.access(cardsPath).then(() => true).catch(() => false)
    if (!existsNotes || !existsCards) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'results not found' } })
    return { ok: true, outputs: { notes: notesPath, flashcards: cardsPath } }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

// -------- RAG scaffolding: chunk + embed + search --------
function chunkText(text: string, maxLen = 1200, overlap = 200): string[] {
  const chunks: string[] = []
  let i = 0
  while (i < text.length) {
    const end = Math.min(text.length, i + maxLen)
    chunks.push(text.slice(i, end))
    if (end === text.length) break
    i = Math.max(i + maxLen - overlap, end)
  }
  return chunks
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!OPENAI_API_KEY) {
    // Fallback: deterministic pseudo-embeddings for dev
    return texts.map((t) => {
      const v = new Array(64).fill(0).map((_, idx) => {
        let h = 0
        const s = t.slice(idx, idx + 32)
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000
        return h / 1000
      })
      return v
    })
  }
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: OPENAI_EMBED_MODEL, input: texts })
  })
  if (!res.ok) throw new Error(`OpenAI embeddings failed: ${res.status}`)
  const json = (await res.json()) as { data: Array<{ embedding: number[] }> }
  return json.data.map((d) => d.embedding)
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  if (!na || !nb) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

app.post('/ai/embed', async (req, reply) => {
  const body = (req.body ?? {}) as { doc_id?: string; force?: boolean }
  const docId = body.doc_id?.trim()
  const force = Boolean(body.force)
  if (!docId) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'doc_id required' } })
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
    const outPath = path.join(OUTPUT_DIR, `${docId}.embeddings.json`)
    const exists = await fs.access(outPath).then(() => true).catch(() => false)
    if (exists && !force) {
      return { ok: true, doc_id: docId, skipped: 'exists' }
    }
    const mdRes = await fetch(`${INGESTION_BASE.replace(/\/$/, '')}/ingestion/blob/${encodeURIComponent(docId)}/markdown`)
    if (!mdRes.ok) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'markdown not found' } })
    const text = await mdRes.text()
    const chunks = chunkText(text)
    const vecs = await embedTexts(chunks)
    const payload = { doc_id: docId, model: OPENAI_EMBED_MODEL, chunks: chunks.map((t, i) => ({ id: `${docId}-${i}`, text: t, vector: vecs[i] })) }
    await fs.writeFile(outPath, JSON.stringify(payload), 'utf8')
    return { ok: true, doc_id: docId, count: chunks.length }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app.get('/ai/search', async (req, reply) => {
  const q = ((req.query as any)?.q ?? '').toString().trim()
  const docId = ((req.query as any)?.doc_id ?? '').toString().trim() || null
  const kRaw = Number((req.query as any)?.k ?? 5)
  const k = Number.isFinite(kRaw) ? Math.max(1, Math.min(kRaw, 20)) : 5
  if (!q) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'q required' } })
  try {
    if (!docId) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'doc_id required (per-doc search for now)' } })
    const embPath = path.join(OUTPUT_DIR, `${docId}.embeddings.json`)
    const exists = await fs.access(embPath).then(() => true).catch(() => false)
    if (!exists) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'no embeddings for doc (run /ai/embed first)' } })
    const payload = JSON.parse(await fs.readFile(embPath, 'utf8')) as { chunks: Array<{ id: string; text: string; vector: number[] }> }
    const qVec = (await embedTexts([q]))[0]
    const scored = payload.chunks.map((c) => ({ id: c.id, text: c.text, score: cosine(qVec, c.vector) }))
    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, k).map((s) => ({ id: s.id, doc_id: docId, score: s.score, snippet: s.text.slice(0, 300) + (s.text.length > 300 ? ' …' : '') }))
    return { ok: true, q, results: top }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app
  .listen({ host: HOST, port: PORT })
  .then(() => app.log.info(`AI service listening on ${HOST}:${PORT}, out=${OUTPUT_DIR}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })

