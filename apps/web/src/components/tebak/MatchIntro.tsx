"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Zap } from "lucide-react"

type Props = {
  myName?: string | null
  opponentName?: string | null
  onBegin: () => void
  deadline?: string
  onReady?: () => void
  opponentReady?: boolean
  sessionId?: string
}

export function MatchIntro({ myName, opponentName, onBegin, deadline }: Props) {
  const [remaining, setRemaining] = useState(8)
  const [show, setShow] = useState(false)
  const begunRef = useRef(false)

  const handleBegin = useCallback(() => {
    if (begunRef.current) return
    begunRef.current = true
    onBegin()
  }, [onBegin])

  useEffect(() => {
    setShow(true)
    const tick = () => {
      const dl = deadline ? new Date(deadline).getTime() : Date.now() + 8000
      const r = Math.max(0, Math.ceil((dl - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) handleBegin()
    }
    tick()
    const interval = setInterval(tick, 500)
    return () => clearInterval(interval)
  }, [deadline, handleBegin])

  const myInit = myName?.[0]?.toUpperCase() || "?"
  const oppInit = opponentName?.[0]?.toUpperCase() || "?"
  const progressPct = ((8 - remaining) / 8) * 100

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #084463 0%, #042436 50%, #0B1A2E 100%)",
      }}>
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: "#6BB9D4" }} />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: "#FFC64F" }} />

      {/* Player Cards */}
      <div className="flex items-center justify-center gap-4 w-full max-w-md mb-6 relative z-10">
        {/* My Card */}
        <div
          className={`flex-1 p-4 rounded-2xl border text-center transition-all duration-700 ease-out`}
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(107,185,212,0.3)",
            transform: show ? "translateX(0)" : "translateX(-60px)",
            opacity: show ? 1 : 0,
          }}>
          <div className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6BB9D4, #084463)" }}>
            {myInit}
          </div>
          <p className="text-sm font-bold text-white truncate">{myName || "Kamu"}</p>
          <p className="text-[10px] text-white/40 mt-0.5">Player</p>
        </div>

        {/* VS Badge */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: "linear-gradient(135deg, rgba(255,198,79,0.2), rgba(255,198,79,0.05))", border: "1px solid rgba(255,198,79,0.3)" }}>
            <Zap size={20} style={{ color: "#FFC64F", filter: "drop-shadow(0 0 8px rgba(255,198,79,0.5))" }} />
          </div>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white/30 tracking-widest uppercase">VS</span>
        </div>

        {/* Opponent Card */}
        <div
          className={`flex-1 p-4 rounded-2xl border text-center transition-all duration-700 ease-out delay-150`}
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,198,79,0.3)",
            transform: show ? "translateX(0)" : "translateX(60px)",
            opacity: show ? 1 : 0,
          }}>
          <div className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FFC64F, #E85D75)" }}>
            {oppInit}
          </div>
          <p className="text-sm font-bold text-white truncate">{opponentName || "Lawan"}</p>
          <p className="text-[10px] text-white/40 mt-0.5">Lawan</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md h-1.5 rounded-full mb-6 relative z-10"
        style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all duration-500 ease-linear"
          style={{
            width: `${progressPct}%`,
            background: remaining > 3 ? "linear-gradient(90deg, #6BB9D4, #FFC64F)" : "linear-gradient(90deg, #FFC64F, #EF4444)",
          }} />
      </div>

      {/* Countdown */}
      <div className="relative z-10 flex flex-col items-center">
        <div className={`transition-all duration-300 ${remaining <= 3 ? "scale-110" : "scale-100"}`}>
          <span className={`text-6xl font-bold font-mono tabular-nums transition-colors duration-500`}
            style={{
              color: remaining > 5 ? "#FFFFFF" : remaining > 3 ? "#FFC64F" : remaining > 1 ? "#F97316" : "#EF4444",
              textShadow: remaining <= 3
                ? `0 0 ${remaining === 1 ? 60 : 30}px ${remaining === 1 ? "rgba(239,68,68,0.5)" : "rgba(249,115,22,0.4)"}`
                : "0 0 20px rgba(255,255,255,0.15)",
            }}>
            {remaining}
          </span>
        </div>
        <span className="text-[10px] text-white/20 tracking-widest uppercase mt-1">detik</span>
      </div>

      {/* Round Info */}
      <p className="absolute bottom-8 text-xs text-white/20 tracking-wider z-10">
        🎮 Ronde 1 · DISC
      </p>
    </div>
  )
}
