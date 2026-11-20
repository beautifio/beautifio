// Tebi — maskot Tebak Aku. Gumpalan kuning yang bereaksi pada setiap momen.
// Hanya mata & mulut yang berganti per mood, badan tetap.

export type TebiMood = "idle" | "think" | "happy" | "sad" | "shock" | "sleepy" | "party"

type Props = {
  mood?: TebiMood
  size?: number
  className?: string
  /** Warna badan; default kuning "kamu". */
  color?: string
  title?: string
}

const INK = "#062F45"

function Eyes({ mood }: { mood: TebiMood }) {
  switch (mood) {
    case "happy":
    case "party":
      // mata senyum ^ ^
      return (
        <g fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round">
          <path d="M41 58 q6 -8 12 0" />
          <path d="M67 58 q6 -8 12 0" />
        </g>
      )
    case "sad":
      return (
        <g>
          <g fill={INK} className="tb-blink">
            <ellipse cx="47" cy="60" rx="5" ry="6" />
            <ellipse cx="73" cy="60" rx="5" ry="6" />
          </g>
          <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round">
            <path d="M39 49 l12 -4" />
            <path d="M81 49 l-12 -4" />
          </g>
        </g>
      )
    case "shock":
      return (
        <g fill="#fff" stroke={INK} strokeWidth="3.5">
          <circle cx="47" cy="57" r="8" />
          <circle cx="73" cy="57" r="8" />
          <circle cx="47" cy="57" r="3" fill={INK} stroke="none" />
          <circle cx="73" cy="57" r="3" fill={INK} stroke="none" />
        </g>
      )
    case "sleepy":
      return (
        <g fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round">
          <path d="M41 59 q6 5 12 0" />
          <path d="M67 59 q6 5 12 0" />
        </g>
      )
    case "think":
      // melirik ke atas kanan
      return (
        <g fill={INK} className="tb-blink">
          <ellipse cx="50" cy="55" rx="5" ry="6.5" />
          <ellipse cx="76" cy="55" rx="5" ry="6.5" />
          <circle cx="52" cy="52.5" r="1.8" fill="#fff" />
          <circle cx="78" cy="52.5" r="1.8" fill="#fff" />
        </g>
      )
    default:
      return (
        <g fill={INK} className="tb-blink">
          <ellipse cx="47" cy="58" rx="5" ry="6.5" />
          <ellipse cx="73" cy="58" rx="5" ry="6.5" />
          <circle cx="49" cy="55.5" r="1.8" fill="#fff" />
          <circle cx="75" cy="55.5" r="1.8" fill="#fff" />
        </g>
      )
  }
}

function Mouth({ mood }: { mood: TebiMood }) {
  const common = { fill: "none", stroke: INK, strokeWidth: 4, strokeLinecap: "round" as const }
  switch (mood) {
    case "happy":
      return <path d="M50 72 q10 11 20 0" {...common} />
    case "party":
      return <path d="M49 70 q11 0 22 0 q-2 13 -11 13 q-9 0 -11 -13z" fill={INK} />
    case "sad":
      return <path d="M51 80 q9 -8 18 0" {...common} />
    case "shock":
      return <ellipse cx="60" cy="78" rx="6" ry="7.5" fill={INK} />
    case "sleepy":
      return <path d="M55 76 h10" {...common} />
    case "think":
      return <ellipse cx="62" cy="76" rx="4" ry="3.5" fill={INK} />
    default:
      return <path d="M53 73 q7 6 14 0" {...common} />
  }
}

function Extras({ mood }: { mood: TebiMood }) {
  if (mood === "think") {
    return (
      <g fill="#EAF6FB">
        <circle cx="100" cy="30" r="4" />
        <circle cx="108" cy="18" r="6" />
      </g>
    )
  }
  if (mood === "sleepy") {
    return (
      <g fill="none" stroke="#EAF6FB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M92 22 h10 l-10 11 h10" />
      </g>
    )
  }
  if (mood === "sad") {
    return <path d="M83 66 q3 6 0 9 q-3 -3 0 -9z" fill="#6BB9D4" />
  }
  if (mood === "party") {
    return (
      <g>
        <path d="M44 22 L60 -2 L74 22z" fill="#FF7A6B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="60" cy="-2" r="4" fill="#3DDC97" stroke={INK} strokeWidth="2.5" />
      </g>
    )
  }
  return null
}

export function Tebi({ mood = "idle", size = 72, className, color = "#FFC64F", title }: Props) {
  return (
    <svg
      viewBox="0 -10 120 130"
      width={size}
      height={size * (130 / 120)}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* kaki */}
      <ellipse cx="44" cy="110" rx="11" ry="6" fill={color} stroke={INK} strokeWidth="3.5" />
      <ellipse cx="76" cy="110" rx="11" ry="6" fill={color} stroke={INK} strokeWidth="3.5" />
      {/* badan gumpalan */}
      <path
        d="M60 20 C88 20 104 40 104 66 C104 94 86 108 60 108 C34 108 16 94 16 66 C16 40 32 20 60 20z"
        fill={color}
        stroke={INK}
        strokeWidth="3.5"
      />
      {/* kilau */}
      <path d="M32 46 q4 -12 16 -16" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="5" strokeLinecap="round" />
      {/* pipi */}
      {mood !== "shock" && mood !== "sleepy" && (
        <g fill="#FF7A6B" opacity="0.45">
          <ellipse cx="36" cy="72" rx="7" ry="4.5" />
          <ellipse cx="84" cy="72" rx="7" ry="4.5" />
        </g>
      )}
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      <Extras mood={mood} />
    </svg>
  )
}
