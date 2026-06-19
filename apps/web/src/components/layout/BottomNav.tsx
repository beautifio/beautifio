"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MessageCircle, Sparkles, PenLine, Ticket, ShoppingBag, Calendar, Briefcase, Users, UserCheck, X, Search, User } from "lucide-react"
import { NAV_TABS, navRoute } from "@/lib/navigation"

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [showBeranda, setShowBeranda] = useState(false)
  const [showFAB, setShowFAB] = useState(false)
  const [showCircles, setShowCircles] = useState(false)

  const hideFAB = ["/bisik", "/tebak", "/admin"].some((p) => pathname.startsWith(p))

  const activeTab = (() => {
    if (pathname.startsWith("/journey")) return "journey"
    if (pathname.startsWith("/inspirasi")) return "inspirasi"
    const match = NAV_TABS.find((tab) => {
      const route = navRoute(tab.id)
      return pathname === route || pathname.startsWith(route + "/")
    })
    return match?.id ?? "home"
  })()

  function NavItem({ tab }: { tab: typeof NAV_TABS[number] }) {
    const Icon = tab.icon
    const isActive = activeTab === tab.id
    return (
      <button
        onClick={() => {
          if (tab.isSheet) {
            if (tab.id === "home") setShowBeranda(true)
            if (tab.id === "circles") setShowCircles(true)
          } else {
            router.push(navRoute(tab.id))
          }
        }}
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
          {tab.label}
        </span>
      </button>
    )
  }

  const closeAll = () => {
    setShowBeranda(false)
    setShowFAB(false)
    setShowCircles(false)
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-xl border-t border-border z-50 safe-area-bottom">
        <div className="flex items-end justify-around h-full px-2 pb-1">
          {/* Kiri: Beranda + Journey */}
          <NavItem tab={NAV_TABS[0]} />
          <NavItem tab={NAV_TABS[1]} />

          {/* FAB tengah */}
          <div className="flex flex-col items-center -mt-4">
            {!hideFAB ? (
              <button
                onClick={() => setShowFAB(true)}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                style={{ background: "#D4537E" }}
                aria-label="Buka menu"
              >
                <MessageCircle size={22} className="text-white" />
              </button>
            ) : (
              <div className="w-12 h-12" />
            )}
          </div>

          {/* Kanan: Inspirasi + Circles */}
          <NavItem tab={NAV_TABS[2]} />
          <NavItem tab={NAV_TABS[3]} />
        </div>
      </nav>

      {/* Sheet: Beranda */}
      {showBeranda && (
        <Sheet onClose={() => setShowBeranda(false)} title="Beranda">
          <div className="grid grid-cols-2 gap-2">
            <SheetButton icon={Ticket} label="Voucher" href="/voucher" onClick={closeAll} />
            <SheetButton icon={ShoppingBag} label="Deals" href="/belanja" onClick={closeAll} />
            <SheetButton icon={Calendar} label="Event" href="/event" onClick={closeAll} />
            <SheetButton icon={Briefcase} label="Peluang" href="/opportunity" onClick={closeAll} />
          </div>
        </Sheet>
      )}

      {/* Sheet: FAB — Bisik / Tebak / Curhat */}
      {showFAB && (
        <Sheet onClose={() => setShowFAB(false)} title="Ngobrol & Tebak">
          <div className="flex flex-col gap-2">
            <FabOption
              icon={MessageCircle}
              label="Bisik"
              desc="Curhat anonim dengan teman baru"
              href="/bisik"
              color="#D4537E"
              onClick={closeAll}
            />
            <FabOption
              icon={Sparkles}
              label="Tebak Aku"
              desc="Seru-seruan tebak-tebakan"
              href="/tebak"
              color="#7F77DD"
              onClick={closeAll}
            />
            <FabOption
              icon={PenLine}
              label="Curhat"
              desc="Cerita dan dukung sesama"
              href="/curhat"
              color="#8B5CF6"
              onClick={closeAll}
            />
          </div>
        </Sheet>
      )}

      {/* Sheet: Circles */}
      {showCircles && (
        <Sheet onClose={() => setShowCircles(false)} title="Circles">
          <div className="grid grid-cols-2 gap-2">
            <SheetButton icon={Users} label="Circle" href="/circle" onClick={closeAll} />
            <SheetButton icon={UserCheck} label="Mentor" href="/mentors" onClick={closeAll} />
          </div>
        </Sheet>
      )}
    </>
  )
}

function Sheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-5 pb-8 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-text-primary">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function SheetButton({ icon: Icon, label, href, onClick }: {
  icon: any; label: string; href: string; onClick: () => void
}) {
  const router = useRouter()
  return (
    <button
      onClick={() => { onClick(); router.push(href) }}
      className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border bg-surface hover:bg-muted transition-colors cursor-pointer text-left"
    >
      <Icon size={18} className="text-text-secondary shrink-0" />
      <span className="text-sm font-medium text-text-primary">{label}</span>
    </button>
  )
}

function FabOption({ icon: Icon, label, desc, href, color, onClick }: {
  icon: any; label: string; desc: string; href: string; color: string; onClick: () => void
}) {
  const router = useRouter()
  return (
    <button
      onClick={() => { onClick(); router.push(href) }}
      className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-surface hover:bg-muted transition-colors cursor-pointer text-left"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        <p className="text-[11px] text-text-secondary">{desc}</p>
      </div>
    </button>
  )
}
