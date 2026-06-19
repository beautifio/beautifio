"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"
import { getBisikSession, getBisikParticipants, getBisikMessages } from "@/lib/bisik/queries"
import { ChatRoom } from "@/components/bisik/ChatRoom"
import type { BisikParticipant, BisikMessage } from "@/lib/bisik/queries"

export default function BisikSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState<BisikParticipant[]>([])
  const [messages, setMessages] = useState<BisikMessage[]>([])

  useEffect(() => {
    if (!user || !supabase) return
    (async () => {
      const session = await getBisikSession(sessionId)
      if (!session) { router.replace("/bisik"); return }

      if (session.status === "ended" || session.status === "reported") {
        router.replace("/bisik")
        return
      }

      const pts = await getBisikParticipants(sessionId)
      setParticipants(pts)

      const msgs = await getBisikMessages(sessionId)
      setMessages(msgs)

      setLoading(false)
    })()
  }, [sessionId, user, router])

  const handleEnded = () => {
    router.push("/bisik")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pb-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <ChatRoom
        sessionId={sessionId}
        participants={participants}
        currentUserId={user!.id}
        initialMessages={messages}
        onEnded={handleEnded}
      />
    </div>
  )
}
