import { useEffect, useRef } from 'react'
import styles from './Portfolio.module.css'
// Web-sized copies (1800px, ~0.5 MB) of the originals in src/assets/Portfolio.
import image1 from '../assets/Portfolio/web/SHI_7551.jpg'
import image2 from '../assets/Portfolio/web/SHI_7557.jpg'
import image3 from '../assets/Portfolio/web/SHI_7644.jpg'
import image4 from '../assets/Portfolio/web/SHI_7663.jpg'
import image5 from '../assets/Portfolio/web/SHI_7698.jpg'
import image6 from '../assets/Portfolio/web/SHI_7719.jpg'

// `position` keeps both of you in frame when a wide photo is cropped to a tall tile.
const IMAGES = [
  { src: image1, alt: 'Ransford on one knee proposing to Ewoe on the steps of a historic building' },
  { src: image2, alt: 'Ransford and Ewoe embracing in front of carved wooden doors' },
  { src: image3, alt: 'Ransford and Ewoe laughing together on a park bench', position: '78% center' },
  { src: image4, alt: 'Ransford and Ewoe walking up a path hand in hand' },
  { src: image5, alt: 'Ransford and Ewoe walking down wide stone steps together' },
  { src: image6, alt: 'Ransford and Ewoe crossing a city street side by side' },
]
// ────────────────────────────────────────────────────

export default function Portfolio() {
  const ref = useRef(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    if (!els) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="portfolio" className={styles.portfolio} ref={ref}>
      <div className={styles.header}>
        <span className="reveal" style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--mid-gray)' }}>
          Life Lately
        </span>
        <h2 className={`${styles.heading} reveal`}>
          Photos
        </h2>
      </div>

      <div className={styles.grid}>
        {IMAGES.map((img, i) => (
          <div
            key={i}
            className={`${styles.cell} reveal`}
            style={{ transitionDelay: `${(i % 3) * 0.1}s` }}
          >
            <img src={img.src} alt={img.alt} loading="lazy" decoding="async" style={img.position ? { objectPosition: img.position } : undefined} />
          </div>
        ))}
      </div>

      <div className={styles.more}>
        <a href="#contact" className={styles.moreLink}>RSVP →</a>
      </div>
    </section>
  )
}
