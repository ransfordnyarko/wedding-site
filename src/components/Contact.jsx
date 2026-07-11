import { useState, useRef, useEffect } from 'react'
import styles from './Contact.module.css'

// ── Edit your contact info here ──────────────────────
export const CONTACT_INFO = {
  email: 'hello@lily.photography',
  instagram: '@lily.photography',
  location: 'New York · Available Worldwide',
}
// ────────────────────────────────────────────────────

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', date: '', message: '' })
  const [sent, setSent] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    if (!els) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const update = f => e => setForm(v => ({ ...v, [f]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    // TODO: connect to your backend / EmailJS / Formspree
    console.log('Enquiry:', form)
    setSent(true)
  }

  return (
    <section id="contact" className={styles.contact} ref={ref}>
      <div className={styles.left}>
        <span className={`${styles.eyebrow} reveal`}>Join us on our Special Day</span>
        <h2 className={`${styles.heading} reveal`}>
          Share in Our<br /><em>Joy</em>
        </h2>
        <div className={`${styles.info} reveal`}>
          <p className={styles.infoItem}>
            <span>Need Anything?</span>
            <span>Contact us Through</span>
          </p>
          <p className={styles.infoItem}>
            <span>Groom</span>
            <a href={`mailto:55 247 9909}`}>{'552 479 909'}</a>
          </p>
          <p className={styles.infoItem}>
            <span>Bride</span>
            <a href={`mailto:55 247 9909}`} target="_blank" rel="noreferrer">{ '552 479 909' }</a>
          </p>
          
        </div>
      </div>

      <div className={`${styles.right} reveal`} style={{ transitionDelay: '0.2s' }}>
        {sent ? (
          <div className={styles.thanks}>
            <p className={styles.thanksIcon}>✦</p>
            <h3 className={styles.thanksHeading}>Thank You</h3>
            <p className={styles.thanksBody}>I'll be in touch within 48 hours. Can't wait to hear your story.</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Name</label>
                <input className={styles.input} type="text" placeholder="Your name"
                  value={form.name} onChange={update('name')} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" placeholder="your@email.com"
                  value={form.email} onChange={update('email')} required />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Would you be joining us?</label>
              <select className={styles.select} value={form.venueBooked} onChange={update('venueBooked')}>
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="yes">Yes with a plus one</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Leave a message for the couple</label>
              <textarea className={styles.input} rows={5} placeholder="Where you met, what you're planning, what matters most to you…"
                value={form.message} onChange={update('message')} style={{ resize: 'vertical' }} />
            </div>
            <button className={styles.submit} type="submit">RSVP</button>
          </form>
        )}
      </div>
    </section>
  )
}
