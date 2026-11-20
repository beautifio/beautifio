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
import Link from "next/link"
import { Ticket, ShoppingBag, Calendar, Briefcase, Shield, Compass, HeartHandshake, Sparkles, ChevronRight, Clock } from "lucide-react"
import { IconTile, ProgressBar, Skeleton } from "@beautifio/ui"
import { journeyUrl } from "@/lib/journey-queries"

const JourneyOnboardingModal = dynamic(() => import("@/features/journey/journey-onboarding-modal").then(m => ({ default: m.JourneyOnboardingModal })), { ssr: false })

const FEATURE_BUTTONS = [
  { href: "/voucher",     label: "Voucher", icon: Ticket,      tone: "fajar" as const },
  { href: "/belanja",     label: "Deals",   icon: ShoppingBag, tone: "senja" as const },
  { href: "/event",       label: "Event",   icon: Calendar,    tone: "langit" as const },
  { href: "/opportunity", label: "Peluang", icon: Briefcase,   tone: "success" as const },
]

/** One pattern for every "go somewhere" card on Beranda. */
function ActionCard({
  href, icon, tone, title, text, emphasis = false, quiet = false,
}: {
  href: string
  icon: React.ReactNode
  tone: "laut" | "langit" | "fajar" | "senja" | "success"
  title: string
  text: string
  emphasis?: boolean
  quiet?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3.5 rounded-xl p-4 transition-[transform,box-shadow] duration-200 ease-out-expo active:scale-[0.99] ${
        quiet
          ? "border border-dashed border-laut-700/15 bg-white/50 hover:bg-white"
          : "bg-white shadow-sm ring-1 ring-inset ring-laut-700/[0.06] hover:shadow-md"
      } ${emphasis ? "ring-laut-700/10" : ""}`}
    >
      <IconTile tone={tone} size="md">{icon}</IconTile>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] font-semibold text-tinta">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-kabut">{text}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-kabut/60 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  )
}

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
    <div className="min-h-screen bg-mist">
      <div className="max-w-content mx-auto px-4 pt-5 pb-28 space-y-4">
        {/* Trial banner */}
        {trialDays && (
          <div className="surface-raised rounded-xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="flex items-center gap-2 text-sm font-semibold text-tinta">
                <Clock size={15} className="text-[#9A6300]" aria-hidden /> Mode Tamu
              </p>
              <p className="text-xs font-medium text-kabut">Sisa {trialDays.remaining} hari</p>
            </div>
            <ProgressBar value={trialDays.currentDay} max={trialDays.totalDays} size="sm" variant="accent" />
            <p className="mt-2.5 text-xs text-kabut">
              <Link href="/register?upgrade=true" className="font-semibold text-laut-500 hover:underline">Daftar</Link>{" "}
              untuk menyimpan progresmu selamanya.
            </p>
          </div>
        )}

        {/* Greeting first, data second */}
        <QuoteCard userName={user ? userName : "Sobat"} />

        <BannerCarousel />

        {/* Feature shortcuts */}
        <nav aria-label="Pintasan" className="grid grid-cols-4 gap-2.5">
          {FEATURE_BUTTONS.map((btn) => {
            const Icon = btn.icon
            return (
              <Link key={btn.href} href={btn.href}
                className="group flex flex-col items-center gap-2 rounded-xl bg-white px-1 py-3 shadow-sm ring-1 ring-inset ring-laut-700/[0.06] transition-[transform,box-shadow] duration-200 ease-out-expo hover:shadow-md active:scale-[0.97]">
                <IconTile tone={btn.tone} size="sm"><Icon /></IconTile>
                <span className="text-xs font-medium text-tinta">{btn.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="space-y-2.5">
          <ActionCard
            href={journey ? journeyUrl(journey) : "/journey"}
            icon={<Compass />}
            tone="laut"
            title={journey ? "Lanjutkan Journey" : "Mulai Journey"}
            text={journey ? "Lanjutkan perjalananmu" : "Mulai perjalanan barumu"}
            emphasis
          />
          <ActionCard
            href="/tes-arah-hidup"
            icon={<Sparkles />}
            tone="fajar"
            title="Tes Arah Hidup"
            text="Kenali kepribadian, minat, dan nilai hidupmu"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-xl bg-danger-soft p-4 text-center">
            <p className="text-sm text-danger">Data belum berhasil dimuat.</p>
            <button onClick={() => { setLoadError(false); setLoading(true); setJourney(null); }} className="mt-2 text-xs font-semibold text-danger underline">Coba lagi</button>
          </div>
        ) : null}

        <ActionCard
          href="/care"
          icon={<Shield />}
          tone="senja"
          title="Beautifio Care"
          text="Konsultasi dan bantuan darurat"
        />

        <ArticlePick journey={journey} />

        {growthZone && (() => {
          const dimInfo = DIMENSION_LABELS[growthZone]
          return (
            <div className="surface-raised rounded-xl p-5">
              <h3 className="text-sm font-semibold text-kabut">🌱 Zona Tumbuhmu</h3>
              <p className="mt-1 font-display text-lg font-semibold text-tinta">{dimInfo?.emoji} {dimInfo?.label || growthZone}</p>
              <p className="text-sm text-kabut mt-1 leading-relaxed">
                Fokus kembangkan dimensi <strong className="text-tinta">{dimInfo?.label || growthZone}</strong>
              </p>
            </div>
          )
        })()}

        <ActionCard
          href="/daftar-mitra"
          icon={<HeartHandshake />}
          tone="success"
          title="Ingin membantu sesama?"
          text="Bergabung sebagai Volunteer atau Psikolog. Dampingi komunitas untuk tumbuh."
          quiet
        />
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
