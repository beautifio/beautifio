"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Play, ChevronRight } from "lucide-react";
import { Skeleton } from "@beautifio/ui";
import { getAllDreamTemplates } from "@beautifio/utils";
import type { DreamTemplate, DreamJourney, JourneyProgress } from "@beautifio/types";
import { useAuth } from "@/hooks/use-auth";

import {
  getAllJourneys,
  journeyUrl,
  getJourneyProgress,
  archiveJourney,
} from "@/lib/journey-queries";

const JourneyOnboardingModal = dynamic(
  () =>
    import("@/features/journey/journey-onboarding-modal").then((m) => ({
      default: m.JourneyOnboardingModal,
    })),
  { ssr: false }
);

const FILTER_TABS = [
  { label: "Semua", value: "" },
  { label: "Olahraga", value: "sports" },
  { label: "Karir", value: "career" },
  { label: "Bisnis", value: "business" },
  { label: "Seni", value: "creative" },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]["value"];

const FILTER_CATEGORIES: Record<FilterKey, string[]> = {
  "": [],
  sports: ["sports"],
  career: ["tech", "education", "health"],
  business: ["business", "lifestyle"],
  creative: ["creative"],
};

const THUMB_BG: Record<string, string> = {
  sports: "#EDF5FF",
  business: "#FFF9ED",
  tech: "#EDFAF5",
  creative: "#FFF0F5",
  health: "#EDFAF8",
  lifestyle: "#FFF5EE",
  education: "#F8FAFC",
};

const CATEGORY_BG: Record<string, string> = {
  sports: "#DBEAFE",
  career: "#E0E7FF",
  business: "#FEF3C7",
  tech: "#CCFBF1",
  creative: "#FCE7F3",
  education: "#E0F2FE",
  health: "#D1FAE5",
  lifestyle: "#FFF7ED",
};

