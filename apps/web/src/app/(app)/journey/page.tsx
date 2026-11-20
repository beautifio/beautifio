"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play,
  ChevronRight,
  Search,
  X,
  Flame,
  Sparkles,
  Trophy,
  Briefcase,
  Store,
  Palette,
  Flag,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@beautifio/ui";
import { getAllDreamTemplates } from "@beautifio/utils";
import type { DreamTemplate, DreamJourney, JourneyProgress } from "@beautifio/types";
import { useAuth } from "@/hooks/use-auth";

import {
  getAllJourneys,
  journeyUrl,
  getJourneyProgress,
} from "@/lib/journey-queries";
import s from "./journey.module.css";

const JourneyOnboardingModal = dynamic(
  () =>
    import("@/features/journey/journey-onboarding-modal").then((m) => ({
      default: m.JourneyOnboardingModal,
    })),
  { ssr: false }
);

/* ─── Tokens (brand) ─── */
const C = {
  navy: "#084463",
  sky: "#6BB9D4",
  sun: "#FFC64F",
  ink: "#1E2938",
  slate: "#647488",
  line: "#E2E8F0",
  mist: "#F0F7FB",
  bg: "#F8FAFC",
};

const FILTER_TABS: { label: string; value: FilterKey; icon: LucideIcon }[] = [
  { label: "Semua", value: "", icon: Sparkles },
  { label: "Olahraga", value: "sports", icon: Trophy },
  { label: "Karir", value: "career", icon: Briefcase },
  { label: "Bisnis", value: "business", icon: Store },
  { label: "Seni", value: "creative", icon: Palette },
];

type FilterKey = "" | "sports" | "career" | "business" | "creative";

const FILTER_CATEGORIES: Record<FilterKey, string[]> = {
  "": [],
  sports: ["sports"],
  career: ["tech", "education", "health"],
  business: ["business", "lifestyle"],
  creative: ["creative"],
};

/* One tint + one ink per category, used by tile, badge and phase dots */
const CATEGORY_STYLE: Record<string, { tint: string; ink: string; label: string }> = {
  sports: { tint: "#E3F0FF", ink: "#1D4ED8", label: "Olahraga" },
  business: { tint: "#FFF3D6", ink: "#92400E", label: "Bisnis" },
  lifestyle: { tint: "#FFEDE0", ink: "#9A3412", label: "Lifestyle" },
  tech: { tint: "#DDF7EF", ink: "#0F766E", label: "Teknologi" },
  creative: { tint: "#FDE7F1", ink: "#BE185D", label: "Seni" },
  health: { tint: "#DCF5EA", ink: "#065F46", label: "Kesehatan" },
  education: { tint: "#E0F2FE", ink: "#0369A1", label: "Akademik" },
};
const FALLBACK_STYLE = { tint: C.mist, ink: C.slate, label: "" };

const MAX_ACTIVE = 3;

/* ─── Trail geometry for the active-journey card ─── */
function buildTrail(n: number, width = 300, top = 30, bottom = 62, padX = 18) {
  const count = Math.max(n, 2);
  const step = (width - padX * 2) / (count - 1);
  const pts = Array.from({ length: count }, (_, i) => ({
    x: padX + i * step,
    y: i % 2 === 0 ? bottom : top,
  }));
  const seg = (a: number, b: number) => {
    let d = `M ${pts[a].x} ${pts[a].y}`;
    for (let i = a + 1; i <= b; i++) {
      const p = pts[i - 1];
      const q = pts[i];
      const mx = (p.x + q.x) / 2;
      d += ` C ${mx} ${p.y}, ${mx} ${q.y}, ${q.x} ${q.y}`;
    }
    return d;
  };
  return { pts, seg };
}

