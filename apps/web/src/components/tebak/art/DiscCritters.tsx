// Makhluk kecil per tipe DISC, satu gaya dengan Tebi (bulat, garis tebal, warna token).
// D = Singa, I = Beo, S = Kura-kura, C = Burung hantu.

export type DiscType = "D" | "I" | "S" | "C"

export const DISC_META: Record<DiscType, { color: string; dark: string; animal: string; label: string; tagline: string }> = {
  D: { color: "#FF7A6B", dark: "#C9473A", animal: "Singa", label: "Dominan", tagline: "Tegas, cepat ambil keputusan" },
  I: { color: "#FFC64F", dark: "#C98F12", animal: "Beo", label: "Influence", tagline: "Ceria, suka ngobrol & bikin suasana" },
  S: { color: "#3DDC97", dark: "#1E9E68", animal: "Kura-kura", label: "Steadiness", tagline: "Sabar, setia, bikin orang nyaman" },
  C: { color: "#6BB9D4", dark: "#3B87A3", animal: "Burung hantu", label: "Conscientious", tagline: "Teliti, rapi, suka berpikir dulu" },
}

const INK = "#062F45"
const SW = 3.5

function Face({ cx = 50, cy = 56 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <g fill={INK} className="tb-blink">
        <circle cx={cx - 10} cy={cy} r="4" />
        <circle cx={cx + 10} cy={cy} r="4" />
      </g>
      <circle cx={cx - 9} cy={cy - 1.5} r="1.3" fill="#fff" />
      <circle cx={cx + 11} cy={cy - 1.5} r="1.3" fill="#fff" />
      <path d={`M${cx - 5} ${cy + 9} q5 5 10 0`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

function Lion() {
  const m = DISC_META.D
  return (
    <g>
      {/* surai */}
      <g fill={m.dark} stroke={INK} strokeWidth={SW} strokeLinejoin="round">
        <path d="M50 8 l9 10 l13 -5 l1 14 l13 3 l-6 12 l9 10 l-12 6 l3 13 l-13 -1 l-5 12 l-12 -8 l-12 8 l-5 -12 l-13 1 l3 -13 l-12 -6 l9 -10 l-6 -12 l13 -3 l1 -14 l13 5z" />
      </g>
      <circle cx="50" cy="56" r="26" fill={m.color} stroke={INK} strokeWidth={SW} />
      <circle cx="31" cy="34" r="6" fill={m.color} stroke={INK} strokeWidth={SW} />
      <circle cx="69" cy="34" r="6" fill={m.color} stroke={INK} strokeWidth={SW} />
      <Face />
      <path d="M46 62 h8 l-4 4z" fill={INK} />
    </g>
  )
}

function Parrot() {
  const m = DISC_META.I
  return (
    <g>
      {/* jambul */}
      <g fill="#FF7A6B" stroke={INK} strokeWidth={SW} strokeLinejoin="round">
        <path d="M44 22 q-4 -16 6 -18 q2 10 0 18z" />
        <path d="M52 22 q4 -16 16 -12 q-4 10 -12 14z" />
      </g>
      <ellipse cx="50" cy="58" rx="30" ry="32" fill={m.color} stroke={INK} strokeWidth={SW} />
      <ellipse cx="22" cy="64" rx="7" ry="14" fill={m.dark} stroke={INK} strokeWidth={SW} />
      <ellipse cx="78" cy="64" rx="7" ry="14" fill={m.dark} stroke={INK} strokeWidth={SW} />
      <g fill={INK} className="tb-blink">
        <circle cx="39" cy="50" r="4" />
        <circle cx="61" cy="50" r="4" />
      </g>
      {/* paruh */}
      <path d="M42 58 q8 -4 16 0 q-2 12 -8 14 q-6 -2 -8 -14z" fill="#FF7A6B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </g>
  )
}

function Turtle() {
  const m = DISC_META.S
  return (
    <g>
      <circle cx="80" cy="50" r="13" fill={m.color} stroke={INK} strokeWidth={SW} />
      <ellipse cx="26" cy="84" rx="9" ry="6" fill={m.color} stroke={INK} strokeWidth={SW} />
      <ellipse cx="66" cy="84" rx="9" ry="6" fill={m.color} stroke={INK} strokeWidth={SW} />
      <path d="M8 76 C8 40 26 26 44 26 C62 26 74 42 74 76z" fill={m.dark} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" opacity="0.6">
        <path d="M30 44 l14 -8 l14 8 l0 16 l-14 8 l-14 -8z" />
      </g>
      <path d="M4 76 h74" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <circle cx="83" cy="47" r="3" fill={INK} className="tb-blink" />
      <path d="M78 56 q5 3 9 0" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

function Owl() {
  const m = DISC_META.C
  return (
    <g>
      <path d="M26 24 l6 14 M74 24 l-6 14" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <path d="M20 40 C20 18 80 18 80 40 L80 70 C80 88 66 94 50 94 C34 94 20 88 20 70z" fill={m.color} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <ellipse cx="50" cy="74" rx="16" ry="14" fill="#EAF6FB" opacity="0.6" />
      <circle cx="37" cy="46" r="11" fill="#fff" stroke={INK} strokeWidth={SW} />
      <circle cx="63" cy="46" r="11" fill="#fff" stroke={INK} strokeWidth={SW} />
      <g fill={INK} className="tb-blink">
        <circle cx="37" cy="46" r="4.5" />
        <circle cx="63" cy="46" r="4.5" />
      </g>
      {/* kacamata kecil */}
      <path d="M48 46 h4" stroke={INK} strokeWidth="3" />
      <path d="M46 58 h8 l-4 7z" fill="#FFC64F" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    </g>
  )
}

const ART: Record<DiscType, () => React.ReactElement> = { D: Lion, I: Parrot, S: Turtle, C: Owl }

export function DiscCritter({ type, size = 64, className }: { type: DiscType; size?: number; className?: string }) {
  const Art = ART[type]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={`${DISC_META[type].animal} — ${DISC_META[type].label}`}>
      <Art />
    </svg>
  )
}
