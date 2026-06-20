"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Send, Flag, PhoneOff, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { BisikMessage, BisikParticipant } from "@/lib/bisik/queries"

type Props = {
  sessionId: string
  participants: BisikParticipant[]
  currentUserId: string
  initialMessages: BisikMessage[]
  onEnded: () => void
}

function timeStr(d: string) {
  return new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export function ChatRoom({ sessionId, participants, currentUserId, initialMessages, onEnded }: Props) {
  const [messages, setMessages] = useState<BisikMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportDetail, setReportDetail] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const me = participants.find((p) => p.user_id === currentUserId)
  const other = participants.find((p) => p.user_id !== currentUserId)
  const otherNickname = other?.nickname || "Lawan bicara"

  useEffect(() => {
    if (!createClient()) return () => {}

    const supabase = createClient()!
    const channel = supabase
      .channel(`bisik-chat-${sessionId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "bisik_chats",
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        const s = payload.new as { status: string }
        if (s.status === "ended") onEnded()
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "bisik_messages",
        filter: `chat_id=eq.${sessionId}`,
      }, (payload) => setMessages((prev) => [...prev, payload.new as BisikMessage]))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId, onEnded])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending || !me) return
    setSending(true)
    try {
      const supabase = createClient()
      if (!supabase) return
      await supabase.from("bisik_messages").insert({
        chat_id: sessionId,
        sender_id: me.id,
        content: input.trim(),
      })
      setInput("")
    } catch {} finally {
      setSending(false)
    }
  }, [input, sending, me, sessionId])

  const handleEnd = async () => {
    const supabase = createClient()
    if (supabase) {
      await supabase.from("bisik_chats").update({
        status: "ended",
        ended_at: new Date().toISOString(),
        ended_by: me?.id,
      }).eq("id", sessionId)
    }
    onEnded()
  }

  const handleReport = async () => {
    if (!me || !reportReason) return
    const supabase = createClient()
    if (supabase) {
      await supabase.from("bisik_chats").update({
        status: "ended",
        ended_at: new Date().toISOString(),
        ended_by: me?.id,
      }).eq("id", sessionId)
    }
    onEnded()
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {otherNickname.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{otherNickname}</p>
            <p className="text-[11px] text-text-secondary">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowReport(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Laporkan"
          >
            <Flag size={18} />
          </button>
          <button
            onClick={() => setShowEndConfirm(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Akhiri"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
            <p className="text-sm">Tidak ada pesan, mulailah percakapan!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === me?.id
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
            placeholder="Ketik pesan..."
            maxLength={500}
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
        <p className="text-[10px] text-text-secondary/50 text-right mt-1">{input.length}/500</p>
      </div>

      {/* End confirm */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEndConfirm(false)} />
          <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <PhoneOff size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Akhiri Percakapan?</h3>
              <p className="text-sm text-text-secondary mt-1">Kamu tidak akan bisa chat lagi setelah ini</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-3 rounded-xl border border-border text-text-primary font-medium text-sm hover:bg-muted transition-colors cursor-pointer">
                Batal
              </button>
              <button onClick={handleEnd} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors cursor-pointer">
                Akhiri
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report sheet */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReport(false)} />
          <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Laporkan</h3>
              <p className="text-sm text-text-secondary mt-1">Laporkan jika ada konten tidak pantas</p>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { value: 'konten_tidak_pantas', label: 'Konten tidak pantas' },
                { value: 'spam', label: 'Spam' },
                { value: 'pelecehan', label: 'Pelecehan' },
                { value: 'ujaran_kebencian', label: 'Ujaran kebencian' },
                { value: 'lainnya', label: 'Lainnya' },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReportReason(r.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors cursor-pointer ${
                    reportReason === r.value ? 'bg-primary/5 border border-primary' : 'bg-muted hover:bg-muted/70'
                  }`}
                >
                  {r.label}
                </button>
              ))}
              <textarea
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
                placeholder="Detail tambahan (opsional)"
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary transition-colors resize-none h-20"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-xl border border-border text-text-primary font-medium text-sm hover:bg-muted transition-colors cursor-pointer">
                Batal
              </button>
              <button onClick={handleReport} disabled={!reportReason} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-40 cursor-pointer">
                Kirim Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
