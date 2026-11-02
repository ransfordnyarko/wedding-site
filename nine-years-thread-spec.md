# Build spec: "Nine years, one thread"

**For Claude Code.** Implement this section in the existing Next.js (App Router, TypeScript) wedding site. Design reference: https://claude.ai/artifact/XPS1DuVxs8ZSgBLWSEQWuD. The artboards to follow are "Our Years", "Upload modal" and "Thread on phone".

Before writing code, read the repo and match what is already there: the font setup (`next/font`), CSS approach, motion tokens, image handling, and whatever backend the RSVP form uses. Reuse those instead of adding parallel systems. If something below conflicts with an existing convention, follow the convention and note it in your summary.

---

## 1. What it replaces

The current **"Our Moments · 9 Years in 3 Minutes"** section (the single video) goes away. In its place goes a horizontal, swipeable timeline. A curly line ("the thread") runs through every moment from 2017 to 2026. The last slide is a large circle with a plus sign, and it opens an upload modal.

Section order on the page stays the same: Hero → Our Story → **Our Years (new)** → Photos → RSVP.

---

## 2. Content model

Put all couple-authored content in one typed file, for example `content/thread.ts`, so it can be edited without touching components.

```ts
export type MediaItem =
  | { type: 'image'; src: string; alt: string; width: number; height: number }
  | { type: 'video'; src: string; poster: string; alt: string; durationLabel?: string };

export type Moment = {
  id: string;            // stable slug, e.g. '2018-first-date'
  year: string;          // '2017', '2018' … label shown in the year rail
  kicker: string;        // small label beside the knot, e.g. 'First date'
  title: string;
  body: string;
  kind: 'illustration' | 'media';
  media: MediaItem[];    // 0–3 items. Enforce max 3 with a dev-time assert.
  illustration?: 'met-on-campus';
};
```

Starting content. Text in [brackets] is a placeholder for Ransford to fill in; keep it visible as-is until replaced.

| # | year | title | kind / media |
|---|------|-------|--------------|
| 1 | 2017 | The day we met | illustration (line drawing of two people meeting on campus, speech bubble: "I feel like I know you from somewhere.") |
| 2 | 2018 | Our first date | 1 image |
| 3 | 2018 | Fun dates | 3 images |
| 4 | 2021 | Will you be my girl? | 1 video (the ask-out video) |
| 5 | 2021 | Our first kiss | 1 image |
| 6 | 2021 | Meeting my family | 3 images |
| 7 | [Year] | Distance lost | 1 image. Body: "Then we scattered: different countries, different schools, miles apart. Distance tried its best. It lost." |
| 8 | [Year] | She said yes | 2 images. Body: "I proposed after school ended, and she said yes." |
| 9 | 2026 | Now, your turn | the add slide (section 5) |

Until real assets exist, use clearly named placeholder files under `public/thread/` (`2018-first-date-1.jpg` and so on) so it's obvious what goes where.

Build the 2017 illustration as an inline SVG component with 1.5px strokes in the ink colour, `role="img"` and an `aria-label`. Don't use a raster image for it.

---

## 3. Components

```
components/thread/
  ThreadSection.tsx     server: loads static moments + approved guest moments, renders <ThreadCarousel>
  ThreadCarousel.tsx    'use client': state, drag, keyboard, layout
  YearRail.tsx          year tabs across the top
  ThreadPath.tsx        the curly SVG line
  MomentSlide.tsx       one moment (text column + media)
  MomentMedia.tsx       1 / 2 / 3 image grid, video player, illustration
  AddMomentSlide.tsx    the plus circle
  UploadModal.tsx       the modal (section 6)
  MetOnCampus.tsx       the 2017 illustration
```

---

## 4. Carousel behaviour

### Layout (desktop ≥ 900px)

- Header row: small label "OUR MOMENTS" and the heading "Nine years, *one thread*", with the italic part in the muted taupe. On the right, a counter such as `03 / 09`.
- The **year rail** sits under the header, with a 1px rule beneath it. It has one button per distinct year, in order. The active year is ink-coloured with a 2px underline; the others are muted.
- The **track** is a flex row of slides. Each slide takes `100 / n` of the track, and the track is `n × 84%` of the viewport width, so part of the next slide peeks in from the right. Move it with `transform: translateX(-(index × 100 / n)%)` on the track, with a `720ms cubic-bezier(.22,.61,.36,1)` transition (or the existing motion token closest to it).
- Inactive slides get `opacity: .28` and the `inert` attribute. The active slide is at full opacity.
- Each slide has a 120px band at the top that the thread runs through. A 9px ink dot sits at `left: 10%; top: 36px`, inside the loop. Beside it, the label `{year} · {kicker}` in 11px uppercase with letter-spacing. Under the band, a text column (`flex: 1 1 260px`) next to a media column (`flex: 2 1 440px`).
- Media grid columns: 1 item → `minmax(0, 360px)`, 2 → `repeat(2, 1fr)`, 3 → `repeat(3, 1fr)`. Images use `next/image`, a 4:5 aspect ratio and `object-fit: cover`. Video uses a 16:10 poster with a 76px round play button in the centre, and plays inline in the slide; don't open a lightbox.
- Controls row: previous and next round buttons (52px; next is filled ink), progress bars (8px inactive, 22px active, 2px tall, each inside a 28×44 hit area), and the hint "Drag, swipe or use the arrows".

### The thread (`ThreadPath.tsx`)

An absolutely positioned SVG across the full track width and 120px tall, sitting behind the slides' top bands.

```ts
// viewBox = `0 0 ${n * 1000} 120`, preserveAspectRatio="none"
// stroke #8A7A6A, width 1.6, vector-effect="non-scaling-stroke", round caps
let d = 'M0 70';
for (let k = 0; k < n; k++) {
  const x = k * 1000;
  d += ` C${x+50} 70 ${x+130} 62 ${x+130} 36`
     + ` C${x+130} 10 ${x+70} 10 ${x+70} 36`     // the loop around the knot
     + ` C${x+70} 62 ${x+150} 82 ${x+270} 78`
     + ` C${x+520} 72 ${x+640} 18 ${x+800} 40`   // the gentle wave to the next moment
     + ` C${x+900} 54 ${x+950} 70 ${x+1000} 70`;
}
```

The SVG lives inside the track, so it moves with the slides and the line seems to carry the visitor along. A nice extra if it's cheap: on first view, animate `stroke-dashoffset` so the thread draws itself up to the first knot.

### Input

- **Drag / swipe:** use pointer events on the viewport, with `touch-action: pan-y` so vertical page scrolling still works. While dragging, follow the finger (add the drag offset in px to the transform and turn the transition off). On release, move one slide if `|dx| > 50px` or the flick velocity is high; otherwise snap back. Clamp at both ends, with light rubber-banding past them.
- **Keyboard:** Left and Right arrows move between slides only while focus is inside the section. Don't add a global `keydown` handler.
- **Year rail:** clicking a year jumps to that year's first moment.
- **Progress bars:** each one jumps to its moment.
- **Reduced motion:** with `prefers-reduced-motion`, drop the transform transition (change instantly) and skip the thread drawing animation.

### Accessibility

- The section is `aria-roledescription="carousel"` with a label. Each slide is `role="group"`, `aria-roledescription="slide"`, labelled "3 of 9: Fun dates".
- Year buttons use `aria-current="true"` for the active year. Previous and next buttons have `aria-label`s and are disabled at the ends.
- Announce the current slide to screen readers in a polite live region when it changes.
- Every image gets a meaningful `alt`.

### Mobile (< 900px)

Same component, using the "Thread on phone" artboard:

- Slides take the full width minus 24px padding on each side (`track = n × 100%`).
- The year rail scrolls horizontally, and the active year scrolls into view.
- Media is a single 360px-tall image. If a moment has more than one, show the first with a small `1 / 3` badge, and swipe inside the media to see the rest. **Don't** nest a second horizontal swipe that fights the slide swipe. A tap on the media opens a simple lightbox for the rest; that is the safer choice.
- The thread band shrinks to 84px. The heading drops to 30px.
- The bottom controls are previous and next buttons (48px) with "Swipe through the years" between them.

---

## 5. The add slide (last slide, 2026)

- The text column has the title "Now, your turn" and the body "Tap the circle to add yours. Wedding-day photos go into a private vault for our montage; older memories join this thread straight away, with your caption."
- Media area: a **200px circle** (168px on mobile) with a 1px ink border, a transparent fill and a thin plus sign (56px icon, stroke width about 0.9). Under it, "ADD TO OUR STORY" in the display serif, and "Wedding-day photos, or a memory from 2017 to 2025" in the small muted style.
- The circle is a `<button aria-label="Add a photo or memory to our story">` that opens `UploadModal`. On hover or focus, invert it (ink fill, light plus) over 200ms.

---

## 6. Upload modal

Use a native `<dialog>` (or the site's existing modal primitive). It's a 960px-max dark panel over a `rgba(22,21,19,.55)` backdrop. Close it with the ✕ button, Esc or a backdrop click. Trap focus while it's open, and return focus to the plus circle when it closes. On phones it becomes a full-height sheet.

Two tabs (`role="tablist"`):

**A. On the wedding day** (November 2026, photos and videos)

- A multi-file drop zone with no count limit. Keep full quality.
- Field: your name.
- Button: **Send to the vault**. Fine print: "Private until the montage is ready."
- The right-hand panel says "Kept for the montage", with text explaining that only Ransford and Ewoe can see these.
- These uploads are **never** shown publicly on the site.

**B. From earlier years** (2017 to 2025; this is the default tab)

- Year picker: toggle buttons for 2017 through 2025, using `aria-pressed`.
- A drop zone with a **maximum of 3 files**. Accept JPG, PNG, HEIC and MP4.
- Fields: caption (textarea) and your name.
- Button: **Add to the thread**. Fine print: "Shows on the thread straight away."
- The right-hand panel is a **live preview** in the light thread style: a short thread segment with its knot, `{year} · Added by {name}`, the first chosen file as a thumbnail, and the caption in italic Playfair. It updates as the guest types.
- On success, close the modal, jump the carousel to the new moment, and briefly highlight it.

Validation: at least one file; type and size limits (suggested 20 MB per image, 200 MB per video; adjust to what the storage plan allows); caption at most 280 characters; name required. Show errors inline under each field.

---

## 7. Backend: uploads and real time

First check what the RSVP form already uses (a database, form service or email) and extend that if it can handle files and live updates. If nothing suitable exists, use **Supabase** (Storage, Postgres and Realtime in one). Don't add a second database.

**Storage:** two buckets.

- `vault` is **private** and holds wedding-day files. Writes go through signed upload URLs only. No public read.
- `memories` is **public read** and holds earlier-year files.

**Table `guest_uploads`:**

```
id uuid pk
kind text check (kind in ('wedding','memory'))
year text null              -- required when kind = 'memory'
caption text null
guest_name text not null
files jsonb not null        -- [{ path, mime, width, height, poster? }]
status text default 'visible' check (status in ('visible','hidden'))
created_at timestamptz default now()
```

**Upload flow:**

1. The client calls `POST /api/uploads/sign` with `{kind, files:[{name,mime,size}]}`.
2. The server validates and returns signed upload URLs for the right bucket.
3. The client uploads the files directly to storage, with a progress bar per file.
4. The client calls `POST /api/uploads/complete` with the metadata, and the server inserts the row.

**Abuse protection:** a honeypot field, a per-IP rate limit (for example 10 submissions an hour), server-side checks of mime type and size, and stripping EXIF location data from images before they are stored publicly.

**How guest memories join the thread:** each earlier-year submission becomes **its own moment** in that year, ordered after the couple's moments for the year, then by `created_at`. Its kicker is "From {guest_name}" and its title is the first line of the caption, or "A memory". This automatically respects the 3-per-moment cap, and it's what the design means by "opens a new loop beside it".

**Real time:** `ThreadSection` server-renders the visible memories. `ThreadCarousel` then subscribes to inserts on `guest_uploads` where `kind = 'memory'` and `status = 'visible'`, and adds new moments without a reload. If Realtime isn't available, use revalidation (for example SWR polling every 30 seconds) as the fallback.

**Moderation:** add a protected `/admin/uploads` page, gated by an environment-variable password or the existing admin auth if there is one. It lists recent uploads with a hide/show toggle and links to download the vault. Keep it minimal.

**Video:** don't transcode on the server. Use the original MP4, plus a poster image grabbed on the client from the first frame. Limit guest video to MP4/H.264.

---

## 8. Design tokens

Match the existing site where these overlap.

| Token | Value | Use |
|---|---|---|
| ground | `#F8F7F4` | section background |
| ink | `#1B1A18` | text, knots, filled buttons |
| body | `#4A4640` | paragraph text |
| muted | `#6B665F` | labels, kickers (passes 4.5:1 on ground) |
| thread | `#8A7A6A` | the line, the italic accent in the heading |
| rule | `#DEDAD3` | year-rail divider |
| placeholder | `#A49C91` | dashed placeholder borders |
| modal | `#161513` / field `#222120` / border `#3A3835` / text `#F3F1EC` / muted `#A8A196` | upload modal |

Fonts: **Playfair Display** for headings and the italic accents, **DM Sans** for body and labels (both probably already loaded), and **Italiana** for the year rail and "ADD TO OUR STORY". Add Italiana through `next/font/google`. Labels are 11px uppercase with `letter-spacing: .2em`.

---

## 9. Done when

- [ ] The old "9 Years in 3 Minutes" section is gone and the thread renders in its place, in desktop and phone layouts.
- [ ] Drag, touch swipe, arrows, the year rail and the progress bars all move between slides. The thread moves with the slides.
- [ ] No moment can render more than 3 media items.
- [ ] The plus circle opens the modal. Focus is trapped while it's open and returns to the circle when it closes. Esc closes it.
- [ ] A wedding-day upload lands in the private bucket and never appears on the public page.
- [ ] An earlier-year upload appears on the thread in another open browser tab without a refresh.
- [ ] Hiding an upload in `/admin/uploads` removes it from the thread.
- [ ] Reduced motion is respected. Keyboard and screen-reader paths work. Lighthouse accessibility score is 95 or above.
- [ ] Placeholder copy in [brackets] is still visible wherever real content hasn't been supplied.

When you're done, give a short summary: the files you added or changed, any environment variables needed (storage keys, admin password), and anything you deviated from in this spec and why.
