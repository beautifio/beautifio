"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { AdBanner } from "./AdBanner"

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

  const guides: Record<number, { title: string; desc: string }> = {
    1: {
      title: "Ronde 1 — Refleksi Diri 💬",
      desc: "Jawab tentang dirimu sendiri.\n\nTidak ada benar atau salah — jawabanmu jadi petunjuk buat lawan menebakmu nanti.",
    },
    2: {
      title: "Ronde 2 — Refleksi Diri 💬",
      desc: "Masih tentang dirimu.\n\nKenali dirimu lebih dalam — jawabanmu jadi petunjuk tambahan di ronde menebak nanti.",
    },
    3: {
      title: "Ronde 3 — Tebak Lawan 🔍",
      desc: "Sekarang giliranmu menebak!\n\nGunakan petunjuk dari jawaban lawan di ronde sebelumnya. Tebakan benar dapat poin.",
    },
    4: {
      title: "Ronde 4 — Tebak Lawan 🔍",
      desc: "Ronde terakhir!\n\nTerus tebak lawanmu pakai semua petunjuk yang kamu punya. Kumpulkan poin sebanyak-banyaknya!",
    },
  }

  const g = guides[round] ?? guides[1]

  const countColor =
    remaining > 5 ? "text-white/60" :
    remaining > 2 ? "text-yellow-300" :
    "text-red-400"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur-sm px-4">
      <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-sm w-full p-6 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-2">{g.title}</h2>
        <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed mb-6">
          {g.desc}
        </p>

        {/* Tombol atau Waiting state */}
        {!iClickedReady ? (
          <button
            onClick={handleReady}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer mb-3"
          >
            Mulai
          </button>
        ) : opponentReady ? (
          <p className="text-sm text-accent font-semibold animate-pulse mb-3">Memulai...</p>
        ) : (
          <p className="text-sm text-white/40 mb-3">Menunggu lawan...</p>
        )}

        {/* Countdown */}
        <p className={`text-xs transition-colors ${countColor}`}>
          Mulai otomatis dalam {remaining} detik
        </p>
        {sessionId ? <div className="mt-3"><AdBanner location="panduan" sessionId={sessionId} /></div> : null}
      </div>
    </div>
  )
}
