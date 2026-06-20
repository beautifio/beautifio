"use client"

import { useState, useEffect, use, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Send, Flag, PhoneOff, ArrowLeft, Loader2,
  ChevronDown, ChevronUp,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { getBisikChat, getBisikMessages } from "@/lib/bisik/queries"
import type { BisikMessage, BisikChat } from "@/lib/bisik/queries"

export default function BisikChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [chat, setChat] = useState<BisikChat | null>(null)
  const [messages, setMessages] = useState<BisikMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [otherName, setOtherName] = useState("Anonymous")
  const [showContext, setShowContext] = useState(true)
  const [contextCard, setContextCard] = useState<{ content: string; topic?: { name: string; emoji: string } | null } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const c = await getBisikChat(chatId)
      if (!c) { router.replace("/bisik"); return }
      if (c.status === "ended") { router.replace("/bisik"); return }
      setChat(c)

      // Fetch context card
      const cardData = c as any
      if (cardData.card_id) {
        const { data: card } = await supabase!
          .from("bisik_cards")
          .select("content, topic:bisik_topics(name, emoji)")
          .eq("id", cardData.card_id)
          .single()
        setContextCard(card as any)
      }

      // Fetch other user's name
      const isInitiator = c.initiator_id === user.id
      const otherId = isInitiator ? c.receiver_id : c.initiator_id
      const { data: otherUser } = await supabase!
        .from("users")
        .select("bisik_anonymous_name, bisik_custom_name")
        .eq("id", otherId)
        .single()
      setOtherName(otherUser?.bisik_custom_name || otherUser?.bisik_anonymous_name || "Anonymous")

      const msgs = await getBisikMessages(chatId)
      setMessages(msgs)
      setLoading(false)
    })()
  }, [chatId, user, router])

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
        setMessages((prev) => [...prev, payload.new as BisikMessage])
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
  }, [chatId, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const isInitiator = chat?.initiator_id === user?.id

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending || !supabase || !user) return
    setSending(true)
    try {
      await supabase.from("bisik_messages").insert({
        chat_id: chatId,
        sender_id: user.id,
        content: input.trim(),
      })

      if (isInitiator && !chat?.expires_at) {
        await supabase
          .from("bisik_chats")
          .update({ expires_at: new Date(Date.now() + 24 * 3600000).toISOString() })
          .eq("id", chatId)
      }

      setInput("")
    } catch {} finally {
      setSending(false)
    }
  }, [input, sending, supabase, user, chatId, isInitiator, chat])

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
    <div className="min-h-screen bg-bg flex flex-col">
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
            <p className="text-[10px] text-text-secondary">Private chat</p>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
            <p className="text-sm">Tidak ada pesan, mulailah percakapan!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
                  isMe
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-muted text-text-primary rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-text-secondary"}`}>
                  {timeStr(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Tulis pesan..."
            maxLength={1000}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
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
  )
}
