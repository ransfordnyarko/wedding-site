import { useEffect, useRef } from 'react'
import styles from './Thread.module.css'

/** One tab per distinct year, in order. Clicking jumps to that year's first moment. */
export default function YearRail({ years, activeYear, onSelect }) {
  const navRef = useRef(null)
  const btnRefs = useRef({})

  // Keep the active year in view when the rail scrolls (phones). Scrolls the
  // rail only, never the page.
  useEffect(() => {
    const nav = navRef.current
    const btn = btnRefs.current[activeYear]
    if (!nav || !btn || nav.scrollWidth <= nav.clientWidth) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    nav.scrollTo({ left: btn.offsetLeft - nav.clientWidth / 2 + btn.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' })
  }, [activeYear])

  return (
    <nav aria-label="Years" className={styles.yearRail} ref={navRef}>
      {years.map(y => (
        <button
          key={y.label}
          type="button"
          ref={el => { btnRefs.current[y.label] = el }}
          className={styles.yearBtn}
          aria-current={y.label === activeYear ? 'true' : undefined}
          onClick={() => onSelect(y.first)}
        >
          {y.label}
        </button>
      ))}
    </nav>
  )
}
