"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  data: any
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [unread, setUnread] = useState(0)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [tier, setTier] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/auth/tier")
      .then(r => r.json())
      .then(d => { if (d?.tier && d.tier !== "reguler") setTier(d.tier) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!user || !supabase) return
    const sb = supabase

    const load = async () => {
      const { data } = await sb
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
      if (data) {
        setNotifs(data)
        setUnread(data.filter((n) => !n.is_read).length)
      }
    }
    load()

    // Realtime
    const channel = sb
      .channel("notif-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        const n = payload.new as Notification
        setNotifs((prev) => [n, ...prev].slice(0, 10))
        setUnread((prev) => prev + 1)
      })
      .subscribe()

    // Click outside
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => {
      sb.removeChannel(channel)
      document.removeEventListener("mousedown", handleClick)
    }
  }, [user])

  const handleMarkRead = async (notif: Notification) => {
    if (!supabase || notif.is_read) return
    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id)
    setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n))
    setUnread((prev) => Math.max(0, prev - 1))
  }

  const handleClick = (notif: Notification) => {
    handleMarkRead(notif)
    const d = notif.data
    if (notif.type === "circle_approved" && d?.circle_id) {
      router.push(`/circle/${d.circle_id}`)
    } else if (notif.type === "circle_rejected" && d?.circle_id) {
      router.push("/circle")
    } else if (notif.type === "circle_new_question" && d?.circle_id) {
      router.push(`/circle/${d.circle_id}`)
    } else if (notif.type === "circle_question_answered" && d?.source_url) {
      router.push(d.source_url)
    } else if (notif.type === "circle_cohost_promoted" && d?.circle_id) {
      router.push(`/circle/${d.circle_id}`)
    } else if (notif.type?.startsWith("event_")) {
      router.push("/event/me")
    } else if (notif.type === "subscription_active") {
      router.push("/bisik")
    } else if (notif.type === "subscription_expiring") {
      router.push("/bisik/upgrade")
    } else if (notif.type?.startsWith("care_")) {
      if (d?.session_id) router.push(`/care/chat/${d.session_id}`)
      else router.push("/care/chat")
    } else if (notif.type?.startsWith("tebak_")) {
      router.push("/tebak")
    } else if (notif.type?.startsWith("bisik_")) {
      if (d?.chat_id) router.push(`/bisik/chat/${d.chat_id}`)
      else router.push("/bisik/chats")
    } else if (notif.type?.startsWith("curhat_")) {
      if (d?.source_url) router.push(d.source_url)
    } else if (notif.type === "journey_milestone") {
      router.push("/journey")
    } else if (notif.type === "familia_achievement") {
      router.push("/profil")
    } else if (notif.type === "voucher_claimed") {
      router.push("/voucher/me")
    } else if (notif.type === "member_banned" || notif.type === "member_joined" || notif.type === "member_left") {
      if (d?.circle_id) router.push(`/circle/${d.circle_id}`)
    } else if (d?.link_url) {
      if (d.link_url.startsWith("/")) router.push(d.link_url)
      else window.open(d.link_url, "_blank")
    } else if (d?.source_url) {
      if (d.source_url.startsWith("/")) router.push(d.source_url)
    }
    setOpen(false)
  }

  if (!user) return <div className="w-8 h-8" />;

  return (
    <div ref={ref} className="relative flex items-center gap-1.5">
      {tier && (
        <span style={{
          background: tier === "ultimate" ? "rgba(107,185,212,0.2)" : "rgba(255,198,79,0.2)",
          color: tier === "ultimate" ? "#6BB9D4" : "#FFC64F",
          borderRadius: 99, padding: "1px 6px", fontSize: 9, fontWeight: 700,
          border: tier === "ultimate" ? "1px solid rgba(107,185,212,0.4)" : "1px solid rgba(255,198,79,0.4)",
        }}>
          {tier === "ultimate" ? "💎 Ultimate" : "👑 Pro"}
        </span>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors relative cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.15)' }}
      >
        <Bell size={16} style={{ color: '#FFFFFF' }} />
        {unread > 0 && (
          <span
            style={{
              position: 'absolute', top: -2, right: -2,
              width: 16, height: 16,
              background: '#FFC64F', color: '#1E2938',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 700,
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-text-primary">Notifikasi</h3>
          </div>

          {notifs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell size={20} className="mx-auto text-text-secondary/30 mb-2" />
              <p className="text-xs text-text-secondary">Belum ada notifikasi</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer ${n.is_read ? "" : "bg-primary/5"}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? "bg-transparent" : "bg-primary"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary">{n.title}</p>
                      {n.body && <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[9px] text-text-secondary/50 mt-1">
                        {new Date(n.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {notifs.length > 0 && (
            <Link href="/profil/notifikasi" onClick={() => setOpen(false)}
              className="block w-full text-center px-4 py-2.5 text-xs font-semibold border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
              style={{ color: "#6BB9D4" }}>
              Lihat Semua →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
