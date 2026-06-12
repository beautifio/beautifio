"use client";

import { use, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, MapPin, Clock, Users, BookOpen, Sparkles, Zap, Trophy,
  Star, Sun, Library, Target, GraduationCap, Heart, Compass,
  RefreshCw, TrendingUp, Quote,
} from "lucide-react";
import { Badge, Button, ProgressBar } from "@beautifio/ui";
import {
  ROADMAP_TEMPLATES, ROADMAP_SEED_MILESTONES, ROADMAP_SEED_RECOMMENDATIONS,
  ROADMAP_CATEGORIES, getStoredJournals, MOCK_JOURNALS, getRoadmapV3,
  getLifeProfile, ZONE_INFO, STAGE_INFO, updateZone,
  generateDailyWins, executePivot,
} from "@beautifio/utils";
import type { RoadmapTask } from "@beautifio/types";
import { MilestoneTimeline } from "@/features/roadmap/components/MilestoneTimeline";
import { RoadmapRecommendations } from "@/features/roadmap/components/RoadmapRecommendations";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";
import { RoadmapV3DreamSection } from "@/features/roadmap/components/RoadmapV3DreamSection";
import { RoadmapV3DailyWinsSection } from "@/features/roadmap/components/RoadmapV3DailyWinsSection";
import { RoadmapV3SmallWinsSection } from "@/features/roadmap/components/RoadmapV3SmallWinsSection";
import { RoadmapV3BigWinsSection } from "@/features/roadmap/components/RoadmapV3BigWinsSection";
import { RoadmapV3BlueprintSection } from "@/features/roadmap/components/RoadmapV3BlueprintSection";
import { RoadmapV3LearningVault } from "@/features/roadmap/components/RoadmapV3LearningVault";
import { RoadmapV3DailyReflections } from "@/features/roadmap/components/RoadmapV3DailyReflections";
import { RoadmapV3MasterclassSection } from "@/features/roadmap/components/RoadmapV3MasterclassSection";
import { RoadmapV3LifePillarsSection } from "@/features/roadmap/components/RoadmapV3LifePillarsSection";
import { RoadmapV3AlternativeFuturesSection } from "@/features/roadmap/components/RoadmapV3AlternativeFuturesSection";
import { GrowthReflectionSection } from "@/features/roadmap/components/GrowthReflectionSection";
import { StageAdaptedContent } from "@/features/roadmap/components/StageAdaptedContent";

const V3_TABS = [
  { key: "dream", label: "Dream", icon: Star },
  { key: "daily", label: "Daily Wins", icon: Sun },
  { key: "skills", label: "Skills", icon: Zap },
  { key: "milestones", label: "Milestones", icon: Trophy },
  { key: "blueprint", label: "Blueprint", icon: BookOpen },
  { key: "masterclass", label: "Masterclass", icon: GraduationCap },
  { key: "life", label: "Life Pillars", icon: Heart },
  { key: "altfutures", label: "Alt Futures", icon: Compass },
  { key: "vault", label: "Vault", icon: Library },
  { key: "reflections", label: "Reflections", icon: Target },
  { key: "related", label: "Related", icon: Sparkles },
];

