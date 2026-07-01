"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Calendar, Clock, DollarSign, Users, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

export default function MitraDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !user) return
    supabase.from("consultation_sessions")
      .select("id, status, net_price, created_at, psychologist:psychologists(full_name)")
      .eq("psychologist_id", user.id).order("created_at", { ascending: false }).limit(100)
      .then(({ data: sessions }) => {
        const ss = sessions || []
        const pending = ss.filter(s => s.status === "scheduled")
        const active = ss.filter(s => s.status === "active")
        const completed = ss.filter(s => s.status === "completed")
        const paid = ss.filter(s => s.status === "paid")
        const today = new Date().toISOString().slice(0, 10)
        const todaySessions = ss.filter(s => s.created_at?.startsWith(today))
        const totalNett = completed.concat(paid).reduce((sum, s) => sum + (s.net_price || 0), 0)
        setData({ pending, active, completed: completed.length + paid.length, todaySessions, totalNett, recent: ss.slice(0, 5) })
        setLoading(false)
      })
  }, [user])

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} /></div>

  const f = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Hari Ini", value: data?.todaySessions?.length || 0, icon: Calendar, color: "#084463" },
          { label: "Menunggu", value: data?.pending?.length || 0, icon: Clock, color: "#FFC64F" },
          { label: "Selesai", value: data?.completed || 0, icon: Users, color: "#22C55E" },
          { label: "Pendapatan", value: f(data?.totalNett || 0), icon: DollarSign, color: "#FFC64F" },
        ].map((c, i) => (
          <div key={i} className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            <c.icon size={14} style={{ color: c.color, marginBottom: 4 }} />
            <p className="text-[10px]" style={{ color: "#647488" }}>{c.label}</p>
            <p className="text-lg font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold" style={{ color: "#647488" }}>📋 Sesi Terbaru</p>
          <button onClick={() => router.push("/mitra/sesi")} className="text-xs font-semibold cursor-pointer" style={{ color: "#6BB9D4" }}>Lihat Semua →</button>
        </div>
        {data?.recent?.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-b-0 text-xs" style={{ borderColor: "#E2E8F0" }}>
            <div>
              <span className="font-semibold" style={{ color: "#1E2938" }}>Konsultasi {s.net_price ? f(s.net_price) : ""}</span>
              <span className="ml-2 text-[10px]" style={{ color: "#647488" }}>{new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" })}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
              background: s.status === "scheduled" ? "rgba(255,198,79,0.1)" : s.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(100,116,136,0.1)",
              color: s.status === "scheduled" ? "#FFC64F" : s.status === "active" ? "#22C55E" : "#647488" }}>{s.status}</span>
          </div>
        ))}
        {!data?.recent?.length && <p className="text-xs text-center py-4" style={{ color: "#647488" }}>Belum ada sesi</p>}
      </div>
    </div>
  )
}
