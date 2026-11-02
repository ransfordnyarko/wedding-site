// GET   /api/admin/uploads           → { rows }  (vault files get 1-hour signed download links)
// PATCH /api/admin/uploads { id, status: 'visible' | 'hidden' } → { row }
// Header: x-admin-password: $ADMIN_PASSWORD
import { handler, body, httpError, supabaseAdmin, checkAdmin } from '../_lib/server.js'
import { BUCKET } from '../../src/lib/uploadLimits.js'

export default handler(['GET', 'PATCH'], async (req, res) => {
  checkAdmin(req)
  const db = supabaseAdmin()

  if (req.method === 'PATCH') {
    const { id, status } = body(req)
    if (!id || !['visible', 'hidden'].includes(status)) throw httpError(400, 'Invalid request.')
    const { data, error } = await db.from('guest_uploads').update({ status }).eq('id', id)
      .select('id, status').single()
    if (error) throw error
    return res.status(200).json({ row: data })
  }

  const { data: rows, error } = await db.from('guest_uploads')
    .select('id, kind, year, caption, guest_name, files, status, created_at')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) throw error

  const vault = db.storage.from(BUCKET.wedding)
  const memories = db.storage.from(BUCKET.memory)
  const withLinks = await Promise.all(rows.map(async r => {
    const files = await Promise.all((r.files || []).map(async f => {
      if (r.kind === 'memory') return { ...f, url: memories.getPublicUrl(f.path).data.publicUrl }
      const { data } = await vault.createSignedUrl(f.path, 3600, { download: f.path.split('/').pop() })
      return { ...f, url: data?.signedUrl }
    }))
    return { ...r, files }
  }))
  res.status(200).json({ rows: withLinks })
})
