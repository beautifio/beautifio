"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, User } from "lucide-react"
import { NotificationBell } from "@/components/NotificationBell"
import { supabase } from "@/lib/supabase/client"

export function MainTopBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [logoUrl, setLogoUrl] = useState("")

  useEffect(() => {
    if (!supabase) return
    supabase.from("app_settings").select("value").eq("key", "logo_square_url").single().then(({ data }) => {
      if (data?.value) setLogoUrl(data.value)
    })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="on-dark sticky top-0 z-30 bg-laut-950/90 shadow-topbar backdrop-blur-xl backdrop-saturate-150">
      <div className="max-w-content mx-auto flex w-full items-center gap-3 px-4 py-2.5">
        {logoUrl && (
          <img src={logoUrl} alt="Beautifio" className="h-7 w-auto flex-shrink-0" />
        )}
        <form
          onSubmit={handleSearch}
          role="search"
          className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors focus-within:border-fajar/50 focus-within:bg-white/[0.12]"
        >
          <Search className="h-4 w-4 shrink-0 text-white/55" aria-hidden />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari di Beautifio"
            aria-label="Cari di Beautifio"
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-white outline-none placeholder:text-white/45 focus-visible:outline-none"
          />
        </form>
        <NotificationBell />
        <Link
          href="/profil"
          aria-label="Profil"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/15"
        >
          <User size={17} className="text-white" />
        </Link>
      </div>
    </header>
  )
}
