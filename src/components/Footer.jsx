import { STUDIO } from './Nav'
import { CONTACT_INFO } from './Contact'
import styles from './Footer.module.css'

const EVENTS = [
  {
    name: 'Traditional',
    date: 'June 19, 2027',
    venue: 'Family House',
    address: 'La, Accra, Ghana',
    dressCode: 'Kente / Traditional Wear',
  },
  {
    name: 'White Wedding',
    date: 'June 20, 2027',
    venue: 'Labadi Beach Hotel',
    address: 'La, Accra, Ghana',
    dressCode: 'Black Tie',
  },
]

const buildMarqueeItems = () =>
  EVENTS.flatMap(event => [
    { label: event.name, value: '', isHeading: true },
    { label: 'Date', value: event.date },
    { label: 'Venue', value: event.venue },
    { label: 'Address', value: event.address },
    { label: 'Dress Code', value: event.dressCode },
  ])

export default function Footer() {
  const base = buildMarqueeItems()
  const items = [...base, ...base] // duplicated for seamless loop

  return (
    <footer id='footer' className={styles.footer}>
      <div className={styles.top}>
        <span className={styles.logo}>{STUDIO.name}</span>

        <div className={styles.marquee}>
          <div className={styles.track}>
            {items.map((item, i) =>
              item.isHeading ? (
                <span key={i} className={styles.marqueeHeading}>
                  {item.label}
                </span>
              ) : (
                <span key={i} className={styles.marqueeItem}>
                  <span className={styles.marqueeLabel}>{item.label}</span>
                  <span className={styles.marqueeValue}>{item.value}</span>
                </span>
              )
            )}
          </div>
        </div>

        <a href={`mailto:${CONTACT_INFO.email}`} className={styles.email}>
          {'#GodWedUs'}
        </a>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} {STUDIO.name} Photography. All rights reserved.</span>
        <span>{'Accra, Ghana'}</span>
      </div>
    </footer>
  )
}