import Fastify from 'fastify'
import fs from 'node:fs/promises'
import path from 'node:path'

const app = Fastify({ logger: { level: 'info' } })

// Env
const HOST = process.env.AI_SERVICE_HOST ?? '0.0.0.0'
const PORT = Number(process.env.AI_SERVICE_PORT ?? 4020)
const OUTPUT_DIR = (() => {
  const v = process.env.AI_OUTPUT_DIR
  if (!v) return path.resolve(process.cwd(), 'out')
  return path.isAbsolute(v) ? v : path.resolve(process.cwd(), v)
})()
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small'
const INGESTION_BASE = process.env.INGESTION_SERVICE_URL || 'http://ingestion-service:4010'

app.get('/ai/health', async () => ({ ok: true }))

app.post('/ai/start', async (req, reply) => {
  const id = (req.headers['x-request-id'] as string) || req.id
  const body = (req.body ?? {}) as { doc_id?: string; markdown?: string }
  const docId = (body.doc_id || 'unknown').trim()
  if (!docId && !body.markdown) return reply.code(400).send({ error: { code: 'INVALID_ARGUMENT', message: 'doc_id or markdown required' } })

  const AI_GENERATION = (process.env.AI_GENERATION || 'stub').toLowerCase()
  const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini'

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    // Acquire markdown: body.markdown takes precedence; otherwise fetch from ingestion by doc_id
    let markdown = (body.markdown || '').trim()
    if (!markdown) {
      const mdRes = await fetch(`${INGESTION_BASE.replace(/\/$/, '')}/ingestion/blob/${encodeURIComponent(docId)}/markdown`)
      if (!mdRes.ok) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'markdown not found for doc' } })
      markdown = await mdRes.text()
    }

    let notes: string
    let flashcards: Array<{ q: string; a: string; hint?: string }>

    if (AI_GENERATION === 'real' && OPENAI_API_KEY) {
      // Trim markdown to avoid context overflow
      const MAX_CHARS = 12000
      const input = markdown.length > MAX_CHARS ? markdown.slice(0, MAX_CHARS) : markdown

      // Generate notes
      const notesPrompt = [
        { role: 'system', content: 'You are a concise study assistant. Produce clear, well-structured markdown notes (headings, bullets) that explain concepts. Avoid giving answers to graded questions; focus on understanding.' },
        { role: 'user', content: `Create study notes in markdown for the following material. Use headings and bullet points.\n\n---\n${input}` }
      ]
      const notesRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model: OPENAI_CHAT_MODEL, temperature: 0.2, messages: notesPrompt })
      })
      if (!notesRes.ok) throw new Error(`OpenAI notes failed: ${notesRes.status}`)
      const notesJson = await notesRes.json()
      notes = (notesJson.choices?.[0]?.message?.content || '').trim() || '# Notes\n\n(Empty)'

      // Generate flashcards
      const cardsPrompt = [
        { role: 'system', content: 'You create helpful study flashcards. Return ONLY a JSON array of objects with keys q (question), a (answer), and optional hint. Avoid exam answers; focus on concepts.' },
        { role: 'user', content: `Based on this material, create 8-12 flashcards. Return JSON only.\n\n---\n${input}` }
      ]
      const cardsRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model: OPENAI_CHAT_MODEL, temperature: 0.3, messages: cardsPrompt, response_format: { type: 'json_object' } })
      })
      if (!cardsRes.ok) throw new Error(`OpenAI flashcards failed: ${cardsRes.status}`)
      const cardsJson = await cardsRes.json()
      let raw = (cardsJson.choices?.[0]?.message?.content || '').trim()
      // Parse JSON. It could be array or object with an array
      try {
        const parsed = JSON.parse(raw)
        flashcards = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.flashcards) ? parsed.flashcards : [])
      } catch {
        // fallback minimal card
        flashcards = [{ q: 'What is the main idea?', a: 'Refer to notes.' }]
      }
      // Ensure shape
      flashcards = flashcards.map((c: any) => ({ q: String(c.q || c.question || ''), a: String(c.a || c.answer || ''), hint: c.hint ? String(c.hint) : undefined })).filter((c) => c.q && c.a)
      if (flashcards.length === 0) flashcards = [{ q: 'What is the main idea?', a: 'Refer to notes.' }]
    } else {
      // Stub generation
      notes = `# Notes for ${docId || '(manual)'}\n\nThis is a mock summary.\n`
      flashcards = [{ q: 'What is X?', a: 'X is Y.' }]
    }

    const effectiveDocId = docId || `manual-${Date.now()}`
    const notesPath = path.join(OUTPUT_DIR, `${effectiveDocId}.notes.md`)
    const cardsPath = path.join(OUTPUT_DIR, `${effectiveDocId}.flashcards.json`)
    await fs.writeFile(notesPath, notes, 'utf8')
    await fs.writeFile(cardsPath, JSON.stringify(flashcards, null, 2), 'utf8')

    const base = '/api/ai'
    return { ok: true, doc_id: effectiveDocId, outputs: { notes: `${base}/blob/${encodeURIComponent(effectiveDocId)}/notes`, flashcards: `${base}/blob/${encodeURIComponent(effectiveDocId)}/flashcards` } }
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
    const base = '/api/ai'
    return { ok: true, outputs: { notes: `${base}/blob/${encodeURIComponent(docId)}/notes`, flashcards: `${base}/blob/${encodeURIComponent(docId)}/flashcards` } }
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


// Serve AI output blobs
app.get('/ai/blob/:doc_id/notes', async (req, reply) => {
  const { doc_id } = req.params as { doc_id: string }
  const notesPath = path.join(OUTPUT_DIR, `${doc_id}.notes.md`)
  try {
    const buf = await fs.readFile(notesPath)
    reply.header('content-type', 'text/markdown; charset=utf-8')
    return buf.toString('utf8')
  } catch (e: any) {
    if ((e as any)?.code === 'ENOENT') return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'notes not found' } })
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app.get('/ai/blob/:doc_id/flashcards', async (req, reply) => {
  const { doc_id } = req.params as { doc_id: string }
  const cardsPath = path.join(OUTPUT_DIR, `${doc_id}.flashcards.json`)
  try {
    const json = JSON.parse(await fs.readFile(cardsPath, 'utf8'))
    reply.header('content-type', 'application/json; charset=utf-8')
    return json
  } catch (e: any) {
    if ((e as any)?.code === 'ENOENT') return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'flashcards not found' } })
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

