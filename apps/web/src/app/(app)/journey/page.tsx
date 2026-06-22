"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Compass, ChevronDown, ChevronUp, Flame, X, Search, Play } from "lucide-react";
import { Button, Card, Skeleton } from "@beautifio/ui";
import { getAllDreamTemplates } from "@beautifio/utils";
import type { DreamTemplate, DreamJourney, JourneyProgress } from "@beautifio/types";
import { useAuth } from "@/hooks/use-auth";
import JourneyCard from "@/components/journey/JourneyCard";

import { getAllJourneys, journeyUrl, getJourneyProgress, archiveJourney } from "@/lib/journey-queries";

const JourneyOnboardingModal = dynamic(() => import("@/features/journey/journey-onboarding-modal").then(m => ({ default: m.JourneyOnboardingModal })), { ssr: false });

const FILTER_TABS = [
  { label: "Semua", value: "" },
  { label: "Olahraga", value: "sports" },
  { label: "Karir", value: "career" },
  { label: "Bisnis", value: "business" },
  { label: "Tech", value: "tech" },
  { label: "Seni", value: "creative" },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]["value"];

const CATEGORY_BG: Record<string, string> = {
  sports: "#E8F5E9",
  career: "#E3F2FD",
  business: "#FFF3E0",
  tech: "#E0F7FA",
  creative: "#F3E5F5",
  education: "#F0F9FF",
  health: "#FFF8E7",
  lifestyle: "#FFF8E7",
};

const CATEGORY_TEXT: Record<string, string> = {
  sports: "#2E7D32",
  career: "#1565C0",
  business: "#E65100",
  tech: "#00838F",
  creative: "#7B1FA2",
  education: "#026AA2",
  health: "#8D6E00",
  lifestyle: "#8D6E00",
};

