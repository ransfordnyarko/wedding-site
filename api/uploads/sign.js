// POST /api/uploads/sign  { kind, website, files: [{ name, mime, size, poster?: { mime, size } }] }
// → { token, files: [{ path, signedUrl, poster?: { path, signedUrl } }] }
import crypto from 'node:crypto'
import { handler, body, httpError, supabaseAdmin, clientIp, hashIp, signToken } from '../_lib/server.js'
import { LIMITS, BUCKET, MB, isAllowedMime, maxBytesFor } from '../../src/lib/uploadLimits.js'

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'video/mp4': 'mp4' }
const safeName = n => String(n || 'file').normalize('NFKD').replace(/[^\w.-]+/g, '_').slice(-80) || 'file'

export default handler(['POST'], async (req, res) => {
  const { kind, files, website } = body(req)
  if (website) throw httpError(400, 'Invalid submission.')            // honeypot
  if (kind !== 'memory' && kind !== 'wedding') throw httpError(400, 'Unknown upload type.')

  const max = kind === 'memory' ? LIMITS.memoryMaxFiles : LIMITS.weddingMaxFiles
  if (!Array.isArray(files) || files.length === 0) throw httpError(400, 'Choose at least one file.', { files: 'Choose at least one file.' })
  if (files.length > max) throw httpError(400, `Up to ${max} files at a time.`, { files: `Up to ${max} files at a time.` })

  for (const f of files) {
    if (!isAllowedMime(kind, f.mime)) throw httpError(400, `${f.name}: this file type isn't supported.`, { files: `${f.name}: this file type isn't supported.` })
    if (!(f.size > 0) || f.size > maxBytesFor(f.mime)) {
      const msg = `${f.name}: files must be under ${maxBytesFor(f.mime) / MB} MB.`
      throw httpError(400, msg, { files: msg })
    }
    if (f.poster && (kind !== 'memory' || f.poster.mime !== 'image/jpeg' || !(f.poster.size > 0) || f.poster.size > 5 * MB)) {
      throw httpError(400, 'Invalid video poster.')
    }
  }

  const db = supabaseAdmin()

  // Per-IP rate limit, counted at sign time.
  const ipHash = hashIp(clientIp(req))
  const since = new Date(Date.now() - 3600_000).toISOString()
  const { count, error: countErr } = await db.from('upload_attempts')
    .select('*', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since)
  if (countErr) throw countErr
  if (count >= LIMITS.submissionsPerHour) throw httpError(429, 'Too many uploads from this connection. Please try again in an hour.')
  await db.from('upload_attempts').insert({ ip_hash: ipHash })

  const uploadId = crypto.randomUUID()
  const bucket = db.storage.from(BUCKET[kind])
  const sign = async path => {
    const { data, error } = await bucket.createSignedUploadUrl(path)
    if (error) throw error
    return { path, signedUrl: data.signedUrl }
  }

  const out = []
  const record = []
  // Sign in small batches so a 300-photo wedding upload doesn't fire 300 requests at once.
  for (let start = 0; start < files.length; start += 20) {
    const batch = files.slice(start, start + 20)
    const signedBatch = await Promise.all(batch.map(async (f, j) => {
      const i = start + j
      const path = kind === 'memory'
        ? `${uploadId}/${i}.${EXT[f.mime]}`
        : `${uploadId}/${String(i).padStart(3, '0')}-${safeName(f.name)}`
      const main = await sign(path)
      const poster = f.poster ? await sign(`${uploadId}/${i}-poster.jpg`) : undefined
      return { main, poster, mime: f.mime }
    }))
    for (const s of signedBatch) {
      out.push({ ...s.main, poster: s.poster })
      record.push({ p: s.main.path, m: s.mime, pp: s.poster?.path })
    }
  }

  const token = signToken({ u: uploadId, k: kind, f: record, exp: Date.now() + 2 * 3600_000 })
  res.status(200).json({ token, files: out })
})
