"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, MessageSquare } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

export default function MitraSesi() {
  const router = useRouter()
  const { user } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"pending" | "active" | "done">("pending")

  useEffect(() => {
    if (!supabase || !user) return
    supabase.from("consultation_sessions")
      .select("id, net_price, status, created_at, user:users(email)")
      .eq("psychologist_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setSessions(data || []); setLoading(false) })
  }, [user])

  const filtered = sessions.filter(s => tab === "pending" ? s.status === "scheduled" : tab === "active" ? s.status === "active" : s.status !== "scheduled" && s.status !== "active")
  const f = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} /></div>

  return (
    <div>
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        {(["pending","active","done"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer" style={{ background: tab === t ? "#FFFFFF" : "transparent", color: tab === t ? "#1E2938" : "#647488", boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>{t === "pending" ? "⏳ Menunggu" : t === "active" ? "💬 Aktif" : "✅ Selesai"}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(s => (
          <div key={s.id} className="p-3 rounded-xl border text-xs" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold" style={{ color: "#1E2938" }}>{s.user?.email || "User"}</span>
              <span className="font-semibold" style={{ color: "#084463" }}>{s.net_price ? f(s.net_price) : "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: "#647488" }}>{new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" })}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: s.status === "scheduled" ? "rgba(255,198,79,0.1)" : s.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(100,116,136,0.1)", color: s.status === "scheduled" ? "#FFC64F" : s.status === "active" ? "#22C55E" : "#647488" }}>{s.status}</span>
            </div>
          </div>
        ))}
        {!filtered.length && <p className="text-xs text-center py-8" style={{ color: "#647488" }}>Tidak ada sesi</p>}
      </div>
    </div>
  )
}