function ActiveTrail({
  emoji,
  total,
  completed,
}: {
  emoji: string;
  total: number;
  completed: number;
}) {
  const shown = Math.min(Math.max(total, 2), 8);
  const ratio = total > 0 ? completed / total : 0;
  const cur = Math.min(Math.round(ratio * (shown - 1)), shown - 1);
  const { pts, seg } = buildTrail(shown);
  const here = pts[cur];

  return (
    <svg viewBox="0 0 300 82" className="w-full h-auto" aria-hidden="true">
      {/* remaining trail */}
      <path
        d={seg(0, shown - 1)}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="0.1 7"
      />
      {/* walked trail */}
      {cur > 0 && (
        <path
          d={seg(0, cur)}
          fill="none"
          stroke={C.sun}
          strokeWidth="3"
          strokeLinecap="round"
          className={s.trailReveal}
        />
      )}
      {pts.map((p, i) => {
        const done = i < cur;
        const isLast = i === shown - 1;
        return (
          <g key={i}>
            {i === cur && (
              <circle cx={p.x} cy={p.y} r="6" fill={C.sun} className={s.pulse} />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={isLast ? 7 : 5}
              fill={done || i === cur ? C.sun : C.navy}
              stroke={done || i === cur ? C.sun : "rgba(255,255,255,0.55)"}
              strokeWidth="2"
            />
            {isLast && i !== cur && (
              <text x={p.x} y={p.y - 11} fontSize="13" textAnchor="middle">
                🏆
              </text>
            )}
          </g>
        );
      })}
      {/* walker */}
      <g transform={`translate(${here.x} ${here.y - 12})`}>
        <g className={s.hop}>
          <text fontSize="18" textAnchor="middle">
            {emoji}
          </text>
        </g>
      </g>
    </svg>
  );
}

/* ─── Illustration for "no journey yet" ─── */
function EmptyTrailArt() {
  const trail = "M 14 104 C 70 104, 60 70, 120 74 S 190 96, 230 66 S 270 34, 300 34";
  return (
    <svg viewBox="0 0 340 120" className="w-full h-auto" aria-hidden="true">
      <defs>
        <mask id="trail-mask">
          <path
            d={trail}
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
            className={s.trailReveal}
          />
        </mask>
      </defs>
      {/* sun */}
      <circle cx="236" cy="18" r="9" fill={C.sun} opacity="0.9" />
      {/* cloud */}
      <g className={s.drift} opacity="0.95">
        <ellipse cx="140" cy="30" rx="18" ry="7" fill="#fff" />
        <ellipse cx="152" cy="25" rx="11" ry="8" fill="#fff" />
      </g>
      {/* hills */}
      <path d="M0 120 C 60 76, 120 84, 180 104 S 300 70, 340 88 L 340 120 Z" fill="#D7ECF5" />
      <path d="M0 120 C 80 96, 150 100, 220 112 S 310 100, 340 106 L 340 120 Z" fill="#C3E2EF" />
      {/* trail (dotted, revealed by mask) */}
      <path
        d={trail}
        fill="none"
        stroke={C.navy}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="0.1 8"
        mask="url(#trail-mask)"
      />
      {/* start */}
      <circle cx="14" cy="104" r="5" fill={C.navy} />
      {/* little traveller waiting at the start */}
      <g transform="translate(30 98)">
        <g className={s.hop}>
          <text fontSize="20" textAnchor="middle">🎒</text>
        </g>
      </g>
      {/* sparkle at the goal */}
      <g className={s.popIn}>
        <text x="322" y="40" fontSize="12" textAnchor="middle">✨</text>
      </g>
      {/* goal flag */}
      <g className={s.popIn}>
        <line x1="300" y1="34" x2="300" y2="8" stroke={C.navy} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M301 9 L 320 14 L 301 20 Z" fill={C.sun} className={s.flagWave} />
        <circle cx="300" cy="34" r="4" fill={C.navy} />
      </g>
    </svg>
  );
}

function PhaseDots({ count, color }: { count: number; color: string }) {
  const shown = Math.min(count, 6);
  return (
    <span className="inline-flex items-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          className="block rounded-full"
          style={{
            width: 5,
            height: 5,
            backgroundColor: color,
            opacity: 0.35 + (0.65 * (i + 1)) / shown,
          }}
        />
      ))}
    </span>
  );
}

