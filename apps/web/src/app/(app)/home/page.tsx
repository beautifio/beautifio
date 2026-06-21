"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { use, useEffect, useState, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"
import { getDreamTemplate, getTemplateFromBenchmarkSlug } from "@beautifio/utils"
import type { DreamJourney, JourneyProgress, DreamTemplate } from "@beautifio/types"
import { getLifeEngineData, DIMENSION_LABELS } from "@/lib/life-engine"
import { JourneySnapshot } from "@/components/beranda/JourneySnapshot"
import { QuoteCard } from "./components/QuoteCard"
import { GuestCTA } from "./components/GuestCTA"
import { ArticlePick } from "./components/ArticlePick"
import { BannerCarousel } from "./components/BannerCarousel"
import { RuangAmanSheet } from "@/features/bantuan/RuangAmanSheet"
import { PusatBantuanSheet } from "@/features/bantuan/PusatBantuanSheet"
import { AchievementNotif } from "@/features/familia/components/AchievementNotif"
import { Ticket, ShoppingBag, Calendar, Briefcase, Shield } from "lucide-react"
import { journeyUrl } from "@/lib/journey-queries"

const JourneyOnboardingModal = dynamic(() => import("@/features/journey/journey-onboarding-modal").then(m => ({ default: m.JourneyOnboardingModal })), { ssr: false })

const FEATURE_BUTTONS = [
  { href: "/voucher",     label: "Voucher",   icon: Ticket,      color: "bg-amber-100 text-amber-700" },
  { href: "/belanja",     label: "Deals",      icon: ShoppingBag, color: "bg-blue-100 text-blue-700" },
  { href: "/event",       label: "Event",      icon: Calendar,    color: "bg-purple-100 text-purple-700" },
  { href: "/opportunity", label: "Peluang",    icon: Briefcase,   color: "bg-green-100 text-green-700" },
]

export default function HomeScreen({
  searchParams,
}: {
  searchParams: Promise<{ mimpi?: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(searchParams)
  const { user } = useAuth()

  const [journey, setJourney] = useState<DreamJourney | null>(null)
  const [progress, setProgress] = useState<JourneyProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingTemplate, setOnboardingTemplate] = useState<DreamTemplate | null>(null)
  const [trialInfo, setTrialInfo] = useState<{ started_at: string; expires_at: string } | null>(null)
  const [ruangAmanOpen, setRuangAmanOpen] = useState(false)
  const [bantuanOpen, setBantuanOpen] = useState(false)
  const [growthZone, setGrowthZone] = useState<string | null>(null)

  const mimpiSlug = resolvedParams?.mimpi

  const isAnonymous = user?.is_anonymous === true || user?.app_metadata?.provider === "anonymous"

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    (isAnonymous ? "Sobat Tamu" : "Sobat")

  const trialDays = useMemo(() => {
    if (!trialInfo) return null
    const now = new Date()
    const start = new Date(trialInfo.started_at)
    const expires = new Date(trialInfo.expires_at)
    const totalDays = Math.round((expires.getTime() - start.getTime()) / 86400000)
    const elapsedDays = Math.round((now.getTime() - start.getTime()) / 86400000)
    const currentDay = Math.min(Math.max(elapsedDays + 1, 1), totalDays)
    const remaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / 86400000))
    return { currentDay, totalDays, remaining }
  }, [trialInfo])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const { getActiveJourney, getJourneyProgress } = await import("@/lib/journey-queries")
        const j = await getActiveJourney(user.id)
        setJourney(j)
        if (j) {
          const p = await getJourneyProgress(user.id, j.id)
          setProgress(p)
        }

        if (j) {
          const lastShown = localStorage.getItem("growth_zone_last_shown")
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
          if (!lastShown || parseInt(lastShown) < weekAgo) {
            const engineData = await getLifeEngineData(user.id)
            if (engineData?.growthZone) {
              setGrowthZone(engineData.growthZone)
              localStorage.setItem("growth_zone_last_shown", String(Date.now()))
            }
          }
        }

        const isAnon = user?.is_anonymous === true || user?.app_metadata?.provider === "anonymous"
        if (isAnon) {
          if (!supabase) return
          const { data: dbUser } = await supabase
            .from("users")
            .select("trial_started_at, trial_expires_at")
            .eq("id", user.id)
            .single()
          if (dbUser?.trial_started_at && dbUser?.trial_expires_at) {
            setTrialInfo({
              started_at: dbUser.trial_started_at,
              expires_at: dbUser.trial_expires_at,
            })
          }
        }
      } catch (e) {
        console.error("Failed to load journey data", e)
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  useEffect(() => {
    if (!loading && !journey && mimpiSlug) {
      let t = getDreamTemplate(mimpiSlug)
      if (!t) {
        const templateSlug = getTemplateFromBenchmarkSlug(mimpiSlug)
        if (templateSlug) t = getDreamTemplate(templateSlug)
      }
      if (t) setOnboardingTemplate(t)
    }
  }, [loading, journey, mimpiSlug])

  const journeyActivity = journey && progress ? {
    title: journey.title || "Perjalanan",
    completed: progress.big_wins_completed || 0,
    total: progress.big_wins_total || 1,
    href: journeyUrl(journey),
  } : null

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-5">
        {/* Trial banner */}
        {trialDays && (
          <div className="bg-[#FFF7E6] border border-[#FFB627] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#92400E]">🕐 Mode Tamu</p>
              <p className="text-xs text-[#92400E]">Sisa {trialDays.remaining} hari</p>
            </div>
            <div className="w-full bg-[#FFE4A0] rounded-full h-1.5 mb-2">
              <div
                className="h-1.5 rounded-full bg-[#FFB627] transition-all"
                style={{ width: `${(trialDays.currentDay / trialDays.totalDays) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-[#92400E]/70">Daftar untuk simpan progress selamanya</p>
          </div>
        )}

        {/* Quote Card */}
        <QuoteCard userName={user ? userName : "Sobat"} />

        <BannerCarousel />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : user ? (
          <JourneySnapshot activity={journey ? journeyActivity : null} />
        ) : (
          <GuestCTA variant="landing" />
        )}

        {/* Feature Buttons — 4 kolom */}
        <div className="grid grid-cols-4 gap-2">
          {FEATURE_BUTTONS.map((btn) => {
            const Icon = btn.icon
            return (
              <button
                key={btn.href}
                onClick={() => router.push(btn.href)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-surface border border-border hover:bg-muted transition-colors cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${btn.color}`}>
                  <Icon size={14} />
                </div>
                <span className="text-[9px] font-medium text-text-primary">{btn.label}</span>
              </button>
            )
          })}
        </div>

        <ArticlePick journey={journey} />

        {growthZone && (() => {
          const dimInfo = DIMENSION_LABELS[growthZone]
          return (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
              <h3 className="text-sm font-bold text-text-primary mb-1">🌱 Zona Tumbuhmu</h3>
              <p className="text-lg font-bold text-accent mt-1">{dimInfo?.emoji} {dimInfo?.label || growthZone}</p>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                Fokus kembangkan dimensi <strong>{dimInfo?.label || growthZone}</strong>
              </p>
            </div>
          )
        })()}

        {/* Butuh Bantuan? */}
        <button
          onClick={() => setBantuanOpen(true)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Butuh Bantuan?</p>
            <p className="text-xs text-amber-600">Kontak darurat & lembaga bantuan</p>
          </div>
          <span className="text-lg text-amber-400">→</span>
        </button>
      </div>

      <AchievementNotif />

      {onboardingTemplate && (
        <JourneyOnboardingModal
          open={true}
          template={onboardingTemplate}
          onClose={() => setOnboardingTemplate(null)}
        />
      )}

      <RuangAmanSheet open={ruangAmanOpen} onClose={() => setRuangAmanOpen(false)} />
      <PusatBantuanSheet open={bantuanOpen} onClose={() => setBantuanOpen(false)} />
    </div>
  )
}
