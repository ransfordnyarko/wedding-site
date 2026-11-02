// Browser-side preparation of guest files before upload.

const MEMORY_MAX_EDGE = 2560

export const isHeic = file =>
  /image\/hei[cf]/.test(file.type) || /\.hei[cf]$/i.test(file.name)

export const isVideoFile = file =>
  file.type.startsWith('video/') || /\.(mp4|mov|m4v)$/i.test(file.name)

/** Best-guess mime for files the OS left untyped (HEIC often is). */
export function guessMime(file) {
  if (file.type) return file.type
  if (isHeic(file)) return 'image/heic'
  if (/\.mp4$/i.test(file.name)) return 'video/mp4'
  if (/\.mov$/i.test(file.name)) return 'video/quicktime'
  return 'application/octet-stream'
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('encode failed'))), type, quality))
}

/**
 * Re-encodes an image through a canvas. This drops all EXIF (including GPS),
 * applies the orientation flag, converts HEIC to JPEG where the browser can
 * decode it (Safari can; most others can't), and caps the long edge.
 */
export async function prepareMemoryImage(file) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(isHeic(file)
      ? `${file.name}: this browser can't read HEIC. Try again from your iPhone, or export it as JPG.`
      : `${file.name}: couldn't read this image.`)
  }
  const scale = Math.min(1, MEMORY_MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()
  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const blob = await canvasToBlob(canvas, type, 0.9)
  return { blob, mime: type, width, height }
}

/** Grabs the first frame of a video as a JPEG poster, and checks it plays. */
export function captureVideoPoster(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    const done = (fn, arg) => { URL.revokeObjectURL(url); video.removeAttribute('src'); video.load(); fn(arg) }
    const timer = setTimeout(() => done(reject, new Error(`${file.name}: couldn't read this video. Please use MP4 (H.264).`)), 15000)
    video.onerror = () => { clearTimeout(timer); done(reject, new Error(`${file.name}: this video can't play in a browser. Please use MP4 (H.264).`)) }
    video.onloadeddata = () => { video.currentTime = Math.min(0.1, video.duration || 0) }
    video.onseeked = async () => {
      clearTimeout(timer)
      try {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight))
        canvas.width = Math.round(video.videoWidth * scale)
        canvas.height = Math.round(video.videoHeight * scale)
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        const blob = await canvasToBlob(canvas, 'image/jpeg', 0.85)
        done(resolve, { blob, width: video.videoWidth, height: video.videoHeight })
      } catch (e) { done(reject, e) }
    }
    video.src = url
  })
}
