"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircleHeart } from "lucide-react"
import { NAV_TABS } from "@/lib/navigation"
import { useAuthStore } from "@/stores/auth-store"

export const BISIK_TAB = { id: "bisik", label: "Bisik", icon: MessageCircleHeart, href: "/bisik" }

const ORDER = [NAV_TABS[0], NAV_TABS[1], BISIK_TAB, NAV_TABS[2], NAV_TABS[3]]

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
  const activeIndex = ORDER.findIndex((t) => t.id === activeTab)

  return (
    <nav
      aria-label="Navigasi utama"
      className="on-dark fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div className="surface-glass-dark pointer-events-auto relative mx-auto flex h-[62px] max-w-sm items-stretch rounded-2xl px-1.5 !bg-laut-950/85">
        {/* sliding indicator */}
        {activeIndex >= 0 && (
          <span
            aria-hidden
            className="absolute inset-y-1.5 left-1.5 rounded-xl bg-white/[0.09] ring-1 ring-inset ring-white/10 transition-transform duration-300 ease-out-expo motion-reduce:transition-none"
            style={{ width: "calc((100% - 12px) / 5)", transform: `translateX(${activeIndex * 100}%)` }}
          >
            <span className="absolute left-1/2 top-0 h-[3px] w-6 -translate-x-1/2 rounded-b-full bg-fajar shadow-[0_0_10px_rgba(255,190,77,0.9)]" />
          </span>
        )}
        {ORDER.map((tab) =>
          tab.id === "bisik" ? (
            <NavItem key={tab.id} tab={tab} active={activeTab === tab.id} badge={bisikMatchCount} onBadgeClick={clearBisikMatch} />
          ) : (
            <NavItem key={tab.id} tab={tab} active={activeTab === tab.id} />
          )
        )}
      </div>
    </nav>
  )
}

function NavItem({
  tab, active, badge, onBadgeClick,
}: {
  tab: (typeof ORDER)[number]
  active: boolean
  badge?: number
  onBadgeClick?: () => void
}) {
  const Icon = tab.icon
  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      onClick={badge && onBadgeClick ? () => onBadgeClick() : undefined}
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1 rounded-xl"
    >
      <span className="relative">
        <Icon
          size={21}
          strokeWidth={active ? 2.3 : 1.9}
          className={`transition-colors duration-200 ${active ? "text-fajar" : "text-white/55"}`}
        />
        {badge && badge > 0 ? (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fajar px-1 text-[9px] font-bold text-laut-950 ring-2 ring-laut-950">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </span>
      <span className={`text-[10.5px] leading-none transition-colors duration-200 ${active ? "font-semibold text-white" : "font-medium text-white/55"}`}>
        {tab.label}
      </span>
    </Link>
  )
}
