// ── The wedding day: edit date, time and venue here ──────────────────
// Used by the "When & where" section and the scrolling strip in the footer.

const PLUS_CODE = 'JV57+2VP Accra, Ghana' // Google plus code: pins the exact spot

export const WEDDING = {
  dateLabel: 'Saturday, 19 December 2026',
  shortDate: '19 December 2026',
  time: '11:00 AM',
  venue: 'New Creation International Church Headquarters',
  address: 'Palos Verdes Dr, Accra, Ghana',
  plusCode: 'JV57+2VP',
  mapEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(PLUS_CODE)}&z=16&output=embed`,
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(PLUS_CODE)}`,
}
