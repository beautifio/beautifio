"use client";

import { CheckCircle2, Circle } from "lucide-react";
import type { DailyActivity } from "@beautifio/types";

interface DailyActivityCardProps {
  activity: DailyActivity;
  dimensionLabel: string;
  dimensionEmoji: string;
  onComplete: (id: string) => void;
}

export function DailyActivityCard({
  activity,
  dimensionLabel,
  dimensionEmoji,
  onComplete,
}: DailyActivityCardProps) {
  return (
    <button
      onClick={() => !activity.is_completed && onComplete(activity.id)}
      disabled={activity.is_completed}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
        activity.is_completed
          ? "border-success/30 bg-success/5 opacity-70"
          : "border-border hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      <span className="text-lg flex-shrink-0">{dimensionEmoji}</span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            activity.is_completed
              ? "text-text-secondary line-through"
              : "text-text-primary"
          }`}
        >
          {activity.title}
        </p>
        <p className="text-[11px] text-text-secondary mt-0.5">{dimensionLabel}</p>
      </div>
      {activity.is_completed ? (
        <CheckCircle2 size={20} className="text-success flex-shrink-0" />
      ) : (
        <Circle size={20} className="text-text-secondary/40 flex-shrink-0" />
      )}
    </button>
  );
}
