"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { AdBanner } from "./AdBanner"

type Props = {
  myName?: string | null
  opponentName?: string | null
  onBegin: () => void
  deadline?: string
  onReady?: () => void
  opponentReady?: boolean
  sessionId?: string
}

export function MatchIntro({ myName, opponentName, onBegin, deadline, onReady, opponentReady, sessionId }: Props) {
  const [step, setStep] = useState(0)
  const [remaining, setRemaining] = useState(20)
  const [iClickedReady, setIClickedReady] = useState(false)
  const begunRef = useRef(false)

  const handleReady = useCallback(() => {
    if (iClickedReady) return
    setIClickedReady(true)
    onReady?.()
  }, [iClickedReady, onReady])

  const handleBegin = useCallback(() => {
    if (begunRef.current) return
    begunRef.current = true
    setTimeout(onBegin, 400)
  }, [onBegin])

  // Auto-dismiss saat bothReady
  useEffect(() => {
    if (iClickedReady && opponentReady) {
      handleBegin()
    }
  }, [iClickedReady, opponentReady, handleBegin])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setStep(1), 0))
    timers.push(setTimeout(() => setStep(2), 300))
    timers.push(setTimeout(() => setStep(3), 700))

    const tick = () => {
      const dl = deadline ? new Date(deadline).getTime() : Date.now() + 20000
      const r = Math.max(0, Math.ceil((dl - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) {
        handleBegin()
        return
      }
    }

    tick()
    const interval = setInterval(tick, 250)

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(interval)
    }
  }, [deadline, handleBegin])

  const countColor =
    remaining > 10 ? "text-white" :
    remaining > 5 ? "text-yellow-200" :
    remaining > 2 ? "text-orange-400" :
    "text-red-400"

  const countGlow =
    remaining > 10 ? { textShadow: "0 0 20px rgba(255,255,255,0.2)" } :
    remaining > 5 ? { textShadow: "0 0 30px rgba(253,224,71,0.3)" } :
    remaining > 2 ? { textShadow: "0 0 50px rgba(251,146,60,0.6)" } :
    { textShadow: "0 0 60px rgba(248,113,113,0.7), 0 0 120px rgba(248,113,113,0.3)" }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-primary/95 via-[#0B1120] to-primary/80 px-4 overflow-hidden relative">

      <div className={`transition-all duration-600 mb-6 ${
        step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}>
        <h1 className="text-3xl font-bold text-white tracking-[0.15em] text-center">
          PERTANDINGAN
        </h1>
      </div>

      <div className="flex items-center justify-center gap-4 w-full max-w-sm mb-6">
        <p className={`flex-1 text-right text-xl font-bold text-white transition-all duration-700 ${
          step >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
        }`}>
          {myName || "Kamu"}
        </p>

        <span className={`text-2xl font-black text-accent transition-all duration-500 ${
          step >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-0"
        }`}
          style={{ textShadow: "0 0 30px rgba(255,198,79,0.5), 0 0 60px rgba(255,198,79,0.2)" }}>
          VS
        </span>

        <p className={`flex-1 text-left text-xl font-bold text-white transition-all duration-700 ${
          step >= 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
        }`}>
          {opponentName || "Lawan"}
        </p>
      </div>

      <p className={`text-sm text-white/50 tracking-wider mb-6 transition-all duration-500 ${
        step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}>
        Game dimulai saat waktu habis • Round 1
      </p>

      {/* Countdown */}
      <div className="flex flex-col items-center gap-1 mb-4">
        <span
          key={remaining}
          className={`block text-center font-bold font-mono transition-all duration-150 text-6xl ${countColor}`}
          style={countGlow}
        >
          {remaining}
        </span>
        <span className="text-[10px] text-white/30 tracking-wider">detik</span>
      </div>

      {/* Mulai button or Waiting state */}
      {!iClickedReady ? (
        <button
          onClick={handleReady}
          className="px-8 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Mulai
        </button>
      ) : opponentReady ? (
        <p className="text-sm text-accent font-semibold animate-pulse">Memulai...</p>
      ) : (
        <p className="text-sm text-white/40">Menunggu lawan...</p>
      )}
      {sessionId ? <AdBanner location="match_intro" sessionId={sessionId} /> : null}
    </div>
  )
}