const CATEGORY_TEXT: Record<string, string> = {
  sports: "#1D4ED8",
  career: "#3730A3",
  business: "#92400E",
  tech: "#0F766E",
  creative: "#BE185D",
  education: "#0369A1",
  health: "#065F46",
  lifestyle: "#9A3412",
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

const MAX_ACTIVE = 3;

export default function JourneyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeJourney, setActiveJourney] = useState<DreamJourney | null>(null);
  const [activeProgress, setActiveProgress] = useState<JourneyProgress | null>(null);
  const [templates] = useState(() => getAllDreamTemplates());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingTemplate, setOnboardingTemplate] = useState<DreamTemplate | null>(null);
  const [templatePhases, setTemplatePhases] = useState<
    Record<string, { id: string; phase_name: string }[]>
  >({});
  const [userJourneySlugs, setUserJourneySlugs] = useState<Set<string>>(new Set());
  const [activeJourneyCount, setActiveJourneyCount] = useState(0);

  const filteredTemplates = useMemo(() => {
    const cats = FILTER_CATEGORIES[activeFilter];
    let items = cats.length > 0
      ? templates.filter((t) => cats.includes(t.category))
      : templates;
    items = items.filter((t) => !userJourneySlugs.has(t.slug));
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase();
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [templates, activeFilter, userJourneySlugs, searchInput]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const all = await getAllJourneys(user.id);
        const active = all.filter((j) => j.status === "active");
        const primary = active[0] || null;
        setActiveJourney(primary);
        setActiveJourneyCount(active.length);

        setUserJourneySlugs(
          new Set(all.map((j) => j.template_slug))
        );

        if (primary) {
          getJourneyProgress(user.id, primary.id)
            .then(setActiveProgress)
            .catch(() => {});
        }

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

          const phaseResults = await Promise.all(
            templates.map((t) =>
              supabase
                .from("dream_phases")
                .select("id, phase_name, sort_order")
                .eq("dream_template_slug", t.slug)
                .order("sort_order", { ascending: true })
                .then(({ data: d }) => ({ slug: t.slug, phases: d || [] }))
            )
          );
          const phaseMap: Record<string, { id: string; phase_name: string }[]> = {};
          phaseResults.forEach((r) => {
            phaseMap[r.slug] = r.phases;
          });
          setTemplatePhases(phaseMap);
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

  const handleCardClick = async (template: DreamTemplate) => {
    if (creating || !user) return;
    setSelectedTemplate(template.slug);

    if (activeJourneyCount >= MAX_ACTIVE) {
      return;
    }

    startJourneyFlow(template);
  };

  const progressPct = activeJourney && activeProgress
    ? Math.round(
        (activeProgress.big_wins_completed /
          Math.max(activeProgress.big_wins_total, 1)) *
          100
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
        <div className="max-w-xl mx-auto px-5 pt-6 pb-28 space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const catLabel = activeJourney
    ? CATEGORY_LABEL[activeJourney.category] || activeJourney.category
    : "";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="max-w-xl mx-auto px-5 pt-6 pb-28">
        {/* ─── SEARCH BAR ─── */}
        <div className="mb-6">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all focus-within:shadow-sm"
            style={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <Search size={16} style={{ color: "#647488" }} />
            <input
              type="text"
              placeholder="Cari jalur..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ fontFamily: "Inter, sans-serif", color: "#1E2938" }}
            />
          </div>
        </div>

        {/* ─── JALURMU ─── */}
        <section className="mb-8">
          {activeJourney ? (
            /* ─── STATE B: ACTIVE JOURNEY ─── */
            <Link href={journeyUrl(activeJourney)} className="block">
              <div
                className="rounded-2xl p-[18px] overflow-hidden"
                style={{ backgroundColor: "#084463" }}
              >
                <span
                  className="inline-block text-[10px] px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#FFFFFF",
                  }}
                >
                  {catLabel} · Sedang berjalan
                </span>

                <span className="block text-3xl mt-2 leading-none">
                  {activeJourney.emoji}
                </span>

                <h2
                  className="text-[16px] font-semibold mt-1"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#FFFFFF",
                  }}
                >
                  {activeJourney.title}
                </h2>

                {activeProgress?.current_big_win && (
                  <p
                    className="text-[12px] mt-0.5"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {activeProgress.current_big_win.title}
                  </p>
                )}

                <div className="mt-3">
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{
                      height: "5px",
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: "#FFC64F",
                      }}
                    />
                  </div>
                </div>

                <p
                  className="text-[11px] mt-1"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {progressPct}% selesai
                </p>

                <div
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl text-[13px] font-medium"
                  style={{ backgroundColor: "#FFC64F", color: "#1E2938" }}
                >
                  <Play size={14} />
                  Lanjut belajar
                </div>
              </div>
            </Link>
          ) : (
            /* ─── STATE A: NO ACTIVE JOURNEY ─── */
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "#F0F7FB",
                border: "1px solid #E2E8F0",
              }}
            >
              <p
                className="text-sm"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  color: "#1E2938",
                }}
              >
                Kamu belum memilih jalur
              </p>
              <p
                className="text-sm mt-1"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: "#647488",
                }}
              >
                Pilih satu jalur di bawah untuk memulai perjalananmu.
              </p>
            </div>
          )}
        </section>

        {/* ─── JELAJAHI JALUR LAIN ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{
                fontFamily: "Poppins, sans-serif",
                color: "#647488",
              }}
            >
              Jelajahi jalur lain
            </h2>
            <span
              className="text-[12px] font-medium"
              style={{
                fontFamily: "Inter, sans-serif",
                color: "#6BB9D4",
              }}
            >
              {filteredTemplates.length} tersedia
            </span>
          </div>

          {/* ─── FILTER TABS (underline) ─── */}
          <div
            className="flex gap-0 overflow-x-auto scrollbar-none mb-4"
            style={{ borderBottom: "1px solid #E2E8F0" }}
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className="shrink-0 px-4 py-2.5 cursor-pointer transition-colors"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color:
                    activeFilter === tab.value ? "#084463" : "#647488",
                  fontWeight: activeFilter === tab.value ? 500 : 400,
                  borderBottom: "2px solid",
                  borderBottomColor:
                    activeFilter === tab.value
                      ? "#084463"
                      : "transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── ERROR ─── */}
          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-sm text-center"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#EF4444",
              }}
            >
              {error}
            </div>
          )}

          {/* ─── LIST CARDS ─── */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm" style={{ color: "#647488" }}>
                Tidak ada jalur yang cocok
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
              }}
            >
              {filteredTemplates.map((t, idx) => {
                const phaseCount = templatePhases[t.slug]?.length ||
                  t.big_wins?.length ||
                  0;
                const thumbBg = THUMB_BG[t.category] || "#F8FAFC";
                const badgeBg = CATEGORY_BG[t.category] || "#F8FAFC";
                const badgeColor = CATEGORY_TEXT[t.category] || "#647488";
                const label =
                  CATEGORY_LABEL[t.category] || t.category;

                return (
                  <div key={t.slug}>
                    {idx > 0 && (
                      <div style={{ borderTop: "1px solid #E2E8F0" }} />
                    )}
                    <div
                      onClick={() => handleCardClick(t)}
                      className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors"
                      style={{ backgroundColor: "#FFFFFF" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#F8FAFC";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#FFFFFF";
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: thumbBg }}
                      >
                        <span className="text-xl leading-none">
                          {t.emoji}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span
                          className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-1"
                          style={{
                            backgroundColor: badgeBg,
                            color: badgeColor,
                          }}
                        >
                          {label}
                        </span>
                        <p
                          className="text-[13px] font-medium truncate"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            color: "#1E2938",
                          }}
                        >
                          {t.title}
                        </p>
                        <div
                          className="flex items-center gap-1 text-[11px] mt-0.5"
                          style={{ color: "#647488" }}
                        >
                          <span>· {phaseCount} fase</span>
                        </div>
                      </div>

                      {/* Chevron */}
                      <ChevronRight
                        size={16}
                        style={{ color: "#E2E8F0" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

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
