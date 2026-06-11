"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame, CheckCircle2, Circle } from "lucide-react";
import { ProgressBar, Badge } from "@beautifio/ui";
import type { RoadmapDailyWinCategory } from "@beautifio/types";
import { toggleDailyHabit, getDoneHabits, getStreak, updateStreak } from "@beautifio/utils";

export function RoadmapV3DailyWinsSection({
  categories,
  roadmapSlug,
}: {
  categories: RoadmapDailyWinCategory[];
  roadmapSlug: string;
}) {
  const [doneHabits, setDoneHabits] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setDoneHabits(getDoneHabits(roadmapSlug));
    setStreak(getStreak(roadmapSlug));
  }, [roadmapSlug]);

  const totalHabits = categories.reduce((s, c) => s + c.habits.length, 0);

  const handleToggle = useCallback((habitId: string) => {
    toggleDailyHabit(roadmapSlug, habitId);
    const updated = getDoneHabits(roadmapSlug);
    setDoneHabits(updated);
    updateStreak(roadmapSlug, updated.length);
    setStreak(getStreak(roadmapSlug));
  }, [roadmapSlug]);

  const progress = totalHabits > 0 ? Math.round((doneHabits.length / totalHabits) * 100) : 0;
  const isComplete = doneHabits.length >= totalHabits;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-text-primary">Daily Wins</h3>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{streak} hari</span>
            </div>
          )}
          <span className="text-xs text-text-secondary">{doneHabits.length}/{totalHabits}</span>
        </div>
      </div>
      <ProgressBar value={progress} size="sm" variant="accent" showLabel />

      {isComplete && (
        <div className="mt-3 p-3 rounded-xl bg-success/10 border border-success/20 text-center">
          <p className="text-sm font-bold text-success">Semua habits hari ini selesai! 🔥</p>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {categories.map((cat) => (
          <div key={cat.category}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{cat.emoji}</span>
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">{cat.category}</span>
              <Badge variant="default" className="text-[10px] ml-auto">
                {cat.habits.filter((h) => doneHabits.includes(h.id)).length}/{cat.habits.length}
              </Badge>
            </div>
            <div className="space-y-1.5">
              {cat.habits.map((habit) => {
                const done = doneHabits.includes(habit.id);
                return (
                  <button
                    key={habit.id}
                    onClick={() => handleToggle(habit.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                      done
                        ? "bg-success/5 border border-success/20"
                        : "bg-surface border border-border hover:border-primary/20 hover:bg-muted/30"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                    ) : (
                      <Circle size={20} className="text-text-secondary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold ${done ? "text-success line-through" : "text-text-primary"}`}>
                        {habit.title}
                      </span>
                      {habit.description && (
                        <p className={`text-xs mt-0.5 ${done ? "text-success/60" : "text-text-secondary"}`}>{habit.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
