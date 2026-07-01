"use client"

import Link from "next/link"
import { Avatar } from "@beautifio/ui"
import type { IdentityData } from "@/hooks/use-identity"

const TIER_BADGE: Record<string, { label: string; emoji: string; bg: string }> = {
  pro: { label: "Pro", emoji: "👑", bg: "#FFC64F" },
  ultimate: { label: "Ultimate", emoji: "💎", bg: "#6BB9D4" },
}

const FIELD_LABELS: Record<string, string> = {
  full_name: "Nama", bio: "Bio", city: "Kota", phone: "Nomor HP",
  province: "Provinsi", avatar_url: "Foto Profil", date_of_birth: "Tanggal Lahir",
}

export function IdentityHero({ user, disc, tesAh, lifeEngine }: IdentityData) {
  const initials = user.name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const tierBadge = TIER_BADGE[user.tier]
  const completenessPct = Math.round(user.completeness * 100)
  const mitraLabel = user.mitraRole === "psychologist" ? "Psikolog" : user.mitraRole === "care_volunteer" ? "Volunteer" : null

  return (
    <div className="px-6 pt-6 pb-4" style={{ background: "linear-gradient(180deg, #08446308 0%, #F8FAFC 100%)" }}>
      <div className="flex flex-col items-center">
        <div style={{ border: "3px solid #6BB9D4" }} className="rounded-full mb-3">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-22 h-22 rounded-full object-cover" />
          ) : (
            <Avatar initials={initials} size="xl" />
          )}
        </div>

        <h1 className="text-lg font-bold" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>{user.name}</h1>

        {user.bio && (
          <p className="text-xs text-center mt-0.5 max-w-xs" style={{ color: "#647488" }}>{user.bio}</p>
        )}

        <div className="flex items-center gap-2 mt-2">
          {tierBadge && user.tier !== "reguler" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: tierBadge.bg }}>
              {tierBadge.emoji} {tierBadge.label}
            </span>
          )}
          {mitraLabel && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: "#22C55E" }}>
              🩺 {mitraLabel}
            </span>
          )}
        </div>

        {completenessPct < 100 && (
          <div className="w-full max-w-xs mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium" style={{ color: "#647488" }}>Kelengkapan Profil</span>
              <span className="text-[10px] font-bold" style={{ color: "#084463" }}>{completenessPct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: "#E2E8F0" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${completenessPct}%`, background: "#FFC64F" }} />
            </div>
            {user.missingFields.length > 0 && (
              <p className="text-[10px] mt-1" style={{ color: "#647488" }}>
                Lengkapi: {user.missingFields.map(f => FIELD_LABELS[f] || f).join(", ")}
              </p>
            )}
          </div>
        )}

        <Link href="/profil/edit" className="mt-3 inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer" style={{ background: "#08446312", color: "#084463" }}>
          Edit Profil
        </Link>
      </div>

      <DNAStrip disc={disc} tesAh={tesAh} lifeEngine={lifeEngine} />
    </div>
  )
}

function DNAStrip({ disc, tesAh, lifeEngine }: Pick<IdentityData, "disc" | "tesAh" | "lifeEngine">) {
  const items: { emoji: string; label: string; value: string }[] = []

  if (disc?.primary) items.push({ emoji: disc.primary.emoji, label: "DISC", value: disc.primary.label })
  if (tesAh?.latest?.scores) {
    const s = typeof tesAh.latest.scores === "string" ? JSON.parse(tesAh.latest.scores) : tesAh.latest.scores
    const top = Object.entries(s as Record<string, number>).sort((a, b) => b[1] - a[1]).slice(0, 2)
    if (top.length > 0) items.push({ emoji: "🧭", label: "Tes AH", value: top.map(([k]) => k).join(" · ") })
  }
  if (lifeEngine) {
    items.push({ emoji: "🌱", label: `Lv.${lifeEngine.level}`, value: lifeEngine.growthZone ? `Growth: ${lifeEngine.growthZone}` : "Seimbang" })
  }

  if (items.length === 0) return null

  return (
    <div className="mt-4 flex justify-center gap-3 flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px]" style={{ background: "#08446308", border: "1px solid #E2E8F0" }}>
          <span>{item.emoji}</span>
          <span className="font-semibold" style={{ color: "#084463" }}>{item.label}</span>
          <span style={{ color: "#647488" }}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}
