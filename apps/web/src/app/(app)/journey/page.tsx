"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Compass, ChevronDown, ChevronUp, Flame, X } from "lucide-react";
import { Button, Card, Skeleton } from "@beautifio/ui";
import { getAllDreamTemplates } from "@beautifio/utils";
import type { DreamTemplate, DreamJourney, JourneyProgress } from "@beautifio/types";
import { useAuth } from "@/hooks/use-auth";
import JourneyCard from "@/components/journey/JourneyCard";

import { getAllJourneys, journeyUrl, getJourneyProgress, archiveJourney } from "@/lib/journey-queries";

const JourneyOnboardingModal = dynamic(() => import("@/features/journey/journey-onboarding-modal").then(m => ({ default: m.JourneyOnboardingModal })), { ssr: false });

const FILTER_CHIPS = [
  { label: "Semua", value: "" },
  { label: "Olahraga", value: "sports" },
  { label: "Karir", value: "career" },
  { label: "Bisnis", value: "business" },
  { label: "Seni", value: "creative" },
  { label: "Akademik", value: "education" },
  { label: "Kesehatan", value: "health" },
] as const

type FilterKey = (typeof FILTER_CHIPS)[number]["value"]

function statusLabel(status: string) {
  switch (status) {
    case "completed": return "Selesai";
    case "archived": return "Ditinggalkan";
    case "pivoted": return "Dialihkan";
    default: return "Aktif";
  }
}

const MAX_ACTIVE = 3;

export default function JourneyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [primaryJourney, setPrimaryJourney] = useState<DreamJourney | null>(null);
  const [primaryProgress, setPrimaryProgress] = useState<JourneyProgress | null>(null);
  const [otherActiveJourneys, setOtherActiveJourneys] = useState<DreamJourney[]>([]);
  const [otherActiveProgress, setOtherActiveProgress] = useState<Record<string, JourneyProgress>>({});
  const [previousJourneys, setPreviousJourneys] = useState<DreamJourney[]>([]);
  const [templates] = useState(() => getAllDreamTemplates());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingTemplate, setOnboardingTemplate] = useState<DreamTemplate | null>(null);
  const [showAllPrevious, setShowAllPrevious] = useState(false);
  const [templatePhases, setTemplatePhases] = useState<Record<string, { id: string; phase_name: string }[]>>({})
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({})
  const [userJourneyMap, setUserJourneyMap] = useState<Record<string, DreamJourney>>({})
  const [startedPhaseIds, setStartedPhaseIds] = useState<Set<string>>(new Set())

  // Archive from list page
  const [archiveTarget, setArchiveTarget] = useState<DreamJourney | null>(null);
  const [archiving, setArchiving] = useState(false);

  // Max-3 limit modal
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<DreamTemplate | null>(null);

  const filteredTemplates = useMemo(
    () => templates.filter((t) => !activeFilter || t.category === activeFilter),
    [templates, activeFilter]
  );

  const activeJourneyCount = (primaryJourney ? 1 : 0) + otherActiveJourneys.length;

  const reloadJourneys = async () => {
    if (!user) return;
    const all = await getAllJourneys(user.id);
    const active = all.filter((j) => j.status === "active");
    const sortedActive = active.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const primary = sortedActive[0] || null;
    setPrimaryJourney(primary);
    setOtherActiveJourneys(active.filter((j) => j.id !== primary?.id));
    setPreviousJourneys(all.filter((j) => j.id !== primary?.id && j.status !== "active"));

    if (primary) {
      getJourneyProgress(user.id, primary.id).then(setPrimaryProgress).catch(() => {});
    }
    const progressMap: Record<string, JourneyProgress> = {};
    await Promise.all(
      active.filter((j) => j.id !== primary?.id).map((j) =>
        getJourneyProgress(user.id, j.id).then((p) => { progressMap[j.id] = p; }).catch(() => {})
      )
    );
    setOtherActiveProgress(progressMap);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await reloadJourneys();

        // Check for pending template (from anonymous auth flow)
        const pendingSlug = localStorage.getItem("pending_template");
        if (pendingSlug) {
          localStorage.removeItem("pending_template");
          const t = templates.find((tmpl) => tmpl.slug === pendingSlug);
          if (t) {
            setOnboardingTemplate(t);
            setShowOnboarding(true);
          }
        }

        const { supabase } = await import("@/lib/supabase/client");
        if (supabase) {
          const { data } = await supabase
            .from("users")
            .select("birth_date")
            .eq("id", user.id)
            .maybeSingle<{ birth_date: string }>();
          if (data?.birth_date) {
            const age = Math.floor(
              (Date.now() - new Date(data.birth_date).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            );
            setUserAge(age);
          }

          // Load phases for all templates
          const phaseResults = await Promise.all(
            templates.map(t =>
              supabase
                .from("dream_phases")
                .select("id, phase_name, sort_order")
                .eq("dream_template_slug", t.slug)
                .order("sort_order", { ascending: true })
                .then(({ data: d }) => ({ slug: t.slug, phases: d || [] }))
            )
          )
          const phaseMap: Record<string, { id: string; phase_name: string }[]> = {}
          phaseResults.forEach(r => { phaseMap[r.slug] = r.phases })
          setTemplatePhases(phaseMap)

          // Participant counts per template
          const { data: allJourneys } = await supabase
            .from("dream_journeys")
            .select("template_slug")
          const countMap: Record<string, number> = {}
          allJourneys?.forEach(j => {
            countMap[j.template_slug] = (countMap[j.template_slug] || 0) + 1
          })
          setParticipantCounts(countMap)

          // User's journeys & phase statuses
          const userJourneys = await getAllJourneys(user.id)
          const journeyMap: Record<string, DreamJourney> = {}
          userJourneys.forEach(j => {
            if (!journeyMap[j.template_slug] || j.status === "active")
              journeyMap[j.template_slug] = j
          })
          setUserJourneyMap(journeyMap)

          const activeJourneyIds = userJourneys.filter(j => j.status === "active").map(j => j.id)
          if (activeJourneyIds.length > 0) {
            const { data: userPhases } = await supabase
              .from("user_phase_status")
              .select("dream_phase_id")
              .in("journey_id", activeJourneyIds)
            setStartedPhaseIds(new Set(userPhases?.map(p => p.dream_phase_id) || []))
          }
        }
      } catch (e) {
        console.error("Gagal memuat perjalanan", e);
        setError("Gagal memuat data pengguna");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const startJourneyFlow = (template: DreamTemplate) => {
    setOnboardingTemplate(template);
    setShowOnboarding(true);
  };

  const handleStartJourney = async (template: DreamTemplate) => {
    if (creating || !user) return;
    setSelectedTemplate(template.slug);

    if (activeJourneyCount >= MAX_ACTIVE) {
      setPendingTemplate(template);
      setShowLimitModal(true);
      return;
    }

    startJourneyFlow(template);
  };

  const handleArchive = async () => {
    if (!archiveTarget || archiving) return;
    setArchiving(true);
    try {
      await archiveJourney(archiveTarget.id);
      await reloadJourneys();
      setArchiveTarget(null);
    } catch (e) {
      console.error("Failed to archive journey", e);
    } finally {
      setArchiving(false);
    }
  };

  const handleLimitArchive = async (journeyId: string) => {
    if (archiving) return;
    setArchiving(true);
    try {
      await archiveJourney(journeyId);
      await reloadJourneys();
      setShowLimitModal(false);
      setArchiving(false);
      if (pendingTemplate) {
        startJourneyFlow(pendingTemplate);
        setPendingTemplate(null);
      }
    } catch (e) {
      console.error("Failed to archive journey", e);
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-6 max-w-content mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-48 w-full mb-4 rounded-2xl" />
        <Skeleton className="h-32 w-full mb-4 rounded-xl" />
      </div>
    );
  }

  const progressPct = primaryProgress
    ? Math.round((primaryProgress.big_wins_completed / Math.max(primaryProgress.big_wins_total, 1)) * 100)
    : 0;

  const hasJourneys = primaryJourney || otherActiveJourneys.length > 0 || previousJourneys.length > 0;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-8 pb-28">

        {/* ─── HERO CARD ─── */}
        {primaryJourney && (
          <Link href={journeyUrl(primaryJourney)} className="block mb-8">
            <Card className="p-6 border-2 border-primary bg-gradient-to-br from-primary/5 via-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{primaryJourney.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-text-primary">{primaryJourney.title}</h1>
                  <p className="text-xs text-primary font-semibold mt-0.5 uppercase tracking-wide">Fokus Utama</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span>Progress</span>
                    <span className="font-semibold text-text-primary">{progressPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  {primaryProgress && primaryProgress.streak > 0 && (
                    <span className="flex items-center gap-1">
                      <Flame size={14} className="text-orange-500" />
                      {primaryProgress.streak} hari berturut-turut
                    </span>
                  )}
                  <span>
                    {primaryProgress?.big_wins_completed || 0}/{primaryProgress?.big_wins_total || 0} big wins
                  </span>
                </div>

                {primaryProgress?.current_big_win && (
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="text-[11px] text-accent font-semibold uppercase tracking-wide">Sedang</p>
                    <p className="text-sm font-bold text-text-primary mt-0.5">
                      {primaryProgress.current_big_win.title}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex justify-end">
                <span className="text-sm font-semibold text-primary flex items-center gap-1">
                  Lanjutkan <ArrowRight size={16} />
                </span>
              </div>
            </Card>
          </Link>
        )}

        {/* ─── JOURNEY AKTIF LAINNYA ─── */}
        {otherActiveJourneys.length > 0 && (
          <section className="mb-8">
            <div className="grid grid-cols-2 gap-3">
              {otherActiveJourneys.map((j) => {
                const p = otherActiveProgress[j.id];
                const pct = p
                  ? Math.round((p.big_wins_completed / Math.max(p.big_wins_total, 1)) * 100)
                  : 0;
                return (
                  <div key={j.id} className="relative group">
                    <Link href={journeyUrl(j)}>
                      <Card className="p-4 border border-border hover:border-primary/30 transition-all h-full">
                        <span className="text-2xl block mb-2">{j.emoji}</span>
                        <h3 className="text-sm font-bold text-text-primary">{j.title}</h3>
                        <div className="mt-2 w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-text-secondary">
                            {p?.big_wins_completed || 0}/{p?.big_wins_total || 0}
                          </span>
                          {p && p.streak > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] text-orange-500">
                              <Flame size={11} />{p.streak}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 pt-2 border-t border-border/50 flex justify-end">
                          <span className="text-xs font-medium text-primary">Lanjutkan →</span>
                        </div>
                      </Card>
                    </Link>
                    <button
                      onClick={() => setArchiveTarget(j)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── PERJALANAN SEBELUMNYA ─── */}
        {previousJourneys.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-bold text-text-primary mb-3">Perjalanan Sebelumnya</h2>
            <div className="space-y-2">
              {(showAllPrevious ? previousJourneys : previousJourneys.slice(0, 3)).map((j) => (
                <div key={j.id} className="p-4 rounded-xl bg-surface border border-border opacity-60 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{j.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{j.title}</p>
                      <p className="text-[11px] text-text-secondary">{statusLabel(j.status)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {previousJourneys.length > 3 && (
              <button
                onClick={() => setShowAllPrevious(!showAllPrevious)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary cursor-pointer mx-auto"
              >
                {showAllPrevious ? (
                  <>Lebih sedikit <ChevronUp size={14} /></>
                ) : (
                  <>Lihat semua ({previousJourneys.length}) <ChevronDown size={14} /></>
                )}
              </button>
            )}
          </section>
        )}

        {/* ─── JELAJAHI MIMPI LAIN ─── */}
        <section>
          {primaryJourney && (
            <>
              <h2 className="text-base font-bold text-text-primary mb-1">Jelajahi Mimpi Lain</h2>
              <p className="text-xs text-text-secondary mb-4">Kamu bisa menjalani lebih dari satu perjalanan sekaligus</p>
            </>
          )}

          {!hasJourneys && (
            <div className="text-center mb-6 pt-4">
              <p className="text-base text-text-secondary">Kamu belum memulai perjalanan.</p>
              <p className="text-sm text-text-secondary/60 mt-1">Pilih mimpi yang paling menarik untukmu.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => setActiveFilter(chip.value)}
                className={`shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  activeFilter === chip.value
                    ? "bg-purple-50 border border-purple-400 text-purple-700"
                    : "bg-muted text-text-secondary hover:text-text-primary"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {filteredTemplates.map((t) => (
              <JourneyCard
                key={t.slug}
                template={t}
                phases={templatePhases[t.slug] || []}
                participantCount={participantCounts[t.slug] || 0}
                userJourney={userJourneyMap[t.slug] || null}
                startedPhaseIds={startedPhaseIds}
              />
            ))}
          </div>
        </section>

      </div>

      {/* ─── ARCHIVE CONFIRMATION MODAL ─── */}
      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setArchiveTarget(null)}>
          <div className="w-full max-w-sm bg-surface rounded-t-xl sm:rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-primary">Tinggalkan perjalanan ini?</h3>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Progress kamu tetap tersimpan. Kamu bisa lihat riwayatnya di Ceritaku.
            </p>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              Kalau mau, kamu bisa mulai lagi dari awal kapanpun.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setArchiveTarget(null)}>
                Batal
              </Button>
              <Button variant="destructive" size="lg" className="flex-1" loading={archiving} onClick={handleArchive}>
                Ya, tinggalkan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAX 3 LIMIT MODAL ─── */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => { setShowLimitModal(false); setPendingTemplate(null); }}>
          <div className="w-full max-w-sm bg-surface rounded-t-xl sm:rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-primary">Kamu sudah punya 3 perjalanan aktif</h3>
            <p className="text-sm text-text-secondary mt-2">Tinggalkan salah satu untuk memulai yang baru.</p>
            <div className="space-y-2 mt-4">
              {primaryJourney && (
                <button
                  onClick={() => handleLimitArchive(primaryJourney.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-destructive/50 hover:bg-destructive/5 transition-all cursor-pointer text-left"
                  disabled={archiving}
                >
                  <span className="text-2xl">{primaryJourney.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary">{primaryJourney.title}</p>
                    <p className="text-[11px] text-text-secondary">Fokus Utama</p>
                  </div>
                  <X size={16} className="text-text-secondary shrink-0" />
                </button>
              )}
              {otherActiveJourneys.map((j) => (
                <button
                  key={j.id}
                  onClick={() => handleLimitArchive(j.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-destructive/50 hover:bg-destructive/5 transition-all cursor-pointer text-left"
                  disabled={archiving}
                >
                  <span className="text-2xl">{j.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary">{j.title}</p>
                    <p className="text-[11px] text-text-secondary">Perjalanan Aktif</p>
                  </div>
                  <X size={16} className="text-text-secondary shrink-0" />
                </button>
              ))}
            </div>
            <Button variant="secondary" size="lg" className="w-full mt-4" onClick={() => { setShowLimitModal(false); setPendingTemplate(null); }}>
              Batal
            </Button>
          </div>
        </div>
      )}

      <JourneyOnboardingModal
        open={showOnboarding && !!onboardingTemplate}
        template={onboardingTemplate!}
        initialAge={userAge}
        onClose={() => {
          setShowOnboarding(false);
          setOnboardingTemplate(null);
          setSelectedTemplate(null);
        }}
      />
    </div>
  );
}
