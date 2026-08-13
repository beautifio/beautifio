"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Search, User, Crown, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

const NotificationBell = dynamic(() => import("@/components/NotificationBell").then(m => ({ default: m.NotificationBell })), { ssr: false })

export function MainTopBar() {
  const router = useRouter()
  const { user } = useAuth()
  const [query, setQuery] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [tier, setTier] = useState<string>("")

  useEffect(() => {
    if (!supabase) return
    supabase.from("app_settings").select("value").eq("key", "logo_square_url").single().then(({ data }) => {
      if (data?.value) { setLogoUrl(data.value); sessionStorage.setItem("bt_logo", data.value) }
    })
    // Show cached logo immediately
    const cached = sessionStorage.getItem("bt_logo")
    if (cached) setLogoUrl(cached)
  }, [])

  useEffect(() => {
    if (!supabase || !user) return
    // Use cached tier first, then refresh
    const cached = sessionStorage.getItem("bt_tier")
    if (cached) setTier(cached)

    supabase.from("user_subscriptions").select("plan_id").eq("user_id", user.id).eq("status", "active").gt("expires_at", new Date().toISOString()).maybeSingle().then(({ data: sub }) => {
      if (!sub) { setTier("reguler"); sessionStorage.setItem("bt_tier", "reguler"); return }
      supabase!.from("subscription_plans").select("tier").eq("id", sub.plan_id).single().then(({ data: plan }) => {
        const t = plan?.tier || "reguler"
        setTier(t)
        sessionStorage.setItem("bt_tier", t)
      })
    })
  }, [user])

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
        {logoUrl && (
          <img src={logoUrl} alt="Beautifio" className="h-6 w-auto flex-shrink-0"  />
        )}
        <form
          onSubmit={handleSearch}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,198,79,0.3)', borderRadius: 16 }}
          className="flex items-center gap-1.5 w-32 px-2.5 py-1.5"
        >
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari..."
            className="flex-1 bg-transparent text-[11px] outline-none border-none"
            style={{ color: '#FFFFFF' }}
          />
        </form>
        <div className="flex-1" />
        {tier === "reguler" ? (
          <Link href="/bisik/upgrade" className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer" style={{ background: 'rgba(255,198,79,0.15)', color: '#FFC64F', border: '1px solid rgba(255,198,79,0.2)' }}>
            <Sparkles size={10} /> Upgrade
          </Link>
        ) : tier ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(255,198,79,0.15)', color: '#FFC64F' }}>
            <Crown size={10} /> {tier === "ultimate" ? "Ultimate" : "Pro"}
          </span>
        ) : null}
        <NotificationBell />
        <Link href="/profil" aria-label="Profil">
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <User size={16} style={{ color: '#FFFFFF' }} />
          </div>
        </Link>
      </div>
    </header>
  )
}
