import Fastify from 'fastify'
import fs from 'node:fs/promises'
import path from 'node:path'

const app = Fastify({ logger: { level: 'info' } })

// Env
const HOST = process.env.AI_SERVICE_HOST ?? '0.0.0.0'
const PORT = Number(process.env.AI_SERVICE_PORT ?? 4020)
const OUTPUT_DIR = process.env.AI_OUTPUT_DIR ?? path.resolve(process.cwd(), 'out')

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

app
  .listen({ host: HOST, port: PORT })
  .then(() => app.log.info(`AI service listening on ${HOST}:${PORT}, out=${OUTPUT_DIR}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })

