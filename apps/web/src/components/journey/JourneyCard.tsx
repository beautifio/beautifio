"use client"

import { useRouter } from "next/navigation"
import type { DreamJourney } from "@beautifio/types"
import type { DreamTemplate } from "@beautifio/types"

interface PhaseInfo {
  id: string
  phase_name: string
}

interface JourneyCardProps {
  template: DreamTemplate
  phases: PhaseInfo[]
  participantCount: number
  userJourney: DreamJourney | null
  startedPhaseIds: Set<string>
}

const CATEGORY_BG: Record<string, string> = {
  sports: "#E8F5E9",
  health: "#FFF8E7",
  creative: "#F0F9FF",
  tech: "#E0F7FA",
  education: "#F0F9FF",
  business: "#E3F2FD",
  lifestyle: "#FFF8E7",
}

export default function JourneyCard({
  template,
  phases,
  participantCount,
  userJourney,
  startedPhaseIds,
}: JourneyCardProps) {
  const router = useRouter()
  const bgColor = CATEGORY_BG[template.category] || "#F5F5F5"

  const daysSinceStarted = userJourney
    ? Math.floor(
        (Date.now() - new Date(userJourney.started_at).getTime()) /
          86400000,
      ) + 1
    : null

  return (
    <div
      onClick={() => router.push(`/journey/${template.slug}`)}
      className="flex overflow-hidden rounded-[14px] border border-border min-h-[130px] cursor-pointer hover:border-primary/30 transition-colors bg-surface"
    >
      {/* Left panel — 38% */}
      <div
        className="relative w-[38%] shrink-0 flex flex-col justify-end p-3"
        style={{ background: bgColor }}
      >
        {/* Emoji large */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl opacity-60">
          {template.emoji}
        </span>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
          }}
        />

        {/* Content over gradient */}
        <div className="relative z-10">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white self-start inline-block mb-1">
            {template.category}
          </span>
          <h3 className="text-[11px] font-medium text-white leading-tight line-clamp-2">
            {template.title}
          </h3>
        </div>
      </div>

      {/* Right panel — 62% */}
      <div className="flex-1 flex flex-col p-3 min-w-0">
        <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-2 mb-2">
          {template.description}
        </p>

        <div className="mb-auto">
          <p className="text-[8px] uppercase tracking-wider text-text-secondary/60 font-semibold mb-1.5">
            FASE TERSEDIA
          </p>
          <div className="flex flex-wrap gap-1">
            {phases.slice(0, 4).map((phase) => {
              const started = startedPhaseIds.has(phase.id)
              return (
                <span
                  key={phase.id}
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    started
                      ? "bg-green-50 text-green-800"
                      : "bg-muted text-text-secondary"
                  }`}
                >
                  {phase.phase_name}
                </span>
              )
            })}
            {phases.length > 4 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-text-secondary/60">
                +{phases.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <span className="text-[10px] text-text-secondary/60">
            👤 {participantCount} peserta
          </span>
          {daysSinceStarted ? (
            <span className="text-[10px] font-semibold text-purple-600">
              Hari ke-{daysSinceStarted} →
            </span>
          ) : (
            <span className="text-[10px] text-text-secondary/60">
              Mulai →
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
