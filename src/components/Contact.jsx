import { useState, useRef, useEffect } from 'react'
import styles from './Contact.module.css'

// ── Edit your contact info here ──────────────────────
export const CONTACT_INFO = {
  email: 'hello@lily.photography',
  instagram: '@lily.photography',
  location: 'New York · Available Worldwide',
}
// ────────────────────────────────────────────────────

// RSVPs go to a Google Sheet through a Google Apps Script web app.
// Setup steps are at the top of google-apps-script/rsvp.gs. Paste the web
// app URL (ends in /exec) into VITE_RSVP_SHEET_URL in .env.local and in Vercel.
const RSVP_SHEET_URL = import.meta.env.VITE_RSVP_SHEET_URL || ''

const ATTENDING = [
  { value: 'Yes', label: "Yes, I'll be there", guests: 1 },
  { value: 'Yes, with a plus one', label: "Yes, and I'm bringing a plus one", guests: 2 },
  { value: 'No', label: "Sadly, I can't make it", guests: 0 },
]

const EMPTY = { name: '', email: '', attending: '', plusOne: '', message: '', website: '' }

// Who guests can call with questions. Ghana numbers, written the local way.
const FAMILY_CONTACTS = [
  {
    side: "Groom's family",
    people: [
      { name: 'Miss Ranita Nyarko', phone: '0599010919' },
      { name: 'Miss Sonia Hassan', phone: '0204647000' },
    ],
  },
  {
    side: "Bride's family",
    people: [
      { name: 'Dr Emmanuel Doh', phone: '0501367452' },
      { name: 'Mr Foster Bey', phone: '024225473' }, // NOTE: 9 digits; Ghana numbers have 10. Confirm.
    ],
  },
]

/** 0599010919 → +233599010919, so the link also works from abroad. */
const toTel = local => (/^0\d{9}$/.test(local) ? `+233${local.slice(1)}` : local)
/** 0599010919 → 059 901 0919 */
const formatPhone = local => local.replace(/^(\d{3})(\d{3})(\d+)$/, '$1 $2 $3')

export default function Contact() {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [sentAs, setSentAs] = useState(null)
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

  const handleSubmit = async e => {
    e.preventDefault()
    if (status === 'sending') return
    const choice = ATTENDING.find(a => a.value === form.attending)
    const payload = new URLSearchParams({
      name: form.name.trim(),
      email: form.email.trim(),
      attending: form.attending,
      guests: String(choice?.guests ?? ''),
      plusOne: choice?.guests === 2 ? form.plusOne.trim() : '',
      message: form.message.trim(),
      website: form.website, // honeypot: real guests never fill this in
    })
    setStatus('sending')
    try {
      if (!RSVP_SHEET_URL) throw new Error('VITE_RSVP_SHEET_URL is not set')
      // A form-encoded POST is a "simple" request, so the browser skips the
      // CORS preflight that Apps Script can't answer.
      const res = await fetch(RSVP_SHEET_URL, { method: 'POST', body: payload })
      const data = await res.json().catch(() => ({ ok: res.ok }))
      if (!data.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setSentAs({ name: form.name.trim().split(/\s+/)[0], coming: (choice?.guests ?? 0) > 0 })
      setStatus('sent')
      setForm(EMPTY)
    } catch (err) {
      console.error('RSVP failed', err)
      setStatus('error')
    }
  }

  return (
    <section id="contact" className={styles.contact} ref={ref}>
      <div className={styles.left}>
        <span className={`${styles.eyebrow} reveal`}>RSVP · 19 December 2026</span>
        <h2 className={`${styles.heading} reveal`}>
          Want to experience<br />our <em>new beginning?</em>
        </h2>
        <p className={`${styles.lede} reveal`}>
          Nine years in the making, and the best part is yet to come. Save your seat and celebrate with us.
        </p>
        <div className={`${styles.info} reveal`}>
          <p className={styles.infoIntro}>Need anything? Reach out to our families.</p>
          {FAMILY_CONTACTS.map(side => (
            <div key={side.side} className={styles.infoItem}>
              <span>{side.side}</span>
              <ul className={styles.people}>
                {side.people.map(p => (
                  <li key={p.name}>
                    <span className={styles.personName}>{p.name}</span>
                    <a href={`tel:${toTel(p.phone)}`} className={styles.phone}>{formatPhone(p.phone)}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.right} reveal`} style={{ transitionDelay: '0.2s' }}>
        {status === 'sent' ? (
          <div className={styles.thanks} role="status">
            <p className={styles.thanksIcon} aria-hidden="true">✦</p>
            <h3 className={styles.thanksHeading}>
              {sentAs?.coming ? `See you there, ${sentAs.name}!` : `Thank you, ${sentAs?.name}`}
            </h3>
            <p className={styles.thanksBody}>
              {sentAs?.coming
                ? "Your RSVP is in. We can't wait to celebrate our new beginning with you."
                : "We'll miss you on the day, and we're so grateful for your love from wherever you are."}
            </p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="rsvp-name">Name</label>
                <input id="rsvp-name" className={styles.input} type="text" placeholder="Your full name"
                  autoComplete="name" maxLength={120}
                  value={form.name} onChange={update('name')} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="rsvp-email">Email</label>
                <input id="rsvp-email" className={styles.input} type="email" placeholder="your@email.com"
                  autoComplete="email" maxLength={200}
                  value={form.email} onChange={update('email')} required />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="rsvp-attending">Will you be joining us?</label>
              <select id="rsvp-attending" className={styles.select} value={form.attending} onChange={update('attending')} required>
                <option value="" disabled>Select…</option>
                {ATTENDING.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            {form.attending === 'Yes, with a plus one' && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="rsvp-plus-one">Your plus one's name</label>
                <input id="rsvp-plus-one" className={styles.input} type="text" placeholder="Their full name"
                  maxLength={120} value={form.plusOne} onChange={update('plusOne')} required />
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="rsvp-message">Leave a message for the couple</label>
              <textarea id="rsvp-message" className={styles.input} rows={5} maxLength={1000}
                placeholder="A wish, a favourite memory, or the song that will get you on the dance floor…"
                value={form.message} onChange={update('message')} style={{ resize: 'vertical' }} />
            </div>
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="rsvp-website">Leave this empty</label>
              <input id="rsvp-website" type="text" tabIndex={-1} autoComplete="off"
                value={form.website} onChange={update('website')} />
            </div>
            {status === 'error' && (
              <p className={styles.error} role="alert">
                Something went wrong sending your RSVP. Please try again, or reach us on the numbers here.
              </p>
            )}
            <button className={styles.submit} type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send my RSVP'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
