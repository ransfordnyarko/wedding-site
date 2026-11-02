import { useEffect, useRef, useState } from 'react'
import styles from './Gifts.module.css'

// ── Edit gift details here ───────────────────────────
// Text in [brackets] is a placeholder and shows on the site until replaced.
const MOMO = {
  name: 'Boye',              // account name as it appears on MoMo
  number: '[MoMo number]',   // e.g. '024 123 4567'
  network: '[Network]',      // MTN, Telecel or AirtelTigo
}

const REGISTRY_URL = 'https://www.amazon.ca/wedding/guest-view/3D2BAF1HQ17KA' // our Amazon registry

// Items for the registry slideshow, copied from the registry on 2026-11-01.
// Amazon doesn't let other sites read a registry live, so update this list by
// hand if you add items (images live in /public/registry/). Every item links to
// the registry so purchases are tracked there. Leave empty to hide the slideshow.
const R = '/registry/'
/** @type {{ name: string, image: string, price?: string }[]} */
const REGISTRY_ITEMS = [
  { name: 'Chefman espresso machine', image: `${R}espresso-machine.jpg` },
  { name: 'Ninja Foodi air fry oven', image: `${R}air-fry-oven.jpg` },
  { name: 'Mini stand mixer', image: `${R}stand-mixer.jpg` },
  { name: 'Ninja 9-in-1 pressure cooker', image: `${R}pressure-cooker.jpg` },
  { name: 'Retro two-slice toaster', image: `${R}toaster.jpg` },
  { name: 'Copper 13-piece knife set', image: `${R}knife-set.jpg` },
  { name: '12-piece gold bakeware set', image: `${R}bakeware-set.jpg` },
  { name: 'Ceramic coffee mugs, set of 4', image: `${R}coffee-mugs.jpg` },
  { name: 'Bamboo cutting boards, set of 3', image: `${R}cutting-boards.jpg` },
  { name: 'Mixing bowls with lids', image: `${R}mixing-bowls.jpg` },
  { name: 'Stainless steel frying pans', image: `${R}frying-pans.jpg` },
  { name: 'Bean bag chair', image: `${R}bean-bag-chair.jpg` },
  { name: 'Pots and pans organizer', image: `${R}pan-organizer.jpg` },
  { name: 'Microfiber cleaning cloths', image: `${R}cleaning-cloths.jpg` },
]
// ────────────────────────────────────────────────────

const isPlaceholder = v => /^\[.*\]$/.test(v)

function MomoCard() {
  const [copied, setCopied] = useState(false)
  const ready = !isPlaceholder(MOMO.number)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(MOMO.number.replace(/\s+/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked; the number is still visible to copy by hand */ }
  }
  return (
    <div className={`${styles.card} reveal`}>
      <span className={styles.cardLabel}>Mobile Money · Ghana</span>
      <p className={styles.number}>{MOMO.number}</p>
      <dl className={styles.details}>
        <div><dt>Name</dt><dd>{MOMO.name}</dd></div>
        <div><dt>Network</dt><dd>{MOMO.network}</dd></div>
      </dl>
      <button type="button" className={styles.btn} onClick={copy} disabled={!ready}>
        {copied ? 'Copied' : 'Copy number'}
      </button>
      <span className={styles.srOnly} aria-live="polite">{copied ? 'Number copied' : ''}</span>
    </div>
  )
}

function RegistrySlideshow() {
  const trackRef = useRef(null)
  const scroll = dir => {
    const el = trackRef.current
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }
  return (
    <div className={styles.slideshow}>
      <ul ref={trackRef} className={styles.track} aria-label="Items on our registry">
        {REGISTRY_ITEMS.map(item => (
          <li key={item.name} className={styles.item}>
            <a href={REGISTRY_URL || undefined} target="_blank" rel="noopener noreferrer">
              <img src={item.image} alt="" loading="lazy" />
              <span className={styles.itemName}>{item.name}</span>
              {item.price && <span className={styles.itemPrice}>{item.price}</span>}
            </a>
          </li>
        ))}
      </ul>
      {REGISTRY_ITEMS.length > 2 && (
        <div className={styles.arrows}>
          <button type="button" className={styles.round} aria-label="Previous items" onClick={() => scroll(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" className={styles.round} aria-label="More items" onClick={() => scroll(1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}

function RegistryCard() {
  return (
    <div className={`${styles.card} reveal`}>
      <span className={styles.cardLabel}>Wedding registry · Amazon</span>
      <p className={styles.cardText}>A few things to help us set up our first home together.</p>
      {REGISTRY_ITEMS.length > 0 && <RegistrySlideshow />}
      {REGISTRY_URL
        ? <a className={styles.btn} href={REGISTRY_URL} target="_blank" rel="noopener noreferrer">View our registry</a>
        : <span className={`${styles.btn} ${styles.btnDisabled}`}>[Registry link coming soon]</span>}
    </div>
  )
}

export default function Gifts() {
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
    <section id="gifts" className={styles.gifts} ref={ref} aria-labelledby="gifts-heading">
      <div className={styles.intro}>
        <span className={`${styles.eyebrow} reveal`}>Gifts</span>
        <h2 id="gifts-heading" className={`${styles.heading} reveal`}>
          Express your <em>love</em>
        </h2>
        <p className={`${styles.lede} reveal`}>
          Your presence is all we ask, but if you want to support our new beginning,
          feel free to use either of these options.
        </p>
      </div>
      <div className={styles.cards}>
        <MomoCard />
        <RegistryCard />
      </div>
    </section>
  )
}
