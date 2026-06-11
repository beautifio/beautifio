"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { Badge } from "@beautifio/ui";
import type { RoadmapBigWin } from "@beautifio/types";

const STAGE_COLORS: Record<string, string> = {
  beginner: "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20",
  intermediate: "border-blue-300 bg-blue-50 dark:bg-blue-900/20",
  advanced: "border-amber-300 bg-amber-50 dark:bg-amber-900/20",
  professional: "border-purple-300 bg-purple-50 dark:bg-purple-900/20",
};

const STAGE_DOT: Record<string, string> = {
  beginner: "bg-emerald-500",
  intermediate: "bg-blue-500",
  advanced: "bg-amber-500",
  professional: "bg-purple-500",
};

const STAGE_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  professional: "Professional",
};

function loadDoneBigWins(slug: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`beautifio_roadmap_bigwins_${slug}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveDoneBigWins(slug: string, states: Record<string, boolean>) {
  try {
    localStorage.setItem(`beautifio_roadmap_bigwins_${slug}`, JSON.stringify(states));
  } catch {}
}

export function RoadmapV3BigWinsSection({
  bigWins,
  roadmapSlug,
}: {
  bigWins: RoadmapBigWin[];
  roadmapSlug: string;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDone(loadDoneBigWins(roadmapSlug));
  }, [roadmapSlug]);

  const toggleWin = useCallback((id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveDoneBigWins(roadmapSlug, next);
      return next;
    });
  }, [roadmapSlug]);

  const sorted = [...bigWins].sort((a, b) => a.order - b.order);
  const totalEssential = bigWins.filter((w) => w.isEssential).length;
  const doneEssential = bigWins.filter((w) => w.isEssential && done[w.id]).length;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" />
          <h3 className="text-base font-bold text-text-primary">Big Wins — Milestones</h3>
        </div>
        {totalEssential > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <ShieldCheck size={12} className="text-amber-500" />
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{doneEssential}/{totalEssential} essential</span>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-border" />

        <div className="space-y-3">
          {sorted.map((win, i) => {
            const isDone = done[win.id] ?? false;
            const stageColor = STAGE_COLORS[win.stage] || "border-border bg-surface";
            const stageDot = STAGE_DOT[win.stage] || "bg-muted";

            return (
              <div key={win.id} className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <button
                    onClick={() => toggleWin(win.id)}
                    className={`w-[46px] h-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all z-10 ${
                      isDone
                        ? "bg-success text-white shadow-md shadow-success/30"
                        : `${stageDot}/10 border-2 border-border bg-bg hover:border-primary/30`
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <span className="text-xs font-bold text-text-secondary">{i + 1}</span>
                    )}
                  </button>
                </div>

                <div
                  className={`flex-1 p-3.5 rounded-xl border transition-all ${
                    isDone ? "border-success/30 bg-success/5" : stageColor
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${isDone ? "text-success line-through" : "text-text-primary"}`}>
                      {win.title}
                    </span>
                    <Badge variant={win.stage === "beginner" ? "default" : win.stage === "intermediate" ? "secondary" : win.stage === "advanced" ? "warning" : "success"} className="text-[10px]">
                      {STAGE_LABEL[win.stage]}
                    </Badge>
                    {win.isEssential && (
                      <Badge variant="destructive" className="text-[10px]">Essential</Badge>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${isDone ? "text-success/60" : "text-text-secondary"}`}>{win.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
