import { useEffect, useRef } from 'react'
import { WEDDING } from '../content/wedding'
import styles from './Details.module.css'

export default function Details() {
  const ref = useRef(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    if (!els) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 },
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="details" className={styles.details} ref={ref} aria-labelledby="details-heading">
      <div className={styles.text}>
        <span className={`${styles.eyebrow} reveal`}>When &amp; where</span>
        <h2 id="details-heading" className={`${styles.heading} reveal`}>
          Join us as we <em>say I do</em>
        </h2>

        <dl className={`${styles.facts} reveal`}>
          <div>
            <dt>Date</dt>
            <dd>{WEDDING.dateLabel}</dd>
          </div>
          <div>
            <dt>Service starts</dt>
            <dd>{WEDDING.time}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>
              {WEDDING.venue}
              <span className={styles.address}>{WEDDING.address} · {WEDDING.plusCode}</span>
            </dd>
          </div>
        </dl>

        <a className={`${styles.btn} reveal`} href={WEDDING.directionsUrl} target="_blank" rel="noopener noreferrer">
          Get directions
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
        </a>
      </div>

      <div className={`${styles.mapWrap} reveal`}>
        <iframe
          className={styles.map}
          src={WEDDING.mapEmbedUrl}
          title={`Map to ${WEDDING.venue}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {/* The whole map is a link to directions; the button above does the same for keyboard users. */}
        <a
          className={styles.mapLink}
          href={WEDDING.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden="true"
        >
          <span className={styles.mapHint}>Tap for directions</span>
        </a>
      </div>
    </section>
  )
}
