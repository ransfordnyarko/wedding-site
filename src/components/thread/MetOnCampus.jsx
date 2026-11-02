// 2017: "The day we met". Inline line drawing, no raster image.
export default function MetOnCampus({ compact = false, className }) {
  const label = 'Line illustration: a young man and woman meeting on campus. He says, "I feel like I know you from somewhere."'
  if (compact) {
    return (
      <svg viewBox="0 0 300 360" role="img" aria-label={label} className={className}>
        <g fill="none" stroke="var(--t-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 300 H280" />
          <circle cx="110" cy="180" r="13" />
          <path d="M110 193 C108 222 110 244 110 262 M110 262 L100 300 M110 262 L120 300 M110 214 L136 226" />
          <circle cx="186" cy="180" r="13" />
          <path d="M173 176 C171 156 201 156 199 176 C203 186 205 194 199 200 M186 193 L166 264 H206 Z M178 264 L176 300 M194 264 L196 300" />
          <path d="M28 92 H262 A20 20 0 0 1 262 132 H124 L108 148 L110 132 H28 A20 20 0 0 1 28 92 Z" />
        </g>
        <text x="145" y="117" textAnchor="middle" fontFamily="var(--serif)" fontStyle="italic" fontSize="11" fill="var(--t-ink)">
          "I feel like I know you from somewhere."
        </text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 420 300" role="img" aria-label={label} className={className}>
      <g fill="none" stroke="var(--t-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 262 H396" />
        {/* campus building */}
        <path d="M262 262 V128 H374 V262 M252 128 L318 92 L384 128 M282 262 V150 M318 262 V150 M354 262 V150" />
        {/* tree */}
        <circle cx="74" cy="146" r="34" />
        <path d="M74 180 V262 M74 214 L60 200 M74 226 L88 212" />
        {/* him */}
        <circle cx="150" cy="150" r="12" />
        <path d="M150 162 C148 190 150 208 150 224 M150 224 L141 262 M150 224 L159 262 M150 182 L174 192 M150 182 L136 204" />
        {/* her */}
        <circle cx="216" cy="150" r="12" />
        <path d="M204 146 C202 128 230 128 228 146 C232 156 234 164 228 170" />
        <path d="M216 162 L198 226 H234 Z M208 226 L206 262 M224 226 L226 262 M214 180 L200 200" />
        {/* speech bubble */}
        <path d="M66 70 H298 A18 18 0 0 1 298 106 H150 L136 120 L138 106 H66 A18 18 0 0 1 66 70 Z" />
      </g>
      <text x="182" y="93" textAnchor="middle" fontFamily="var(--serif)" fontStyle="italic" fontSize="12" fill="var(--t-ink)">
        "I feel like I know you from somewhere."
      </text>
    </svg>
  )
}
