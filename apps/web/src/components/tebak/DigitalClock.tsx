"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { IconHourglass } from "./art/icons"

type Props = {
  deadline: string
  onTimeout: () => void
  label?: string
  compact?: boolean
  /** Saat true, ≤5 detik berubah koral & berdenyut (giliran pemain sendiri). */
  isUrgent?: boolean
}

/**
 * Timer Tebak Aku: bar yang menipis + angka besar. API sama dengan versi LED lama
 * (deadline / onTimeout / label) supaya semua pemanggil tetap jalan.
 */
export function DigitalClock({ deadline, onTimeout, label = "Sisa waktu", compact, isUrgent }: Props) {
  const getRemainingMs = useCallback(() => Math.max(0, new Date(deadline).getTime() - Date.now()), [deadline])

  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const totalRef = useRef<number>(0)
  const firedRef = useRef(false)

  useEffect(() => {
    firedRef.current = false
    // Total = sisa waktu saat timer pertama terlihat (dibulatkan ke detik penuh terdekat)
    totalRef.current = Math.max(1000, Math.ceil(getRemainingMs() / 1000) * 1000)
    const tick = () => {
      const ms = getRemainingMs()
      setRemainingMs(ms)
      if (ms <= 0 && !firedRef.current) {
        firedRef.current = true
        onTimeout()
      }
    }
    tick()
    const t = setInterval(tick, 200)
    return () => clearInterval(t)
  }, [deadline, onTimeout, getRemainingMs])

  const seconds = remainingMs === null ? null : Math.ceil(remainingMs / 1000)
  const pct = remainingMs === null || totalRef.current === 0 ? 100 : Math.min(100, (remainingMs / totalRef.current) * 100)
  const low = seconds !== null && seconds <= 5
  const hot = !!isUrgent && low

  const barColor = hot ? "bg-tb-no" : low ? "bg-tb-me" : "bg-tb-them"
  const numColor = hot ? "text-tb-no" : "text-tb-ink"

  if (compact) {
    return (
      <span className={`font-tebak text-lg font-semibold tabular-nums ${numColor}`} suppressHydrationWarning>
        {seconds ?? "–"}
      </span>
    )
  }

  return (
    <div className="w-full" role="timer" aria-live="off" aria-label={`${label}: ${seconds ?? ""} detik`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${hot ? "text-tb-no" : "text-tb-soft"}`}>
          <IconHourglass size={14} className={hot ? "animate-tb-wiggle" : ""} />
          {label}
        </span>
        <span
          key={hot ? seconds : "calm"}
          className={`font-tebak text-2xl font-semibold leading-none tabular-nums ${numColor} ${hot ? "animate-tb-bump" : ""}`}
          suppressHydrationWarning
        >
          {seconds ?? "–"}
        </span>
      </div>
      <div className="h-3 rounded-full bg-tb-deep overflow-hidden border border-tb-line">
        <div
          className={`h-full rounded-full ${barColor} ${hot ? "animate-tb-pulse-soft" : ""}`}
          style={{ width: `${pct}%`, transition: "width 200ms linear, background-color 300ms ease" }}
        />
      </div>
    </div>
  )
}
