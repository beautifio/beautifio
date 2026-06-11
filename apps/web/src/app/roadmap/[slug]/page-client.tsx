"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Clock, Users, BookOpen, Sparkles, Zap, Trophy,
  Star, Sun, Library, Target, GraduationCap,
} from "lucide-react";
import { Badge, Button } from "@beautifio/ui";
import {
  ROADMAP_TEMPLATES, ROADMAP_SEED_MILESTONES, ROADMAP_SEED_RECOMMENDATIONS,
  ROADMAP_CATEGORIES, getStoredJournals, MOCK_JOURNALS, getRoadmapV3,
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

const V3_TABS = [
  { key: "dream", label: "Dream", icon: Star },
  { key: "daily", label: "Daily Wins", icon: Sun },
  { key: "skills", label: "Skills", icon: Zap },
  { key: "milestones", label: "Milestones", icon: Trophy },
  { key: "blueprint", label: "Blueprint", icon: BookOpen },
  { key: "masterclass", label: "Masterclass", icon: GraduationCap },
  { key: "vault", label: "Vault", icon: Library },
  { key: "reflections", label: "Reflections", icon: Target },
  { key: "related", label: "Related", icon: Sparkles },
];

export default function RoadmapDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [v3Tab, setV3Tab] = useState("dream");

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

          <div className="px-4 mt-4">
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

          <div className="px-6 pt-6 pb-24 space-y-8">
            {v3Tab === "dream" && <RoadmapV3DreamSection dream={v3Roadmap.dream} color={color} />}
            {v3Tab === "daily" && <RoadmapV3DailyWinsSection categories={v3Roadmap.dailyWins} roadmapSlug={slug} />}
            {v3Tab === "skills" && <RoadmapV3SmallWinsSection categories={v3Roadmap.smallWins} />}
            {v3Tab === "milestones" && <RoadmapV3BigWinsSection bigWins={v3Roadmap.bigWins} roadmapSlug={slug} />}
            {v3Tab === "blueprint" && <RoadmapV3BlueprintSection blueprint={v3Roadmap.blueprint} />}
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
