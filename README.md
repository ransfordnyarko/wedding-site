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
| Colours & fonts | `styles/globals.css` | CSS variables |

## Deploy

```bash
npm run build   # outputs to dist/
```

Deploy `dist/` to Vercel, Netlify, or GitHub Pages.
