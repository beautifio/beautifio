"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@beautifio/ui";
import { ROADMAP_CATEGORIES } from "@beautifio/utils";
import type { RoadmapTemplate } from "@beautifio/types";

const iconMap: Record<string, string> = {
  Stethoscope: "🩺", Trophy: "🏆", Zap: "⚡", Target: "🎯",
  Music: "🎵", Camera: "📷", TrendingUp: "📈", Monitor: "💻",
  Code: "💻", Sparkles: "✨",
};

export function RoadmapCard({ template }: { template: RoadmapTemplate }) {
  const catInfo = ROADMAP_CATEGORIES.find((c) => c.slug === template.category);

  return (
    <Link href={`/roadmap/${template.slug}`} className="block">
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group">
        <div className={`bg-gradient-to-r ${template.color || "from-primary to-secondary"} px-6 pt-6 pb-5`}>
          <div className="flex items-center justify-between">
            <span className="text-2xl">{iconMap[template.icon || ""] || "📋"}</span>
            <ChevronRight size={16} className="text-white/50 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-white mt-2">{template.title}</h3>
          <p className="text-sm text-white/75 mt-1 line-clamp-2 leading-snug">{template.description}</p>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {catInfo && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">
                {catInfo.emoji} {catInfo.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-text-secondary">
            <span>{template.estimated_duration || "Variatif"}</span>
            <span>{template.total_milestones} tahap</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
