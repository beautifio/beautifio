"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircleHeart } from "lucide-react"
import { NAV_TABS } from "@/lib/navigation"
import { useAuthStore } from "@/stores/auth-store"

export const BISIK_TAB = { id: "bisik", label: "Bisik", icon: MessageCircleHeart, href: "/bisik" }

export function BottomNav() {
  const pathname = usePathname()
  const bisikMatchCount = useAuthStore((s) => s.bisikMatchCount)
  const clearBisikMatch = useAuthStore((s) => s.clearBisikMatch)

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
    <nav
      style={{
        background: '#084463',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -4px 20px rgba(8,68,99,0.3)',
      }}
      className="fixed bottom-0 left-0 right-0 h-16 z-50 safe-area-bottom"
    >
      <div className="flex items-end justify-around h-full px-2 pb-1">
        <NavItem tab={NAV_TABS[0]} active={activeTab === "home"} />
        <NavItem tab={NAV_TABS[1]} active={activeTab === "journey"} />
        <NavItem
          tab={BISIK_TAB}
          active={activeTab === "bisik"}
          badge={bisikMatchCount}
          onBadgeClick={clearBisikMatch}
        />
        <NavItem tab={NAV_TABS[2]} active={activeTab === "inspirasi"} />
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
        <div
          style={{
            position: 'absolute', top: 0,
            width: 24, height: 2,
            background: '#FFC64F',
            borderRadius: '0 0 2px 2px',
          }}
        />
      )}
      <div className="relative">
        <Icon
          size={22}
          style={{
            color: active ? '#FFC64F' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.2s ease',
          }}
        />
        {badge && badge > 0 ? (
          <span
            style={{
              position: 'absolute', top: -6, right: -6,
              width: 16, height: 16,
              background: '#FFC64F', color: '#1E2938',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700,
            }}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: active ? 600 : 400,
          color: active ? '#FFC64F' : 'rgba(255,255,255,0.5)',
        }}
      >
        {tab.label}
      </span>
    </Link>
  )
}
