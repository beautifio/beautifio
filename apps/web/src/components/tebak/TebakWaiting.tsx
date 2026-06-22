"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2, Users, Bot } from "lucide-react"
import { subscribeToTebakGame } from "@/lib/tebak/realtime"
import { matchWithBot } from "@/lib/tebak/actions"
import type { TebakSession } from "@/lib/tebak/queries"

type Props = {
  sessionId: string
  isPlayerA: boolean
  onMatched: (session: TebakSession) => void
  onCancel: () => void
}

export function TebakWaiting({ sessionId, isPlayerA, onMatched, onCancel }: Props) {
  const [dots, setDots] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const [matchingBot, setMatchingBot] = useState(false)
  const matchedRef = useRef(false)

  useEffect(() => {
    const i = setInterval(() => setDots((p) => (p.length >= 3 ? "" : p + ".")), 500)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setElapsed((p) => p + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (elapsed >= 20 && !matchedRef.current) {
      matchedRef.current = true
      setMatchingBot(true)
      matchWithBot(sessionId, isPlayerA).catch(() => {
        matchedRef.current = false
        setMatchingBot(false)
      })
    }
  }, [elapsed, sessionId, isPlayerA])

  useEffect(() => {
    const unsub = subscribeToTebakGame(sessionId, {
      onSessionUpdate: (s) => {
        if (s.status === "active") {
          matchedRef.current = true
          onMatched(s)
        }
      },
      onQuestionUpdate: () => {},
      onAnswerSubmitted: () => {},
    })
    return unsub
  }, [sessionId, onMatched])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          {matchingBot ? (
            <Bot size={36} className="text-primary animate-bounce" />
          ) : (
            <Users size={36} className="text-primary animate-pulse" />
          )}
        </div>
        <Loader2 size={20} className="absolute -top-1 -right-1 text-primary animate-spin" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">
        {matchingBot ? "Bot sedang bergabung..." : `Mencari lawan${dots}`}
      </h3>
      <p className="text-sm text-text-secondary text-center mb-8">
        {matchingBot
          ? "Tidak ada pemain lain, kamu akan bermain dengan bot"
          : "Kami mencari pemain lain untuk bermain Tebak Aku"}
      </p>
      {!matchingBot && (
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-border text-text-primary text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
        >
          Batalkan
        </button>
      )}
    </div>
  )
}
