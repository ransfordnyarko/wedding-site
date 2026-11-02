# Thread media

Web-ready copies of the photos and videos in `src/assets/Memory Lane`, used by
`src/content/thread.js`. The originals stay in `src/assets/Memory Lane`.

- Photos: JPEG, at most 1600px on the long edge, with all metadata (including
  GPS location) removed. HEIC files were converted. The three Instagram-story
  shots (`2026-coldest-picture`, `2026-niagara-racing`, `2026-niagara-heights`)
  were cropped to remove the grey story bars.
- Videos: MP4 / H.264, so they play in every browser. The two HEVC originals
  (`2025-back-to-long-distance`, `2026-niagara`) were re-encoded at 720p.
  Each `*.mp4` has a matching `*-poster.jpg` frame.

Photos and videos are shown at their own shape on desktop, so give each item
its real `width` and `height` in `thread.js` when adding new ones.
