import styles from './Thread.module.css'

function PlusIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" aria-hidden="true">
      <path d="M12 4v16M4 12h16" />
    </svg>
  )
}

/**
 * The plus circle on the last slide. With `href` it links out to the shared
 * Google Drive folder; otherwise it opens the upload modal.
 */
export default function AddMomentSlide({ onOpen, buttonRef, href }) {
  return (
    <div className={styles.addWrap}>
      {href
        ? (
          <a
            ref={buttonRef}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.addCircle}
            aria-label="Add your photos and videos to our shared Google Drive folder (opens in a new tab)"
            draggable="false"
          >
            <PlusIcon />
          </a>
        )
        : (
          <button
            ref={buttonRef}
            type="button"
            className={styles.addCircle}
            aria-label="Add a photo or memory to our story"
            onClick={onOpen}
          >
            <PlusIcon />
          </button>
        )}
      <span className={styles.addLabel}>Add to our story</span>
      <span className={styles.addHint}>
        {href ? 'Photos and videos from any year, or the wedding day. Opens Google Drive.' : 'Wedding-day photos, or a memory from 2017 to 2025'}
      </span>
    </div>
  )
}
