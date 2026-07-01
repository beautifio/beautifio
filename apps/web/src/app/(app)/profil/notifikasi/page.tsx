"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, ChevronDown, ChevronUp, Trash2, CheckCheck } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

const GROUPS = [
  { key: "forum", label: "Forum", icon: "💬", items: [
    { key: "circle_mention", label: "@Mention di Forum" },
    { key: "circle_new_question", label: "Pertanyaan baru" },
    { key: "circle_question_answered", label: "Pertanyaan dijawab" },
    { key: "member_joined", label: "Member bergabung" },
    { key: "member_left", label: "Member keluar" },
    { key: "member_banned", label: "Member dibanned" },
  ]},
  { key: "circle", label: "Circle", icon: "👥", items: [
    { key: "circle_approved", label: "Circle disetujui" },
    { key: "circle_rejected", label: "Circle ditolak" },
    { key: "circle_cohost_promoted", label: "Co-host dipromosikan" },
  ]},
  { key: "content", label: "Konten & Event", icon: "📰", items: [
    { key: "tanya_answer", label: "Jawaban pertanyaan" },
    { key: "inspirasi_mention", label: "@Mention di Inspirasi" },
    { key: "attachment_reported", label: "Lampiran dilaporkan" },
    { key: "event_confirmed", label: "Pendaftaran event dikonfirmasi" },
    { key: "event_cancelled", label: "Event dibatalkan" },
  ]},
  { key: "bisik", label: "Bisik", icon: "💬", items: [
    { key: "bisik_new_match", label: "Koneksi baru" },
    { key: "bisik_new_message", label: "Pesan baru" },
  ]},
  { key: "tebak", label: "Tebak Aku", icon: "🎮", items: [
    { key: "tebak_result", label: "Hasil game" },
    { key: "tebak_rematch", label: "Tantangan rematch" },
  ]},
  { key: "care", label: "Beautifio Care", icon: "🩺", items: [
    { key: "care_new_session", label: "Sesi baru" },
    { key: "care_new_message", label: "Pesan baru" },
    { key: "care_closed", label: "Sesi selesai" },
  ]},
  { key: "personal", label: "Personal", icon: "🌱", items: [
    { key: "curhat_comment", label: "Komentar di Curhat" },
    { key: "curhat_reaction", label: "Reaksi di Curhat" },
    { key: "journey_milestone", label: "Milestone tercapai" },
    { key: "familia_achievement", label: "Achievement terbuka" },
    { key: "subscription_active", label: "Langganan aktif" },
    { key: "subscription_expiring", label: "Langganan hampir habis" },
    { key: "voucher_claimed", label: "Voucher diklaim" },
  ]},
  { key: "broadcast", label: "Broadcast", icon: "📢", items: [
    { key: "event", label: "Event" },
    { key: "promo", label: "Promo / Voucher" },
    { key: "recommendation", label: "Rekomendasi Produk" },
  ]},
]

