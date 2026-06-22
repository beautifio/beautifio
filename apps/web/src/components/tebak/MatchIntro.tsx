"use client"

import { useEffect, useState } from "react"

type Props = {
  myName?: string | null
  opponentName?: string | null
  onBegin: () => void
}

export function MatchIntro({ myName, opponentName, onBegin }: Props) {
  const [step, setStep] = useState(0)
  const [count, setCount] = useState(5)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setStep(1), 300))
    timers.push(setTimeout(() => setStep(2), 800))
    timers.push(setTimeout(() => setStep(3), 1500))
    timers.push(setTimeout(() => { setStep(4); setCount(5) }, 2000))
    timers.push(setTimeout(() => setCount(4), 2600))
    timers.push(setTimeout(() => setCount(3), 3200))
    timers.push(setTimeout(() => setCount(2), 3800))
    timers.push(setTimeout(() => setCount(1), 4400))
    timers.push(setTimeout(() => setStep(5), 5000))
    timers.push(setTimeout(onBegin, 5600))

    return () => timers.forEach(clearTimeout)
  }, [onBegin])

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-primary/95 via-[#0B1120] to-primary/80 px-4 overflow-hidden">
      {/* Title */}
      <div className={`transition-all duration-600 mb-8 ${
        step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}>
        <h1 className="text-3xl font-bold text-white tracking-[0.15em]">
          PERTANDINGAN
        </h1>
      </div>

      {/* Players + VS */}
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

      {/* Info */}
      <p className={`text-sm text-white/50 tracking-wider mb-8 transition-all duration-500 ${
        step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}>
        Segera dimulai • Tebak Aku • Round 1
      </p>

      {/* Countdown */}
      <div className={`transition-all duration-300 ${
        step === 4 ? "opacity-100 scale-100" : step >= 5 ? "opacity-0 scale-150" : "opacity-0 scale-0"
      }`}>
        {step === 4 && <span key={count} className="text-8xl font-bold font-mono text-white block text-center" style={{ animation: "si 0.3s ease-out" }}>{count}</span>}
      </div>

      {/* GO! */}
      <div className={`transition-all duration-500 ${
        step >= 5 ? "opacity-100 scale-100" : "opacity-0 scale-0"
      }`}>
        <div className="px-8 py-4 rounded-full bg-accent shadow-lg shadow-accent/40">
          <span className="text-2xl font-black text-primary">MULAI!</span>
        </div>
      </div>

      <style>{`@keyframes si{from{transform:scale(0.3);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}
