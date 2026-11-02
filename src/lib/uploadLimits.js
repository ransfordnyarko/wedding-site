// Shared by the browser and the /api functions, so both enforce the same rules.
// Adjust the size limits to your Supabase plan (the Free plan caps any single
// file at 50 MB regardless of what is set here).

export const MB = 1024 * 1024

export const LIMITS = {
  imageMaxBytes: 20 * MB,
  videoMaxBytes: 200 * MB,
  memoryMaxFiles: 3,
  weddingMaxFiles: 500,       // "no count limit" in practice; a sanity cap per submission
  captionMaxChars: 280,
  nameMaxChars: 80,
  submissionsPerHour: 10,     // per IP
}

// What actually gets stored. Memory images are re-encoded in the browser
// (which strips EXIF/GPS and turns HEIC into JPEG), so only these land in
// the public bucket.
export const MEMORY_MIME = ['image/jpeg', 'image/png', 'video/mp4']
// The vault keeps originals at full quality, including iPhone HEIC and MOV.
export const WEDDING_MIME_PREFIXES = ['image/', 'video/']

export const isVideoMime = mime => mime.startsWith('video/')

export function maxBytesFor(mime) {
  return isVideoMime(mime) ? LIMITS.videoMaxBytes : LIMITS.imageMaxBytes
}

export function isAllowedMime(kind, mime) {
  if (typeof mime !== 'string') return false
  return kind === 'memory'
    ? MEMORY_MIME.includes(mime)
    : WEDDING_MIME_PREFIXES.some(p => mime.startsWith(p))
}

/** Years a guest can choose when adding an earlier memory. */
export const GUEST_YEARS = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']

export const BUCKET = { memory: 'memories', wedding: 'vault' }