const CATEGORY_LABEL: Record<string, string> = {
  sports: "Olahraga",
  career: "Karir",
  business: "Bisnis",
  tech: "Tech",
  creative: "Seni",
  education: "Akademik",
  health: "Kesehatan",
  lifestyle: "Lifestyle",
};

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

  const [searchInput, setSearchInput] = useState("");

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
      <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-xl mx-auto px-5 pt-6 pb-28 space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const progressPct = primaryJourney && primaryProgress
    ? Math.round((primaryProgress.big_wins_completed / Math.max(primaryProgress.big_wins_total, 1)) * 100)
    : 0;

  const filteredTemplatesBySearch = useMemo(
    () => {
      let items = templates.filter((t) => !activeFilter || t.category === activeFilter);
      if (searchInput.trim()) {
        const q = searchInput.toLowerCase();
        items = items.filter((t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
      return items;
    },
    [templates, activeFilter, searchInput]
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-xl mx-auto px-5 pt-6 pb-28">

        {/* ─── JALURMU ─── */}
        <section className="mb-8">
          {primaryJourney ? (
            <Link href={journeyUrl(primaryJourney)} className="block">
              <div
                className="rounded-2xl p-[18px]"
                style={{ backgroundColor: '#084463' }}
              >
                {/* Category tag */}
                <span
                  className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
                >
                  {CATEGORY_LABEL[primaryJourney.category] || primaryJourney.category}
                </span>

                {/* Emoji + Title row */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-4xl leading-none">{primaryJourney.emoji}</span>
                  <div className="min-w-0 flex-1 pt-1">
                    <h2
                      className="text-base font-semibold truncate"
                      style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#FFFFFF' }}
                    >
                      {primaryJourney.title}
                    </h2>
                    {primaryProgress?.current_big_win && (
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.7)' }}
                      >
                        Fase: {primaryProgress.current_big_win.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-1">
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%`, backgroundColor: '#FFC64F' }}
                    />
                  </div>
                </div>

                {/* Percentage + CTA row */}
                <div className="flex items-center justify-between mt-1">
                  <span
                    className="text-xs font-medium"
                    style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.8)' }}
                  >
                    {progressPct}% selesai
                  </span>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: '#FFC64F', color: '#1E2938' }}
                  >
                    <Play size={14} />
                    Lanjut belajar
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            /* ─── EMPTY STATE ─── */
            <div
              className="rounded-2xl border p-8 text-center"
              style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#F8FAFC' }}
              >
                <Compass size={24} style={{ color: '#647488' }} />
              </div>
              <p
                className="text-sm font-semibold mb-4"
                style={{ fontFamily: 'Poppins, sans-serif', color: '#1E2938' }}
              >
                Kamu belum memilih jalur
              </p>
              <button
                onClick={() => document.getElementById('jelajahi-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#FFC64F', color: '#1E2938' }}
              >
                Pilih Jalurmu
              </button>
            </div>
          )}
        </section>

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
                      <div
                        className="p-4 rounded-2xl h-full transition-all hover:shadow-sm"
                        style={{ border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}
                      >
                        <span className="text-2xl block mb-2">{j.emoji}</span>
                        <h3 className="text-sm font-bold" style={{ color: '#1E2938' }}>{j.title}</h3>
                        <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#084463' }} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px]" style={{ color: '#647488' }}>
                            {p?.big_wins_completed || 0}/{p?.big_wins_total || 0}
                          </span>
                          {p && p.streak > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px]" style={{ color: '#FFC64F' }}>
                              <Flame size={11} />{p.streak}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 pt-2 flex justify-end" style={{ borderTop: '1px solid #E2E8F0' }}>
                          <span className="text-xs font-medium" style={{ color: '#084463' }}>Lanjutkan →</span>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => setArchiveTarget(j)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#FFFFFF' }}
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
            <h2 className="text-base font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#1E2938' }}>Perjalanan Sebelumnya</h2>
            <div className="space-y-2">
              {(showAllPrevious ? previousJourneys : previousJourneys.slice(0, 3)).map((j) => (
                <div key={j.id} className="p-4 rounded-xl opacity-60 hover:opacity-80 transition-opacity" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{j.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#1E2938' }}>{j.title}</p>
                      <p className="text-[11px]" style={{ color: '#647488' }}>{statusLabel(j.status)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {previousJourneys.length > 3 && (
              <button
                onClick={() => setShowAllPrevious(!showAllPrevious)}
                className="mt-2 flex items-center gap-1 text-xs font-medium mx-auto cursor-pointer"
                style={{ color: '#647488' }}
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

        {/* ─── SEARCH BAR ─── */}
        <div className="mb-5">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all focus-within:shadow-sm"
            style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
          >
            <Search size={16} style={{ color: '#647488' }} />
            <input
              type="text"
              placeholder="Cari jalur..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ fontFamily: 'Inter, sans-serif', color: '#1E2938' }}
            />
          </div>
        </div>

        {/* ─── FILTER TABS (sticky) ─── */}
        <div className="sticky top-0 z-10 mb-5" style={{ backgroundColor: '#F8FAFC' }}>
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className="shrink-0 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer relative whitespace-nowrap"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  color: activeFilter === tab.value ? '#084463' : '#647488',
                }}
              >
                {tab.label}
                {activeFilter === tab.value && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 mx-4"
                    style={{ backgroundColor: '#084463' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── ERROR ─── */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm text-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
            {error}
          </div>
        )}

        {/* ─── JELAJAHI JALUR LAIN ─── */}
        <section id="jelajahi-section">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#647488' }}
            >
              Jelajahi jalur lain
            </h2>
            <span
              className="text-xs font-medium"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6BB9D4' }}
            >
              {filteredTemplatesBySearch.length} tersedia
            </span>
          </div>

          {filteredTemplatesBySearch.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm" style={{ color: '#647488' }}>Tidak ada jalur yang cocok</p>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}
            >
              {filteredTemplatesBySearch.map((t, idx) => {
                const phaseCount = templatePhases[t.slug]?.length || t.big_wins?.length || 0;
                const bgColor = CATEGORY_BG[t.category] || '#F8FAFC';
                const textColor = CATEGORY_TEXT[t.category] || '#647488';
                const catLabel = CATEGORY_LABEL[t.category] || t.category;
                const userJourney = userJourneyMap[t.slug];

                return (
                  <div key={t.slug}>
                    {idx > 0 && <div style={{ borderTop: '1px solid #E2E8F0' }} />}
                    <div
                      onClick={() => {
                        if (userJourney) {
                          router.push(journeyUrl(userJourney));
                        } else {
                          handleStartJourney(t);
                        }
                      }}
                      className="flex items-center gap-3 px-4 py-3.5 transition-all cursor-pointer"
                      style={{ backgroundColor: '#FFFFFF' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                    >
                      {/* Thumbnail */}
                      <div
                        className="w-[46px] h-[46px] rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                      >
                        <span className="text-xl leading-none">{t.emoji}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Category pill */}
                        <span
                          className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1"
                          style={{ backgroundColor: bgColor, color: textColor }}
                        >
                          {catLabel}
                        </span>
                        {/* Title */}
                        <p
                          className="text-[13px] font-medium truncate"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#1E2938' }}
                        >
                          {t.title}
                        </p>
                      </div>

                      {/* Phase count + dots */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px]" style={{ color: '#647488' }}>{phaseCount} fase</span>
                          <div className="flex items-center gap-[3px]">
                            {Array.from({ length: Math.min(phaseCount, 4) }).map((_, i) => (
                              <span
                                key={i}
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: '#E2E8F0' }}
                              />
                            ))}
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#647488' }}>
                          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
