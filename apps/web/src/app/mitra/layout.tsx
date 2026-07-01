"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { MainTopBar } from "@/components/layout/MainTopBar"
import { LayoutDashboard, MessageSquare, DollarSign, User, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

const LINKS = [
  { href: "/mitra", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mitra/sesi", label: "Sesi", icon: Calendar },
  { href: "/mitra/keuangan", label: "Keuangan", icon: DollarSign },
  { href: "/mitra/profil", label: "Profil", icon: User },
]

export default function MitraLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [stats, setStats] = useState({ today: 0, pending: 0 })

  useEffect(() => {
    if (!supabase || !user) return
    const today = new Date().toISOString().slice(0, 10)
    Promise.all([
      supabase.from("consultation_sessions").select("id", { count: "exact", head: true }).eq("psychologist_id", user.id).gte("created_at", today),
      supabase.from("consultation_sessions").select("id", { count: "exact", head: true }).eq("psychologist_id", user.id).eq("status", "scheduled"),
    ]).then(([r1, r2]) => setStats({ today: r1.count || 0, pending: r2.count || 0 }))
  }, [user])

  return (
    <div className="min-h-screen pb-20" style={{ background: "#F8FAFC" }}>
      <MainTopBar />
      <div className="max-w-content mx-auto px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(8,68,99,0.08)" }}>
            <LayoutDashboard size={20} style={{ color: "#084463" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Mitra Beautifio</h1>
            <p className="text-xs" style={{ color: "#647488" }}>{stats.today} sesi hari ini · {stats.pending} menunggu</p>
          </div>
        </div>
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
          {LINKS.map(l => (
            <button key={l.href} onClick={() => router.push(l.href)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
              style={{ background: pathname === l.href ? "#FFFFFF" : "transparent", color: pathname === l.href ? "#1E2938" : "#647488", boxShadow: pathname === l.href ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>
              <l.icon size={14} />{l.label}
            </button>
          ))}
        </div>
        {children}
      </div>
    </div>
  )
}
