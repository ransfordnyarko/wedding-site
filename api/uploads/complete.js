// POST /api/uploads/complete  { token, kind, year, caption, guestName, website, files: [{ width, height }] }
// → { row }   (row is only returned for memories; wedding rows stay private)
import { handler, body, httpError, supabaseAdmin, verifyToken } from '../_lib/server.js'
import { LIMITS, BUCKET, GUEST_YEARS, maxBytesFor } from '../../src/lib/uploadLimits.js'

export default handler(['POST'], async (req, res) => {
  const { token, kind, year, caption, guestName, website, files = [] } = body(req)
  if (website) throw httpError(400, 'Invalid submission.')
  const session = verifyToken(token)
  if (session.k !== kind) throw httpError(400, 'Invalid upload session.')

  const fieldErrors = {}
  const name = String(guestName || '').trim()
  if (!name) fieldErrors.name = 'Please add your name.'
  else if (name.length > LIMITS.nameMaxChars) fieldErrors.name = `Keep it under ${LIMITS.nameMaxChars} characters.`
  const text = String(caption || '').trim()
  if (kind === 'memory') {
    if (!GUEST_YEARS.includes(year)) fieldErrors.year = 'Pick a year between 2017 and 2025.'
    if (text.length > LIMITS.captionMaxChars) fieldErrors.caption = `Captions can be up to ${LIMITS.captionMaxChars} characters.`
  }
  if (Object.keys(fieldErrors).length) throw httpError(400, 'Please fix the highlighted fields.', fieldErrors)

  // Check what actually landed in storage: every issued file must exist,
  // with an allowed type and size (the client can't be trusted on this).
  const db = supabaseAdmin()
  const bucket = db.storage.from(BUCKET[kind])
  const { data: listed, error } = await bucket.list(session.u, { limit: 1000 })
  if (error) throw error
  const byName = new Map(listed.map(o => [`${session.u}/${o.name}`, o]))
  for (const f of session.f) {
    const obj = byName.get(f.p)
    if (!obj) throw httpError(400, 'Some files did not finish uploading. Please try again.')
    const size = obj.metadata?.size ?? 0
    const mime = obj.metadata?.mimetype ?? ''
    if (size > maxBytesFor(f.m) || mime.split(';')[0] !== f.m) {
      await bucket.remove(session.f.flatMap(x => [x.p, x.pp].filter(Boolean)))
      throw httpError(400, 'A file did not match what was declared. Please try again.')
    }
  }

  const stored = session.f.map((f, i) => ({
    path: f.p,
    mime: f.m,
    width: Number.isFinite(files[i]?.width) ? files[i].width : null,
    height: Number.isFinite(files[i]?.height) ? files[i].height : null,
    ...(f.pp ? { poster: f.pp } : {}),
  }))

  const { data: row, error: insErr } = await db.from('guest_uploads').insert({
    upload_id: session.u,
    kind,
    year: kind === 'memory' ? year : null,
    caption: kind === 'memory' ? text || null : null,
    guest_name: name,
    files: stored,
  }).select('id, kind, year, caption, guest_name, files, created_at').single()
  if (insErr) {
    // A replayed token hits the unique index on upload_id.
    throw insErr.code === '23505' ? httpError(409, 'This upload was already saved.') : insErr
  }

  res.status(200).json({ row: kind === 'memory' ? row : { id: row.id, kind: 'wedding' } })
})
