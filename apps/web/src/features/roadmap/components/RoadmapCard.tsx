"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { RoadmapTemplate } from "@beautifio/types";

export function RoadmapCard({ template }: { template: RoadmapTemplate }) {
  return (
    <Link href={`/roadmap/${template.slug}`} className="block">
      <div className="bg-card border border-border rounded-md shadow-card overflow-hidden hover:border-primary/30 transition-all group">
        <div className={`bg-gradient-to-r ${template.color || "from-primary to-secondary"} px-5 py-6`}>
          <div className="flex items-center justify-between">
            <span className="text-3xl">{template.icon === "Stethoscope" ? "🩺" : template.icon === "Trophy" ? "🏆" : template.icon === "Zap" ? "⚡" : template.icon === "Target" ? "🎯" : template.icon === "Music" ? "🎵" : template.icon === "Camera" ? "📷" : template.icon === "TrendingUp" ? "📈" : template.icon === "Monitor" ? "💻" : template.icon === "Code" ? "💻" : template.icon === "Sparkles" ? "✨" : "📋"}</span>
            <ChevronRight size={18} className="text-white/60 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-white mt-3">{template.title}</h3>
          <p className="text-sm text-white/80 mt-1 line-clamp-2">{template.description}</p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between text-xs text-text-secondary">
          <span>{template.estimated_duration || "Variatif"}</span>
          <span>{template.total_milestones} milestones</span>
        </div>
      </div>
    </Link>
  );
}
