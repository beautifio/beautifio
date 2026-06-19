"use client"

import { useEffect, useState } from "react"
import { Loader2, Users } from "lucide-react"
import { subscribeToTebakGame } from "@/lib/tebak/realtime"
import type { TebakSession } from "@/lib/tebak/queries"

type Props = {
  sessionId: string
  onMatched: (session: TebakSession) => void
  onCancel: () => void
}

export function TebakWaiting({ sessionId, onMatched, onCancel }: Props) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const i = setInterval(() => setDots((p) => (p.length >= 3 ? "" : p + ".")), 500)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const unsub = subscribeToTebakGame(sessionId, {
      onSessionUpdate: (s) => { if (s.status === "active") onMatched(s) },
      onQuestionUpdate: () => {},
      onAnswerSubmitted: () => {},
    })
    return unsub
  }, [sessionId, onMatched])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Users size={36} className="text-primary animate-pulse" />
        </div>
        <Loader2 size={20} className="absolute -top-1 -right-1 text-primary animate-spin" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">Mencari lawan{dots}</h3>
      <p className="text-sm text-text-secondary text-center mb-8">
        Kami mencari pemain lain untuk bermain Tebak Aku
      </p>
      <button
        onClick={onCancel}
        className="px-6 py-2.5 rounded-xl border border-border text-text-primary text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
      >
        Batalkan
      </button>
    </div>
  )
}
