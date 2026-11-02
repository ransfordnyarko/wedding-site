import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import YearRail from './YearRail'
import ThreadPath from './ThreadPath'
import MomentSlide from './MomentSlide'
import UploadModal from './UploadModal'
import styles from './Thread.module.css'

const MOBILE_QUERY = '(max-width: 899px)'
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
const SWIPE_PX = 50
const FLICK_PX_PER_MS = 0.5

function useMedia(query) {
  return useSyncExternalStore(
    cb => { const m = window.matchMedia(query); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

const pad = v => String(v).padStart(2, '0')
const isTypingTarget = el => el?.closest?.('dialog, input, textarea, select, [contenteditable="true"]')

export default function ThreadCarousel({ moments, onMemoryAdded }) {
  const n = moments.length
  const isMobile = useMedia(MOBILE_QUERY)
  const reducedMotion = useMedia(REDUCED_QUERY)

  // Track the active slide by id so live inserts before it don't move the view.
  // `anchor` is the fallback position if the active moment gets hidden.
  const [pos, setPos] = useState({ id: moments[0].id, anchor: 0 })
  const locate = useCallback(
    p => { const k = moments.findIndex(m => m.id === p.id); return k < 0 ? Math.min(p.anchor, n - 1) : k },
    [moments, n],
  )
  const index = locate(pos)
  const active = moments[index]
  const { id: currentId, title: currentTitle } = active

  const [announcement, setAnnouncement] = useState('')
  const [highlightId, setHighlightId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [drawState, setDrawPhase] = useState(() => ('IntersectionObserver' in window ? 'pending' : 'done'))
  const drawPhase = reducedMotion ? 'done' : drawState // pending → drawing → done

  const sectionRef = useRef(null)
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const addRef = useRef(null)
  const slideRefs = useRef({})
  const restoreFocus = useRef(false)
  const userMoved = useRef(false)
  const pendingFocusId = useRef(null)

  const years = useMemo(() => {
    const seen = []
    moments.forEach((m, k) => { if (!seen.some(s => s.label === m.year)) seen.push({ label: m.year, first: k }) })
    return seen
  }, [moments])

  /** Jump to slide k, or move by `delta` from wherever the carousel is now. */
  const move = useCallback((k, delta = 0) => {
    restoreFocus.current = sectionRef.current?.contains(document.activeElement) ?? false
    userMoved.current = true
    setDrawPhase('done')
    setPos(p => {
      const t = Math.max(0, Math.min(n - 1, delta ? locate(p) + delta : k))
      return { id: moments[t].id, anchor: t }
    })
  }, [moments, n, locate])
  const go = useCallback(k => move(k), [move])
  const step = useCallback(d => move(0, d), [move])

  // ── Track position ────────────────────────────────────────────────────
  const applyTransform = useCallback((dxPx = 0) => {
    const el = trackRef.current
    if (!el) return
    const base = -(index * 100) / n
    el.style.transform = dxPx ? `translateX(calc(${base}% + ${dxPx}px))` : `translateX(${base}%)`
  }, [index, n])

  useLayoutEffect(() => { applyTransform(0) }, [applyTransform])

  useEffect(() => {
    if (!userMoved.current) return
    setAnnouncement(`${index + 1} of ${n}: ${currentTitle}`)
    // If the focused control just became inert/disabled, keep focus in the section.
    if (restoreFocus.current && !sectionRef.current.contains(document.activeElement)) {
      slideRefs.current[currentId]?.focus({ preventScroll: true })
    }
    restoreFocus.current = false
    if (pendingFocusId.current === currentId) {
      slideRefs.current[currentId]?.focus({ preventScroll: true })
      pendingFocusId.current = null
    }
  }, [index, n, currentId, currentTitle])

  // ── Thread draws itself up to the first knot on first view ────────────
  useEffect(() => {
    if (drawPhase === 'drawing') {
      const t = setTimeout(() => setDrawPhase('done'), 2500) // in case transitionend never fires
      return () => clearTimeout(t)
    }
    if (drawPhase !== 'pending') return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setDrawPhase('drawing'); obs.disconnect() }
    }, { threshold: 0.25 })
    obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [drawPhase])

  // ── Drag / swipe ──────────────────────────────────────────────────────
  const drag = useRef(null)
  const suppressClick = useRef(false)

  const onPointerDown = e => {
    if (e.button !== 0 || modalOpen || e.target.closest('dialog')) return
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), dx: 0, active: false }
  }
  const onPointerMove = e => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x0
    const dy = e.clientY - d.y0
    if (!d.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag.current = null; return } // vertical scroll
      if (Math.abs(dx) < 8) return
      d.active = true
      viewportRef.current.setPointerCapture(e.pointerId)
      trackRef.current.classList.add(styles.dragging)
      if (drawPhase !== 'done') setDrawPhase('done')
    }
    const atEdge = (index === 0 && dx > 0) || (index === n - 1 && dx < 0)
    d.dx = atEdge ? dx * 0.3 : dx
    applyTransform(d.dx)
  }
  const endDrag = (e, cancelled) => {
    const d = drag.current
    drag.current = null
    if (!d || !d.active) return
    trackRef.current.classList.remove(styles.dragging)
    suppressClick.current = true
    setTimeout(() => { suppressClick.current = false }, 0)
    const v = d.dx / Math.max(1, performance.now() - d.t0)
    let next = index
    if (!cancelled && (Math.abs(d.dx) > SWIPE_PX || Math.abs(v) > FLICK_PX_PER_MS)) next = d.dx < 0 ? index + 1 : index - 1
    next = Math.max(0, Math.min(n - 1, next))
    if (next === index) applyTransform(0)
    else go(next)
  }

  // ── Keyboard (only while focus is inside the section) ─────────────────
  const onKeyDown = e => {
    if (isTypingTarget(e.target)) return
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
  }

  // ── Upload modal ──────────────────────────────────────────────────────
  const openModal = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => {
    setModalOpen(false)
    requestAnimationFrame(() => addRef.current?.focus())
  }, [])
  const onAdded = useCallback(row => {
    const id = onMemoryAdded(row)
    setModalOpen(false)
    pendingFocusId.current = id
    userMoved.current = true
    setDrawPhase('done')
    setPos({ id, anchor: 0 })
    setHighlightId(id)
    setTimeout(() => setHighlightId(h => (h === id ? null : h)), 2800)
  }, [onMemoryAdded])

  const counter = `${pad(index + 1)} / ${pad(n)}`

  return (
    <section
      id="moments"
      ref={sectionRef}
      className={styles.section}
      aria-roledescription="carousel"
      aria-label="Our moments: nine years, one thread"
      onKeyDown={onKeyDown}
      style={{ '--n': n }}
    >
      <div className={styles.header}>
        <div className={styles.headText}>
          <span className={styles.label}>Our moments{isMobile ? ` · ${counter}` : ''}</span>
          <h2 className={styles.heading}>Nine years, <em>one thread</em></h2>
        </div>
        {!isMobile && <span className={styles.counter} aria-hidden="true">{counter}</span>}
      </div>

      <YearRail years={years} activeYear={active.year} onSelect={go} />

      <div
        ref={viewportRef}
        className={styles.viewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={e => endDrag(e, false)}
        onPointerCancel={e => endDrag(e, true)}
        onClickCapture={e => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation() } }}
        onDragStart={e => e.preventDefault()}
      >
        <div ref={trackRef} className={styles.track}>
          <div
            className={`${styles.threadClip} ${styles[`thread_${drawPhase}`]}`}
            onTransitionEnd={() => setDrawPhase('done')}
          >
            <ThreadPath n={n} className={styles.thread} />
          </div>
          <div className={styles.slides}>
            {moments.map((m, k) => (
              <MomentSlide
                key={m.id}
                moment={m}
                index={k}
                total={n}
                active={k === index}
                eager={Math.abs(k - index) <= 1}
                isMobile={isMobile}
                highlighted={highlightId === m.id}
                onAdd={openModal}
                addRef={m.kind === 'add' ? addRef : undefined}
                slideRef={el => { slideRefs.current[m.id] = el }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.arrows}>
          <button type="button" className={styles.roundBtn} aria-label="Previous moment" disabled={index === 0} onClick={() => step(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          </button>
          {isMobile && <span className={styles.hint}>Swipe through the years</span>}
          <button type="button" className={`${styles.roundBtn} ${styles.roundBtnFilled}`} aria-label="Next moment" disabled={index === n - 1} onClick={() => step(1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
        {!isMobile && (
          <>
            <div className={styles.progress}>
              {moments.map((m, k) => (
                <button
                  key={m.id}
                  type="button"
                  className={styles.progressHit}
                  aria-label={`Go to ${k + 1} of ${n}: ${m.title}`}
                  aria-current={k === index ? 'true' : undefined}
                  onClick={() => go(k)}
                >
                  <span className={`${styles.progressBar} ${k === index ? styles.progressBarActive : ''}`} />
                </button>
              ))}
            </div>
            <span className={styles.hint}>Drag, swipe or use the arrows</span>
          </>
        )}
      </div>

      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">{announcement}</div>

      {modalOpen && <UploadModal onClose={closeModal} onMemoryAdded={onAdded} />}
    </section>
  )
}
