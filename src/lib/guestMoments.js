import { supabase, publicMemoryUrl } from './supabase'
import { MAX_MEDIA_PER_MOMENT, assertMoment } from '../content/thread'
import { isVideoMime } from './uploadLimits'

const TITLE_MAX = 80

function splitCaption(caption) {
  const text = (caption || '').trim()
  if (!text) return { title: 'A memory', body: '' }
  const [first, ...rest] = text.split(/\r?\n/)
  if (first.length <= TITLE_MAX) return { title: first.trim(), body: rest.join('\n').trim() }
  const cut = first.slice(0, TITLE_MAX).replace(/\s+\S*$/, '')
  return { title: `${cut}…`, body: text }
}

/** A `guest_uploads` row (kind = 'memory') → a Moment for the thread. */
export function rowToMoment(row) {
  const { title, body } = splitCaption(row.caption)
  const files = Array.isArray(row.files) ? row.files.slice(0, MAX_MEDIA_PER_MOMENT) : []
  const alt = row.caption?.trim().replace(/\s+/g, ' ') || `A memory from ${row.year}, shared by ${row.guest_name}`
  return assertMoment({
    id: `guest-${row.id}`,
    year: row.year,
    kicker: `From ${row.guest_name}`,
    title,
    body,
    kind: 'media',
    guestName: row.guest_name,
    createdAt: row.created_at,
    media: files.map((f, i) => {
      const label = files.length > 1 ? `${alt} (${i + 1} of ${files.length})` : alt
      return isVideoMime(f.mime)
        ? { type: 'video', src: publicMemoryUrl(f.path), poster: f.poster ? publicMemoryUrl(f.poster) : '', alt: label }
        : { type: 'image', src: publicMemoryUrl(f.path), alt: label, width: f.width || 1200, height: f.height || 1500 }
    }),
  })
}

const yearNum = y => (/^\d{4}$/.test(y) ? Number(y) : null)

/**
 * Couple moments keep their authored order. Each guest moment goes after the
 * couple's moments for its year (then by created_at). If the couple has no
 * moment in that year, it goes before the first couple moment with a later
 * numeric year. The add slide is always last.
 */
export function mergeMoments(couple, guests, addSlide) {
  const keyed = couple.map((m, i) => ({ m, a: i, b: 0, c: '' }))
  for (const g of guests) {
    let a = -1
    for (let i = couple.length - 1; i >= 0; i--) if (couple[i].year === g.year) { a = i; break }
    if (a >= 0) { keyed.push({ m: g, a, b: 1, c: g.createdAt || '' }); continue }
    const gy = yearNum(g.year)
    const later = couple.findIndex(m => yearNum(m.year) !== null && gy !== null && yearNum(m.year) > gy)
    keyed.push({ m: g, a: later >= 0 ? later : couple.length, b: -1, c: g.createdAt || '' })
  }
  keyed.sort((x, y) => x.a - y.a || x.b - y.b || (x.c < y.c ? -1 : x.c > y.c ? 1 : 0))
  return [...keyed.map(k => k.m), addSlide]
}

export async function fetchVisibleMemories() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('guest_uploads')
    .select('id, year, caption, guest_name, files, created_at')
    .eq('kind', 'memory')
    .eq('status', 'visible')
    .order('created_at', { ascending: true })
    .limit(500)
  if (error) throw error
  return data
}
