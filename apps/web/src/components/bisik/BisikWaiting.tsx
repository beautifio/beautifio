"use client"

import { useEffect, useState } from "react"
import { Loader2, MessageSquare } from "lucide-react"
import { subscribeToBisikSession } from "@/lib/bisik/realtime"

type Props = {
  sessionId: string
  onMatched: () => void
  onCancel: () => void
}

export function BisikWaiting({ sessionId, onMatched, onCancel }: Props) {
  const [dots, setDots] = useState("")
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const i = setInterval(() => setDots((p) => (p.length >= 3 ? "" : p + ".")), 500)
    const t = setInterval(() => setTimeElapsed((p) => p + 1), 1000)
    return () => { clearInterval(i); clearInterval(t) }
  }, [])

  useEffect(() => {
    const unsub = subscribeToBisikSession(
      sessionId,
      (status) => {
        if (status === "matched" || status === "active") onMatched()
      },
      () => {}
    )
    return unsub
  }, [sessionId, onMatched])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare size={36} className="text-primary animate-pulse" />
        </div>
        <Loader2 size={20} className="absolute -top-1 -right-1 text-primary animate-spin" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">Mencari lawan bicara{dots}</h3>
      <p className="text-sm text-text-secondary text-center mb-6">
        Kami sedang mencari orang yang cocok untukmu
      </p>
      <div className="flex items-center gap-2 text-xs text-text-secondary mb-8">
        <Loader2 size={14} className="animate-spin" />
        <span>{timeElapsed} detik</span>
      </div>
      <button
        onClick={onCancel}
        className="px-6 py-2.5 rounded-xl border border-border text-text-primary text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
      >
        Batalkan
      </button>
    </div>
  )
}
