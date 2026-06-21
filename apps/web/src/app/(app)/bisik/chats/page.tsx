"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageCircle, ChevronRight, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

interface BisikChat {
  id: string
  status: string
  created_at: string
  initiator_id: string
  card: { content: string; topic?: { name: string; emoji: string } | null } | null
  initiator: { bisik_anonymous_name: string; bisik_custom_name: string | null }
  receiver: { bisik_anonymous_name: string; bisik_custom_name: string | null }
  messages: Array<{ id: string; content: string; sender_id: string; is_read: boolean; created_at: string }>
}

function getInitial(name: string): string {
  return (name[0] || "?").toUpperCase()
}

function getColorFromName(name: string): string {
  const colors = [
    "#D4537E", "#084463", "#FF6B35", "#2EC4B6", "#E71D36",
    "#FFC857", "#A8D8EA", "#95B8D1", "#7C3AED", "#0EA5E9",
    "#F59E0B", "#10B981", "#EC4899", "#8B5CF6", "#F97316",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Baru"
  if (mins < 60) return `${mins}m`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}j`

  const days = Math.floor(hours / 24)
  if (days === 1) return "Kemarin"
  return `${days}h`
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

    // Realtime: update chat list when new message arrives
    const channel = supabase
      .channel("bisik-chats-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "bisik_messages",
      }, () => {
        loadChats()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, authLoading])

  const loadChats = async () => {
    if (!supabase || !user) return
    setLoading(true)
    const { data } = await supabase
      .from("bisik_chats")
      .select(`
        id, status, created_at, initiator_id,
        card:bisik_cards(content, topic:bisik_topics(name, emoji)),
        initiator:users!initiator_id(bisik_anonymous_name, bisik_custom_name),
        receiver:users!receiver_id(bisik_anonymous_name, bisik_custom_name),
        messages:bisik_messages(id, content, sender_id, is_read, created_at)
      `)
      .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })

    setChats((data ?? []) as unknown as BisikChat[])
    setLoading(false)
  }

  const getOtherUser = (chat: BisikChat) => {
    if (!user) return { name: "Anonymous", initials: "?" }
    const isInitiator = chat.initiator_id === user.id
    const other = isInitiator ? chat.receiver : chat.initiator
    const name = other?.bisik_custom_name || other?.bisik_anonymous_name || "Anonymous"
    return { name, initials: getInitial(name) }
  }

  const getLastMessage = (chat: BisikChat) => {
    if (!chat.messages || chat.messages.length === 0) return null
    return chat.messages.reduce((latest, msg) =>
      new Date(msg.created_at) > new Date(latest.created_at) ? msg : latest
    )
  }

  const getUnreadCount = (chat: BisikChat) => {
    if (!user || !chat.messages) return 0
    return chat.messages.filter((m) => !m.is_read && m.sender_id !== user.id).length
  }

  const markAsRead = async (chatId: string) => {
    if (!supabase || !user) return
    await supabase
      .from("bisik_messages")
      .update({ is_read: true })
      .eq("chat_id", chatId)
      .neq("sender_id", user.id)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="bg-surface border-b border-border">
        <div className="max-w-content mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold text-text-primary">Obrolan</h1>
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 py-6">
        {/* Banner CTA */}
        <button
          onClick={() => router.push("/bisik")}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6 text-left cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">Temukan Match Baru</p>
            <p className="text-xs text-text-secondary">Mulai swipe untuk terhubung!</p>
          </div>
          <ChevronRight size={18} className="text-text-secondary shrink-0" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <MessageCircle size={32} className="text-text-secondary/30" />
            <p className="text-sm text-text-secondary">Belum ada obrolan</p>
            <p className="text-xs text-text-secondary/50">Buat kartu curhat atau swipe untuk memulai</p>
            <button
              onClick={() => router.push("/bisik")}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium cursor-pointer"
            >
              Mulai
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => {
              const other = getOtherUser(chat)
              const lastMsg = getLastMessage(chat)
              const unread = getUnreadCount(chat)
              const topic = chat.card?.topic

              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    markAsRead(chat.id)
                    router.push(`/bisik/chat/${chat.id}`)
                  }}
                  className="w-full flex items-start gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all text-left cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: getColorFromName(other.name) }}
                    >
                      {other.initials}
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-surface" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-sm truncate ${unread > 0 ? "font-semibold text-text-primary" : "font-medium text-text-primary"}`}>
                        {other.name}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {topic?.emoji && (
                          <span className="text-xs opacity-60">{topic.emoji}</span>
                        )}
                        <span className="text-[10px] text-text-secondary">
                          {lastMsg ? relativeTime(lastMsg.created_at) : relativeTime(chat.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!lastMsg ? (
                        <>
                          <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 font-medium">
                            ✨ Match Baru
                          </span>
                          <span className="text-xs text-text-secondary/60 italic">Say Hello 👋</span>
                        </>
                      ) : (
                        <p className="text-xs text-text-secondary truncate">
                          {lastMsg.sender_id === user?.id ? "Kamu: " : ""}
                          {lastMsg.content.slice(0, 40)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
