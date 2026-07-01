"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageCircle, ChevronRight, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

interface ChatRow {
  id: string
  status: string
  created_at: string
  initiator_id: string
  receiver_id: string
  card_id: string | null
}

interface UserInfo {
  id: string
  name: string
}

interface LastMsg {
  chat_id: string
  content: string
  sender_id: string
  created_at: string
}

interface UnreadInfo {
  chat_id: string
}

interface CardInfo {
  id: string
  topic_emoji: string | null
}

function getInitial(name: string): string {
  return (name[0] || "?").toUpperCase()
}

function hashColor(name: string): string {
  const colors = ["#084463","#6BB9D4","#FFC64F","#22C55E","#084463","#FFC64F","#EF4444","#6BB9D4","#084463","#6BB9D4"]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
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
  return `${days}hr`
}

export default function ActiveChats() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [rows, setRows] = useState<Array<ChatRow & {
    opponentName: string
    lastMsg: LastMsg | null
    isUnread: boolean
    topicEmoji: string | null
  }>>([])
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (authLoading || !user || !supabase) return
    loadData()

    const channel = supabase
      .channel("bisik-chats-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bisik_chats", filter: `initiator_id=eq.${user.id}` }, () => refreshData())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bisik_chats", filter: `receiver_id=eq.${user.id}` }, () => refreshData())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bisik_chats", filter: `initiator_id=eq.${user.id}` }, () => refreshData())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bisik_chats", filter: `receiver_id=eq.${user.id}` }, () => refreshData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, authLoading])

  const refreshData = async () => {
    if (!supabase || !user) return
    setRefreshing(true)
    await loadDataInner()
    setRefreshing(false)
  }

  const loadData = async () => {
    if (!supabase || !user) return
    setLoading(true)
    await loadDataInner()
    setLoading(false)
  }

  const loadDataInner = async () => {
    if (!supabase || !user) return

    // Load pending invites received
    await supabase.from("bisik_invites")
      .select("id, from_user, status, created_at, from:from_user(full_name, avatar_url)")
      .eq("to_user", user.id).eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setInvites(data || []) })

    // 1. Fetch chats (simple, no joins)
    const { data: chats } = await supabase
      .from("bisik_chats")
      .select("id, status, created_at, initiator_id, receiver_id, card_id")
      .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })

    if (!chats || chats.length === 0) {
      setRows([])
      return
    }

    const chatList = chats as ChatRow[]

    // 2. Fetch user names for all participants
    const userIds = [...new Set(chatList.flatMap(c => [c.initiator_id, c.receiver_id]))]
    const { data: users } = await supabase
      .from("users")
      .select("id, bisik_anonymous_name, bisik_custom_name")
      .in("id", userIds)

    const userNameMap = new Map<string, string>()
    for (const u of users ?? []) {
      userNameMap.set(u.id, u.bisik_custom_name || u.bisik_anonymous_name || "Anonymous")
    }

    // 3. Fetch last message per chat
    const chatIds = chatList.map(c => c.id)
    const { data: allMessages } = await supabase
      .from("bisik_messages")
      .select("id, chat_id, content, sender_id, created_at")
      .in("chat_id", chatIds)
      .order("created_at", { ascending: false })

    const lastMsgMap = new Map<string, LastMsg>()
    for (const msg of (allMessages ?? []) as LastMsg[]) {
      if (!lastMsgMap.has(msg.chat_id)) {
        lastMsgMap.set(msg.chat_id, msg)
      }
    }

    // 4. Fetch unread messages
    const { data: unreadMsgs } = await supabase
      .from("bisik_messages")
      .select("chat_id")
      .in("chat_id", chatIds)
      .eq("is_read", false)
      .neq("sender_id", user.id)

    const unreadSet = new Set((unreadMsgs ?? []).map((u: UnreadInfo) => u.chat_id))

    // 5. Fetch topic emoji from cards
    const cardIds = chatList.map(c => c.card_id).filter(Boolean) as string[]
    const topicEmojiMap = new Map<string, string | null>()
    if (cardIds.length > 0) {
      const { data: cards } = await supabase
        .from("bisik_cards")
        .select("id, topic:bisik_topics(emoji)")
        .in("id", cardIds)

      for (const card of (cards ?? []) as any[]) {
        topicEmojiMap.set(card.id, card.topic?.emoji ?? null)
      }
    }

    // Combine
    setRows(chatList.map(c => {
      const isInitiator = c.initiator_id === user.id
      const opponentId = isInitiator ? c.receiver_id : c.initiator_id
      return {
        ...c,
        opponentName: userNameMap.get(opponentId) || "Anonymous",
        lastMsg: lastMsgMap.get(c.id) || null,
        isUnread: unreadSet.has(c.id),
        topicEmoji: c.card_id ? (topicEmojiMap.get(c.card_id) ?? null) : null,
      }
    }))

  }

  const markAsRead = async (chatId: string) => {
    if (!supabase || !user) return
    await supabase
      .from("bisik_messages")
      .update({ is_read: true })
      .eq("chat_id", chatId)
      .neq("sender_id", user.id)
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-bg pb-24">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
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

        {invites.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#FFC64F" }}>📨 Undangan Kenalan</p>
            <div className="space-y-2">
              {invites.map((inv: any) => (
                <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: "#FFC64F30", background: "rgba(255,198,79,0.06)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: hashColor(inv.from?.full_name || "?") }}>
                    {getInitial(inv.from?.full_name || "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "#1E2938" }}>{inv.from?.full_name || "Seseorang"}</p>
                    <p className="text-[10px]" style={{ color: "#647488" }}>dari game Tebak</p>
                  </div>
                  <button onClick={async () => {
                    const { respondToBisikInvite } = await import("@/lib/tebak/bisik-bridge")
                    await respondToBisikInvite(inv.id, false)
                    setInvites(prev => prev.filter(i => i.id !== inv.id))
                  }} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }}>Tolak</button>
                  <button onClick={async () => {
                    const { respondToBisikInvite } = await import("@/lib/tebak/bisik-bridge")
                    const result = await respondToBisikInvite(inv.id, true)
                    setInvites(prev => prev.filter(i => i.id !== inv.id))
                    if (result?.chatId) router.push(`/bisik/chat/${result.chatId}`)
                  }} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white cursor-pointer" style={{ background: "#22C55E" }}>Terima</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : rows.length === 0 ? (
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
            {rows.map((row) => (
              <button
                key={row.id}
                onClick={() => {
                  markAsRead(row.id)
                  router.push(`/bisik/chat/${row.id}`)
                }}
                className="w-full flex items-start gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all text-left cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: hashColor(row.opponentName) }}
                  >
                    {getInitial(row.opponentName)}
                  </div>
                  {row.isUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-surface" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${row.isUnread ? "font-semibold text-text-primary" : "font-medium text-text-primary"}`}>
                      {row.opponentName}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {row.topicEmoji && <span className="text-xs opacity-60">{row.topicEmoji}</span>}
                      <span className="text-[10px] text-text-secondary">
                        {row.lastMsg ? relativeTime(row.lastMsg.created_at) : relativeTime(row.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!row.lastMsg ? (
                      <>
                        <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 font-medium">
                          ✨ Match Baru
                        </span>
                        <span className="text-xs text-text-secondary/60 italic">Say Hello 👋</span>
                      </>
                    ) : (
                      <p className="text-xs text-text-secondary truncate">
                        {row.lastMsg.sender_id === user?.id ? "Kamu: " : ""}
                        {row.lastMsg.content.slice(0, 40)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
