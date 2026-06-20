"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageCircle, ChevronRight, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

interface BisikChat {
  id: string
  card_id: string
  initiator_id: string
  receiver_id: string
  status: string
  created_at: string
  expires_at: string | null
  last_message?: { content: string; created_at: string } | null
  card?: { content: string; topic?: { name: string; emoji: string } | null } | null
}

export default function ActiveChats() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [chats, setChats] = useState<BisikChat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user || !supabase) return
    loadChats()
  }, [user, authLoading])

  const loadChats = async () => {
    setLoading(true)
    const { data } = await supabase!
      .from("bisik_chats")
      .select("*, card:bisik_cards(content), last_message:bisik_messages(content, created_at)")
      .or(`initiator_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
      .in("status", ["active"])
      .order("created_at", { ascending: false })

    setChats((data ?? []).map((c: any) => {
      const msgs = c.last_message
      return {
        ...c,
        last_message: Array.isArray(msgs) ? msgs[msgs.length - 1] || null : msgs || null,
      }
    }))
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-surface border-b border-border">
        <div className="max-w-content mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold text-text-primary">Obrolan Aktif</h1>
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <MessageCircle size={32} className="text-text-secondary/30" />
            <p className="text-sm text-text-secondary">Belum ada obrolan aktif</p>
            <p className="text-xs text-text-secondary/50">Temukan teman ngobrol di halaman Bisik</p>
            <button
              onClick={() => router.push("/bisik")}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium cursor-pointer"
            >
              Cari Obrolan
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => router.push(`/bisik/chat/${chat.id}`)}
                className="w-full flex items-start gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {chat.card?.content?.slice(0, 60) || "Percakapan"}
                  </p>
                  {chat.last_message ? (
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {chat.last_message.content.slice(0, 80)}
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary/50 mt-0.5">Menunggu balasan...</p>
                  )}
                </div>
                <ChevronRight size={14} className="text-text-secondary shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
