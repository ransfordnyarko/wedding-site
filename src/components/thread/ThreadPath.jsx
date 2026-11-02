// The curly line that runs through every moment. Lives inside the track, so
// it moves with the slides.
function threadD(n) {
  let d = 'M0 70'
  for (let k = 0; k < n; k++) {
    const x = k * 1000
    d += ` C${x + 50} 70 ${x + 130} 62 ${x + 130} 36`
       + ` C${x + 130} 10 ${x + 70} 10 ${x + 70} 36`     // the loop around the knot
       + ` C${x + 70} 62 ${x + 150} 82 ${x + 270} 78`
       + ` C${x + 520} 72 ${x + 640} 18 ${x + 800} 40`   // the gentle wave to the next moment
       + ` C${x + 900} 54 ${x + 950} 70 ${x + 1000} 70`
  }
  return d
}

export default function ThreadPath({ n, className }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${n * 1000} 120`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={threadD(n)}
        fill="none"
        stroke="var(--t-thread)"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
