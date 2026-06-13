"use client";

import { useMemo } from "react";
import { Sparkles, Trophy, CheckCircle, BookHeart, CalendarDays, BarChart3 } from "lucide-react";
import type { StoryEntry } from "@/lib/journey-queries";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatJournalDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const typeConfig: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  dream_chosen: { icon: Sparkles, bg: "bg-primary/10", color: "text-primary" },
  big_win: { icon: Trophy, bg: "bg-success/10", color: "text-success" },
  small_win: { icon: CheckCircle, bg: "bg-accent/10", color: "text-accent" },
  reflection: { icon: BookHeart, bg: "bg-primary/5", color: "text-primary" },
  review_weekly: { icon: CalendarDays, bg: "bg-warning/10", color: "text-warning" },
  review_monthly: { icon: BarChart3, bg: "bg-secondary/10", color: "text-secondary" },
};

interface StoryTimelineProps {
  entries: StoryEntry[];
}

function ReflectionEntry({ entry }: { entry: StoryEntry }) {
  const hasContent = entry.learned || entry.grateful || entry.improve;
  if (!hasContent) return null;

  return (
    <div className="bg-surface rounded-2xl border border-border p-5">
      <p className="text-[10px] text-text-secondary/40 mb-3 uppercase tracking-wide">Refleksi</p>
      <div className="space-y-3 text-sm text-text-primary leading-relaxed">
        {entry.learned && (
          <p>{entry.learned}</p>
        )}
        {entry.grateful && (
          <p className="text-text-secondary">Aku bersyukur {entry.grateful.toLowerCase()}.</p>
        )}
        {entry.improve && (
          <p className="text-text-secondary">Besok aku ingin {entry.improve.toLowerCase()}.</p>
        )}
      </div>
      {entry.mood && (
        <p className="text-xs text-text-secondary/40 mt-3 pt-3 border-t border-border">
          Suasana hati: {entry.mood}
        </p>
      )}
    </div>
  );
}

function TimelineEntry({ entry }: { entry: StoryEntry }) {
  const config = typeConfig[entry.type] || typeConfig.small_win;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 bg-surface rounded-xl border border-border p-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
        <Icon size={14} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary leading-relaxed">{entry.title}</p>
        {entry.description && (
          <p className="text-xs text-text-secondary/60 mt-1">{entry.description}</p>
        )}
      </div>
    </div>
  );
}

export function StoryTimeline({ entries }: StoryTimelineProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, StoryEntry[]> = {};
    for (const e of entries) {
      const key = e.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    }
    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
          <BookHeart size={28} className="text-primary/30" />
        </div>
        <p className="text-sm font-semibold text-text-primary mb-1">Belum ada cerita</p>
        <p className="text-xs text-text-secondary max-w-xs mx-auto">
          Setiap mimpi yang kamu pilih, pencapaian, dan refleksi akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, dayEntries]) => {
        const hasReflection = dayEntries.some((e) => e.type === "reflection" && (e.learned || e.grateful || e.improve));
        const nonReflection = dayEntries.filter((e) => e.type !== "reflection" || (!e.learned && !e.grateful && !e.improve));
        const reflectionEntries = dayEntries.filter((e) => e.type === "reflection" && (e.learned || e.grateful || e.improve));

        return (
          <div key={date}>
            <p className="text-xs font-semibold text-text-secondary/50 mb-3">
              {hasReflection ? formatJournalDate(date) : formatDate(date)}
            </p>
            <div className="space-y-2">
              {nonReflection.map((entry, i) => (
                <TimelineEntry key={i} entry={entry} />
              ))}
              {reflectionEntries.map((entry, i) => (
                <ReflectionEntry key={i} entry={entry} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
