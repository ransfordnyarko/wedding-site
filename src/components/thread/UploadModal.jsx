import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { COUPLE } from '../../content/thread'
import { GUEST_YEARS, LIMITS, MB, maxBytesFor } from '../../lib/uploadLimits'
import { captureVideoPoster, guessMime, isHeic, isVideoFile, prepareMemoryImage } from '../../lib/media'
import { submitUpload } from '../../lib/uploader'
import styles from './UploadModal.module.css'

const MEMORY_ACCEPT = 'image/jpeg,image/png,image/heic,image/heif,.heic,.heif,video/mp4'
const WEDDING_ACCEPT = 'image/*,video/*,.heic,.heif'

let nextFileId = 0

function checkFile(kind, file) {
  const mime = guessMime(file)
  if (kind === 'memory') {
    const ok = ['image/jpeg', 'image/png', 'video/mp4'].includes(mime) || isHeic(file)
    if (!ok) return `${file.name}: use JPG, PNG, HEIC or MP4.`
  } else if (!mime.startsWith('image/') && !mime.startsWith('video/')) {
    return `${file.name}: only photos and videos, please.`
  }
  const max = maxBytesFor(mime)
  if (file.size > max) return `${file.name}: ${isVideoFile(file) ? 'videos' : 'photos'} must be under ${max / MB} MB.`
  return null
}

function FileThumb({ entry, className }) {
  const [failed, setFailed] = useState(false)
  if (isVideoFile(entry.file)) {
    return <video className={className} src={entry.url} muted playsInline preload="metadata" aria-hidden="true" />
  }
  if (failed) return <div className={`${className} ${styles.thumbFallback}`} aria-hidden="true">{entry.file.name.split('.').pop()?.toUpperCase()}</div>
  return <img className={className} src={entry.url} alt="" onError={() => setFailed(true)} />
}

