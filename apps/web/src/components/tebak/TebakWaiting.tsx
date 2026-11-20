"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Tebi } from "./art/Tebi"
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
    <div className="flex-1 flex flex-col justify-center py-8">
      <div className="tb-board p-6 flex flex-col items-center text-center">
        <div className="relative">
          <span className="absolute inset-0 m-auto w-28 h-28 rounded-full border-2 border-tb-them/30 animate-ping" aria-hidden />
          <Tebi mood={error ? "sad" : matchingBot ? "happy" : "think"} size={104} className="relative animate-tb-bob" />
        </div>
        <h3 className="font-tebak text-2xl font-semibold text-tb-ink mt-4" aria-live="polite">
          {matchingBot ? "Lawan ditemukan!" : retrying ? "Mencocokkan pemain" : `Mencari teman main${dots}`}
        </h3>
        <p className="text-sm text-tb-soft mt-1 max-w-[30ch]">
          {matchingBot ? "Menyiapkan permainan…" : "Biasanya tidak sampai 10 detik"}
        </p>
        {error && <p className="text-sm text-tb-no mt-4">{error}</p>}
        {!matchingBot && (
          <button
            onClick={onCancel}
            className="tb-chunky mt-6 px-6 py-3 bg-transparent border-tb-line text-tb-soft text-sm font-semibold hover:text-tb-ink cursor-pointer"
          >
            Batalkan
          </button>
        )}
      </div>
    </div>
  )
}
