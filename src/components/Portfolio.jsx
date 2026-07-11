import { useEffect, useRef } from 'react'
import styles from './Portfolio.module.css'
import image1 from '../assets/Portfolio/SHI_7552.jpg'
import image5 from '../assets/Portfolio/SHI_7624.jpg'
import image3 from '../assets/Portfolio/SHI_7586.jpg'
import image4 from '../assets/Portfolio/SHI_7604.jpg'
import image2 from '../assets/Portfolio/SHI_7576.jpg'
import image6 from '../assets/Portfolio/SHI_7752.jpg'

// ── Replace with your actual portfolio images ────────
const IMAGES = [
  { src: image1, alt: 'Portrait' },
  { src: image2, alt: 'Wedding ceremony' },
  { src: image3, alt: 'Couple portrait' },
  { src: image4, alt: 'Wedding couple' },
  { src: image5, alt: 'Bride' },
  { src: image6, alt: 'Couple' },
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
            <img src={img.src} alt={img.alt} loading="lazy" />
          </div>
        ))}
      </div>

      <div className={styles.more}>
        <a href="#contact" className={styles.moreLink}>RSVP →</a>
      </div>
    </section>
  )
}
