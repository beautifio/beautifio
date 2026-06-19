"use client"

import { useEffect, useState, useCallback } from "react"

type Props = {
  deadline: string
  onTimeout: () => void
}

export function Timer({ deadline, onTimeout }: Props) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000))
      setRemaining(diff)
      if (diff <= 0) onTimeout()
    }
    tick()
    const t = setInterval(tick, 250)
    return () => clearInterval(t)
  }, [deadline, onTimeout])

  const pct = Math.min(100, (remaining / 15) * 100)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-secondary">Sisa waktu</span>
        <span className={`text-xs font-bold ${remaining <= 5 ? "text-red-500" : "text-text-primary"}`}>
          {remaining}s
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            remaining <= 5 ? "bg-red-500" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
