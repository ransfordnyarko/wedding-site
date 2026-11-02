# LILY — Photography Portfolio · React + Vite

A luxury editorial photography portfolio website.

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Personalising

All editable config is at the **top of each component file**.

| What | File | Variable |
|------|------|----------|
| Studio name | `Nav.jsx` | `STUDIO` |
| Hero slides & images | `Hero.jsx` | `slides` |
| About text & portraits | `About.jsx` | `ABOUT` |
| Services cards | `Services.jsx` | `SERVICES` |
| Portfolio images | `Portfolio.jsx` | `IMAGES` |
| Contact info | `Contact.jsx` | `CONTACT_INFO` |
| "Our Years" thread moments | `src/content/thread.js` | `MOMENTS`, `COUPLE` |
| Thread photos / video | `public/thread/` | see the README there |
| Colours & fonts | `styles/globals.css` | CSS variables |

## Guest uploads ("Nine years, one thread")

The last slide of the thread lets guests upload wedding-day photos (private
vault) or earlier memories (shown on the thread live). It runs on Supabase.

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.
2. Copy `.env.example` to `.env.local` and fill in the keys. Add the same
   variables in Vercel → Project → Settings → Environment Variables.
3. `npm run dev` serves the `/api` functions locally too (see `vite.config.js`).
4. Moderate at `/admin/uploads` (password = `ADMIN_PASSWORD`).

Without the env vars the thread still renders the couple's moments; uploads
just report that they aren't configured.

## Deploy

```bash
npm run build   # outputs to dist/
```

Deploy to **Vercel** (the `/api` folder becomes serverless functions and
`vercel.json` routes `/admin/uploads`). Static-only hosts such as GitHub Pages
will serve the site but not uploads.