export default function NotifikasiPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<"history" | "preferences">("history")

  // History tab
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [activePress, setActivePress] = useState<string | null>(null)
  const pressTimer = useState<ReturnType<typeof setTimeout> | null>(null)

  // Preferences tab
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return }
    if (!supabase || !user) return
    loadNotifs()
  }, [user, authLoading])

  const loadNotifs = async () => {
    if (!supabase || !user) return
    setLoading(true)
    const { data } = await supabase.from("notifications")
      .select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(50)
    setNotifs(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    setDeleting(prev => new Set(prev).add(id))
    await supabase.from("notifications").delete().eq("id", id)
    setNotifs(prev => prev.filter(n => n.id !== id))
    setDeleting(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const clearAll = async () => {
    if (!supabase || !user || !confirm("Hapus semua notifikasi?")) return
    await supabase.from("notifications").delete().eq("user_id", user.id)
    setNotifs([])
  }

  const startPress = (id: string) => {
    const t = setTimeout(() => setActivePress(id), 500)
    pressTimer[1](t)
  }
  const cancelPress = () => {
    if (pressTimer[0]) clearTimeout(pressTimer[0])
    setActivePress(null)
  }

  // Preferences logic
  useEffect(() => {
    if (!supabase || !user) return
    supabase.from("notification_preferences").select("notification_type, enabled").eq("user_id", user.id)
      .then(({ data }) => {
        const map: Record<string, boolean> = {}
        data?.forEach((p: any) => { map[p.notification_type] = p.enabled ?? true })
        setPrefs(map)
      })
  }, [user])

  const togglePref = async (key: string) => {
    if (!supabase || !user) return
    const enabled = !prefs[key]
    setPrefs(prev => ({ ...prev, [key]: enabled }))
    if (prefs[key] !== undefined) {
      await supabase.from("notification_preferences").update({ enabled }).eq("user_id", user.id).eq("notification_type", key)
    } else {
      await supabase.from("notification_preferences").insert({ user_id: user.id, notification_type: key, enabled })
    }
  }

  const toggleGroup = (key: string) => {
    setExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })

  if (!user) return null

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-4 py-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm cursor-pointer mb-4" style={{ color: "#647488" }}>
          <ArrowLeft size={16} /> Kembali
        </button>

        <h1 className="text-lg font-bold mb-4" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Notifikasi</h1>

        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
          {(["history", "preferences"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={{ background: tab === t ? "#FFFFFF" : "transparent", color: tab === t ? "#1E2938" : "#647488", boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>
              {t === "history" ? "📬 Riwayat" : "⚙️ Preferensi"}
            </button>
          ))}
        </div>

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div>
            {notifs.length > 0 && (
              <button onClick={clearAll} className="mb-3 flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-semibold cursor-pointer"
                style={{ background: "rgba(239,68,68,0.06)", color: "#EF4444" }}>
                <Trash2 size={12} /> Hapus Semua
              </button>
            )}

            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white border border-[#E2E8F0] animate-pulse" />)}</div>
            ) : notifs.length === 0 ? (
              <div className="text-center py-16">
                <Bell size={32} className="mx-auto mb-2" style={{ color: "#E2E8F0" }} />
                <p className="text-sm" style={{ color: "#647488" }}>Belum ada notifikasi</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifs.map(n => (
                  <div key={n.id} className="relative group">
                    <div
                      onPointerDown={() => startPress(n.id)}
                      onPointerUp={cancelPress}
                      onPointerLeave={cancelPress}
                      onClick={() => {
                        if (activePress) return
                        supabase?.from("notifications").update({ is_read: true }).eq("id", n.id)
                        setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
                      }}
                      className="p-3 rounded-xl border cursor-pointer transition-colors"
                      style={{ background: n.is_read ? "#FFFFFF" : "rgba(8,68,99,0.03)", borderColor: "#E2E8F0", opacity: deleting.has(n.id) ? 0.5 : 1 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? "bg-transparent" : ""}`} style={{ background: n.is_read ? "transparent" : "#084463" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: "#1E2938" }}>{n.title}</p>
                          {n.body && <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: "#647488" }}>{n.body}</p>}
                          <p className="text-[9px] mt-1" style={{ color: "#647488" }}>{formatDate(n.created_at)}</p>
                        </div>
                        {activePress === n.id && (
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                            className="shrink-0 p-2 rounded-lg cursor-pointer" style={{ background: "rgba(239,68,68,0.08)" }}>
                            <Trash2 size={12} style={{ color: "#EF4444" }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PREFERENCES TAB */}
        {tab === "preferences" && (
          <div className="space-y-2">
            {GROUPS.map(grp => (
              <div key={grp.key} className="rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0", background: "#FFFFFF" }}>
                <button onClick={() => toggleGroup(grp.key)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer">
                  <span className="text-xs font-semibold" style={{ color: "#1E2938" }}>{grp.icon} {grp.label}</span>
                  {expanded.has(grp.key) ? <ChevronUp size={14} style={{ color: "#647488" }} /> : <ChevronDown size={14} style={{ color: "#647488" }} />}
                </button>
                {expanded.has(grp.key) && (
                  <div className="border-t" style={{ borderColor: "#E2E8F0" }}>
                    {grp.items.map(item => (
                      <div key={item.key} className="flex items-center justify-between px-4 py-2.5 border-b last:border-b-0" style={{ borderColor: "#E2E8F0" }}>
                        <span className="text-xs" style={{ color: "#647488" }}>{item.label}</span>
                        <button onClick={() => togglePref(item.key)}
                          className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${prefs[item.key] !== false ? "" : "opacity-40"}`}
                          style={{ background: prefs[item.key] !== false ? "#084463" : "#E2E8F0" }}>
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${prefs[item.key] !== false ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
