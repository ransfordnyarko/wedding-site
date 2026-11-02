import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Browser client (anon key, read-only through RLS). Null when not configured. */
export const supabase = url && anonKey
  ? createClient(url, anonKey, { auth: { persistSession: false } })
  : null

export function publicMemoryUrl(path) {
  return `${url}/storage/v1/object/public/memories/${path.split('/').map(encodeURIComponent).join('/')}`
}