export default function UploadModal({ onClose, onMemoryAdded }) {
  const dialogRef = useRef(null)
  const uid = useId()
  const [tab, setTab] = useState('memory')
  const [year, setYear] = useState(null)
  const [caption, setCaption] = useState('')
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [files, setFiles] = useState({ memory: [], wedding: [] })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | preparing | uploading
  const [progress, setProgress] = useState([])
  const [weddingDone, setWeddingDone] = useState(0)
  const busy = status !== 'idle'
  const list = files[tab]
  const isMemory = tab === 'memory'

  // Open as a modal (native focus trapping + Esc), lock page scroll.
  useEffect(() => {
    // Don't call close() in cleanup: StrictMode runs cleanup+effect again on
    // mount, and close() fires a 'close' event that would unmount the modal.
    // Unmounting removes the dialog from the top layer anyway.
    const d = dialogRef.current
    if (!d.open) d.showModal()
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = prev }
  }, [])

  // Release object URLs when the modal goes away.
  const filesRef = useRef(files)
  useEffect(() => { filesRef.current = files }, [files])
  useEffect(() => () => {
    Object.values(filesRef.current).flat().forEach(f => URL.revokeObjectURL(f.url))
  }, [])

  const requestClose = () => { if (!busy) dialogRef.current.close() }

  const addFiles = fileList => {
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return
    const errs = []
    const accepted = []
    for (const file of incoming) {
      const err = checkFile(tab, file)
      if (err) errs.push(err)
      else accepted.push({ id: ++nextFileId, file, url: URL.createObjectURL(file) })
    }
    let next = [...list, ...accepted]
    if (isMemory && next.length > LIMITS.memoryMaxFiles) {
      next.slice(LIMITS.memoryMaxFiles).forEach(f => URL.revokeObjectURL(f.url))
      next = next.slice(0, LIMITS.memoryMaxFiles)
      errs.push(`A memory holds up to ${LIMITS.memoryMaxFiles} files. Add another memory for the rest.`)
    }
    setFiles(f => ({ ...f, [tab]: next }))
    setErrors(e => ({ ...e, files: errs.join(' ') || undefined, form: undefined }))
  }

  const removeFile = id => {
    setFiles(f => {
      const gone = f[tab].find(x => x.id === id)
      if (gone) URL.revokeObjectURL(gone.url)
      return { ...f, [tab]: f[tab].filter(x => x.id !== id) }
    })
  }

  const validate = () => {
    const e = {}
    if (!list.length) e.files = 'Choose at least one photo or video.'
    if (!name.trim()) e.name = 'Please add your name.'
    else if (name.trim().length > LIMITS.nameMaxChars) e.name = `Keep it under ${LIMITS.nameMaxChars} characters.`
    if (isMemory) {
      if (!year) e.year = 'Pick the year this memory is from.'
      if (caption.length > LIMITS.captionMaxChars) e.caption = `Captions can be up to ${LIMITS.captionMaxChars} characters.`
    }
    return e
  }

  const onSubmit = async ev => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      const first = ['year', 'files', 'caption', 'name'].find(k => e[k])
      dialogRef.current.querySelector(`[data-field="${first}"]`)?.focus()
      return
    }

    try {
      setStatus('preparing')
      let prepared
      if (isMemory) {
        prepared = await Promise.all(list.map(async ({ file }) => {
          if (isVideoFile(file)) {
            let poster = null
            try { poster = await captureVideoPoster(file) } catch (err) {
              // Still allow the upload if only the poster grab failed for a valid MP4.
              if (guessMime(file) !== 'video/mp4') throw err
            }
            return { name: file.name, blob: file, mime: 'video/mp4', width: poster?.width, height: poster?.height, poster: poster && { blob: poster.blob } }
          }
          const img = await prepareMemoryImage(file)
          return { name: file.name, blob: img.blob, mime: img.mime, width: img.width, height: img.height }
        }))
      } else {
        prepared = list.map(({ file }) => ({ name: file.name, blob: file, mime: guessMime(file) }))
      }

      setStatus('uploading')
      setProgress(prepared.map(() => 0))
      const result = await submitUpload({
        kind: tab,
        files: prepared,
        guestName: name.trim(),
        year: isMemory ? year : null,
        caption: isMemory ? caption.trim() : null,
        website,
        onProgress: (i, p) => setProgress(ps => { const c = [...ps]; c[i] = p; return c }),
      })

      setStatus('idle')
      if (isMemory) {
        onMemoryAdded(result.row)
      } else {
        setWeddingDone(list.length)
        files.wedding.forEach(f => URL.revokeObjectURL(f.url))
        setFiles(f => ({ ...f, wedding: [] }))
        setProgress([])
      }
    } catch (err) {
      setStatus('idle')
      setProgress([])
      setErrors({ ...(err.fieldErrors || {}), form: err.message || 'Something went wrong. Please try again.' })
    }
  }

  const onTabKey = e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = tab === 'memory' ? 'wedding' : 'memory'
    setTab(next)
    setErrors({})
    document.getElementById(`${uid}-tab-${next}`)?.focus()
  }
  const pickTab = t => { if (!busy) { setTab(t); setErrors({}) } }

  const err = k => errors[k] && <p id={`${uid}-${k}-err`} className={styles.error}>{errors[k]}</p>
  const describedBy = (k, extra) => [errors[k] && `${uid}-${k}-err`, extra].filter(Boolean).join(' ') || undefined

  const first = files.memory[0]

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`${uid}-title`}
      onCancel={e => { if (busy) e.preventDefault() }}
      onClose={onClose}
      onClick={e => { if (e.target === dialogRef.current) requestClose() }}
    >
      <div className={styles.panel}>
        <button type="button" className={styles.close} aria-label="Close" onClick={requestClose} disabled={busy}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.titleBlock}>
            <span className={styles.label}>2026 · The last swipe</span>
            <h2 id={`${uid}-title`} className={styles.title}>Add to <em>our story</em></h2>
          </div>

          <div role="tablist" aria-label="What are you sharing?" className={styles.tabs} onKeyDown={onTabKey}>
            {[
              ['wedding', 'On the wedding day', 'December 2026 · photos and videos'],
              ['memory', 'From earlier years', '2017 to 2025 · joins the thread now'],
            ].map(([t, main, sub]) => (
              <button
                key={t}
                id={`${uid}-tab-${t}`}
                type="button"
                role="tab"
                aria-selected={tab === t}
                aria-controls={`${uid}-panel`}
                tabIndex={tab === t ? 0 : -1}
                className={styles.tab}
                onClick={() => pickTab(t)}
              >
                <span className={styles.tabMain}>{main}</span>
                <span className={styles.tabSub}>{sub}</span>
              </button>
            ))}
          </div>

          <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${tab}`} className={styles.fields}>
            {!isMemory && weddingDone > 0 && (
              <p className={styles.success} role="status">
                {weddingDone === 1 ? 'Your file is' : `All ${weddingDone} files are`} in the vault. Thank you! Add more any time.
              </p>
            )}

            {isMemory && (
              <div className={styles.field}>
                <span id={`${uid}-year-label`} className={styles.label}>Which year?</span>
                <div role="group" aria-labelledby={`${uid}-year-label`} aria-describedby={describedBy('year')} className={styles.years}>
                  {GUEST_YEARS.map((y, k) => (
                    <button
                      key={y}
                      type="button"
                      data-field={k === 0 ? 'year' : undefined}
                      aria-pressed={year === y}
                      className={styles.yearBtn}
                      onClick={() => { setYear(y); setErrors(e => ({ ...e, year: undefined })) }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
                {err('year')}
              </div>
            )}

            <div className={styles.field}>
              <label
                className={`${styles.drop} ${errors.files ? styles.invalid : ''}`}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add(styles.dropOver) }}
                onDragLeave={e => e.currentTarget.classList.remove(styles.dropOver)}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove(styles.dropOver); if (!busy) addFiles(e.dataTransfer.files) }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
                <span className={styles.dropMain}>Drop photos or videos here, or <u>browse</u></span>
                <span id={`${uid}-drop-hint`} className={styles.dropHint}>
                  {isMemory ? 'Up to 3 per moment · JPG, PNG, HEIC, MP4' : 'As many as you like · full quality is kept'}
                </span>
                <input
                  key={tab}
                  data-field="files"
                  className={styles.fileInput}
                  type="file"
                  multiple
                  accept={isMemory ? MEMORY_ACCEPT : WEDDING_ACCEPT}
                  disabled={busy}
                  aria-describedby={describedBy('files', `${uid}-drop-hint`)}
                  aria-invalid={Boolean(errors.files)}
                  onChange={e => { addFiles(e.target.files); e.target.value = '' }}
                />
              </label>
              {err('files')}
              {list.length > 0 && (
                <ul className={styles.fileList} aria-label="Chosen files">
                  {list.map((f, i) => (
                    <li key={f.id} className={styles.fileRow}>
                      <FileThumb entry={f} className={styles.fileThumb} />
                      <span className={styles.fileName}>{f.file.name}</span>
                      {status === 'uploading'
                        ? <progress className={styles.fileProgress} max="1" value={progress[i] || 0} aria-label={`Uploading ${f.file.name}`} />
                        : (
                          <button type="button" className={styles.fileRemove} onClick={() => removeFile(f.id)} disabled={busy} aria-label={`Remove ${f.file.name}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                          </button>
                        )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isMemory && (
              <div className={styles.field}>
                <label htmlFor={`${uid}-caption`} className={styles.label}>Caption</label>
                <textarea
                  id={`${uid}-caption`}
                  data-field="caption"
                  rows={2}
                  className={`${styles.input} ${errors.caption ? styles.invalid : ''}`}
                  placeholder="Where was this, and what was happening?"
                  value={caption}
                  onChange={e => { setCaption(e.target.value); if (errors.caption) setErrors(x => ({ ...x, caption: undefined })) }}
                  aria-invalid={Boolean(errors.caption)}
                  aria-describedby={describedBy('caption', `${uid}-count`)}
                />
                <span id={`${uid}-count`} className={`${styles.count} ${caption.length > LIMITS.captionMaxChars ? styles.countOver : ''}`}>
                  {caption.length} / {LIMITS.captionMaxChars}
                </span>
                {err('caption')}
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor={`${uid}-name`} className={styles.label}>Your name</label>
              <input
                id={`${uid}-name`}
                data-field="name"
                type="text"
                autoComplete="name"
                className={`${styles.input} ${errors.name ? styles.invalid : ''}`}
                placeholder="So we know who to thank"
                value={name}
                onChange={e => { setName(e.target.value); if (errors.name) setErrors(x => ({ ...x, name: undefined })) }}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy('name')}
                required
              />
              {err('name')}
            </div>

            {/* Honeypot: invisible to people, tempting to bots. */}
            <div className={styles.honeypot} aria-hidden="true">
              <label>Website <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.submit} disabled={busy}>
                {status === 'preparing' ? 'Preparing…' : status === 'uploading' ? 'Uploading…' : isMemory ? 'Add to the thread' : 'Send to the vault'}
              </button>
              <span className={styles.fine}>{isMemory ? 'Shows on the thread straight away.' : 'Private until the montage is ready.'}</span>
            </div>
            {errors.form && <p className={styles.formError} role="alert">{errors.form}</p>}
          </div>
        </form>

        <aside className={styles.aside} aria-label={isMemory ? 'Preview' : 'Where it goes'}>
          <span className={styles.label}>{isMemory ? 'How it will look on the thread' : 'Where it goes'}</span>
          {isMemory ? (
            <>
              <div className={styles.preview}>
                <svg viewBox="0 0 500 100" preserveAspectRatio="none" aria-hidden="true" className={styles.previewThread}>
                  <path d="M0 64 C40 64 110 56 110 32 C110 8 60 8 60 32 C60 56 130 72 230 68 C330 64 400 22 500 40" fill="none" stroke="#8A7A6A" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className={styles.previewKnot} aria-hidden="true" />
                <span className={styles.previewMeta}>{year || '[Year]'} · Added by {name.trim() || 'you'}</span>
                {first
                  ? <FileThumb entry={first} className={styles.previewImg} />
                  : <div className={styles.previewEmpty}>Your photo</div>}
                <p className={styles.previewCaption}>{caption.trim() || 'Your caption appears here, in your words.'}</p>
              </div>
              <p className={styles.asideNote}>
                Lands in {year || 'that year'} on the thread as soon as you hit Add. A moment holds 3 photos at most; yours opens a new loop beside the others.
              </p>
            </>
          ) : (
            <div className={styles.vault}>
              <div className={styles.vaultTiles} aria-hidden="true">
                <span /><span />
                <span className={styles.vaultLock}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="5" y="11" width="14" height="9" rx="1" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                </span>
              </div>
              <p className={styles.vaultTitle}>Kept for the montage.</p>
              <p className={styles.asideNote}>
                Wedding-day photos and videos go into a private vault only {COUPLE.groom} and {COUPLE.bride} can open. We'll cut them into a film after the day and share it here.
              </p>
            </div>
          )}
        </aside>
      </div>
    </dialog>,
    document.body,
  )
}