export default function JourneyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeJourneys, setActiveJourneys] = useState<DreamJourney[]>([]);
  const [activeProgress, setActiveProgress] = useState<JourneyProgress | null>(null);
  const [templates] = useState(() => getAllDreamTemplates());
  const [loading, setLoading] = useState(true);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingTemplate, setOnboardingTemplate] = useState<DreamTemplate | null>(null);
  const [templatePhases, setTemplatePhases] = useState<
    Record<string, { id: string; phase_name: string }[]>
  >({});
  const [userJourneySlugs, setUserJourneySlugs] = useState<Set<string>>(new Set());

  const activeJourney = activeJourneys[0] ?? null;
  const otherActive = activeJourneys.slice(1);

  const availableTemplates = useMemo(
    () => templates.filter((t) => !userJourneySlugs.has(t.slug)),
    [templates, userJourneySlugs]
  );

  const filterCounts = useMemo(() => {
    const counts = {} as Record<FilterKey, number>;
    FILTER_TABS.forEach(({ value }) => {
      const cats = FILTER_CATEGORIES[value];
      counts[value] =
        cats.length === 0
          ? availableTemplates.length
          : availableTemplates.filter((t) => cats.includes(t.category)).length;
    });
    return counts;
  }, [availableTemplates]);

  const filteredTemplates = useMemo(() => {
    const cats = FILTER_CATEGORIES[activeFilter];
    let items = cats.length > 0
      ? availableTemplates.filter((t) => cats.includes(t.category))
      : availableTemplates;
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase();
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [availableTemplates, activeFilter, searchInput]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const all = await getAllJourneys(user.id);
        const active = all.filter((j) => j.status === "active");
        setActiveJourneys(active);
        setUserJourneySlugs(new Set(all.map((j) => j.template_slug)));

        if (active[0]) {
          getJourneyProgress(user.id, active[0].id)
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
        setError("Data jalurmu belum bisa dimuat. Muat ulang halaman untuk mencoba lagi.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const handleCardClick = (template: DreamTemplate) => {
    if (!user) {
      // Guests see the public dream page, which handles sign-up and
      // brings them back here with the template pre-selected.
      router.push(`/mimpi/${template.slug}`);
      return;
    }
    if (activeJourneys.length >= MAX_ACTIVE) {
      setNotice(
        `Kamu sudah menjalani ${MAX_ACTIVE} jalur. Selesaikan atau arsipkan satu dulu untuk memulai yang baru.`
      );
      return;
    }
    setOnboardingTemplate(template);
    setShowOnboarding(true);
  };

  const progressPct = activeProgress
    ? Math.round(
        (activeProgress.big_wins_completed /
          Math.max(activeProgress.big_wins_total, 1)) *
          100
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen px-4" style={{ backgroundColor: C.bg }}>
        <div className="max-w-content mx-auto pt-5 pb-24 space-y-4">
          <Skeleton className="h-52 w-full rounded-3xl" />
          <Skeleton className="h-11 w-full rounded-2xl" />
          <Skeleton className="h-9 w-full rounded-full" />
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  const activeStyle = activeJourney
    ? CATEGORY_STYLE[activeJourney.category] || FALLBACK_STYLE
    : FALLBACK_STYLE;

  return (
    <div className="min-h-screen px-4" style={{ backgroundColor: C.bg }}>
      <div className="max-w-content mx-auto pt-5 pb-24">
        {/* ─── HERO: jalurmu ─── */}
        <section className="mb-6">
          {activeJourney ? (
            <Link
              href={journeyUrl(activeJourney)}
              className="block rounded-3xl overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ backgroundColor: C.navy, outlineColor: C.sun }}
            >
              <div className="px-5 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="text-[12px]"
                      style={{ fontFamily: "Inter, sans-serif", color: "rgba(255,255,255,0.65)" }}
                    >
                      Jalurmu sekarang
                    </p>
                    <h1
                      className="text-[19px] font-semibold leading-snug mt-0.5"
                      style={{ fontFamily: "Poppins, sans-serif", color: "#FFFFFF" }}
                    >
                      {activeJourney.title}
                    </h1>
                  </div>
                  {activeProgress && activeProgress.streak > 0 && (
                    <span
                      className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                      style={{ backgroundColor: "rgba(255,198,79,0.18)", color: C.sun }}
                      title="Hari berturut-turut kamu aktif"
                    >
                      <Flame size={13} />
                      {activeProgress.streak} hari
                    </span>
                  )}
                </div>

                <div className="mt-2 -mx-1">
                  <ActiveTrail
                    emoji={activeJourney.emoji}
                    total={activeProgress?.big_wins_total ?? 6}
                    completed={activeProgress?.big_wins_completed ?? 0}
                  />
                </div>
              </div>

              <div
                className="px-5 py-4 flex items-center gap-3"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px]"
                    style={{ fontFamily: "Inter, sans-serif", color: "rgba(255,255,255,0.6)" }}
                  >
                    Langkah berikutnya
                  </p>
                  <p
                    className="text-[13px] font-medium truncate"
                    style={{ fontFamily: "Inter, sans-serif", color: "#FFFFFF" }}
                  >
                    {activeProgress?.current_big_win?.title ?? "Buka jalurmu untuk melihat langkah hari ini"}
                  </p>
                  <div
                    className="mt-2 h-[5px] rounded-full overflow-hidden"
                    style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
                  >
                    <div
                      className={`h-full rounded-full ${s.fill}`}
                      style={{ width: `${progressPct}%`, backgroundColor: C.sun }}
                    />
                  </div>
                  <p
                    className="text-[11px] mt-1"
                    style={{ fontFamily: "Inter, sans-serif", color: "rgba(255,255,255,0.65)" }}
                  >
                    {activeProgress
                      ? `${activeProgress.big_wins_completed} dari ${activeProgress.big_wins_total} pencapaian (${progressPct}%)`
                      : "Memuat progres…"}
                  </p>
                </div>
                <span
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[13px] font-semibold"
                  style={{ backgroundColor: C.sun, color: C.ink, fontFamily: "Poppins, sans-serif" }}
                >
                  <Play size={14} fill="currentColor" />
                  Lanjut
                </span>
              </div>
            </Link>
          ) : (
            <div
              className="rounded-3xl overflow-hidden"
              style={{ backgroundColor: C.mist, border: `1px solid ${C.line}` }}
            >
              <div className="px-5 pt-5">
                <h1
                  className="text-[20px] font-semibold leading-snug"
                  style={{ fontFamily: "Poppins, sans-serif", color: C.ink }}
                >
                  Mau jadi apa kamu nanti?
                </h1>
                <p
                  className="text-[13px] leading-relaxed mt-1.5 max-w-[34ch]"
                  style={{ fontFamily: "Inter, sans-serif", color: C.slate }}
                >
                  Pilih satu mimpi. Kami pecah jadi langkah kecil yang bisa kamu mulai hari ini.
                </p>
              </div>
              <div className="mt-1">
                <EmptyTrailArt />
              </div>
            </div>
          )}

          {/* Other active journeys */}
          {otherActive.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
              {otherActive.map((j) => {
                const st = CATEGORY_STYLE[j.category] || FALLBACK_STYLE;
                return (
                  <Link
                    key={j.id}
                    href={journeyUrl(j)}
                    className="shrink-0 flex items-center gap-2 rounded-2xl pl-2 pr-3 py-2 bg-white"
                    style={{ border: `1px solid ${C.line}` }}
                  >
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-[17px]"
                      style={{ backgroundColor: st.tint }}
                    >
                      {j.emoji}
                    </span>
                    <span
                      className="text-[12px] font-medium max-w-[140px] truncate"
                      style={{ fontFamily: "Inter, sans-serif", color: C.ink }}
                    >
                      {j.title}
                    </span>
                    <ChevronRight size={14} style={{ color: C.slate }} />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── JELAJAHI ─── */}
        <section aria-labelledby="explore-heading">
          <div className="flex items-baseline justify-between mb-3">
            <h2
              id="explore-heading"
              className="text-[16px] font-semibold"
              style={{ fontFamily: "Poppins, sans-serif", color: C.ink }}
            >
              {activeJourney ? "Jelajahi jalur lain" : "Pilih jalurmu"}
            </h2>
            <span
              className="text-[12px]"
              style={{ fontFamily: "Inter, sans-serif", color: C.slate }}
            >
              {filteredTemplates.length} jalur
            </span>
          </div>

          {/* Search */}
          <label
            className="flex items-center gap-2 rounded-2xl px-3.5 h-11 bg-white mb-3 focus-within:ring-2"
            style={{ border: `1px solid ${C.line}`, ["--tw-ring-color" as string]: C.sky }}
          >
            <Search size={16} style={{ color: C.slate }} aria-hidden="true" />
            <span className="sr-only">Cari jalur</span>
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari mimpi, misal: dokter, desainer"
              className="flex-1 min-w-0 bg-transparent outline-none text-[13px]"
              style={{ fontFamily: "Inter, sans-serif", color: C.ink }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="p-1 rounded-full"
                aria-label="Hapus pencarian"
              >
                <X size={14} style={{ color: C.slate }} />
              </button>
            )}
          </label>

          {/* Filter chips */}
          <div
            className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-3"
            role="tablist"
            aria-label="Kategori"
          >
            {FILTER_TABS.map(({ label, value, icon: Icon }) => {
              const on = activeFilter === value;
              return (
                <button
                  key={value || "all"}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActiveFilter(value)}
                  className={`shrink-0 inline-flex items-center gap-1.5 h-9 pl-3 pr-3.5 rounded-full text-[13px] cursor-pointer ${s.chip}`}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: on ? 600 : 500,
                    backgroundColor: on ? C.navy : "#FFFFFF",
                    color: on ? "#FFFFFF" : C.slate,
                    border: `1px solid ${on ? C.navy : C.line}`,
                  }}
                >
                  <Icon size={14} style={{ color: on ? C.sun : C.sky }} aria-hidden="true" />
                  {label}
                  <span
                    className="text-[11px] tabular-nums"
                    style={{ opacity: on ? 0.75 : 0.6 }}
                  >
                    {filterCounts[value]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Error / notice */}
          {error && (
            <div
              className="mb-3 p-3 rounded-2xl text-[13px]"
              style={{
                backgroundColor: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#B91C1C",
              }}
            >
              {error}
            </div>
          )}
          {notice && (
            <div
              role="status"
              className={`mb-3 p-3 rounded-2xl text-[13px] flex items-start gap-2 ${s.toast}`}
              style={{ backgroundColor: "#FFF7E0", border: "1px solid #FDE3A0", color: "#7A4E00" }}
            >
              <Flag size={15} className="shrink-0 mt-0.5" />
              {notice}
            </div>
          )}

          {/* List */}
          {filteredTemplates.length === 0 ? (
            <div
              className="rounded-3xl bg-white text-center px-6 py-10"
              style={{ border: `1px solid ${C.line}` }}
            >
              <div className="text-[34px] leading-none mb-3" aria-hidden="true">🧭</div>
              <p
                className="text-[14px] font-medium"
                style={{ fontFamily: "Poppins, sans-serif", color: C.ink }}
              >
                {availableTemplates.length === 0
                  ? "Kamu sudah mengambil semua jalur"
                  : "Belum ada jalur yang cocok"}
              </p>
              {(searchInput || activeFilter) && availableTemplates.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setActiveFilter("");
                  }}
                  className="mt-4 inline-flex items-center h-9 px-4 rounded-full text-[13px] font-medium"
                  style={{ backgroundColor: C.mist, color: C.navy }}
                >
                  Lihat semua jalur
                </button>
              )}
            </div>
          ) : (
            <ul
              key={activeFilter}
              className="rounded-3xl overflow-hidden bg-white"
              style={{ border: `1px solid ${C.line}` }}
            >
              {filteredTemplates.map((t, idx) => {
                const phaseCount =
                  templatePhases[t.slug]?.length || t.big_wins?.length || 0;
                const st = CATEGORY_STYLE[t.category] || FALLBACK_STYLE;
                const label = st.label || t.category;

                return (
                  <li
                    key={t.slug}
                    className={s.row}
                    style={{
                      animationDelay: `${Math.min(idx, 10) * 35}ms`,
                      borderTop: idx === 0 ? "none" : `1px solid ${C.line}`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCardClick(t)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left cursor-pointer transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:bg-[#F0F7FB] ${s.rowButton}`}
                    >
                      <span
                        className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0 text-[26px] leading-none ${s.tile}`}
                        style={{ backgroundColor: st.tint }}
                        aria-hidden="true"
                      >
                        {t.emoji}
                      </span>

                      <span className="flex-1 min-w-0">
                        <span
                          className="block text-[14px] font-semibold truncate"
                          style={{ fontFamily: "Poppins, sans-serif", color: C.ink }}
                        >
                          {t.title}
                        </span>
                        <span
                          className="block text-[12px] leading-snug mt-0.5 line-clamp-2"
                          style={{ fontFamily: "Inter, sans-serif", color: C.slate }}
                        >
                          {t.description}
                        </span>
                        <span className="flex items-center gap-2 mt-1.5">
                          <span
                            className="text-[11px] font-medium px-2 py-[1px] rounded-full"
                            style={{ backgroundColor: st.tint, color: st.ink }}
                          >
                            {label}
                          </span>
                          {phaseCount > 0 && (
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px]"
                              style={{ color: C.slate }}
                            >
                              <PhaseDots count={phaseCount} color={st.ink} />
                              {phaseCount} fase
                            </span>
                          )}
                        </span>
                      </span>

                      <ChevronRight size={18} style={{ color: "#CBD5E1" }} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Taken journeys hint */}
          {userJourneySlugs.size > 0 && !searchInput && !activeFilter && (
            <p
              className="flex items-center justify-center gap-1.5 text-[12px] mt-4"
              style={{ fontFamily: "Inter, sans-serif", color: C.slate }}
            >
              <CheckCircle2 size={13} style={{ color: C.sky }} />
              {userJourneySlugs.size} jalur yang sudah kamu ambil tidak ditampilkan
            </p>
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
        }}
      />
    </div>
  );
}
