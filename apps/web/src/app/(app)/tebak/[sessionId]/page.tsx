"use client"

import { useState, useEffect, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"
import { TebakWaiting } from "@/components/tebak/TebakWaiting"
import { GameRoom } from "@/components/tebak/GameRoom"
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
      const { data } = await supabase!
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
    setSession(s)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!session) return null

  if (session.status === "waiting") {
    return (
      <div className="min-h-screen bg-bg">
        <div className="bg-surface border-b border-border">
          <div className="max-w-content mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => router.back()} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-text-primary">Tebak Aku</h1>
          </div>
        </div>
        <TebakWaiting sessionId={sessionId} onMatched={handleMatched} onCancel={() => router.push("/tebak")} />
      </div>
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
