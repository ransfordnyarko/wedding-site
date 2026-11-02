import { useState, useEffect } from 'react'
import styles from './Nav.module.css'

// ── Config ──────────────────────────────────────────
export const STUDIO = { name: 'EMMA', tagline: 'GodWedUs' }
// ────────────────────────────────────────────────────

const links = ['Hero', 'About', 'Moments', 'Portfolio', 'Details', 'Gifts', 'Footer']
const links2 = ['Home', 'Our Story', 'Moments', 'Photography', 'Details', 'Gifts', 'Contact']

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#hero" className={styles.logo}>{STUDIO.name}</a>

      <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
        {links.map((l, i) => (
          <li key={l}>
            <a href={`#${l.toLowerCase()}`} className={styles.link}
               onClick={() => setMenuOpen(false)}>{links2[i]}</a>
          </li>
        ))}
      </ul>

      <a href="#contact" className={styles.inquire}>RSVP</a>

      <button className={styles.burger} onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu">
        <span className={menuOpen ? styles.barTop : ''} />
        <span className={menuOpen ? styles.barMid : ''} />
        <span className={menuOpen ? styles.barBot : ''} />
      </button>
    </nav>
  )
}
