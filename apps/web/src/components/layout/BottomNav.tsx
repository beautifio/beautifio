"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, MessageCircleHeart } from "lucide-react"
import { NAV_TABS } from "@/lib/navigation"
import { useAuthStore } from "@/stores/auth-store"

export const BISIK_TAB = { id: "bisik", label: "Bisik", icon: MessageCircleHeart, href: "/bisik" }

export function BottomNav() {
  const pathname = usePathname()
  const bisikMatchCount = useAuthStore((s) => s.bisikMatchCount)
  const clearBisikMatch = useAuthStore((s) => s.clearBisikMatch)

  const hideFAB = ["/bisik", "/tebak", "/admin", "/connect"].some((p) => pathname.startsWith(p))

  const activeTab = (() => {
    if (pathname.startsWith("/bisik")) return "bisik"
    if (pathname.startsWith("/journey")) return "journey"
    if (pathname.startsWith("/inspirasi")) return "inspirasi"
    if (pathname.startsWith("/circle")) return "circle"
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

        {/* Bisik with badge */}
        <NavItem
          tab={BISIK_TAB}
          active={activeTab === "bisik"}
          badge={bisikMatchCount}
          onBadgeClick={clearBisikMatch}
        />

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
        <NavItem tab={NAV_TABS[3]} active={activeTab === "circle"} />
      </div>
    </nav>
  )
}

function NavItem({
  tab, active, badge, onBadgeClick,
}: {
  tab: typeof NAV_TABS[number];
  active: boolean;
  badge?: number;
  onBadgeClick?: () => void;
}) {
  const Icon = tab.icon
  return (
    <Link
      href={tab.href}
      onClick={badge && onBadgeClick ? () => onBadgeClick() : undefined}
      className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all relative"
    >
      {active && (
        <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
      )}
      <div className="relative">
        <Icon
          size={20}
          className={`transition-transform ${active ? "scale-110 text-primary" : "text-text-secondary"}`}
        />
        {badge && badge > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </div>
      <span className={`text-[10px] font-medium ${active ? "text-primary font-semibold" : "text-text-secondary"}`}>
        {tab.label}
      </span>
    </Link>
  )
}