export default function RoadmapDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [v3Tab, setV3Tab] = useState("dream");
  const [showPivot, setShowPivot] = useState(false);
  const [pivotTarget, setPivotTarget] = useState("");

  const ALL_DREAMS = [
    { slug: "football-player", title: "Pemain Bola", emoji: "⚽" },
    { slug: "doctor", title: "Dokter", emoji: "🩺" },
    { slug: "entrepreneur", title: "Pengusaha", emoji: "💼" },
    { slug: "programmer", title: "Programmer", emoji: "💻" },
    { slug: "musician", title: "Musisi", emoji: "🎵" },
    { slug: "content-creator", title: "Content Creator", emoji: "🎬" },
    { slug: "digital-marketer", title: "Digital Marketer", emoji: "📱" },
    { slug: "runner", title: "Runner", emoji: "🏃" },
    { slug: "athlete", title: "Atlet", emoji: "🏅" },
    { slug: "beauty-creator", title: "Beauty Creator", emoji: "💄" },
    { slug: "golfer", title: "Pegolf", emoji: "⛳" },
  ];
  const dreamTitle = (s: string) => ALL_DREAMS.find((d) => d.slug === s)?.title ?? s;
  const dreamEmoji = (s: string) => ALL_DREAMS.find((d) => d.slug === s)?.emoji ?? "🎯";

  const handlePivot = () => {
    if (!pivotTarget) return;
    executePivot(pivotTarget);
    setShowPivot(false);
    router.push(`/roadmap/${pivotTarget}`);
  };

  const v3Roadmap = useMemo(() => getRoadmapV3(slug), [slug]);
  const template = useMemo(() => ROADMAP_TEMPLATES.find((t) => t.slug === slug), [slug]);

  const milestones = ROADMAP_SEED_MILESTONES[slug] ?? [];
  const recommendations = ROADMAP_SEED_RECOMMENDATIONS[slug] ?? [];
  const catInfo = template ? ROADMAP_CATEGORIES.find((c) => c.slug === template.category) : null;

  if (!v3Roadmap && !template) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <MapPin size={40} className="mx-auto text-text-secondary/30 mb-3" />
          <p className="text-sm font-medium text-text-primary">Roadmap tidak ditemukan</p>
          <button onClick={() => router.push("/roadmap")} className="mt-3 text-xs font-medium text-primary hover:underline cursor-pointer">Kembali ke Roadmap</button>
        </div>
      </div>
    );
  }

  if (v3Roadmap) {
    const color = v3Roadmap.color || "from-primary to-secondary";
    const totalHabits = v3Roadmap.dailyWins.reduce((s, c) => s + c.habits.length, 0);
    const totalSkills = v3Roadmap.smallWins.reduce((s, c) => s + c.skills.length, 0);

    const lifeProfile = getLifeProfile();
    const zoneInfo = lifeProfile ? ZONE_INFO[lifeProfile.currentZone] : null;
    const stageInfo = lifeProfile ? STAGE_INFO[lifeProfile.currentStage] : null;
    const lifeEngineReady = lifeProfile?.onboardingCompleted;

    const avgCapital = lifeProfile
      ? Math.round(Object.values(lifeProfile.lifeCapital).reduce((a, b) => a + b, 0) / 6)
      : 0;

    const ecosystemGroups = [
      {
        title: "Cerita Terkait",
        items: [
          { id: `es-${slug}-1`, type: "story" as const, title: "Jelajahi Cerita Terkait", subtitle: `Inspirasi seputar ${v3Roadmap.title}`, href: "/cerita" },
        ],
      },
      {
        title: "Benefit Familia",
        items: [
          { id: `ef-${slug}-1`, type: "familia-reward" as const, title: "Achievement Rewards", subtitle: "Dapatkan reward untuk pencapaian", href: "/familia/rewards" },
          { id: `ef-${slug}-2`, type: "familia-deal" as const, title: "Deals Terkait", subtitle: "Penawaran khusus pengembang diri", href: "/familia/deals" },
          { id: `ef-${slug}-3`, type: "familia-voucher" as const, title: "Voucher Spesial", subtitle: "Voucher eksklusif anggota Familia", href: "/familia/vouchers" },
        ],
      },
    ];

    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-content mx-auto">
          <div className={`bg-gradient-to-r ${color} px-6 pt-12 pb-6 text-white`}>
            <button onClick={() => router.push("/roadmap")} className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all active:scale-90 mb-4">
              <ArrowLeft size={18} />
            </button>

            <span className="text-3xl mb-2 block">{v3Roadmap.emoji}</span>
            <h1 className="text-xl font-bold mt-1">{v3Roadmap.title}</h1>
            <p className="text-sm text-white/80 mt-1">{v3Roadmap.description}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-white/70 flex-wrap">
              <span className="flex items-center gap-1"><Clock size={12} />{v3Roadmap.duration}</span>
              <span className="flex items-center gap-1"><Sun size={12} />{totalHabits} daily habits</span>
              <span className="flex items-center gap-1"><Zap size={12} />{totalSkills} skills</span>
              <span className="flex items-center gap-1"><Trophy size={12} />{v3Roadmap.bigWins.length} milestones</span>
            </div>
          </div>

          {/* Journey Banner */}
          {lifeEngineReady ? (
            <div className="px-4 mt-3">
              <button onClick={() => router.push("/journey")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                    <span>{zoneInfo?.emoji} {zoneInfo?.label}</span>
                    <span className="text-text-secondary">·</span>
                    <span>{stageInfo?.emoji} {stageInfo?.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-border rounded-full overflow-hidden max-w-[120px]">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${avgCapital}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-primary">{avgCapital}% Life Capital</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-primary font-semibold">
                  <span>Buka</span>
                  <ArrowLeft size={12} className="rotate-180" />
                </div>
              </button>
            </div>
          ) : (
            <div className="px-4 mt-3">
              <button onClick={() => router.push("/journey")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-all cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary">Mulai Journey-mu</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">Temukan zona dan stage hidupmu, lalu lacak progres mimpimu</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold">
                  <span className="text-primary">Mulai</span>
                  <ArrowLeft size={12} className="rotate-180 text-primary" />
                </div>
              </button>
            </div>
          )}

          {/* Pivot / Change Dream */}
          {lifeEngineReady && lifeProfile.currentDreamSlug !== slug && (
            <div className="px-4 mt-2">
              <button onClick={() => setShowPivot(true)}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 hover:bg-amber-50 transition-all cursor-pointer text-left"
              >
                <RefreshCw size={14} className="text-amber-600 flex-shrink-0" />
                <span className="text-[11px] font-medium text-amber-700">Beralih mimpi? Klik untuk ganti dream</span>
              </button>
            </div>
          )}

          <div className="px-4 mt-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {V3_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = v3Tab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setV3Tab(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface text-text-secondary border border-border hover:border-primary/30"
                    }`}
                  >
                    <Icon size={13} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pivot Modal */}
          {showPivot && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setShowPivot(false)}>
              <div className="w-full max-w-sm bg-white dark:bg-surface rounded-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                  <RefreshCw size={28} className="mx-auto text-amber-500 mb-2" />
                  <h3 className="text-base font-bold text-text-primary">Ganti Dream</h3>
                  <p className="text-xs text-text-secondary mt-1">Modal hidupmu akan tetap tersimpan dan dialihkan.</p>
                </div>

                {lifeProfile?.previousDreams?.includes(slug) && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-2">
                    <TrendingUp size={14} className="text-primary" />
                    <p className="text-[10px] text-text-secondary">Kamu pernah menjalani ini sebelumnya. Modal hidup tetap utuh.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {ALL_DREAMS.filter((d) => d.slug !== slug).map((d) => (
                    <button key={d.slug} onClick={() => setPivotTarget(d.slug)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-xs font-medium transition-all cursor-pointer ${
                        pivotTarget === d.slug
                          ? "border-accent bg-accent/5 text-accent"
                          : "border-border text-text-secondary hover:border-accent/30"
                      }`}
                    >
                      <span>{d.emoji}</span>
                      <span>{d.title}</span>
                    </button>
                  ))}
                </div>

                {pivotTarget && (
                  <div className="p-3 rounded-xl bg-success/5 border border-success/20 space-y-1.5">
                    <p className="text-xs font-bold text-success flex items-center gap-1.5">
                      <Sparkles size={12} /> Transferable Skills
                    </p>
                    <ul className="space-y-0.5">
                      {["Kedisiplinan & konsistensi", "Kemampuan belajar mandiri", "Manajemen waktu", "Adaptabilitas", "Problem solving"].map((s) => (
                        <li key={s} className="text-[10px] text-text-secondary flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-success" />
                          {s}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-text-secondary mt-1">
                      Life Capital: <span className="font-bold text-accent">{avgCapital}%</span> akan dipertahankan.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => { setShowPivot(false); setPivotTarget(""); }}
                    className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-muted transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button onClick={handlePivot} disabled={!pivotTarget}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      pivotTarget
                        ? "bg-accent text-white hover:bg-accent/90"
                        : "bg-muted text-text-secondary/50 cursor-not-allowed"
                    }`}
                  >
                    Ganti ke {dreamTitle(pivotTarget)}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 pt-6 pb-24 space-y-8">
            {v3Tab === "dream" && (
              <>
                <RoadmapV3DreamSection dream={v3Roadmap.dream} color={color} />
                {lifeEngineReady && <StageAdaptedContent stage={lifeProfile.currentStage} dreamTitle={v3Roadmap.title} />}
              </>
            )}
            {v3Tab === "daily" && <RoadmapV3DailyWinsSection categories={v3Roadmap.dailyWins} roadmapSlug={slug} />}
            {v3Tab === "skills" && <RoadmapV3SmallWinsSection categories={v3Roadmap.smallWins} />}
            {v3Tab === "milestones" && (
              <>
                <RoadmapV3BigWinsSection bigWins={v3Roadmap.bigWins} roadmapSlug={slug} />
                <GrowthReflectionSection
                  dreamSlug={slug}
                  dreamTitle={v3Roadmap.title}
                  totalDone={0}
                  totalTarget={v3Roadmap.bigWins.length}
                />
              </>
            )}
            {v3Tab === "blueprint" && <RoadmapV3BlueprintSection blueprint={v3Roadmap.blueprint} />}
            {v3Tab === "life" && <RoadmapV3LifePillarsSection pillars={v3Roadmap.lifePillars} />}
            {v3Tab === "altfutures" && <RoadmapV3AlternativeFuturesSection futures={v3Roadmap.alternativeFutures} mainTitle={v3Roadmap.title} />}
            {v3Tab === "masterclass" && (
              <RoadmapV3MasterclassSection
                agePath={v3Roadmap.agePath}
                timeline={v3Roadmap.timeline}
                realityCheck={v3Roadmap.realityCheck}
                alternativePaths={v3Roadmap.alternativePaths}
                masterclassLessons={v3Roadmap.masterclassLessons}
              />
            )}
            {v3Tab === "vault" && <RoadmapV3LearningVault roadmapSlug={slug} />}
            {v3Tab === "reflections" && <RoadmapV3DailyReflections roadmapSlug={slug} />}
            {v3Tab === "related" && <EcosystemLinks groups={ecosystemGroups} />}
          </div>
        </div>
      </div>
    );
  }

  const totalMilestones = milestones.length;
  const totalTasks = milestones.reduce((sum, m) => sum + (m.tasks as RoadmapTask[]).length, 0);

  const ecosystemGroups = [
    {
      title: "Cerita Terkait",
      items: [
        { id: `rs-${slug}-1`, type: "story" as const, title: "Jelajahi Cerita Terkait", subtitle: `Temukan inspirasi seputar ${template!.label}`, href: "/cerita" },
      ],
    },
    {
      title: "Benefit Familia",
      items: [
        { id: `rf-${slug}-1`, type: "familia-reward" as const, title: "Achievement Rewards", subtitle: "Dapatkan reward untuk pencapaian roadmap", href: "/familia/rewards" },
        { id: `rf-${slug}-2`, type: "familia-deal" as const, title: "Deals Terkait", subtitle: "Penawaran khusus untuk pengembang diri", href: "/familia/deals" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto">
        <div className={`bg-gradient-to-r ${template!.color} px-6 pt-12 pb-8 text-white`}>
          <button onClick={() => router.push("/roadmap")} className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all active:scale-90 mb-4">
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                  {template!.label}
                </Badge>
                {catInfo && (
                  <Badge variant="default" className="bg-white/10 text-white border-white/10 text-[10px]">
                    {catInfo.emoji} {catInfo.label}
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold mt-2">{template!.title}</h1>
              <p className="text-sm text-white/80 mt-1">{template!.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
                <span className="flex items-center gap-1"><Clock size={12} />{template!.duration}</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{totalMilestones} milestones</span>
                <span className="flex items-center gap-1"><Users size={12} />{totalTasks} tugas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 flex items-start gap-2">
            <Zap size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <p className="font-medium">Fitur ini akan dipindahkan</p>
              <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                Kelola mimpimu di <button onClick={() => router.push("/journey")} className="underline font-medium cursor-pointer">Journey</button> — pengalaman baru yang lebih seru dan terpadu.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pt-6 pb-24 space-y-8">
          <MilestoneTimeline milestones={milestones} slug={slug} />

          {(() => {
            const allJournals = [...MOCK_JOURNALS, ...getStoredJournals()];
            const linkedJournal = allJournals.find((j) => j.roadmap_slug === slug);
            return linkedJournal ? (
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-secondary">Jurnal Perjalanan</p>
                    <p className="text-sm font-semibold text-text-primary">{linkedJournal.title}</p>
                    <p className="text-[11px] text-text-secondary">{linkedJournal.entry_count} entri · {linkedJournal.follower_count} pengikut</p>
                  </div>
                  <Button onClick={() => router.push(`/jurnal/${linkedJournal.slug}`)} size="sm" variant="secondary">
                    <BookOpen size={12} />
                    <span>Buka</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-border text-center">
                <BookOpen size={20} className="mx-auto text-text-secondary/40 mb-2" />
                <p className="text-sm font-medium text-text-primary">Catat Perjalananmu</p>
                <p className="text-xs text-text-secondary mt-1">Buat jurnal untuk mendokumentasikan progres roadmap ini</p>
                <button
                  onClick={() => {
                    const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
                    const now = new Date().toISOString();
                    const jSlug = `${slugify(template!.title)}-${Date.now()}`.slice(0, 60);
                    try {
                      const existing = JSON.parse(localStorage.getItem("beautifio_journals") || "[]");
                      existing.unshift({
                        id: `jrnl-user-${Date.now()}`,
                        user_id: "u-user",
                        title: `Perjalanan ${template!.title}`,
                        slug: jSlug,
                        description: `Dokumentasi perjalanan saya mengikuti roadmap ${template!.title}`,
                        goal_category: template!.category === "health" ? "pendidikan" : template!.category === "sports" ? "kesehatan" : template!.category === "business" ? "bisnis" : template!.category === "tech" ? "skill" : "personal",
                        roadmap_slug: slug,
                        is_public: true,
                        entry_count: 0,
                        follower_count: 0,
                        reaction_count: 0,
                        created_at: now,
                        updated_at: now,
                        author_name: "Kamu",
                        author_initials: "KM",
                      });
                      localStorage.setItem("beautifio_journals", JSON.stringify(existing));
                      router.push(`/jurnal/${jSlug}`);
                    } catch {}
                  }}
                  className="mt-3 text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Buat Jurnal Perjalanan
                </button>
              </div>
            );
          })()}

          <RoadmapRecommendations recommendations={recommendations} />
          <EcosystemLinks groups={ecosystemGroups} />
        </div>
      </div>
    </div>
  );
}
