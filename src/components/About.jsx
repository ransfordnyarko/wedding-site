import { useEffect, useRef } from 'react'
import styles from './About.module.css'
import slide from '../assets/Other/1112.jpeg'
import slide2 from '../assets/Other/1113.jpeg'

// ── Edit your about content here ────────────────────
const ABOUT = {
  eyebrow: 'Our Story',
  headline: "Married Before We Knew It",
  // Who tells each part: 'him' (Ransford), 'her' (Ewoe) or 'us' (together).
  // A paragraph can be split between voices by giving it several parts.
  story: [
    { voice: 'him', text: 'I met her on campus with a line — "I feel like I know you from somewhere." A small trick to start a conversation, and it worked.' },
    { voice: 'her', text: "I saw through it immediately, but I let him have it anyway. Then he found out my mother worked at the Central Bank, and just like that, he started calling me his wife. No real reason for it — just one of those things Ghanaian men say and somehow it sticks. I laughed it off, thinking nothing of it." },
    { voice: 'him', text: "The joke became a friendship. The friendship became best friendship — church together on Sundays, the same group of friends, always somewhere in each other's space. Small small, it grew into something neither of us could call a joke anymore." },
    { parts: [
      { voice: 'him', text: 'I proposed after school ended,' },
      { voice: 'her', text: 'and I said yes.' },
    ] },
    { voice: 'her', text: 'Then we scattered — different countries, different schools, miles apart. Distance tried its best. It lost.' },
    { voice: 'us', text: "Now we're home, and we're getting married. This is where the real story begins." },
  ],

  cta: 'More Photos',
  // Replace with your actual portrait image
  portrait: slide,
  portrait2: slide2,
}
// ────────────────────────────────────────────────────

const VOICES = { him: 'Ransford', her: 'Ewoe', us: 'Together' }

/** One paragraph, tinted by whoever is telling it. Mixed paragraphs blend. */
function StoryParagraph({ para }) {
  const parts = para.parts || [para]
  const speakers = [...new Set(parts.map(p => p.voice))]
  const first = speakers[0]
  const last = speakers[speakers.length - 1]
  return (
    <div className={`${styles.para} ${styles[`rule_${first}`]} ${first !== last ? styles[`ruleTo_${last}`] : ''} reveal`}>
      <p className={styles.voice}>
        {speakers.map((v, k) => (
          <span key={v} className={styles[`voice_${v}`]}>
            {k > 0 && <span className={styles.voiceSep} aria-hidden="true">·</span>}
            {VOICES[v]}
          </span>
        ))}
      </p>
      <p className={styles.paraText}>
        {parts.map((p, k) => (
          <span key={k} className={styles[`text_${p.voice}`]}>{k > 0 ? ' ' : ''}{p.text}</span>
        ))}
      </p>
    </div>
  )
}

export default function About() {
  const ref = useRef(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    if (!els) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="about" className={styles.about} ref={ref}>
      <div className={styles.text}>
        <p className={`${styles.eyebrow} reveal`}>{ABOUT.eyebrow}</p>
        <h2 className={`${styles.headline} reveal`}>{ABOUT.headline}</h2>
        <div className={styles.story}>
          {ABOUT.story.map((para, i) => <StoryParagraph key={i} para={para} />)}
        </div>
        <a href="#portfolio" className={`${styles.cta} reveal`}>{ABOUT.cta}</a>
      </div>

      <div className={styles.images}>
        <div className={`${styles.imgLarge} reveal`}>
          <img src={ABOUT.portrait} alt="Portrait session" />
        </div>
        <div className={`${styles.imgSmall} reveal`} style={{ transitionDelay: '0.15s' }}>
          <img src={ABOUT.portrait2} alt="Wedding detail" />
        </div>
      </div>
    </section>
  )
}
