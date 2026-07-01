"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, User } from "lucide-react"
import { NotificationBell } from "@/components/NotificationBell"

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
        <Link href="/profil" aria-label="Profil">
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <User size={16} style={{ color: '#FFFFFF' }} />
          </div>
        </Link>
      </div>
    </header>
  )
}
