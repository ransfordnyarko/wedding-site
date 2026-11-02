import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Serves /api/* from the same files Vercel deploys as serverless functions,
// so `npm run dev` works without the Vercel CLI.
function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        if (!url.pathname.startsWith('/api/')) return next()
        const file = resolve('api', `${url.pathname.slice(5).replace(/\.\./g, '')}.js`)
        if (!existsSync(file)) return next()
        try {
          const chunks = []
          for await (const c of req) chunks.push(c)
          const raw = Buffer.concat(chunks).toString()
          req.body = raw && req.headers['content-type']?.includes('json') ? JSON.parse(raw) : raw
          req.query = Object.fromEntries(url.searchParams)
          res.status = code => { res.statusCode = code; return res }
          res.json = obj => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
          const mod = await server.ssrLoadModule(file)
          await mod.default(req, res)
        } catch (e) {
          server.config.logger.error(e.stack || String(e))
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Dev API error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make server-only keys (SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD) visible to the dev API.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) process.env[k] ??= v
  return {
    plugins: [react(), devApi()],
  }
})
