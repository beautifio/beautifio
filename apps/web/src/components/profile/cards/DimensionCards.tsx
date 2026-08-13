"use client"

import Link from "next/link"
import type { IdentityData } from "@/hooks/use-identity"

export function DiscCard({ disc }: { disc: IdentityData["disc"] }) {
  if (!disc?.primary) return <EmptyCard icon="🎮" label="Tebak Aku" href="/tebak" desc="Cari tahu DISC-mu" />

  return (
    <Link href="/tebak" className="block p-2.5 rounded-xl border border-border bg-gradient-to-br from-red-50/30 to-white cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-text-primary">🧬 DISC</span>
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-success/10 text-success">{disc.gameCount} game</span>
      </div>
      <p className="text-xs font-bold text-primary">{disc.primary.emoji} {disc.primary.label}</p>
      <p className="text-[9px] mt-0.5 text-text-secondary leading-tight line-clamp-1">{disc.primary.desc}</p>
      {disc.secondary && <p className="text-[9px] mt-0.5 text-secondary">Sekunder: {disc.secondary.emoji} {disc.secondary.label}</p>}
    </Link>
  )
}

export function TesAHCard({ tesAh }: { tesAh: IdentityData["tesAh"] }) {
  if (!tesAh?.latest?.scores) return <EmptyCard icon="🧭" label="Tes Arah Hidup" href="/tes-arah-hidup" desc="Kepribadian, minat & nilai" />

  const modulLabels: Record<string, string> = { personality: "Kepribadian", interest: "Minat", values: "Nilai" }
  const s = typeof tesAh.latest.scores === "string" ? JSON.parse(tesAh.latest.scores) : tesAh.latest.scores

  return (
    <Link href="/tes-arah-hidup/hasil" className="block p-2.5 rounded-xl border border-border bg-gradient-to-br from-amber-50/30 to-white cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-text-primary">🧭 Tes AH</span>
        {tesAh.latest.module && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">{modulLabels[tesAh.latest.module] || tesAh.latest.module}</span>}
      </div>
      <div className="flex flex-wrap gap-1">
        {Object.entries(s as Record<string, number>).slice(0, 4).map(([k, v]) => (
          <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/5 text-primary font-medium">{k}:{typeof v === "number" ? v.toFixed(1) : v}</span>
        ))}
      </div>
      <p className="text-[9px] mt-1 text-text-secondary/70">Lihat lengkap →</p>
    </Link>
  )
}

export function JourneyCard({ journey }: { journey: IdentityData["journey"] }) {
  if (!journey) return <EmptyCard icon="🗺️" label="Journey" href="/journey" desc="Mulai perjalananmu" />

  const progress = journey.bigWinsTotal > 0 ? Math.round((journey.bigWinsDone / journey.bigWinsTotal) * 100) : 0

  return (
    <Link href="/journey" className="block p-2.5 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-white cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-text-primary">🗺️ Journey</span>
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{journey.bigWinsDone}/{journey.bigWinsTotal}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-base">{journey.emoji}</span>
        <p className="text-xs font-semibold text-text-primary truncate">{journey.title}</p>
      </div>
      {journey.bigWinsTotal > 0 && (
        <div className="mt-1.5 h-1 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
      )}
    </Link>
  )
}

export function LifeEngineCard({ lifeEngine }: { lifeEngine: IdentityData["lifeEngine"] }) {
  if (!lifeEngine) return <EmptyCard icon="🌱" label="Life Engine" href="#" desc="Aktivitas harianmu" />

  return (
    <div className="p-2.5 rounded-xl border border-border bg-gradient-to-br from-secondary/5 to-white">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-text-primary">🌱 Life Engine</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white">Lv.{lifeEngine.level}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {Object.entries(lifeEngine.capitals).slice(0, 4).map(([dim, cap]) => (
          <span key={dim} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/5 text-primary font-medium">{dim.slice(0,1).toUpperCase()+dim.slice(1,3)}:{cap.total}</span>
        ))}
      </div>
      {lifeEngine.growthZone && <p className="text-[9px] mt-1 text-secondary">🎯 {lifeEngine.growthZone}</p>}
    </div>
  )
}

function EmptyCard({ icon, label, href, desc }: { icon: string; label: string; href: string; desc: string }) {
  return (
    <Link href={href} className="block p-2.5 rounded-xl border border-border bg-white cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition-all">
      <span className="text-base">{icon}</span>
      <p className="text-xs font-bold mt-0.5 text-text-primary">{label}</p>
      <p className="text-[9px] mt-0.5 text-text-secondary">{desc}</p>
    </Link>
  )
}
