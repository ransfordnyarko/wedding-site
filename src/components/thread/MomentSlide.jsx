import MomentMedia from './MomentMedia'
import AddMomentSlide from './AddMomentSlide'
import styles from './Thread.module.css'

export default function MomentSlide({ moment, index, total, active, eager, isMobile, highlighted, onAdd, addRef, slideRef }) {
  const isAdd = moment.kind === 'add'
  return (
    <article
      ref={slideRef}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${moment.title}`}
      className={`${styles.slide} ${active ? styles.slideActive : ''} ${highlighted ? styles.slideHighlight : ''}`}
      inert={!active}
      tabIndex={-1}
    >
      <div className={styles.band}>
        <span className={styles.knot} aria-hidden="true" />
        <span className={styles.kicker}>
          {moment.year}{isMobile ? '' : ` · ${moment.kicker}`}
        </span>
      </div>

      <div className={styles.slideBody}>
        <div className={styles.textCol}>
          <h3 className={styles.title}>{moment.title}</h3>
          {moment.body && <p className={styles.body}>{moment.body}</p>}
          {moment.guestName && (
            <p className={styles.guest}>
              <span className={styles.avatar} aria-hidden="true">{initials(moment.guestName)}</span>
              Shared by {moment.guestName}
            </p>
          )}
        </div>
        <div className={styles.mediaCol}>
          {isAdd
            ? <AddMomentSlide onOpen={onAdd} buttonRef={addRef} href={moment.href} />
            : <MomentMedia moment={moment} active={active} eager={eager} isMobile={isMobile} />}
        </div>
      </div>
    </article>
  )
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')
}
