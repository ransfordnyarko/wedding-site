import { STUDIO } from './Nav'
import { CONTACT_INFO } from './Contact'
import { WEDDING } from '../content/wedding'
import styles from './Footer.module.css'

const EVENTS = [
  {
    name: 'The Wedding',
    date: WEDDING.dateLabel,
    time: WEDDING.time,
    venue: WEDDING.venue,
    address: WEDDING.address,
  },
]

const buildMarqueeItems = () =>
  EVENTS.flatMap(event => [
    { label: event.name, value: '', isHeading: true },
    { label: 'Date', value: event.date },
    { label: 'Time', value: event.time },
    { label: 'Venue', value: event.venue },
    { label: 'Address', value: event.address },
  ])

export default function Footer() {
  const base = buildMarqueeItems()
  // Four copies: the strip scrolls by half, so each half must be wider than
  // the footer even with a single event.
  const items = [...base, ...base, ...base, ...base]

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
        <span>© {new Date().getFullYear()} Designed by Nkunim Studios. All rights reserved.</span>
        <span>{'Accra, Ghana'}</span>
      </div>
    </footer>
  )
}