"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Search, User } from "lucide-react"
import { BisikMatchNotifier } from "@/components/bisik/MatchNotifier"
import { NotificationBell } from "@/components/NotificationBell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideTopBar =
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/tebak/") ||
    pathname.startsWith("/tebak/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")

  return (
    <>
      {!hideTopBar && (
        <header
          style={{
            background: '#084463',
            boxShadow: '0 2px 12px rgba(8,68,99,0.2)',
          }}
          className="flex items-center gap-3 px-4 py-2.5 sticky top-0 z-30"
        >
          <Link
            href="/search"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20,
            }}
            className="flex items-center gap-2 flex-1 px-3 py-2"
          >
            <Search className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Cari di Beautifio...</span>
          </Link>
          <NotificationBell />
          <Link href="/profil" aria-label="Profil">
            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <User size={16} style={{ color: '#FFFFFF' }} />
            </div>
          </Link>
        </header>
      )}
      <BisikMatchNotifier />
      {children}
    </>
  )
}
