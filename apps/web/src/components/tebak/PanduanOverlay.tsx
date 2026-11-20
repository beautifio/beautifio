"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { AdBanner } from "./AdBanner"
import { Tebi } from "./art/Tebi"
import { IconChat, IconSearch } from "./art/icons"

type Props = {
  round: number
  onMulai: () => void
  onReady: () => void
  opponentReady?: boolean
  iAmReady?: boolean
  sessionId?: string
}

export function PanduanOverlay({ round, onMulai, onReady, opponentReady, iAmReady, sessionId }: Props) {
  const [remaining, setRemaining] = useState(8)
  const [iClickedReady, setIClickedReady] = useState(false)
  const begunRef = useRef(false)

  const handleReady = useCallback(() => {
    if (iClickedReady) return
    setIClickedReady(true)
    onReady?.()
  }, [iClickedReady, onReady])

  const handleDismiss = useCallback(() => {
    if (begunRef.current) return
    begunRef.current = true
    setTimeout(onMulai, 300)
  }, [onMulai])

  // Auto-dismiss saat bothReady (local iClickedReady, bukan iAmReady)
  useEffect(() => {
    if (iClickedReady && opponentReady) {
      handleDismiss()
    }
  }, [iClickedReady, opponentReady, handleDismiss])

  // Countdown 8 detik
  useEffect(() => {
    const start = Date.now()
    const dl = start + 8000

    const tick = () => {
      if (begunRef.current) return
      const r = Math.max(0, Math.ceil((dl - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) {
        handleDismiss()
        return
      }
    }

    tick()
    const interval = setInterval(tick, 500)
    return () => clearInterval(interval)
  }, [handleDismiss])

  const guides: Record<number, { title: string; desc: string; mood: "happy" | "think"; kind: "kenalan" | "tebak" }> = {
    1: { title: "Ronde 1: Kenalan", desc: "Jawab tentang dirimu sendiri. Tidak ada jawaban benar atau salah.", mood: "happy", kind: "kenalan" },
    2: { title: "Ronde 2: Kenalan lagi", desc: "Masih tentang dirimu. Dari sini kepribadianmu mulai kelihatan.", mood: "happy", kind: "kenalan" },
    3: { title: "Ronde 3: Tebak lawan", desc: "Satu orang menjawab, satu lagi menebak. Tebakan benar dapat 10 poin.", mood: "think", kind: "tebak" },
    4: { title: "Ronde 4: Ronde terakhir", desc: "Giliran bertukar. Kumpulkan poin sebanyak-banyaknya!", mood: "think", kind: "tebak" },
  }

  const g = guides[round] ?? guides[1]

  return (
    <div className="flex-1 flex flex-col justify-center gap-4 animate-tb-slide-in">
      <div className="tb-board p-6 text-center flex flex-col items-center">
        <Tebi mood={g.mood} size={92} className="animate-tb-bob" />
        <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${g.kind === "kenalan" ? "bg-tb-me/15 text-tb-me" : "bg-tb-them/15 text-tb-them"}`}>
          {g.kind === "kenalan" ? <IconChat size={14} /> : <IconSearch size={14} />}
          {g.kind === "kenalan" ? "Jawab tentang dirimu" : "Tebak jawaban lawan"}
        </span>
        <h2 className="font-tebak text-2xl font-semibold text-tb-ink mt-3">{g.title}</h2>
        <p className="text-sm text-tb-soft leading-relaxed mt-1 max-w-[32ch]">{g.desc}</p>

        <div className="w-full mt-6">
          {!iClickedReady ? (
            <button
              onClick={handleReady}
              className="tb-chunky w-full py-3.5 bg-tb-me border-tb-me text-tb-stage font-semibold text-sm cursor-pointer [--tb-edge:var(--color-tb-me-dark)]"
            >
              Aku siap
            </button>
          ) : (
            <p className="py-3.5 text-sm font-semibold text-tb-them animate-tb-pulse-soft">
              {opponentReady ? "Memulai…" : "Menunggu lawan siap…"}
            </p>
          )}
        </div>
        <p className={`text-xs mt-3 tabular-nums ${remaining <= 3 ? "text-tb-me" : "text-tb-soft"}`}>
          Mulai otomatis dalam {remaining} detik
        </p>
      </div>
      {sessionId ? <AdBanner location="panduan" sessionId={sessionId} /> : null}
    </div>
  )
}
