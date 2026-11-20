"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Share2, Download, Link2 } from "lucide-react"
import { DiscCritter, DISC_META, type DiscType } from "./art/DiscCritters"

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

const DISC_KEYS: DiscType[] = ["D", "I", "S", "C"]

function asDisc(k: string): DiscType {
  return (DISC_KEYS as string[]).includes(k) ? (k as DiscType) : "S"
}

/* ─── Bar DISC yang terisi bertahap ─── */
function AnimatedBar({ type, value, maxVal, delay = 0 }: { type: DiscType; value: number; maxVal: number; delay?: number }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setOn(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  const meta = DISC_META[type]
  const pct = maxVal > 0 ? (value / maxVal) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 font-tebak text-sm font-semibold" style={{ color: meta.color }}>{type}</span>
      <div className="flex-1 h-2.5 rounded-full bg-tb-deep overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: on ? `${pct}%` : "0%", background: meta.color, transition: "width 700ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </div>
      <span className="w-4 text-right text-xs tabular-nums text-tb-soft">{value}</span>
    </div>
  )
}

/* ─── Kartu profil satu pemain ─── */
function ProfileCard({ name, profile, tone, delay }: { name: string; profile: DiscProfile; tone: "me" | "them"; delay: number }) {
  const dom = asDisc(profile.discDominant)
  const meta = DISC_META[dom]
  const maxDisc = Math.max(...DISC_KEYS.map(k => profile.discCounts[k] ?? 0), 1)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div className="tb-board p-4 [perspective:800px]">
      <div className="flex items-center gap-3">
        <div
          className="w-[76px] h-[76px] shrink-0 rounded-3xl flex items-center justify-center border-2"
          style={{
            background: flipped ? `${meta.color}22` : "var(--color-tb-deep)",
            borderColor: flipped ? meta.color : "var(--color-tb-line)",
            transform: flipped ? "rotateY(0deg)" : "rotateY(90deg)",
            transition: "transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 300ms ease, border-color 300ms ease",
          }}
        >
          <DiscCritter type={dom} size={60} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-semibold truncate ${tone === "me" ? "text-tb-me" : "text-tb-them"}`}>{name}</p>
          <p className="font-tebak text-xl font-semibold text-tb-ink leading-tight">
            Si {meta.animal}
          </p>
          <p className="text-xs text-tb-soft leading-snug">{meta.label} · {meta.tagline}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {DISC_KEYS.map((k, i) => (
          <AnimatedBar key={k} type={k} value={profile.discCounts[k] ?? 0} maxVal={maxDisc} delay={delay + 200 + i * 90} />
        ))}
      </div>
      {profile.commDominant ? (
        <p className="mt-3 text-xs text-tb-soft">
          Gaya ngobrol: <span className="font-semibold text-tb-ink">{profile.commDominant}</span>
        </p>
      ) : null}
    </div>
  )
}

/* ─── Main Component ─── */
export function DiscProfileReveal({ myProfile, theirProfile, myName, opponentName, deadline, onAdvance }: Props) {
  const [remaining, setRemaining] = useState(20)
  const [showShare, setShowShare] = useState(false)
  const [shareMsg, setShareMsg] = useState("")
  const cardRef = useRef<HTMLDivElement>(null)
  const begunRef = useRef(false)

  const handleDismiss = useCallback(() => {
    if (begunRef.current) return
    begunRef.current = true
    setTimeout(onAdvance, 300)
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMsg("Link disalin")
    } catch {
      setShareMsg("Link gagal disalin")
    }
    setTimeout(() => setShareMsg(""), 2000)
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(cardRef.current, { backgroundColor: "#062F45", pixelRatio: 2 })
      const link = document.createElement("a")
      link.download = `profil-tebak-aku-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      setShareMsg("Gambar tersimpan")
    } catch {
      setShareMsg("Gambar gagal dibuat")
    }
    setTimeout(() => setShareMsg(""), 2000)
  }

  return (
    <div className="flex flex-col gap-4 animate-tb-slide-in">
      <div className="text-center">
        <h2 className="font-tebak text-2xl font-semibold text-tb-ink">Ini kepribadian kalian</h2>
        <p className="text-sm text-tb-soft mt-0.5">Dari jawaban di ronde kenalan</p>
      </div>

      <div ref={cardRef} className="flex flex-col gap-3 p-1">
        <ProfileCard name={myName || "Kamu"} profile={myProfile} tone="me" delay={250} />
        <ProfileCard name={opponentName || "Lawan"} profile={theirProfile} tone="them" delay={900} />
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleDismiss}
          className="tb-chunky w-full py-3.5 bg-tb-me border-tb-me text-tb-stage font-semibold text-sm cursor-pointer [--tb-edge:var(--color-tb-me-dark)]"
        >
          Lihat hasil akhir
        </button>
        <div className="flex items-center justify-between gap-2 min-h-[36px]">
          {showShare ? (
            <div className="flex items-center gap-2">
              <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-tb-line text-xs text-tb-ink hover:bg-white/10 transition-colors cursor-pointer">
                <Link2 size={14} /> Salin link
              </button>
              <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-tb-line text-xs text-tb-ink hover:bg-white/10 transition-colors cursor-pointer">
                <Download size={14} /> Simpan gambar
              </button>
            </div>
          ) : (
            <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-tb-line text-xs text-tb-soft hover:text-tb-ink hover:bg-white/5 transition-colors cursor-pointer">
              <Share2 size={14} /> Bagikan
            </button>
          )}
          <span className="text-xs text-tb-soft tabular-nums" aria-live="polite">
            {shareMsg || `Lanjut otomatis ${remaining} dtk`}
          </span>
        </div>
      </div>
    </div>
  )
}
