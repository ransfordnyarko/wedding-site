import { useCallback, useEffect, useState } from 'react'
import styles from './AdminUploads.module.css'

const KEY = 'thread-admin-pw'

async function api(method, password, body) {
  const res = await fetch('/api/admin/uploads', {
    method,
    headers: { 'x-admin-password': password, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || `Error ${res.status}`), { status: res.status })
  return data
}

export default function AdminUploads() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(KEY) || '')
  const [draft, setDraft] = useState('')
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const load = useCallback(async pw => {
    setError('')
    try {
      const { rows } = await api('GET', pw)
      setRows(rows)
      sessionStorage.setItem(KEY, pw)
      setPassword(pw)
    } catch (e) {
      setError(e.message)
      if (e.status === 401) { sessionStorage.removeItem(KEY); setPassword('') }
    }
  }, [])

  useEffect(() => {
    document.title = 'Guest uploads · admin'
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load with a saved password
    if (password) load(password)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async row => {
    const status = row.status === 'visible' ? 'hidden' : 'visible'
    setRows(rs => rs.map(r => (r.id === row.id ? { ...r, status } : r)))
    try { await api('PATCH', password, { id: row.id, status }) } catch (e) {
      setError(e.message)
      setRows(rs => rs.map(r => (r.id === row.id ? { ...r, status: row.status } : r)))
    }
  }

  if (!rows) {
    return (
      <main className={styles.page}>
        <h1 className={styles.h1}>Guest uploads</h1>
        <form className={styles.login} onSubmit={e => { e.preventDefault(); load(draft) }}>
          <label htmlFor="pw">Admin password</label>
          <input id="pw" type="password" value={draft} onChange={e => setDraft(e.target.value)} autoComplete="current-password" autoFocus />
          <button type="submit">Sign in</button>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </form>
      </main>
    )
  }

  const shown = rows.filter(r => filter === 'all' || r.kind === filter)
  const vaultFiles = rows.filter(r => r.kind === 'wedding').flatMap(r => r.files)

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <h1 className={styles.h1}>Guest uploads</h1>
        <div className={styles.tools}>
          <label>Show{' '}
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="memory">Earlier memories (public)</option>
              <option value="wedding">Wedding day (vault)</option>
            </select>
          </label>
          <button type="button" onClick={() => load(password)}>Refresh</button>
          <button type="button" onClick={() => { sessionStorage.removeItem(KEY); setRows(null); setPassword('') }}>Sign out</button>
        </div>
      </header>
      <p className={styles.note}>
        Vault: {vaultFiles.length} files. Download links below last one hour; press Refresh for new ones.
        Hiding a memory removes it from the thread within about 30 seconds.
      </p>
      {error && <p className={styles.error} role="alert">{error}</p>}

      <table className={styles.table}>
        <thead>
          <tr><th>When</th><th>Type</th><th>From</th><th>Year / caption</th><th>Files</th><th>Status</th></tr>
        </thead>
        <tbody>
          {shown.map(r => (
            <tr key={r.id} className={r.status === 'hidden' ? styles.hidden : ''}>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>{r.kind === 'wedding' ? 'Vault' : 'Memory'}</td>
              <td>{r.guest_name}</td>
              <td>{r.kind === 'memory' ? <><strong>{r.year}</strong> {r.caption}</> : '—'}</td>
              <td>
                <ul className={styles.files}>
                  {r.files.map(f => (
                    <li key={f.path}>
                      <a href={f.url} target="_blank" rel="noreferrer">
                        {f.mime.startsWith('image/') && r.kind === 'memory'
                          ? <img src={f.url} alt="" width="56" height="56" />
                          : f.path.split('/').pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                {r.kind === 'memory'
                  ? <button type="button" onClick={() => toggle(r)} aria-pressed={r.status === 'hidden'}>
                      {r.status === 'visible' ? 'Visible · hide' : 'Hidden · show'}
                    </button>
                  : 'Private'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {shown.length === 0 && <p className={styles.note}>Nothing yet.</p>}
    </main>
  )
}
