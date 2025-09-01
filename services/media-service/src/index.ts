import Fastify from 'fastify'
import fs from 'node:fs/promises'
import path from 'node:path'

const app = Fastify({ logger: { level: 'info' } })

// Env
const HOST = process.env.MEDIA_SERVICE_HOST ?? '0.0.0.0'
const PORT = Number(process.env.MEDIA_SERVICE_PORT ?? 4030)
const OUTPUT_DIR = process.env.MEDIA_OUTPUT_DIR ?? path.resolve(process.cwd(), 'out')

app.get('/media/health', async () => ({ ok: true }))

app.post('/media/start', async (req, reply) => {
  const id = (req.headers['x-request-id'] as string) || req.id
  const body = (req.body ?? {}) as { doc_id?: string }
  const docId = body.doc_id || 'unknown'

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
    const mp4Path = path.join(OUTPUT_DIR, `${docId}.mp4`)
    const thumbPath = path.join(OUTPUT_DIR, `${docId}.thumb.jpg`)
    // mock content
    await fs.writeFile(mp4Path, Buffer.from('MOCK_MP4'))
    await fs.writeFile(thumbPath, Buffer.from('MOCK_JPG'))

    return { ok: true, doc_id: docId, outputs: { mp4: mp4Path, thumbnail: thumbPath } }
  } catch (e: any) {
    req.log.error({ err: e }, 'media start failed')
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app.get('/media/result/:doc_id', async (req, reply) => {
  const params = req.params as { doc_id: string }
  const docId = params.doc_id
  const mp4Path = path.join(OUTPUT_DIR, `${docId}.mp4`)
  const thumbPath = path.join(OUTPUT_DIR, `${docId}.thumb.jpg`)
  try {
    const existsMp4 = await fs.access(mp4Path).then(() => true).catch(() => false)
    const existsThumb = await fs.access(thumbPath).then(() => true).catch(() => false)
    if (!existsMp4 || !existsThumb) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'results not found' } })
    // Return gateway-friendly blob URLs
    const base = '/api/media'
    return { ok: true, outputs: { mp4: `${base}/blob/${encodeURIComponent(docId)}/mp4`, thumbnail: `${base}/blob/${encodeURIComponent(docId)}/thumbnail` } }
  } catch (e: any) {
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

// Blob endpoints to serve media
app.get('/media/blob/:doc_id/mp4', async (req, reply) => {
  const { doc_id } = req.params as { doc_id: string }
  try {
    const p = path.join(OUTPUT_DIR, `${doc_id}.mp4`)
    const buf = await fs.readFile(p)
    reply.header('content-type', 'video/mp4')
    return buf
  } catch (e: any) {
    if ((e as any)?.code === 'ENOENT') return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'mp4 not found' } })
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app.get('/media/blob/:doc_id/thumbnail', async (req, reply) => {
  const { doc_id } = req.params as { doc_id: string }
  try {
    const p = path.join(OUTPUT_DIR, `${doc_id}.thumb.jpg`)
    const buf = await fs.readFile(p)
    reply.header('content-type', 'image/jpeg')
    return buf
  } catch (e: any) {
    if ((e as any)?.code === 'ENOENT') return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'thumbnail not found' } })
    return reply.code(500).send({ error: { code: 'INTERNAL', message: String(e?.message || e) } })
  }
})

app
  .listen({ host: HOST, port: PORT })
  .then(() => app.log.info(`Media service listening on ${HOST}:${PORT}, out=${OUTPUT_DIR}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })

