// ── "Nine years, one thread" — edit the couple's moments here ─────────
//
// Text in [brackets] is a placeholder. It stays visible on the site until
// you replace it. Image/video files live in /public/thread/ (see the
// README there for the full list of expected file names).

/**
 * @typedef {{ type: 'image', src: string, alt: string, width: number, height: number, position?: string }} ImageItem
 * @typedef {{ type: 'video', src: string, poster: string, alt: string, width?: number, height?: number, durationLabel?: string }} VideoItem
 * @typedef {ImageItem | VideoItem} MediaItem
 *
 * @typedef {Object} Moment
 * @property {string} id          stable slug, e.g. '2018-first-date'
 * @property {string} year        label shown in the year rail
 * @property {string} kicker      small label beside the knot
 * @property {string} title
 * @property {string} body
 * @property {'illustration' | 'media' | 'add'} kind
 * @property {MediaItem[]} media  0–3 items (enforced by assertMoment)
 * @property {'met-on-campus'} [illustration]
 * @property {string} [guestName] set on guest-submitted moments
 * @property {string} [createdAt] set on guest-submitted moments
 */

export const COUPLE = {
  groom: 'Ransford',
  bride: 'Ewoe',
}

export const MAX_MEDIA_PER_MOMENT = 3

export { GUEST_YEARS } from '../lib/uploadLimits'

/**
 * Guest uploads (the "Now, your turn" slide + upload modal) are switched off
 * for now; a different version is coming later. Flip to true to bring the
 * add slide, the modal and live guest memories back.
 */
export const GUEST_UPLOADS_ENABLED = false

/**
 * For now the plus circle sends guests to a shared Google Drive folder instead.
 * Paste the folder's share link here (sharing: "Anyone with the link", Editor,
 * so guests can upload). While this is empty the add slide stays hidden.
 */
export const DRIVE_UPLOAD_URL = 'https://drive.google.com/drive/folders/1qyUZfh00vkOTX9v9mJI4_29dvl0yRK7a?usp=sharing'

/** `position` is the CSS object-position used when a photo has to be cropped (phones). */
const img = (src, alt, width, height, position) => ({ type: 'image', src, alt, width, height, position })
const video = (src, alt, width, height, durationLabel) => ({
  type: 'video', src, poster: src.replace(/\.mp4$/, '-poster.jpg'), alt, width, height, durationLabel,
})
const T = '/thread/'
const TOP = 'center 12%' // FaceTime screenshots: keep both faces in frame

// Each chapter that has a video opens with it (videos always stand alone);
// the photos from the same chapter follow as their own moment.
/** @type {Moment[]} */
export const MOMENTS = [
  {
    id: '2017-the-day-we-met',
    year: '2017',
    kicker: 'Where it started',
    title: 'The day we met',
    body: 'A line on campus: "I feel like I know you from somewhere." A small trick to start a conversation, and it worked. No photos from this one, so here is how we remember it.',
    kind: 'illustration',
    illustration: 'met-on-campus',
    media: [],
  },
  {
    id: '2018-first-date',
    year: '2018',
    kicker: 'First date',
    title: 'Our first date',
    body: 'The first of many. We still have the selfie to prove it happened.',
    kind: 'media',
    media: [img(`${T}2018-first-date.jpg`, 'Ransford and Ewoe smiling together in a selfie on their first date', 1599, 1200)],
  },
  {
    id: '2018-after-church',
    year: '2018',
    kicker: 'Sundays',
    title: 'After service at KCF',
    body: 'Sunday service at KCF, and a photo together on the way out.',
    kind: 'media',
    media: [img(`${T}2018-kcf-after-church.jpg`, 'Ransford with his arm around Ewoe in a church lobby after a KCF service', 810, 1080)],
  },
  {
    id: '2019-firsts',
    year: '2019',
    kicker: 'Firsts',
    title: 'Firsts, together',
    body: 'Our first outing, and my birthday with her by my side. 2019 was the year we started collecting moments.',
    kind: 'media',
    media: [
      img(`${T}2019-first-outing.jpg`, 'Ransford in a grey blazer and Ewoe in black on a sunny lawn at their first outing', 1080, 810),
      img(`${T}2019-ransfords-birthday.jpg`, 'Ransford and Ewoe standing together on a terrace on his birthday', 810, 1080),
    ],
  },
  {
    id: '2022-ewoe-birthday',
    year: '2022',
    kicker: 'Her birthday',
    title: "Ewoe's birthday",
    body: 'A cake, a celebration, and the look on her face.',
    kind: 'media',
    media: [video(`${T}2022-ewoe-birthday.mp4`, 'Video of Ransford and Ewoe with her birthday cake', 576, 1056, '0:25')],
  },
  {
    id: '2023-ghana-canada',
    year: '2023',
    kicker: 'The miles between',
    title: 'Ghana to Canada',
    body: 'Then we scattered: different countries, different time zones. Our dates moved to FaceTime, and we kept showing up.',
    kind: 'media',
    media: [
      img(`${T}2023-ghana-canada-1.jpg`, 'FaceTime screenshot: Ransford grinning close to the camera with Ewoe in the corner', 738, 1600, TOP),
      img(`${T}2023-ghana-canada-2.jpg`, 'FaceTime screenshot: Ransford on the call with Ewoe in the corner', 738, 1600, TOP),
    ],
  },
  {
    id: '2024-creating-memories',
    year: '2024',
    kicker: 'Together again',
    title: 'Creating memories',
    body: 'Every visit was a race to fit in as much as we could.',
    kind: 'media',
    media: [video(`${T}2024-creating-memories.mp4`, 'Video of a printed photo of Ransford and Ewoe from a photoshoot', 720, 1280, '0:10')],
  },
  {
    id: '2024-one-last-day',
    year: '2024',
    kicker: 'August',
    title: 'One last day, then the miles',
    body: 'The day before I left, and one of the first calls from the other side. This time it was the US and Canada.',
    kind: 'media',
    media: [
      img(`${T}2024-day-before-leaving.jpg`, 'Ransford and Ewoe dressed up in a living room the day before he left', 1200, 1600),
      img(`${T}2024-us-canada-call.jpg`, 'FaceTime screenshot: Ransford throwing up a peace sign with Ewoe in the corner', 738, 1600, TOP),
    ],
  },
  {
    id: '2025-first-couple-interview',
    year: '2025',
    kicker: 'June',
    title: 'Our first couple interview',
    body: 'We sat down for our first interview as a couple, and got a selfie out of it.',
    kind: 'media',
    media: [img(`${T}2025-first-couple-interview.jpg`, 'Selfie of Ewoe with Ransford leaning his head on hers, both pouting for the camera', 1200, 1599)],
  },
  {
    id: '2025-ewoe-graduation',
    year: '2025',
    kicker: 'October',
    title: "Ewoe's graduation",
    body: 'She walked across that stage, and I got to be there to see it.',
    kind: 'media',
    media: [video(`${T}2025-graduation.mp4`, 'Video of Ewoe in her graduation gown being handed flowers', 720, 1280, '0:07')],
  },
  {
    id: '2025-graduation-day',
    year: '2025',
    kicker: 'Graduation day',
    title: 'So proud of her',
    body: 'Fixing her cap, flowers in hand, and a selfie to close out a big day.',
    kind: 'media',
    media: [
      img(`${T}2025-graduation-capping.jpg`, 'Ransford adjusting Ewoe’s graduation cap in the hall', 1290, 1592),
      img(`${T}2025-graduation-portrait.jpg`, 'Ewoe holding a bouquet with Ransford behind her on a tree-lined path', 1280, 1599),
      img(`${T}2025-graduation-selfie.jpg`, 'Selfie of Ewoe and Ransford outside at sunset after graduation', 1200, 1599),
    ],
  },
  {
    id: '2025-cake-and-thanksgiving',
    year: '2025',
    kicker: 'Celebrating',
    title: 'Cake and thanksgiving',
    body: 'A cake for the graduate, then thanksgiving with family.',
    kind: 'media',
    media: [
      img(`${T}2025-graduation-cake.jpg`, 'Ransford and Ewoe embracing beside her graduation cake', 1200, 1600),
      img(`${T}2025-graduation-thanksgiving.jpg`, 'Ewoe and Ransford with two family members at the graduation thanksgiving', 1280, 960),
    ],
  },
  {
    id: '2025-kamloops',
    year: '2025',
    kicker: 'The next day',
    title: 'Cozy at Kamloops',
    body: 'The day after graduation, up on a mountain in Kamloops, just the two of us.',
    kind: 'media',
    media: [
      img(`${T}2025-kamloops-1.jpg`, 'Ransford holding Ewoe from behind on a mountain overlooking a lake', 1200, 1600),
      img(`${T}2025-kamloops-2.jpg`, 'Selfie of Ewoe hugging Ransford with the lake and hills behind them', 1600, 1200),
      img(`${T}2025-kamloops-3.jpg`, 'Ewoe sitting on a picnic bench with Ransford behind her among autumn leaves', 1200, 1600),
    ],
  },
  {
    id: '2025-back-to-long-distance',
    year: '2025',
    kicker: 'Goodbye again',
    title: 'Back to long distance',
    body: 'Every visit ended the same way: another goodbye, and another video call.',
    kind: 'media',
    media: [video(`${T}2025-back-to-long-distance.mp4`, 'Screen recording of a FaceTime call between Ransford and Ewoe', 592, 1280, '0:38')],
  },
  {
    id: '2025-distance-lost',
    year: '2025',
    kicker: 'US and Canada',
    title: 'Distance lost',
    body: 'Late calls, sleepy faces and plenty of silliness. Distance tried its best. It lost.',
    kind: 'media',
    media: [
      img(`${T}2025-us-canada-call-1.jpg`, 'FaceTime screenshot: Ransford smiling on a late-night call with Ewoe', 738, 1600, TOP),
      img(`${T}2025-us-canada-call-2.jpg`, 'FaceTime screenshot: Ransford pressed against a pillow, pouting at Ewoe', 738, 1600, TOP),
    ],
  },
  {
    id: '2026-the-proposal',
    year: '2026',
    kicker: 'June',
    title: 'The proposal',
    body: 'I asked her to marry me. Here is how it happened.',
    kind: 'media',
    media: [video(`${T}2026-proposal.mp4`, 'Video of Ransford proposing to Ewoe on the steps of a historic building', 464, 832, '4:34')],
  },
  {
    id: '2026-moments-before',
    year: '2026',
    kicker: 'Rewind a few hours',
    title: 'Moments before',
    body: 'Dressed up and heading out, a few hours before everything changed. The coldest picture of 2026, if you ask us.',
    kind: 'media',
    media: [
      img(`${T}2026-before-the-proposal.jpg`, 'Mirror selfie of Ewoe and Ransford dressed in black before the proposal', 1200, 1600),
      img(`${T}2026-coldest-picture.jpg`, 'Ewoe and Ransford in formal black stepping out of a car in a parking garage', 1290, 951),
    ],
  },
  {
    id: '2026-she-said-yes',
    year: '2026',
    kicker: 'Engaged',
    title: 'She said yes',
    body: 'Then dinner at the CN Tower, newly engaged, with the whole city lit up below us.',
    kind: 'media',
    media: [
      img(`${T}2026-she-said-yes.jpg`, 'Selfie of Ewoe and Ransford in front of ornate wooden doors just after she said yes', 1200, 1599),
      img(`${T}2026-dinner-at-the-cn.jpg`, 'Ransford and Ewoe at a candlelit dinner table at the CN Tower with city lights behind them', 1600, 1204),
    ],
  },
  {
    id: '2026-niagara-falls',
    year: '2026',
    kicker: 'Two days later',
    title: 'Adventure to Niagara Falls',
    body: 'Our first trip as an engaged couple, and the car ride there was half the fun.',
    kind: 'media',
    media: [video(`${T}2026-niagara.mp4`, 'Video of Ewoe and Ransford in the car on the way to Niagara Falls', 1280, 720, '0:31')],
  },
  {
    id: '2026-niagara-day',
    year: '2026',
    kicker: 'Niagara',
    title: 'Helmets and heights',
    body: 'A morning outing with a new ring, go-karts, and the view from the top. Next stop: December 19.',
    kind: 'media',
    media: [
      img(`${T}2026-niagara-morning.jpg`, 'Ewoe’s hand showing her engagement ring at a café table, Ransford behind', 1200, 1600),
      img(`${T}2026-niagara-racing.jpg`, 'Ewoe and Ransford in go-kart helmets blowing kisses at the camera', 1290, 974),
      img(`${T}2026-niagara-heights.jpg`, 'Ewoe and Ransford smiling in an observation wheel cabin at Niagara', 1290, 974),
    ],
  },
]

/** The final "Now, your turn" slide. Always last. */
export const ADD_MOMENT = {
  id: 'add-your-moment',
  year: '2026',
  kicker: 'December',
  title: 'Now, your turn',
  body: 'Tap the circle to add yours. Wedding-day photos go into a private vault for our montage; older memories join this thread straight away, with your caption.',
  kind: 'add',
  media: [],
}

/** The last slide when uploads go to Google Drive. */
export const DRIVE_ADD_MOMENT = {
  ...ADD_MOMENT,
  body: 'Tap the circle to add yours. It opens our shared Google Drive folder, where you can drop in photos and videos from any year, or from the wedding day.',
  href: DRIVE_UPLOAD_URL,
}

export function assertMoment(m) {
  if (import.meta.env.DEV && m.media.length > MAX_MEDIA_PER_MOMENT) {
    throw new Error(`Moment "${m.id}" has ${m.media.length} media items; the max is ${MAX_MEDIA_PER_MOMENT}.`)
  }
  return m
}

MOMENTS.forEach(assertMoment)
