import { useState, useEffect } from 'react'
import styles from './Hero.module.css'
import slide1 from '../assets/Hero/SHI_7644.jpg'
import slide2 from '../assets/Hero/SHI_7663.jpg'
import slide3 from '../assets/Hero/SHI_7698.jpg'
import slide4 from '../assets/Hero/SHI_7764.jpg'


// ── Replace src values with your actual photos ───────
const slides = [
  {
    bg: slide1,
    label: '1 Corithians 13:13',
  },
  {
    bg: slide2,
    label: 'Faith',
  },
  {
    bg: slide3,
    label: 'Hope',
  },
  {
    bg: slide4,
    label: 'Love',
  }
]
// ────────────────────────────────────────────────────

export default function Hero() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="hero" className={styles.hero}>
      {slides.map((s, i) => (
        <div
          key={i}
          className={`${styles.slide} ${i === active ? styles.active : ''}`}
          style={{ backgroundImage: `url(${s.bg})` }}
        />
      ))}

      <div className={styles.overlay} />

      <div className={styles.content}>
        <p className={styles.eyebrow} style={{ animationDelay: '0.2s' }}>
          {slides[active].label}
        </p>
        <h1 className={styles.headline}>
          <span className={styles.line1}>And now these three remain: faith, hope and love.</span>
          <em className={styles.line2}>But the greatest of these is love</em>
        </h1>
        <a href="#portfolio" className={styles.cta}>View Portfolio</a>
      </div>

      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className={styles.scrollLine} />
    </section>
  )
}
