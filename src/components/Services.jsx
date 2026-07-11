import styles from './Services.module.css'
import highlightVideo from '../assets/Videos/0711.mp4'
import posterImg from '../assets/Portfolio/SHI_7576.jpg'
import { useRef, useEffect } from 'react' // shown before user presses play

const CONTENT = {
  eyebrow: 'Our Moments',
  headline: '9 Years in 3 Minutes',
}

export default function Services() {
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
    <section id="services" className={styles.services} ref={ref}>
      <div className={styles.header}>
        <span className={`${styles.eyebrow} reveal`}>{CONTENT.eyebrow}</span>
      </div>

      <h2 className={`${styles.videoHeadline} reveal`}>{CONTENT.headline}</h2>

      <div className={`${styles.videoWrap} reveal`}>
        <video
          className={styles.video}
          src={highlightVideo}
          poster={posterImg}
          controls
          playsInline
        />
      </div>

      <div className={styles.marquee}>
        {/* unchanged */}
      </div>
    </section>
  )
}