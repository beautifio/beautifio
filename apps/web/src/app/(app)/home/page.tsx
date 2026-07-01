"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { use, useEffect, useState, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { RuangAmanSheet } from "@/features/bantuan/RuangAmanSheet"
import { supabase } from "@/lib/supabase/client"
import { getDreamTemplate, getTemplateFromBenchmarkSlug } from "@beautifio/utils"
import type { DreamJourney, JourneyProgress, DreamTemplate } from "@beautifio/types"
import { getLifeEngineData, DIMENSION_LABELS } from "@/lib/life-engine"
import { JourneySnapshot } from "@/components/beranda/JourneySnapshot"
import { QuoteCard } from "./components/QuoteCard"
import { GuestCTA } from "./components/GuestCTA"
import { ArticlePick } from "./components/ArticlePick"
import { BannerCarousel } from "./components/BannerCarousel"

import { AchievementNotif } from "@/features/familia/components/AchievementNotif"
import { Ticket, ShoppingBag, Calendar, Briefcase, Shield, Compass, HeartHandshake } from "lucide-react"
import { journeyUrl } from "@/lib/journey-queries"

const JourneyOnboardingModal = dynamic(() => import("@/features/journey/journey-onboarding-modal").then(m => ({ default: m.JourneyOnboardingModal })), { ssr: false })

const FEATURE_BUTTONS = [
  { href: "/voucher",     label: "Voucher",   icon: Ticket,      color: "bg-accent/20 text-primary" },
  { href: "/belanja",     label: "Deals",      icon: ShoppingBag, color: "bg-secondary/20 text-secondary" },
  { href: "/event",       label: "Event",      icon: Calendar,    color: "bg-primary/10 text-primary" },
  { href: "/opportunity", label: "Peluang",    icon: Briefcase,   color: "bg-success/10 text-success" },
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

  const [growthZone, setGrowthZone] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)

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
            const engineData = await getLifeEngineData()
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
      <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-3">
        {/* Trial banner */}
        {trialDays && (
          <div className="bg-accent/5 border border-accent rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-primary">🕐 Mode Tamu</p>
              <p className="text-xs text-text-secondary">Sisa {trialDays.remaining} hari</p>
            </div>
            <div className="w-full bg-accent/20 rounded-full h-1.5 mb-2">
              <div
                className="h-1.5 rounded-full bg-accent transition-all"
                style={{ width: `${(trialDays.currentDay / trialDays.totalDays) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-text-secondary">Daftar untuk simpan progress selamanya</p>
          </div>
        )}

        {/* Quote Card */}
        <QuoteCard userName={user ? userName : "Sobat"} />

        <BannerCarousel />

        {/* Feature Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {FEATURE_BUTTONS.map((btn) => {
            const Icon = btn.icon
            return (
              <button key={btn.href} onClick={() => router.push(btn.href)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-surface border border-border hover:bg-muted transition-colors cursor-pointer">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${btn.color}`}><Icon size={14} /></div>
                <span className="text-[9px] font-medium text-text-primary">{btn.label}</span>
              </button>
            )
          })}
        </div>

        {/* Bold Cards */}
        <button onClick={() => router.push(journey ? journeyUrl(journey) : "/journey")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-colors text-left cursor-pointer"
          style={{ background: "#E8F4F8", border: "2px solid #6BB9D4" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#6BB9D4" }}>
            <Compass size={20} style={{ color: "#FFFFFF" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#084463" }}>Mulai Journey</p>
            <p className="text-xs" style={{ color: "#647488" }}>{journey ? "Lanjutkan perjalananmu" : "Mulai perjalanan barumu"}</p>
          </div>
          <span className="text-lg" style={{ color: "#6BB9D4" }}>→</span>
        </button>

        <button onClick={() => router.push("/tes-arah-hidup")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-colors text-left cursor-pointer"
          style={{ background: "#FFF8E1", border: "2px solid #FFC64F" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FFC64F" }}>
            <Compass size={20} style={{ color: "#084463" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#1E2938" }}>Tes Arah Hidup</p>
            <p className="text-xs" style={{ color: "#647488" }}>Kenali kepribadian, minat, dan nilai hidupmu</p>
          </div>
          <span className="text-lg" style={{ color: "#FFC64F" }}>→</span>
        </button>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : loadError ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center">
            <p className="text-sm text-red-600">Gagal memuat data</p>
            <button onClick={() => { setLoadError(false); setLoading(true); setJourney(null); }} className="mt-2 text-xs text-red-500 underline">Coba lagi</button>
          </div>
        ) : null}

        {/* Beautifio Care */}
        <button
          onClick={() => router.push("/care")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-colors text-left cursor-pointer"
          style={{ background: "#FFF8E1", border: "2px solid #FFC64F" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FFC64F" }}>
            <Shield size={20} style={{ color: "#084463" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#1E2938" }}>Beautifio Care</p>
            <p className="text-xs" style={{ color: "#647488" }}>Konsultasi & bantuan darurat</p>
          </div>
          <span className="text-lg" style={{ color: "#FFC64F" }}>→</span>
        </button>
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

        <button onClick={() => router.push("/daftar-mitra")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-colors text-left cursor-pointer"
          style={{ background: "#F0FDF4", border: "2px solid #22C55E" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#22C55E" }}>
            <HeartHandshake size={20} style={{ color: "#FFFFFF" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#1E2938" }}>Ingin Membantu Sesama?</p>
            <p className="text-xs" style={{ color: "#647488" }}>Bergabung sebagai Volunteer atau Psikolog. Dampingi komunitas untuk tumbuh.</p>
          </div>
          <span className="text-lg" style={{ color: "#22C55E" }}>→</span>
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
    </div>
  )
}
