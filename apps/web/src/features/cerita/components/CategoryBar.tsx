"use client";

import {
  BookOpen, Briefcase, TrendingUp, Dumbbell, Music,
  Gamepad2, Camera, Sparkles, Monitor, type LucideIcon,
} from "lucide-react";
import { STORY_CATEGORIES } from "@beautifio/utils";
import { useMemo } from "react";

const iconMap: Record<string, LucideIcon> = {
  BookOpen, Briefcase, TrendingUp, Dumbbell, Music,
  Gamepad2, Camera, Sparkles, Monitor,
};

export function CategoryBar({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const categories = useMemo(() => STORY_CATEGORIES, []);

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 h-9 px-4 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
          selected === null
            ? "bg-primary text-primary-foreground"
            : "bg-surface border border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
        }`}
      >
        Semua
      </button>
      {categories.map((cat) => {
        const Icon = iconMap[cat.icon];
        return (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug === selected ? null : cat.slug)}
            className={`flex items-center gap-1.5 flex-shrink-0 h-9 px-3 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              selected === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-surface border border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
            }`}
          >
            {Icon && <Icon size={14} />}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
