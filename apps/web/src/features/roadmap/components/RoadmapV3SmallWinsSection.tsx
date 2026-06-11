"use client";

import { useState } from "react";
import { ChevronDown, Zap } from "lucide-react";
import { Badge } from "@beautifio/ui";
import type { RoadmapSmallWinCategory } from "@beautifio/types";

const LEVEL_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-purple-500",
];

const LEVEL_BG = [
  "bg-emerald-100 dark:bg-emerald-900/30",
  "bg-blue-100 dark:bg-blue-900/30",
  "bg-amber-100 dark:bg-amber-900/30",
  "bg-purple-100 dark:bg-purple-900/30",
];

const LEVEL_TEXT = [
  "text-emerald-700 dark:text-emerald-300",
  "text-blue-700 dark:text-blue-300",
  "text-amber-700 dark:text-amber-300",
  "text-purple-700 dark:text-purple-300",
];

export function RoadmapV3SmallWinsSection({
  categories,
}: {
  categories: RoadmapSmallWinCategory[];
}) {
  const [expandedCat, setExpandedCat] = useState<string | null>(categories[0]?.category ?? null);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-accent" />
        <h3 className="text-base font-bold text-text-primary">Small Wins — Skill Progression</h3>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const isExpanded = expandedCat === cat.category;
          return (
            <div
              key={cat.category}
              className={`rounded-xl border transition-all ${
                isExpanded ? "border-primary/30 bg-primary/5" : "border-border bg-surface"
              }`}
            >
              <button
                onClick={() => setExpandedCat(isExpanded ? null : cat.category)}
                className="w-full flex items-center gap-3 p-4 cursor-pointer text-left"
              >
                <span className="text-xl">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-text-primary">{cat.category}</span>
                  <p className="text-xs text-text-secondary">{cat.skills.length} skills</p>
                </div>
                <ChevronDown size={16} className={`text-text-secondary transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {cat.skills.map((skill) => (
                    <div key={skill.id} className="p-3.5 rounded-xl bg-bg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{skill.name}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{skill.description}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {skill.levels.map((level, li) => (
                          <div
                            key={li}
                            className={`flex items-center gap-2.5 p-2 rounded-lg ${LEVEL_BG[li] || "bg-muted/30"}`}
                          >
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${LEVEL_COLORS[li] || "bg-muted"}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${LEVEL_TEXT[li] || "text-text-secondary"}`}>
                                  {level.label}
                                </span>
                                <span className="text-[10px] text-text-secondary">· {level.target}</span>
                              </div>
                              <p className="text-[11px] text-text-secondary mt-0.5">{level.description}</p>
                            </div>
                            <Badge
                              variant={li === 0 ? "default" : li === 1 ? "secondary" : li === 2 ? "warning" : "success"}
                              className="text-[10px] flex-shrink-0"
                            >
                              Level {li + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
