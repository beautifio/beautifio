"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { NAV_TABS } from "@/lib/navigation"

export function BottomNav() {
  const pathname = usePathname()

  const hideFAB = ["/bisik", "/tebak", "/admin", "/connect"].some((p) => pathname.startsWith(p))

  const activeTab = (() => {
    if (pathname.startsWith("/journey")) return "journey"
    if (pathname.startsWith("/inspirasi")) return "inspirasi"
    if (pathname.startsWith("/circles")) return "circles"
    if (pathname.startsWith("/home") || pathname === "/") return "home"
    for (const tab of NAV_TABS) {
      if (pathname === tab.href || pathname.startsWith(tab.href + "/")) return tab.id
    }
    return ""
  })()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-xl border-t border-border z-50 safe-area-bottom">
      <div className="flex items-end justify-around h-full px-2 pb-1">
        {/* Beranda */}
        <NavItem tab={NAV_TABS[0]} active={activeTab === "home"} />

        {/* Journey */}
        <NavItem tab={NAV_TABS[1]} active={activeTab === "journey"} />

        {/* FAB tengah */}
        <div className="flex flex-col items-center -mt-4">
          {!hideFAB ? (
            <Link
              href="/connect"
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105 active:scale-95"
              style={{ background: "#D4537E" }}
              aria-label="Connect"
            >
              <MessageCircle size={22} className="text-white" />
            </Link>
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>

        {/* Inspirasi */}
        <NavItem tab={NAV_TABS[2]} active={activeTab === "inspirasi"} />

        {/* Circles */}
        <NavItem tab={NAV_TABS[3]} active={activeTab === "circles"} />
      </div>
    </nav>
  )
}

function NavItem({ tab, active }: { tab: typeof NAV_TABS[number]; active: boolean }) {
  const Icon = tab.icon
  return (
    <Link
      href={tab.href}
      className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all relative"
    >
      {active && (
        <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
      )}
      <Icon
        size={20}
        className={`transition-transform ${active ? "scale-110 text-primary" : "text-text-secondary"}`}
      />
      <span className={`text-[10px] font-medium ${active ? "text-primary font-semibold" : "text-text-secondary"}`}>
        {tab.label}
      </span>
    </Link>
  )
}
