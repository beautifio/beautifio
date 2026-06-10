"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Users } from "lucide-react";
import { Badge } from "@beautifio/ui";
import { ROADMAP_TEMPLATES, ROADMAP_SEED_MILESTONES, ROADMAP_SEED_RECOMMENDATIONS, ROADMAP_CATEGORIES } from "@beautifio/utils";
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
          <button onClick={() => router.push("/roadmap")} className="w-8 h-8 rounded-sm bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors mb-4">
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
          <RoadmapRecommendations recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
}
