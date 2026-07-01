"use client"

import Link from "next/link"
import type { IdentityData } from "@/hooks/use-identity"

export function ActivityRow({ activity }: { activity: IdentityData["activity"] }) {
  const items: { icon: string; label: string; value: string; href: string; sub?: string }[] = []

  if (activity.baca && activity.baca.totalRead > 0) {
    items.push({
      icon: "📖", label: "Baca", value: `${activity.baca.totalRead} artikel`,
      sub: `${activity.baca.totalMinutes} menit`, href: "/inspirasi",
    })
  }

  if (activity.bisik.activeChats > 0) {
    items.push({
      icon: "💬", label: "Bisik", value: `${activity.bisik.activeChats} chat aktif`,
      sub: "Lihat percakapan", href: "/bisik",
    })
  }

  if (activity.circle.joined > 0) {
    items.push({
      icon: "👥", label: "Circle", value: `${activity.circle.joined} circle`,
      sub: "Lihat komunitas", href: "/circle",
    })
  }

  if (activity.care.activeSessions > 0) {
    items.push({
      icon: "🩺", label: "Care", value: `${activity.care.activeSessions} sesi aktif`,
      sub: "Beautifio Care", href: "/care",
    })
  }

  if (items.length === 0) return null

  return (
    <div className="px-6">
      <h3 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: "#647488" }}>Aktivitas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item, i) => (
          <Link key={i} href={item.href} className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer hover:shadow-sm transition-all bg-white" style={{ borderColor: "#E2E8F0" }}>
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold" style={{ color: "#1E2938" }}>{item.value}</p>
              {item.sub && <p className="text-[10px]" style={{ color: "#647488" }}>{item.sub}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function TimelineCompact({ timeline }: { timeline: IdentityData["timeline"] }) {
  if (timeline.length === 0) return null

  return (
    <div className="px-6">
      <h3 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: "#647488" }}>Perjalananku</h3>
      <div className="space-y-2">
        {timeline.slice(0, 3).map((entry, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: "#08446305" }}>
            <span className="text-sm flex-shrink-0 mt-0.5">{entry.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold" style={{ color: "#1E2938" }}>{entry.title}</p>
              {entry.description && <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "#647488" }}>{entry.description}</p>}
              <p className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>{formatDate(entry.date)}</p>
            </div>
          </div>
        ))}
      </div>
      <Link href="/profil/story" className="block text-center mt-3 text-[11px] font-semibold py-2 rounded-lg cursor-pointer" style={{ color: "#084463", background: "#08446308" }}>
        Lihat Ceritaku →
      </Link>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}
