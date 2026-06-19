"use client"

import { usePathname, useRouter, useSelectedLayoutSegment } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { NAV_TABS, navRoute } from "@/lib/navigation"

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const hideFAB = ["/bisik", "/tebak", "/admin"].some((p) => pathname.startsWith(p))

  const activeTab = (() => {
    if (pathname.startsWith("/journey")) return "journey"
    const match = NAV_TABS.find((tab) => {
      const route = navRoute(tab.id)
      return pathname === route || pathname.startsWith(route + "/")
    })
    return match?.id ?? "home"
  })()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-xl border-t border-border z-50 safe-area-bottom">
      <div className="flex items-end justify-around h-full px-2 pb-1">
        {/* Kiri: 2 tab */}
        {NAV_TABS.slice(0, 2).map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => router.push(navRoute(item.id))}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer transition-all relative"
            >
              {isActive && (
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
              <Icon
                size={20}
                className={`transition-transform ${isActive ? "scale-110 text-primary" : "text-text-secondary"}`}
              />
              <span className={`text-[10px] font-medium ${isActive ? "text-primary font-semibold" : "text-text-secondary"}`}>
                {item.label}
              </span>
            </button>
          )
        })}

        {/* FAB tengah */}
        <div className="flex flex-col items-center -mt-4">
          {!hideFAB ? (
            <button
              onClick={() => router.push("/bisik")}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              style={{ background: "#D4537E" }}
              aria-label="Buka Bisik"
            >
              <MessageCircle size={22} className="text-white" />
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>

        {/* Kanan: 2 tab */}
        {NAV_TABS.slice(2, 4).map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => router.push(navRoute(item.id))}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer transition-all relative"
            >
              {isActive && (
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
              <Icon
                size={20}
                className={`transition-transform ${isActive ? "scale-110 text-primary" : "text-text-secondary"}`}
              />
              <span className={`text-[10px] font-medium ${isActive ? "text-primary font-semibold" : "text-text-secondary"}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
