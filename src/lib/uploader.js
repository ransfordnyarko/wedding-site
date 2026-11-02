// Sign → upload straight to storage (with progress) → complete.

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `Upload failed (${res.status}). Please try again.`)
    err.fieldErrors = data.fieldErrors
    throw err
  }
  return data
}

function putWithProgress(signedUrl, blob, mime, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)
    xhr.setRequestHeader('Content-Type', mime)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(e.loaded / e.total) }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300
      ? (onProgress(1), resolve())
      : reject(new Error(`A file failed to upload (${xhr.status}). Please try again.`)))
    xhr.onerror = () => reject(new Error('Network error while uploading. Please try again.'))
    xhr.send(blob)
  })
}

/**
 * @param {object} p
 * @param {'memory'|'wedding'} p.kind
 * @param {{name:string, blob:Blob, mime:string, width?:number, height?:number, poster?:{blob:Blob}}[]} p.files
 * @param {(index:number, fraction:number) => void} p.onProgress
 */
export async function submitUpload({ kind, files, guestName, year, caption, website, onProgress }) {
  const signed = await postJson('/api/uploads/sign', {
    kind,
    website,
    files: files.map(f => ({
      name: f.name,
      mime: f.mime,
      size: f.blob.size,
      poster: f.poster ? { mime: 'image/jpeg', size: f.poster.blob.size } : undefined,
    })),
  })

  // A few files at a time keeps phones responsive on large wedding batches.
  const queue = files.map((f, i) => ({ f, i }))
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const { f, i } = job
      const target = signed.files[i]
      const posterShare = f.poster ? 0.05 : 0
      if (f.poster) await putWithProgress(target.poster.signedUrl, f.poster.blob, 'image/jpeg', p => onProgress(i, p * posterShare))
      await putWithProgress(target.signedUrl, f.blob, f.mime, p => onProgress(i, posterShare + p * (1 - posterShare)))
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, files.length) }, worker))

  return postJson('/api/uploads/complete', {
    token: signed.token,
    kind,
    year,
    caption,
    guestName,
    website,
    files: files.map(f => ({ width: f.width || null, height: f.height || null })),
  })
}
