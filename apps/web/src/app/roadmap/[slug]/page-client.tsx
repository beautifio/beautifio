"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Users, BookOpen } from "lucide-react";
import { Badge, Button } from "@beautifio/ui";
import { ROADMAP_TEMPLATES, ROADMAP_SEED_MILESTONES, ROADMAP_SEED_RECOMMENDATIONS, ROADMAP_CATEGORIES, getStoredJournals, MOCK_JOURNALS } from "@beautifio/utils";
import type { RoadmapTask } from "@beautifio/types";
import { MilestoneTimeline } from "@/features/roadmap/components/MilestoneTimeline";
import { RoadmapRecommendations } from "@/features/roadmap/components/RoadmapRecommendations";

export default function RoadmapDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const template = useMemo(() => ROADMAP_TEMPLATES.find((t) => t.slug === slug), [slug]);
  const milestones = ROADMAP_SEED_MILESTONES[slug] ?? [];
  const recommendations = ROADMAP_SEED_RECOMMENDATIONS[slug] ?? [];
  const catInfo = ROADMAP_CATEGORIES.find((c) => c.slug === template?.category);

  if (!template) {
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

  const totalMilestones = milestones.length;
  const totalTasks = milestones.reduce((sum, m) => sum + (m.tasks as RoadmapTask[]).length, 0);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto">
        <div className={`bg-gradient-to-r ${template.color} px-6 pt-12 pb-8 text-white`}>
          <button onClick={() => router.push("/roadmap")} className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all active:scale-90 mb-4">
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                  {template.label}
                </Badge>
                {catInfo && (
                  <Badge variant="default" className="bg-white/10 text-white border-white/10 text-[10px]">
                    {catInfo.emoji} {catInfo.label}
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold mt-2">{template.title}</h1>
              <p className="text-sm text-white/80 mt-1">{template.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
                <span className="flex items-center gap-1"><Clock size={12} />{template.duration}</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{totalMilestones} milestones</span>
                <span className="flex items-center gap-1"><Users size={12} />{totalTasks} tugas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pt-6 pb-24 space-y-8">
          <MilestoneTimeline milestones={milestones} slug={slug} />

          {/* Journal Integration */}
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
                    const jSlug = `${slugify(template.title)}-${Date.now()}`.slice(0, 60);
                    try {
                      const existing = JSON.parse(localStorage.getItem("beautifio_journals") || "[]");
                      existing.unshift({
                        id: `jrnl-user-${Date.now()}`,
                        user_id: "u-user",
                        title: `Perjalanan ${template.title}`,
                        slug: jSlug,
                        description: `Dokumentasi perjalanan saya mengikuti roadmap ${template.title}`,
                        goal_category: template.category === "health" ? "pendidikan" : template.category === "sports" ? "kesehatan" : template.category === "business" ? "bisnis" : template.category === "tech" ? "skill" : "personal",
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
        </div>
      </div>
    </div>
  );
}
