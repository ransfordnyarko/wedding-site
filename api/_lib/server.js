// Shared helpers for the /api functions (Vercel Node functions; also mounted
// by the Vite dev server, see vite.config.js). Files in /api/_lib are not routes.
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

let admin = null
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw httpError(503, 'Uploads are not configured yet.')
  admin ??= createClient(url, key, { auth: { persistSession: false } })
  return admin
}

export function httpError(status, message, fieldErrors) {
  return Object.assign(new Error(message), { status, fieldErrors })
}

/** Wraps a handler: method check, JSON errors. */
export function handler(methods, fn) {
  return async (req, res) => {
    if (!methods.includes(req.method)) {
      res.setHeader('Allow', methods.join(', '))
      return res.status(405).json({ error: 'Method not allowed' })
    }
    try {
      await fn(req, res)
    } catch (e) {
      const status = e.status || 500
      if (!e.status) console.error(e)
      res.status(status).json({ error: status >= 500 && !e.status ? 'Something went wrong. Please try again.' : e.message, fieldErrors: e.fieldErrors })
    }
  }
}

export function body(req) {
  if (req.body && typeof req.body === 'object') return req.body
  try { return JSON.parse(req.body || '{}') } catch { throw httpError(400, 'Invalid JSON') }
}

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  return (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
}

function secret() {
  const s = process.env.UPLOAD_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw httpError(503, 'Uploads are not configured yet.')
  return s
}

export const hashIp = ip => crypto.createHmac('sha256', secret()).update(`ip:${ip}`).digest('hex').slice(0, 32)

const b64 = buf => Buffer.from(buf).toString('base64url')

/** Stateless, tamper-proof record of what /sign issued, checked by /complete. */
export function signToken(payload) {
  const data = b64(JSON.stringify(payload))
  const sig = crypto.createHmac('sha256', secret()).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) throw httpError(400, 'Invalid upload session.')
  const [data, sig] = token.split('.')
  const expected = crypto.createHmac('sha256', secret()).update(data).digest('base64url')
  const a = Buffer.from(sig), b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw httpError(400, 'Invalid upload session.')
  const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
  if (payload.exp < Date.now()) throw httpError(400, 'This upload session expired. Please try again.')
  return payload
}

export function checkAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) throw httpError(503, 'ADMIN_PASSWORD is not set.')
  const given = String(req.headers['x-admin-password'] || '')
  const a = crypto.createHash('sha256').update(given).digest()
  const b = crypto.createHash('sha256').update(expected).digest()
  if (!crypto.timingSafeEqual(a, b)) throw httpError(401, 'Wrong password.')
}
