import { useCallback, useEffect, useMemo, useState } from 'react'
import { MOMENTS, ADD_MOMENT, DRIVE_ADD_MOMENT, DRIVE_UPLOAD_URL, GUEST_UPLOADS_ENABLED } from '../../content/thread'
import { fetchVisibleMemories, mergeMoments, rowToMoment } from '../../lib/guestMoments'
import { supabase } from '../../lib/supabase'
import ThreadCarousel from './ThreadCarousel'

const POLL_MS = 30_000

/**
 * Visible guest memories, kept live. Realtime pushes new inserts instantly;
 * a 30s poll is the fallback and also catches rows hidden in /admin/uploads
 * (RLS stops Realtime from delivering an update once a row is hidden).
 */
function useGuestRows() {
  const [rows, setRows] = useState([])

  const refresh = useCallback(async () => {
    try { setRows(await fetchVisibleMemories()) } catch (e) { console.warn('Could not load guest memories', e) }
  }, [])

  useEffect(() => {
    if (!supabase || !GUEST_UPLOADS_ENABLED) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch from an external store
    refresh()
    const channel = supabase
      .channel('guest-memories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_uploads', filter: 'kind=eq.memory' }, payload => {
        if (payload.eventType === 'INSERT' && payload.new?.status === 'visible') {
          setRows(rs => (rs.some(r => r.id === payload.new.id) ? rs : [...rs, payload.new]))
        } else {
          refresh()
        }
      })
      .subscribe()
    const timer = setInterval(() => { if (!document.hidden) refresh() }, POLL_MS)
    const onVisible = () => { if (!document.hidden) refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      supabase.removeChannel(channel)
    }
  }, [refresh])

  const addRow = useCallback(row => {
    setRows(rs => (rs.some(r => r.id === row.id) ? rs : [...rs, row]))
  }, [])

  return { rows, addRow }
}

export default function ThreadSection() {
  const { rows, addRow } = useGuestRows()
  const moments = useMemo(
    () => {
      if (GUEST_UPLOADS_ENABLED) return mergeMoments(MOMENTS, rows.map(rowToMoment), ADD_MOMENT)
      return DRIVE_UPLOAD_URL ? [...MOMENTS, DRIVE_ADD_MOMENT] : MOMENTS
    },
    [rows],
  )
  const onMemoryAdded = useCallback(row => {
    addRow(row)
    return rowToMoment(row).id
  }, [addRow])

  return <ThreadCarousel moments={moments} onMemoryAdded={onMemoryAdded} />
}
