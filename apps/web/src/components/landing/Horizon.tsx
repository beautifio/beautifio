import styles from "./landing.module.css"

/* Deterministic star field — identical on server and client. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20261120)
const STARS = Array.from({ length: 90 }, (_, i) => {
  const x = rand() * 1440
  const y = rand() * 250
  return {
    x: +x.toFixed(1),
    y: +y.toFixed(1),
    r: +(0.4 + rand() * 1.0).toFixed(2),
    o: +(0.25 + rand() * 0.65 * (1 - y / 320)).toFixed(2),
    twinkle: i % 9 === 0,
  }
})

/* Path of lights: a winding trail from the foreground up to where the sun rises. */
function bez(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}
const TRAIL = { x: [790, 520, 900, 640], y: [575, 470, 360, 268] }
const TRAIL_D = `M${TRAIL.x[0]} ${TRAIL.y[0]} C ${TRAIL.x[1]} ${TRAIL.y[1]}, ${TRAIL.x[2]} ${TRAIL.y[2]}, ${TRAIL.x[3]} ${TRAIL.y[3]}`
const LIGHTS = [0.04, 0.2, 0.35, 0.48, 0.6, 0.7, 0.79, 0.87, 0.93].map((t, i, arr) => ({
  x: +bez(t, ...(TRAIL.x as [number, number, number, number])).toFixed(1),
  y: +bez(t, ...(TRAIL.y as [number, number, number, number])).toFixed(1),
  r: +(5.2 - (i / (arr.length - 1)) * 3.9).toFixed(2),
  i,
}))

const FAR = "M0 300 C 160 262, 330 238, 520 262 C 600 272, 680 270, 760 258 C 900 236, 1040 238, 1180 258 C 1300 274, 1380 262, 1440 248 L1440 560 L0 560 Z"
const MID = "M0 362 C 180 318, 360 316, 560 346 C 720 370, 860 330, 1040 320 C 1200 312, 1340 336, 1440 352 L1440 560 L0 560 Z"
const NEAR = "M0 452 C 200 404, 420 414, 640 446 C 860 478, 1100 410, 1300 420 C 1370 424, 1410 430, 1440 436 L1440 560 L0 560 Z"
const SUN_X = 640

type Props = {
  /** "hero" plays the dawn sequence; "still" renders the final state with no motion. */
  mode?: "hero" | "still"
  showStars?: boolean
  showTrail?: boolean
  className?: string
}

export function Horizon({ mode = "hero", showStars = true, showTrail = true, className = "" }: Props) {
  const animated = mode === "hero"
  return (
    <svg
      viewBox="0 0 1440 560"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      focusable="false"
      className={`${styles.horizon} ${animated ? styles.animated : ""} ${className}`}
    >
      <defs>
        <radialGradient id="hz-glow" cx={SUN_X} cy="268" r="420" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFE3A3" stopOpacity="0.95" />
          <stop offset="0.12" stopColor="#FFBE4D" stopOpacity="0.7" />
          <stop offset="0.38" stopColor="#F59C7A" stopOpacity="0.28" />
          <stop offset="0.7" stopColor="#1F6F97" stopOpacity="0.08" />
          <stop offset="1" stopColor="#1F6F97" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hz-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF7E2" />
          <stop offset="0.55" stopColor="#FFE3A3" />
          <stop offset="1" stopColor="#FFBE4D" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hz-rim" x1="0" x2="1440" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFE3A3" stopOpacity="0" />
          <stop offset={(SUN_X - 360) / 1440} stopColor="#FFBE4D" stopOpacity="0.15" />
          <stop offset={SUN_X / 1440} stopColor="#FFE3A3" stopOpacity="0.95" />
          <stop offset={(SUN_X + 380) / 1440} stopColor="#FFBE4D" stopOpacity="0.15" />
          <stop offset="1" stopColor="#FFE3A3" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hz-far" x1="0" x2="0" y1="240" y2="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0F5C82" />
          <stop offset="0.6" stopColor="#084463" />
        </linearGradient>
        <linearGradient id="hz-mid" x1="0" x2="0" y1="310" y2="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#073A58" />
          <stop offset="1" stopColor="#052A44" />
        </linearGradient>
        <linearGradient id="hz-near" x1="0" x2="0" y1="400" y2="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#042238" />
          <stop offset="1" stopColor="#03182A" />
        </linearGradient>
        <radialGradient id="hz-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF7E2" />
          <stop offset="0.28" stopColor="#FFE3A3" />
          <stop offset="0.45" stopColor="#FFBE4D" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFBE4D" stopOpacity="0" />
        </radialGradient>
      </defs>

      {showStars && (
        <g className={styles.stars}>
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#EAF6FF"
              opacity={s.o}
              className={s.twinkle ? styles.twinkle : undefined}
              style={s.twinkle ? { animationDelay: `${(i % 7) * 0.7}s` } : undefined}
            />
          ))}
        </g>
      )}

      {/* Dawn: glow + sun rising behind the far ridge */}
      <g className={styles.dawn}>
        <rect x="-400" y="-500" width="2240" height="1060" fill="url(#hz-glow)" />
        <circle cx={SUN_X} cy="282" r="46" fill="url(#hz-sun)" className={styles.sun} />
      </g>

      <g className={styles.layerFar}>
        <path d={FAR} fill="url(#hz-far)" />
        <path d={FAR.split(" L1440")[0]} fill="none" stroke="url(#hz-rim)" strokeWidth="1.6" />
      </g>
      <g className={styles.layerMid}>
        <path d={MID} fill="url(#hz-mid)" />
        <path d={MID.split(" L1440")[0]} fill="none" stroke="url(#hz-rim)" strokeOpacity="0.45" strokeWidth="1.2" />
      </g>
      <g className={styles.layerNear}>
        <path d={NEAR} fill="url(#hz-near)" />
        <path d={NEAR.split(" L1440")[0]} fill="none" stroke="url(#hz-rim)" strokeOpacity="0.22" strokeWidth="1" />
      </g>

      {showTrail && (
        <g className={styles.trail}>
          <path d={TRAIL_D} fill="none" stroke="#FFBE4D" strokeOpacity="0.22" strokeWidth="1.4" strokeDasharray="2 7" strokeLinecap="round" />
          {LIGHTS.map((l) => (
            <g key={l.i} className={styles.lamp} style={{ animationDelay: `${0.9 + l.i * 0.12}s` }}>
              <circle cx={l.x} cy={l.y} r={l.r * 3.4} fill="url(#hz-lamp)" />
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}
