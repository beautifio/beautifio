"use client"

import { useState, useEffect, use, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Send, Flag, PhoneOff, ArrowLeft, Loader2,
  ChevronDown, ChevronUp, AlertTriangle, Ban,
  Check, CheckCheck, Clock, AlertCircle, RefreshCw,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { getBisikChat, getBisikMessages } from "@/lib/bisik/queries"
import type { BisikMessage, BisikChat } from "@/lib/bisik/queries"
import { isBisikBot, botReplyToMessage } from "@/lib/bisik/bot-actions"

interface PendingMessage {
  localId: string
  chat_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  _status: 'pending' | 'failed'
}

function relativeTimeShort(dateStr: string): string {
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

function isOnline(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return Date.now() - new Date(dateStr).getTime() < 120_000
}

export default function BisikChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [chat, setChat] = useState<BisikChat | null>(null)
  const [messages, setMessages] = useState<BisikMessage[]>([])
  const [pendingMsgs, setPendingMsgs] = useState<PendingMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [otherName, setOtherName] = useState("Anonymous")
  const [otherId, setOtherId] = useState<string | null>(null)
  const [receiverIsBot, setReceiverIsBot] = useState(false)
  const [botFrozen, setBotFrozen] = useState(false)
  const [botTyping, setBotTyping] = useState(false)
  const [lastOnline, setLastOnline] = useState<string | null>(null)
  const [showContext, setShowContext] = useState(true)
  const [contextCard, setContextCard] = useState<{ content: string; topic?: { name: string; emoji: string } | null } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const markAsRead = useCallback(async () => {
    if (!supabase || !chatId || !user) return
    await supabase
      .from("bisik_messages")
      .update({ is_read: true })
      .eq("chat_id", chatId)
      .neq("sender_id", user.id)
  }, [chatId, user])

  // Ban state
  const [banInfo, setBanInfo] = useState<{ isBanned: boolean; message: string; bannedUntil: string } | null>(null)
  const [banCount, setBanCount] = useState(0)
  const banCountRef = useRef(banCount);
  banCountRef.current = banCount;
  const [sensorNotif, setSensorNotif] = useState<string | null>(null)

  // Track sent content to detect server-side masking
  const sentContentRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const c = await getBisikChat(chatId)
      if (!c) { router.replace("/bisik"); return }
      if (c.status === "ended") { router.replace("/bisik"); return }
      setChat(c)

      const cardData = c as any
      if (cardData.card_id) {
        const { data: card } = await supabase!
          .from("bisik_cards")
          .select("content, topic:bisik_topics(name, emoji)")
          .eq("id", cardData.card_id)
          .single()
        setContextCard(card as any)
      }

      const isInitiator = c.initiator_id === user.id
      const oId = isInitiator ? c.receiver_id : c.initiator_id
      setOtherId(oId)
      // Fetch opponent name (same flow for bot & human)
      const { data: otherUser } = await supabase!
        .from("users")
        .select("bisik_anonymous_name, bisik_custom_name, last_online_at")
        .eq("id", oId)
        .single()
      const nameFromUser = otherUser?.bisik_custom_name || otherUser?.bisik_anonymous_name || "Anonymous"
      setOtherName(nameFromUser)
      setLastOnline(otherUser?.last_online_at ?? null)
      // Detect if bot (for reply logic only, not for display)
      isBisikBot(oId).then(setReceiverIsBot)

      const msgs = await getBisikMessages(chatId)
      setMessages(msgs)
      setLoading(false)
    })()

    // Check ban status
    checkBan()
  }, [chatId, user, router])

  // Auto-trigger bot opening message when chat first loads
  useEffect(() => {
    if (!receiverIsBot || botFrozen || messages.length > 0) return
    const init = async () => {
      // Quick read delay: 5s
      const readMs = 5000
      await new Promise(r => setTimeout(r, readMs))
      setBotTyping(true)
      const reply = await botReplyToMessage(chatId, '').catch(() => null)
      setBotTyping(false)
      if (reply?.frozen) setBotFrozen(true)
    }
    init()
  }, [receiverIsBot, messages.length, botFrozen, chatId])

  // Heartbeat: update last_online_at periodically
  useEffect(() => {
    if (!supabase || !user) return
    const beat = () => {
      supabase.from("users").update({ last_online_at: new Date().toISOString() }).eq("id", user.id)
    }
    beat()
    const interval = setInterval(beat, 60_000)
    return () => clearInterval(interval)
  }, [user?.id])

  // Refresh opponent's last_online_at periodically
  useEffect(() => {
    if (!supabase || !otherId) return
    const interval = setInterval(async () => {
      const { data } = await supabase.from("users").select("last_online_at").eq("id", otherId).single()
      if (data?.last_online_at) setLastOnline(data.last_online_at)
    }, 30_000)
    return () => clearInterval(interval)
  }, [otherId])

  const checkBan = async () => {
    if (!supabase || !user) return
    const { data: ban } = await supabase
      .from("bisik_bans")
      .select("banned_until, ban_count")
      .eq("user_id", user.id)
      .single()

    if (ban && new Date(ban.banned_until) > new Date()) {
      const remainingMs = new Date(ban.banned_until).getTime() - Date.now()
      const remainingMins = Math.ceil(remainingMs / 60000)
      setBanInfo({
        isBanned: true,
        message: `Kamu tidak bisa mengirim pesan selama ${remainingMins} menit lagi karena membagikan informasi pribadi.`,
        bannedUntil: ban.banned_until,
      })
      setBanCount(ban.ban_count)
    }
    // Also get current violation count (matches server logic: COUNT DISTINCT dates)
    const { data: violations } = await supabase
      .from("bisik_violations")
      .select("created_at")
      .eq("user_id", user.id)
      .gt("created_at", new Date(Date.now() - 86400000).toISOString())
    const distinctDays = new Set(
      (violations ?? []).map((v) => new Date(v.created_at).toDateString())
    ).size
    setBanCount(distinctDays)
  }

  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel(`bisik-chat-${chatId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "bisik_messages",
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        const msg = payload.new as BisikMessage
        setMessages((prev) => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])

        // Check if our own message was modified by server-side masking
        if (msg.sender_id === user?.id) {
          const originalContent = sentContentRef.current.get(msg.id)
          if (originalContent && originalContent !== msg.content) {
            setSensorNotif(
              `⚠️ Informasi pribadi terdeteksi dan disensor. ` +
              `Peringatan ke-${banCountRef.current + 1}/3. Setelah 3x kamu akan dibanned 3 jam.`
            )
            setTimeout(() => setSensorNotif(null), 8000)
            checkBan()
          }
          sentContentRef.current.delete(msg.id)
        }

        // Mark as read when receiving messages from the other user
        if (msg.sender_id !== user?.id) {
          markAsRead()
        }
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "bisik_chats",
        filter: `id=eq.${chatId}`,
      }, (payload) => {
        const s = (payload.new as BisikChat).status
        if (s === "ended") router.replace("/bisik")
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [chatId, router, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const isInitiator = chat?.initiator_id === user?.id

  const allMessages = () =>
    [...messages, ...pendingMsgs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

  const sendMessage = async (content: string, localId: string) => {
    if (!supabase || !user) return false
    try {
      const { data: msg } = await supabase
        .from("bisik_messages")
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content,
        })
        .select("id")
        .single()

      if (msg?.id) {
        sentContentRef.current.set(msg.id, content)
      }

      if (!chat?.expires_at) {
        // Only Pro/Ultimate users get 24h expiry benefit
        const { data: activeSub } = await supabase.from("user_subscriptions")
          .select("id").eq("user_id", user.id).eq("status", "active")
          .gt("expires_at", new Date().toISOString()).maybeSingle();
        if (activeSub) {
          await supabase.from("bisik_chats").update({
            expires_at: new Date(Date.now() + 24 * 3600000).toISOString()
          }).eq("id", chatId)
        }
      }

      return true
    } catch {
      return false
    }
  }

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending || !supabase || !user) return
    if (banInfo?.isBanned) return

    const originalContent = input.trim()
    const localId = crypto.randomUUID()
    const now = new Date().toISOString()

    setPendingMsgs(prev => [...prev, {
      localId,
      chat_id: chatId,
      sender_id: user.id,
      content: originalContent,
      is_read: false,
      created_at: now,
      _status: 'pending',
    }])

    setSending(true)
    setInput("")
    const ok = await sendMessage(originalContent, localId)
    if (ok) {
      setPendingMsgs(prev => prev.filter(m => m.localId !== localId))
      // Bot auto-reply
      if (receiverIsBot && !botFrozen) {
        setBotTyping(false)
        // Human read delay: 30-90s
        const readMs = 30000 + Math.floor(Math.random() * 60000)
        await new Promise(r => setTimeout(r, readMs))
        setBotTyping(true)
        const reply = await botReplyToMessage(chatId, originalContent).catch(() => null)
        setBotTyping(false)
        if (reply?.frozen) setBotFrozen(true)
      }
    } else {
      setPendingMsgs(prev => prev.map(m =>
        m.localId === localId ? { ...m, _status: 'failed' as const } : m
      ))
    }
    setSending(false)
  }, [input, sending, supabase, user, chatId, isInitiator, chat, banInfo, receiverIsBot, botFrozen])

  const retryMessage = async (pending: PendingMessage) => {
    setPendingMsgs(prev => prev.map(m =>
      m.localId === pending.localId ? { ...m, _status: 'pending' as const } : m
    ))
    const ok = await sendMessage(pending.content, pending.localId)
    if (ok) {
      setPendingMsgs(prev => prev.filter(m => m.localId !== pending.localId))
    } else {
      setPendingMsgs(prev => prev.map(m =>
        m.localId === pending.localId ? { ...m, _status: 'failed' as const } : m
      ))
    }
  }

  const handleEnd = async () => {
    if (!supabase) return
    await supabase
      .from("bisik_chats")
      .update({ status: "ended", ended_at: new Date().toISOString(), ended_by: user?.id })
      .eq("id", chatId)
    router.replace("/bisik")
  }

  const timeStr = (d: string) =>
    new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "AN"

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh bg-bg flex flex-col">
      <div className="max-w-content mx-auto w-full flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.replace("/bisik")}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {getInitials(otherName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{otherName}</p>
            <p className="text-[10px] text-text-secondary">
              {botFrozen ? (
                <span className="text-text-secondary/50">Obrolan selesai</span>
              ) : receiverIsBot ? (
                <span className="text-green-600 font-medium">Online</span>
              ) : isOnline(lastOnline) ? (
                <span className="text-green-600 font-medium">Online</span>
              ) : lastOnline ? (
                `Offline ${relativeTimeShort(lastOnline)}`
              ) : "Private chat"}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer"
          >
            <Flag size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 w-44 bg-surface border border-border rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => { setShowMenu(false); alert("Fitur lapor akan segera hadir") }}
                className="w-full px-4 py-2.5 text-sm text-text-primary hover:bg-muted flex items-center gap-2 cursor-pointer"
              >
                <Flag size={14} /> Laporkan Obrolan Ini
              </button>
              <hr className="border-border" />
              <button
                onClick={() => { setShowMenu(false); setShowEndConfirm(true) }}
                className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-muted flex items-center gap-2 cursor-pointer"
              >
                <PhoneOff size={14} /> Akhiri Obrolan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Context card */}
      {contextCard && (
        <div
          className="mx-4 mt-3 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 cursor-pointer"
          onClick={() => setShowContext(!showContext)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-primary">
              {contextCard.topic?.emoji} {contextCard.topic?.name}
            </span>
            {showContext ? <ChevronUp size={14} className="text-text-secondary" /> : <ChevronDown size={14} className="text-text-secondary" />}
          </div>
          {showContext && (
            <p className="text-xs text-text-secondary leading-relaxed">
              &ldquo;{contextCard.content}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Sensor notification */}
      {sensorNotif && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">{sensorNotif}</p>
          <button onClick={() => setSensorNotif(null)} className="text-xs text-amber-500 cursor-pointer shrink-0">Tutup</button>
        </div>
      )}

      {/* Ban warning */}
      {banInfo?.isBanned && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
          <Ban size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{banInfo.message}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && pendingMsgs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
            {receiverIsBot ? (
              <>
                <p className="text-lg mb-1">✨</p>
                <p className="text-sm font-medium">{otherName} siap ngobrol</p>
                <p className="text-xs mt-1">Teman curhat yang selalu ada buat kamu</p>
              </>
            ) : (
              <p className="text-sm">Tidak ada pesan, mulailah percakapan!</p>
            )}
          </div>
        )}
        {allMessages().map((msg, i) => {
          const isPending = '_status' in msg
          const isMe = msg.sender_id === user?.id
          const status = isPending ? (msg as PendingMessage)._status : 'sent'
          return (
            <div key={isPending ? (msg as PendingMessage).localId : msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
                  status === 'failed' ? 'border border-red-300 bg-red-50' :
                  isMe
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-muted text-text-primary rounded-bl-md"
                }`}
              >
                <p className={`text-sm whitespace-pre-wrap break-words ${status === 'failed' ? 'text-red-700' : ''}`}>
                  {msg.content}
                </p>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                  <span className={`text-[10px] ${isMe ? "text-white/60" : "text-text-secondary"}`}>
                    {timeStr(msg.created_at)}
                  </span>
                  {isMe && !isPending && (
                    <span className="flex items-center">
                      {(msg as BisikMessage).is_read
                        ? <CheckCheck size={12} className="text-blue-300" />
                        : <Check size={12} className="text-white/50" />
                      }
                    </span>
                  )}
                  {isPending && (msg as PendingMessage)._status === 'pending' && (
                    <Clock size={12} className="text-white/50 animate-pulse" />
                  )}
                </div>
                {status === 'failed' && (
                  <button
                    onClick={() => retryMessage(msg as PendingMessage)}
                    className="mt-1.5 flex items-center gap-1 text-[10px] text-red-600 font-medium cursor-pointer"
                  >
                    <RefreshCw size={10} /> Kirim ulang
                  </button>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-surface shrink-0" style={{ paddingBottom: 'max(16px, calc(4rem + env(safe-area-inset-bottom)))' }}>
        {botTyping && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-text-secondary">{otherName} mengetik...</span>
          </div>
        )}
        {botFrozen && (
          <p className="text-xs text-center text-text-secondary/50 mb-2">
            Obrolan selesai — {otherName} udah offline. Kalian bisa ngobrol lagi minggu depan!
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={botFrozen ? "Obrolan sudah selesai..." : banInfo?.isBanned ? "Kamu sedang dibanned..." : "Tulis pesan..."}
            maxLength={1000}
            disabled={banInfo?.isBanned || botFrozen}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || !!banInfo?.isBanned || botFrozen}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors cursor-pointer shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* End confirm */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEndConfirm(false)} />
          <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-24 animate-in slide-in-from-bottom">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <PhoneOff size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Akhiri Obrolan?</h3>
              <p className="text-sm text-text-secondary mt-1">Riwayat chat tidak bisa dikembalikan</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-border text-text-primary font-medium text-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleEnd}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium text-sm cursor-pointer"
              >
                Akhiri
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
