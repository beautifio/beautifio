"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, User } from "lucide-react"
import { NotificationBell } from "@/components/NotificationBell"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

function TierBadge() {
  const { user } = useAuth()
  const [tier, setTier] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase || !user) return
    supabase.from("user_subscriptions")
      .select("plan_id").eq("user_id", user.id).eq("status", "active")
      .gt("expires_at", new Date().toISOString()).maybeSingle()
      .then(async ({ data: sub }) => {
        if (!sub?.plan_id) return
        const { data: plan } = await supabase!.from("subscription_plans")
          .select("tier").eq("id", sub.plan_id).single()
        if (plan?.tier && plan.tier !== "reguler") setTier(plan.tier)
      })
  }, [user])

  if (!tier) return null

  return (
    <span style={{
      position: "absolute", bottom: -3, right: -3,
      width: 12, height: 12, borderRadius: "50%",
      background: tier === "ultimate" ? "#6BB9D4" : "#FFC64F",
      border: "1.5px solid #084463",
    }} title={tier === "ultimate" ? "Ultimate" : "Pro"} />
  )
}

export function MainTopBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header
      style={{ background: '#084463', boxShadow: '0 2px 12px rgba(8,68,99,0.2)' }}
      className="flex items-center gap-3 px-4 py-2.5 sticky top-0 z-30"
    >
      <div className="max-w-content mx-auto w-full flex items-center gap-3">
        <form
          onSubmit={handleSearch}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,198,79,0.3)', borderRadius: 20 }}
          className="flex items-center gap-2 w-48 px-3 py-2"
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari di Beautifio..."
            className="flex-1 bg-transparent text-xs outline-none border-none"
            style={{ color: '#FFFFFF' }}
          />
        </form>
        <div className="flex-1" />
        <NotificationBell />
        <Link href="/profil" aria-label="Profil" className="relative">
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <User size={16} style={{ color: '#FFFFFF' }} />
          </div>
          <TierBadge />
        </Link>
      </div>
    </header>
  )
}
