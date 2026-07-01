"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Share2, Download } from "lucide-react"

type DiscProfile = {
  discCounts: Record<string, number>
  commCounts: Record<string, number>
  discDominant: string
  commDominant: string
}

type Props = {
  myProfile: DiscProfile
  theirProfile: DiscProfile
  myName?: string | null
  opponentName?: string | null
  deadline: string
  onAdvance: () => void
}

const DISC_COLORS: Record<string, string> = {
  D: "#EF4444",
  I: "#F59E0B",
  S: "#22C55E",
  C: "#3B82F6",
}
const DISC_LABELS: Record<string, string> = {
  D: "Dominan",
  I: "Influence",
  S: "Steadiness",
  C: "Conscientious",
}
const DISC_SUBTITLE: Record<string, string> = {
  D: "Tegas • Gas pol",
  I: "Sosial • Seru",
  S: "Sabar • Setia",
  C: "Teliti • Detail",
}

const COMM_LABELS: Record<string, string> = {
  Langsung: "Langsung",
  Empatik: "Empatik",
  Ekspresif: "Ekspresif",
  Tenang: "Tenang",
}
const COMM_COLORS: Record<string, string> = {
  Langsung: "#EF4444",
  Empatik: "#22C55E",
  Ekspresif: "#F59E0B",
  Tenang: "#8B5CF6",
}

/* ─── SVG Radar Chart ─── */

function RadarChart({ values, maxVal, labels, colors, size = 220 }: {
  values: number[]
  maxVal: number
  labels: string[]
  colors: string[]
  size?: number
}) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const n = values.length
  const angleSlice = (2 * Math.PI) / n

  const getPoint = (i: number, val: number) => {
    const angle = angleSlice * i - Math.PI / 2
    const dist = (val / maxVal) * r
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  const gridLevels = 4
  const gridPolygons = Array.from({ length: gridLevels }, (_, level) => {
    const pts = Array.from({ length: n }, (_, i) => {
      const a = angleSlice * i - Math.PI / 2
      const d = ((level + 1) / gridLevels) * r
      return `${cx + d * Math.cos(a)},${cy + d * Math.sin(a)}`
    }).join(" ")
    return pts
  })

  const dataPoints = values.map((v, i) => getPoint(i, v))
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(" ")

  const [animProgress, setAnimProgress] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const duration = 800
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setAnimProgress(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  const animDataPoints = values.map((v, i) => {
    const animVal = v * animProgress
    return getPoint(i, animVal)
  })
  const animPolygon = animDataPoints.map(p => `${p.x},${p.y}`).join(" ")

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px] mx-auto" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))" }}>
      {/* Grid */}
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      ))}
      {/* Grid lines */}
      {Array.from({ length: n }, (_, i) => {
        const outer = getPoint(i, maxVal)
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      })}

      {/* Data polygon fill */}
      <polygon points={animPolygon} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

      {/* Data points */}
      {animDataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={colors[i]} stroke="white" strokeWidth="1.5" />
      ))}

      {/* Labels */}
      {values.map((v, i) => {
        const labelPos = getPoint(i, maxVal * 1.22)
        return (
          <text key={i} x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle"
            className="fill-white/80" style={{ fontSize: 11, fontWeight: 600 }}>
            {labels[i]}
          </text>
        )
      })}

      {/* Center value */}
      <text x={cx} y={cy + 4} textAnchor="middle" dominantBaseline="middle"
        className="fill-white/40" style={{ fontSize: 10 }}>
        DISC
      </text>
    </svg>
  )
}

/* ─── Animated Bar ─── */

function AnimatedBar({ label, value, maxVal, color, delay = 0 }: {
  label: string; value: number; maxVal: number; color: string; delay?: number
}) {
  const [width, setWidth] = useState(0)
  const [count, setCount] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const start = performance.now() + delay
    const duration = 600
    const tick = (t: number) => {
      if (t < start) { requestAnimationFrame(tick); return }
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setWidth(eased * (value / maxVal) * 100)
      setCount(Math.round(eased * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, maxVal, delay])

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-white/70">{label}</span>
        <span className="font-semibold tabular-nums text-white">{count}</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-none" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

/* ─── Profile Card ─── */

function ProfileSection({
  name, profile, discTotal, delay,
}: { name: string; profile: DiscProfile; discTotal: number; delay: number }) {
  const discKeys = ["D", "I", "S", "C"]
  const commKeys = ["Langsung", "Empatik", "Ekspresif", "Tenang"]
  const maxDisc = Math.max(...discKeys.map(k => profile.discCounts[k] ?? 0), 1)
  const maxComm = Math.max(...commKeys.map(k => profile.commCounts[k] ?? 0), 1)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-lg font-bold text-white">{name}</p>
        <p className="text-sm text-accent font-medium">
          {DISC_LABELS[profile.discDominant]} · {COMM_LABELS[profile.commDominant] ?? profile.commDominant}
        </p>
        <p className="text-xs text-white/40">{DISC_SUBTITLE[profile.discDominant]}</p>
      </div>

      {/* Radar chart */}
      <RadarChart
        values={discKeys.map(k => profile.discCounts[k] ?? 0)}
        maxVal={maxDisc}
        labels={discKeys}
        colors={discKeys.map(k => DISC_COLORS[k])}
      />

      {/* Communication bars */}
      <div className="space-y-2 pt-2">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Gaya Komunikasi</p>
        {commKeys.map((k, i) => (
          <AnimatedBar
            key={k}
            label={COMM_LABELS[k] ?? k}
            value={profile.commCounts[k] ?? 0}
            maxVal={maxComm}
            color={COMM_COLORS[k] ?? "#6B7280"}
            delay={delay + i * 100}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Main Component ─── */

export function DiscProfileReveal({ myProfile, theirProfile, myName, opponentName, deadline, onAdvance }: Props) {
  const [remaining, setRemaining] = useState(20)
  const [iClickedReady, setIClickedReady] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [shareMsg, setShareMsg] = useState("")
  const cardRef = useRef<HTMLDivElement>(null)
  const begunRef = useRef(false)

  const handleReady = useCallback(() => setIClickedReady(true), [])
  const handleDismiss = useCallback(() => {
    if (begunRef.current) return
    begunRef.current = true
    setTimeout(onAdvance, 400)
  }, [onAdvance])

  useEffect(() => {
    const dl = new Date(deadline).getTime()
    const tick = () => {
      if (begunRef.current) return
      const r = Math.max(0, Math.ceil((dl - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) { handleDismiss(); return }
    }
    tick()
    const t = setInterval(tick, 500)
    return () => clearInterval(t)
  }, [deadline, handleDismiss])

  const myDiscTotal = Object.values(myProfile.discCounts).reduce((a, b) => a + b, 0)
  const theirDiscTotal = Object.values(theirProfile.discCounts).reduce((a, b) => a + b, 0)

  const handleShare = async () => {
    setShowShare(true)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMsg("Link disalin!")
    } catch {
      setShareMsg("Gagal menyalin")
    }
    setTimeout(() => setShareMsg(""), 2000)
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#0A1628",
        pixelRatio: 2,
      })
      const link = document.createElement("a")
      link.download = `disc-profile-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      setShareMsg("Gambar diunduh!")
    } catch {
      setShareMsg("Gagal unduh")
    }
    setTimeout(() => setShareMsg(""), 2000)
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-4" style={{ background: "linear-gradient(135deg, #0A1628 0%, #1A2A4A 100%)" }}>
      {/* Header */}
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-white">Profil Kepribadian</h2>
        <p className="text-xs text-white/40 mt-0.5">Berdasarkan jawabanmu selama permainan</p>
      </div>

      {/* Card container */}
      <div ref={cardRef} className="flex-1 flex flex-col gap-4 overflow-auto">
        {/* My Profile */}
        <div className="rounded-2xl p-5 backdrop-blur-xl border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <ProfileSection name={myName || "Kamu"} profile={myProfile} discTotal={myDiscTotal} delay={300} />
        </div>

        {/* VS divider */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs font-bold text-white/30 tracking-widest">VS</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Their Profile */}
        <div className="rounded-2xl p-5 backdrop-blur-xl border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <ProfileSection name={opponentName || "Lawan"} profile={theirProfile} discTotal={theirDiscTotal} delay={800} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-4 flex items-center justify-between">
        <button onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
          <Share2 size={14} /> Bagikan
        </button>
        {showShare && (
          <div className="flex items-center gap-2">
            <button onClick={handleCopyLink} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-white hover:bg-white/20 transition-colors cursor-pointer">
              📋 Salin Link
            </button>
            <button onClick={handleDownload} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-white hover:bg-white/20 transition-colors cursor-pointer">
              <Download size={14} className="inline mr-1" /> Unduh Gambar
            </button>
          </div>
        )}
        {shareMsg && <span className="text-xs text-accent ml-2">{shareMsg}</span>}

        {!iClickedReady ? (
          <button onClick={handleReady} className="px-8 py-3 rounded-xl bg-accent text-primary font-bold text-sm hover:bg-accent/90 transition-colors cursor-pointer shadow-lg shadow-accent/20">
            Lanjut
          </button>
        ) : (
          <p className="text-xs text-white/30">Otomatis lanjut dalam {remaining}d</p>
        )}
      </div>
    </div>
  )
}
