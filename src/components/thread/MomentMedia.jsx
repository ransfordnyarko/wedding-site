import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import MetOnCampus from './MetOnCampus'
import styles from './Thread.module.css'

// Media rows are laid out at each item's own aspect ratio (no cropping on
// desktop): column widths are proportional to width/height, so every item in
// a row ends up the same height, and the row is capped at MEDIA_H tall.
const MEDIA_H = 460
const GAP = 16
const ratioOf = item => (item.width && item.height ? item.width / item.height : item.type === 'video' ? 16 / 10 : 4 / 5)

/** <img> that turns into a labelled dashed box while the real file is missing. */
function ThreadImage({ item, eager, className, style }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className={`${styles.placeholder} ${className || ''}`} style={style} role="img" aria-label={item.alt}>
        <span>{item.alt}</span>
        <small>{item.src.split('/').pop()}</small>
      </div>
    )
  }
  return (
    <img
      className={className}
      style={style}
      src={item.src}
      alt={item.alt}
      width={item.width}
      height={item.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable="false"
      onError={() => setFailed(true)}
    />
  )
}

function PlayIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
}

/** Poster + round play button; plays inline in the slide (no lightbox). */
function ThreadVideo({ item, active, eager, className, style }) {
  const [playing, setPlaying] = useState(false)
  const [broken, setBroken] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => { if (!active) videoRef.current?.pause() }, [active])

  if (playing && !broken) {
    return (
      <div className={`${styles.videoWrap} ${className || ''}`} style={style}>
        <video
          ref={videoRef}
          className={styles.videoEl}
          src={item.src}
          poster={item.poster || undefined}
          controls
          autoPlay
          playsInline
          aria-label={item.alt}
          onError={() => setBroken(true)}
        />
      </div>
    )
  }
  return (
    <div className={`${styles.videoWrap} ${className || ''}`} style={style}>
      {item.poster
        ? <ThreadImage item={{ src: item.poster, alt: item.alt, width: item.width || 1600, height: item.height || 1000 }} eager={eager} className={styles.videoPoster} />
        : <div className={`${styles.placeholder} ${styles.videoPoster}`} aria-hidden="true" />}
      {broken
        ? <span className={styles.videoMissing}>Video not found: {item.src.split('/').pop()}</span>
        : (
          <button type="button" className={styles.playBtn} aria-label={`Play video: ${item.alt}`} onClick={() => setPlaying(true)}>
            <PlayIcon />
          </button>
        )}
      {item.durationLabel && <span className={styles.videoLabel}>{item.durationLabel}</span>}
    </div>
  )
}

function Lightbox({ media, start, onClose }) {
  const ref = useRef(null)
  const [i, setI] = useState(start)
  const item = media[i]

  useEffect(() => {
    // No close() in cleanup (see UploadModal): it would fire 'close' under StrictMode.
    if (!ref.current.open) ref.current.showModal()
  }, [])

  const go = k => setI(Math.max(0, Math.min(media.length - 1, k)))
  return createPortal(
    <dialog
      ref={ref}
      className={styles.lightbox}
      aria-label={`Photos, ${i + 1} of ${media.length}`}
      onClose={onClose}
      onClick={e => { if (e.target === ref.current) ref.current.close() }}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') { e.stopPropagation(); go(i + 1) }
        if (e.key === 'ArrowLeft') { e.stopPropagation(); go(i - 1) }
      }}
    >
      <div className={styles.lightboxInner}>
        <button type="button" className={styles.lightboxClose} aria-label="Close" onClick={() => ref.current.close()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className={styles.lightboxStage}>
          {item.type === 'video'
            ? <ThreadVideo key={i} item={item} active eager />
            : <ThreadImage key={i} item={item} eager className={styles.lightboxImg} />}
        </div>
        <div className={styles.lightboxBar}>
          <button type="button" className={styles.roundBtn} aria-label="Previous photo" disabled={i === 0} onClick={() => go(i - 1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          </button>
          <span aria-live="polite">{i + 1} / {media.length}</span>
          <button type="button" className={`${styles.roundBtn} ${styles.roundBtnFilled}`} aria-label="Next photo" disabled={i === media.length - 1} onClick={() => go(i + 1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}

export default function MomentMedia({ moment, active, eager, isMobile }) {
  const [lightbox, setLightbox] = useState(false)

  if (moment.kind === 'illustration') {
    return <MetOnCampus compact={isMobile} className={styles.illustration} />
  }

  const media = moment.media
  if (media.length === 0) return null

  if (isMobile) {
    const first = media[0]
    const more = media.length > 1
    const fill = { aspectRatio: ratioOf(first), objectPosition: first.position }
    return (
      <div className={styles.mobileMedia}>
        {first.type === 'video'
          ? <ThreadVideo item={first} active={active} eager={eager} className={styles.mobileFill} style={fill} />
          : more
            ? (
              <button type="button" className={styles.mediaTap} aria-label={`View all ${media.length} photos: ${moment.title}`} onClick={() => setLightbox(true)}>
                <ThreadImage item={first} eager={eager} className={styles.mobileFill} style={fill} />
              </button>
            )
            : <ThreadImage item={first} eager={eager} className={styles.mobileFill} style={fill} />}
        {more && (
          first.type === 'video'
            ? <button type="button" className={styles.badge} onClick={() => setLightbox(true)} aria-label={`View all ${media.length} items`}>1 / {media.length}</button>
            : <span className={styles.badge} aria-hidden="true">1 / {media.length}</span>
        )}
        {lightbox && <Lightbox media={media} start={0} onClose={() => setLightbox(false)} />}
      </div>
    )
  }

  const ratios = media.map(ratioOf)
  const sum = ratios.reduce((a, b) => a + b, 0)
  const rowStyle = {
    gridTemplateColumns: ratios.map(r => `minmax(0, ${((r / sum) * 100).toFixed(3)}fr)`).join(' '),
    width: `min(100%, ${Math.round(sum * MEDIA_H + GAP * (media.length - 1))}px)`,
  }
  return (
    <div className={styles.grid} style={rowStyle}>
      {media.map((item, k) => (
        item.type === 'video'
          ? <ThreadVideo key={k} item={item} active={active} eager={eager} className={styles.gridVideo} style={{ aspectRatio: ratios[k] }} />
          : <ThreadImage key={k} item={item} eager={eager} className={styles.gridImg} style={{ aspectRatio: ratios[k] }} />
      ))}
    </div>
  )
}
