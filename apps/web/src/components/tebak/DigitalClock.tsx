"use client"

import { useEffect, useState, useRef, useCallback } from "react"

type Props = {
  deadline: string
  onTimeout: () => void
  label?: string
  compact?: boolean
  isUrgent?: boolean
}

export function DigitalClock({ deadline, onTimeout, label = "Sisa Waktu", compact, isUrgent }: Props) {
  const getRemaining = useCallback(() => {
    return Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000))
  }, [deadline])

  const [remaining, setRemaining] = useState(getRemaining)
  const [hasMounted, setHasMounted] = useState(false)
  const colonRef = useRef(true)
  const [, forceRender] = useState(0)

  useEffect(() => {
    setHasMounted(true)
    const tick = () => {
      const diff = getRemaining()
      setRemaining(diff)
      if (diff <= 0) onTimeout()
    }
    const t = setInterval(tick, 250)
    const c = setInterval(() => {
      colonRef.current = !colonRef.current
      forceRender(n => n + 1)
    }, 800)
    return () => { clearInterval(t); clearInterval(c) }
  }, [deadline, onTimeout, getRemaining])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  
  if (!hasMounted) {
    // Render placeholder or initial state on server and initial client render
    const initialMinutes = Math.floor(getRemaining() / 60)
    const initialSeconds = getRemaining() % 60
    return (
      <div className="flex flex-col items-center gap-2 opacity-50">
         {/* Render a simplified, static version for SSR */}
         <div className="relative rounded-2xl px-7 py-5 bg-[#0B1120] border border-white/[0.07] shadow-2xl">
            <div className="relative flex items-center justify-center">
              <span className="font-mono font-bold tracking-[0.15em] text-5xl sm:text-6xl text-[#67e8f9]">
                {String(initialMinutes).padStart(2, "0")}
              </span>
              <span className="text-3xl sm:text-4xl font-bold mx-1.5 text-[#67e8f9]">:</span>
              <span className="font-mono font-bold tracking-[0.15em] text-5xl sm:text-6xl text-[#67e8f9]">
                {String(initialSeconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary">{label}</p>
      </div>
    )
  }
  
  const isLow = remaining <= 5
  const isCritical = remaining <= 3
  const colonVisible = colonRef.current

  const urgent = isUrgent && isLow

  const digitClass = `font-mono font-bold tracking-[0.15em] transition-all duration-500 ${
    isCritical ? "text-red-400 animate-pulse" : isLow ? "text-amber-400" : "text-[#67e8f9]"
  }`
  const digitStyle = isCritical
    ? { textShadow: "0 0 20px rgba(239,68,68,0.6), 0 0 60px rgba(239,68,68,0.3)" }
    : isLow
    ? { textShadow: "0 0 20px rgba(251,191,36,0.6), 0 0 60px rgba(251,191,36,0.3)" }
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
      <div className={`relative rounded-2xl px-7 py-5 bg-[#0B1120] border shadow-2xl overflow-hidden ${
        isCritical ? "border-red-500/30" : isLow ? "border-amber-400/20" : "border-white/[0.07]"
      }`}>
        <div
          className={`absolute inset-0 rounded-2xl blur-3xl transition-colors duration-700 ${
            isCritical ? "bg-red-500/20" : isLow ? "bg-amber-400/12" : "bg-cyan-400/8"
          }`}
        />
        {isLow && (
          <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl ${
            isCritical ? "bg-red-500/25 animate-pulse" : "bg-amber-400/15"
          }`} />
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
        isCritical ? "text-red-400" : isLow ? "text-amber-400" : "text-text-secondary"
      }`}>
        {label}
      </p>
    </div>
  )
}
