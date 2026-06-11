"use client";

import { useState } from "react";
import { ChevronDown, BookOpen, Brain, Wrench, AlertTriangle, Star, ListChecks, Heart, Zap } from "lucide-react";
import type { RoadmapBlueprint } from "@beautifio/types";

const SECTIONS: {
  key: keyof RoadmapBlueprint;
  label: string;
  icon: typeof BookOpen;
  emoji: string;
  color: string;
}[] = [
  { key: "skills", label: "Skills", icon: Zap, emoji: "⚡", color: "from-blue-500 to-blue-600" },
  { key: "habits", label: "Habits", icon: Heart, emoji: "🌱", color: "from-emerald-500 to-emerald-600" },
  { key: "mindset", label: "Mindset", icon: Brain, emoji: "🧠", color: "from-purple-500 to-purple-600" },
  { key: "tools", label: "Tools & Resources", icon: Wrench, emoji: "🛠️", color: "from-amber-500 to-amber-600" },
  { key: "commonMistakes", label: "Common Mistakes", icon: AlertTriangle, emoji: "⚠️", color: "from-rose-500 to-rose-600" },
  { key: "successFactors", label: "Success Factors", icon: Star, emoji: "⭐", color: "from-yellow-500 to-yellow-600" },
];

export function RoadmapV3BlueprintSection({ blueprint }: { blueprint: RoadmapBlueprint }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={16} className="text-primary" />
        <h3 className="text-base font-bold text-text-primary">Success Blueprint</h3>
      </div>

      <div className="space-y-2.5">
        {SECTIONS.map((section) => {
          const items = blueprint[section.key] as string[] | undefined;
          if (!items || items.length === 0) return null;
          const isExpanded = expanded === section.key;

          return (
            <div
              key={section.key}
              className={`rounded-xl border transition-all overflow-hidden ${
                isExpanded ? "border-primary/20" : "border-border"
              }`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : section.key)}
                className="w-full flex items-center gap-3 p-4 bg-surface cursor-pointer text-left"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0`}>
                  <ListChecks size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-text-primary">{section.label}</span>
                  <p className="text-xs text-text-secondary">{items.length} items</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-text-secondary transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 bg-surface border-t border-border">
                  <ul className="space-y-2 mt-3">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-xs mt-0.5 flex-shrink-0">{section.emoji}</span>
                        <span className="text-sm text-text-primary leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

