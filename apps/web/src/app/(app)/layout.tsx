"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Search, User } from "lucide-react"
import { BisikMatchNotifier } from "@/components/bisik/MatchNotifier"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideTopBar =
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/bisik/") ||
    pathname.startsWith("/tebak/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")

  return (
    <>
      {!hideTopBar && (
        <header className="flex items-center gap-3 px-4 py-2 border-b border-border sticky top-0 bg-surface z-30">
          <Link
            href="/search"
            className="flex items-center gap-2 flex-1 bg-bg rounded-full px-3 py-2 border border-border"
          >
            <Search className="w-4 h-4 text-text-secondary" />
            <span className="text-xs text-text-secondary">Cari di Beautifio...</span>
          </Link>
          <Link href="/profil" aria-label="Profil">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
              <User size={16} className="text-primary" />
            </div>
          </Link>
        </header>
      )}
      <BisikMatchNotifier />
      {children}
    </>
  )
}
