"use client"

import { useState, useEffect, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"
import { TebakWaiting } from "@/components/tebak/TebakWaiting"
import { GameRoom } from "@/components/tebak/GameRoom"
import { TebakStage, TebakTopBar } from "@/components/tebak/TebakStage"
import { Tebi } from "@/components/tebak/art/Tebi"
import type { TebakSession } from "@/lib/tebak/queries"

export default function TebakSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<TebakSession | null>(null)

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const { data } = await supabase
        .from("tebak_sessions")
        .select("*")
        .eq("id", sessionId)
        .single()
      if (!data) { router.replace("/tebak"); return }
      setSession(data as TebakSession)
      setLoading(false)
    })()
  }, [sessionId, user, router])

  const handleMatched = useCallback((s: TebakSession) => {
    setSession(prev => prev ? { ...prev, ...s } : s)
  }, [])

  if (loading) {
    return (
      <TebakStage className="items-center justify-center">
        <Tebi mood="think" size={80} className="animate-tb-bob" title="Memuat permainan" />
      </TebakStage>
    )
  }

  if (!session) return null

  if (session.status === "waiting") {
    return (
      <TebakStage>
        <TebakTopBar mood="think" onBack={() => router.push("/tebak")} />
        <TebakWaiting sessionId={sessionId} isPlayerA={true} onMatched={handleMatched} onCancel={() => router.push("/tebak")} onReMatched={(newId) => router.push(`/tebak/${newId}`)} />
      </TebakStage>
    )
  }

  return (
    <GameRoom
      sessionId={sessionId}
      session={session}
      userId={user!.id}
    />
  )
}
