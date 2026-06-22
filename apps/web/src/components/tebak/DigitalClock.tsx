"use client"

import { useEffect, useState, useRef } from "react"

type Props = {
  deadline: string
  onTimeout: () => void
  label?: string
  compact?: boolean
}

export function DigitalClock({ deadline, onTimeout, label = "Sisa Waktu", compact }: Props) {
  const [remaining, setRemaining] = useState(0)
  const colonRef = useRef(true)
  const [, forceRender] = useState(0)

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000))
      setRemaining(diff)
      if (diff <= 0) onTimeout()
    }
    tick()
    const t = setInterval(tick, 250)
    const c = setInterval(() => {
      colonRef.current = !colonRef.current
      forceRender(n => n + 1)
    }, 800)
    return () => { clearInterval(t); clearInterval(c) }
  }, [deadline, onTimeout])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isLow = remaining <= 5
  const colonVisible = colonRef.current

  const digitClass = `font-mono font-bold tracking-[0.15em] transition-all duration-500 ${
    isLow ? "text-red-400" : "text-[#67e8f9]"
  }`
  const digitStyle = isLow
    ? { textShadow: "0 0 20px rgba(239,68,68,0.6), 0 0 60px rgba(239,68,68,0.3)" }
    : { textShadow: "0 0 20px rgba(103,232,249,0.5), 0 0 60px rgba(103,232,249,0.2)" }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span className={`${digitClass} text-lg`} style={digitStyle}>
          {String(minutes).padStart(2, "0")}
        </span>
        <span className={`text-base font-bold transition-all duration-300 ${
          colonVisible ? "opacity-100" : "opacity-30"
        } ${isLow ? "text-red-400" : "text-[#67e8f9]"}`}>:</span>
        <span className={`${digitClass} text-lg`} style={digitStyle}>
          {String(seconds).padStart(2, "0")}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative rounded-2xl px-7 py-5 bg-[#0B1120] border border-white/[0.07] shadow-2xl overflow-hidden">
        <div
          className={`absolute inset-0 rounded-2xl blur-3xl transition-colors duration-700 ${
            isLow ? "bg-red-500/15" : "bg-cyan-400/8"
          }`}
        />
        {isLow && (
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        )}
        <div className="relative flex items-center justify-center">
          <span className={`${digitClass} text-5xl sm:text-6xl`} style={digitStyle}>
            {String(minutes).padStart(2, "0")}
          </span>
          <span className={`text-3xl sm:text-4xl font-bold mx-1.5 transition-all duration-300 ${
            colonVisible ? "opacity-100" : "opacity-20"
          } ${isLow ? "text-red-400" : "text-[#67e8f9]"}`}>:</span>
          <span className={`${digitClass} text-5xl sm:text-6xl`} style={digitStyle}>
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>
      <p className={`text-[11px] font-semibold tracking-widest uppercase transition-colors duration-500 ${
        isLow ? "text-red-400" : "text-text-secondary"
      }`}>
        {label}
      </p>
    </div>
  )
}
