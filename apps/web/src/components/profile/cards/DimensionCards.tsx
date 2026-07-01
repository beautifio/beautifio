"use client"

import Link from "next/link"
import type { IdentityData } from "@/hooks/use-identity"

export function DiscCard({ disc }: { disc: IdentityData["disc"] }) {
  if (!disc?.primary) return <EmptyCard icon="🎮" label="Tebak Aku" href="/tebak" desc="Main Tebak untuk tahu DISC-mu" />

  return (
    <Link href="/tebak" className="block p-3.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all bg-white" style={{ borderColor: "#E2E8F0" }}>
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[11px] font-bold" style={{ color: "#1E2938" }}>🧬 DISC</span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#22C55E12", color: "#22C55E" }}>
          {disc.gameCount} game
        </span>
      </div>
      <p className="text-sm font-bold" style={{ color: "#084463" }}>
        {disc.primary.emoji} {disc.primary.label}
      </p>
      <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "#647488" }}>{disc.primary.desc}</p>
      {disc.secondary && (
        <p className="text-[10px] mt-1" style={{ color: "#6BB9D4" }}>
          Sekunder: {disc.secondary.emoji} {disc.secondary.label}
        </p>
      )}
    </Link>
  )
}

export function TesAHCard({ tesAh }: { tesAh: IdentityData["tesAh"] }) {
  if (!tesAh?.latest?.scores) return <EmptyCard icon="🧭" label="Tes Arah Hidup" href="/tes-arah-hidup" desc="Tes kepribadian, minat & nilai" />

  const modulLabels: Record<string, string> = { personality: "Kepribadian", interest: "Minat", values: "Nilai" }
  const s = typeof tesAh.latest.scores === "string" ? JSON.parse(tesAh.latest.scores) : tesAh.latest.scores

  return (
    <Link href="/tes-arah-hidup/hasil" className="block p-3.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all bg-white" style={{ borderColor: "#E2E8F0" }}>
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[11px] font-bold" style={{ color: "#1E2938" }}>🧭 Tes Arah Hidup</span>
        {tesAh.latest.module && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#FFC64F18", color: "#B8860B" }}>
            {modulLabels[tesAh.latest.module] || tesAh.latest.module}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(s as Record<string, number>).slice(0, 4).map(([k, v]) => (
          <span key={k} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#08446308", color: "#084463" }}>
            {k}: {typeof v === "number" ? v.toFixed(1) : v}
          </span>
        ))}
      </div>
      <p className="text-[10px] mt-1.5" style={{ color: "#647488" }}>Lihat hasil lengkap →</p>
    </Link>
  )
}

export function JourneyCard({ journey }: { journey: IdentityData["journey"] }) {
  if (!journey) return <EmptyCard icon="🗺️" label="Journey" href="/journey" desc="Mulai perjalanan mimpimu" />

  const progress = journey.bigWinsTotal > 0 ? Math.round((journey.bigWinsDone / journey.bigWinsTotal) * 100) : 0

  return (
    <Link href="/journey" className="block p-3.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all bg-white" style={{ borderColor: "#E2E8F0" }}>
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[11px] font-bold" style={{ color: "#1E2938" }}>🗺️ Journey</span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#08446312", color: "#084463" }}>
          {journey.bigWinsDone}/{journey.bigWinsTotal} big win
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xl">{journey.emoji}</span>
        <p className="text-sm font-semibold" style={{ color: "#1E2938" }}>{journey.title}</p>
      </div>
      {journey.bigWinsTotal > 0 && (
        <div className="mt-2">
          <div className="w-full h-1 rounded-full" style={{ background: "#E2E8F0" }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "#084463" }} />
          </div>
        </div>
      )}
    </Link>
  )
}

export function LifeEngineCard({ lifeEngine }: { lifeEngine: IdentityData["lifeEngine"] }) {
  if (!lifeEngine) return <EmptyCard icon="🌱" label="Life Engine" href="#" desc="Lakukan aktivitas harian" />

  return (
    <div className="p-3.5 rounded-xl border bg-white" style={{ borderColor: "#E2E8F0" }}>
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[11px] font-bold" style={{ color: "#1E2938" }}>🌱 Life Engine</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#084463", color: "white" }}>
          Lv.{lifeEngine.level}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(lifeEngine.capitals).slice(0, 4).map(([dim, cap]) => (
          <span key={dim} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#08446308", color: "#084463" }}>
            {dim.slice(0, 1).toUpperCase() + dim.slice(1, 3)}: {cap.total}
          </span>
        ))}
      </div>
      {lifeEngine.growthZone && (
        <p className="text-[10px] mt-1.5" style={{ color: "#6BB9D4" }}>
          🎯 Growth Zone: {lifeEngine.growthZone}
        </p>
      )}
    </div>
  )
}

function EmptyCard({ icon, label, href, desc }: { icon: string; label: string; href: string; desc: string }) {
  return (
    <Link href={href} className="block p-3.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all bg-white" style={{ borderColor: "#E2E8F0" }}>
      <span className="text-lg">{icon}</span>
      <p className="text-sm font-bold mt-1" style={{ color: "#1E2938" }}>{label}</p>
      <p className="text-[10px] mt-0.5" style={{ color: "#647488" }}>{desc}</p>
    </Link>
  )
}
