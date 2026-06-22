"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Users } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { subscribeToTebakGame } from "@/lib/tebak/realtime"
import { matchWithBot, retryMatchmaking } from "@/lib/tebak/actions"
import type { TebakSession } from "@/lib/tebak/queries"

type Props = {
  sessionId: string
  isPlayerA: boolean
  onMatched: (session: TebakSession) => void
  onCancel: () => void
  onReMatched?: (newSessionId: string) => void
}

export function TebakWaiting({ sessionId, isPlayerA, onMatched, onCancel, onReMatched }: Props) {
  const router = useRouter()
  const [dots, setDots] = useState("")
  const [matchingBot, setMatchingBot] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    const i = setInterval(() => setDots((p) => (p.length >= 3 ? "" : p + ".")), 500)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    if (doneRef.current) return

    const retryTimer = setTimeout(async () => {
      if (doneRef.current) return
      setRetrying(true)
      try {
        const newId = await retryMatchmaking(sessionId)
        if (doneRef.current) return
        if (newId && newId !== sessionId) {
          doneRef.current = true
          if (onReMatched) onReMatched(newId)
          else router.push(`/tebak/${newId}`)
          return
        }
      } catch {
        // retry gagal, lanjut
      }
      setRetrying(false)
    }, 2000)

    const botTimer = setTimeout(async () => {
      if (doneRef.current) return
      doneRef.current = true
      setMatchingBot(true)

      try {
        const ok = await matchWithBot(sessionId)
        if (!ok || !supabase) {
          setMatchingBot(false)
          setError("Gagal mencari pemain. Coba lagi.")
          doneRef.current = false
          return
        }

        const { data: s } = await supabase.from("tebak_sessions").select("*").eq("id", sessionId).single()
        if (s && s.status === "active") {
          onMatched(s as TebakSession)
          return
        }

        setMatchingBot(false)
        setError("Gagal mengaktifkan sesi. Coba lagi.")
        doneRef.current = false
      } catch {
        setMatchingBot(false)
        setError("Terjadi kesalahan. Coba lagi.")
        doneRef.current = false
      }
    }, 10000)

    return () => {
      clearTimeout(retryTimer)
      clearTimeout(botTimer)
    }
  }, [sessionId, router, onReMatched, onMatched])

  useEffect(() => {
    if (doneRef.current) return
    const unsub = subscribeToTebakGame(sessionId, {
      onSessionUpdate: (s) => {
        if (s.status === "active") {
          doneRef.current = true
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
          <Users size={36} className="text-primary animate-pulse" />
        </div>
        <Loader2 size={20} className="absolute -top-1 -right-1 text-primary animate-spin" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">
        {matchingBot ? "Menyiapkan pertandingan..." : retrying ? "Mencocokkan pemain..." : `Mencari lawan${dots}`}
      </h3>
      <p className="text-sm text-text-secondary text-center mb-8">
        {matchingBot
          ? "Kamu akan segera bermain"
          : retrying
          ? "Memeriksa ulang antrian..."
          : "Kami mencari pemain lain untuk bermain Tebak Aku"}
      </p>
      {error && (
        <p className="text-sm text-red-500 text-center mb-4">{error}</p>
      )}
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
