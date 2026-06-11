"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LifePillar } from "@beautifio/types";

interface Props {
  pillars: LifePillar[];
}

export function RoadmapV3LifePillarsSection({ pillars }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-5 border border-primary/10">
        <h2 className="text-base font-bold text-text-primary">Life Pillars</h2>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
          Menjadi hebat di bidangmu saja tidak cukup. Kehidupan yang seimbang dan bermakna
          dibangun dari 6 pilar ini. Setiap pilar saling mendukung — mengabaikan satu
          akan mempengaruhi yang lain.
        </p>
      </div>

      {pillars.map((pillar) => {
        const isOpen = expanded === pillar.name;
        return (
          <div key={pillar.name} className="rounded-2xl border border-border overflow-hidden bg-surface">
            <button
              onClick={() => setExpanded(isOpen ? null : pillar.name)}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{pillar.emoji}</span>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{pillar.name}</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">{pillar.description}</p>
                </div>
              </div>
              {isOpen ? <ChevronUp size={16} className="text-text-secondary shrink-0" /> : <ChevronDown size={16} className="text-text-secondary shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-2">
                {pillar.habits.map((habit, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/20">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-primary font-bold">{i + 1}</span>
                    </div>
                    <p className="text-xs text-text-primary leading-relaxed">{habit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="bg-gradient-to-br from-amber-500/5 to-rose-500/5 rounded-2xl p-5 border border-amber-500/10 text-center">
        <p className="text-xs text-text-secondary italic leading-relaxed">
          &ldquo;Your dream may evolve. Your skills remain valuable. Every lesson learned creates new opportunities.&rdquo;
        </p>
      </div>
    </div>
  );
}
