"use client";

import { Sparkles, Heart, Briefcase, Star } from "lucide-react";
import type { RoadmapDream } from "@beautifio/types";

export function RoadmapV3DreamSection({ dream, color }: { dream: RoadmapDream; color?: string }) {
  return (
    <section>
      <div className={`rounded-2xl bg-gradient-to-br ${color || "from-primary/10 to-secondary/10"} p-6 border border-primary/10`}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-primary" />
          <h3 className="text-sm font-bold text-text-primary tracking-wide uppercase">Dream</h3>
        </div>

        <h2 className="text-2xl font-extrabold text-text-primary leading-tight">{dream.title}</h2>
        <p className="text-sm text-text-secondary mt-2 leading-relaxed">{dream.description}</p>

        <div className="mt-5 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={14} className="text-rose-500" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">Kenapa Ini Penting</span>
          </div>
          <p className="text-sm text-text-primary leading-relaxed">{dream.whyMatters}</p>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={14} className="text-accent" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">Peluang Karir</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dream.careerPossibilities.map((cp, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-bg border border-border text-xs font-medium text-text-primary">
                {cp}
              </span>
            ))}
          </div>
        </div>

        {dream.successExamples.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">Inspirasi Sukses</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dream.successExamples.map((ex, i) => {
                const [name, ...rest] = ex.split(" — ");
                return (
                  <div key={i} className="p-3.5 rounded-xl bg-bg border border-border">
                    <p className="text-sm font-bold text-text-primary">{name}</p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-snug">{rest.join(" — ")}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
