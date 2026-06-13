"use client";

import { useMemo } from "react";
import { BookHeart } from "lucide-react";
import type { JourneyDailyReflection } from "@beautifio/types";

interface StoryEntry {
  date: string;
  type: "reflection" | "milestone";
  content: string;
  mood?: string;
}

interface JourneyStoryProps {
  reflections: JourneyDailyReflection[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatDiaryDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function JourneyStory({ reflections }: JourneyStoryProps) {
  const entries = useMemo<StoryEntry[]>(() => {
    const result: StoryEntry[] = [];

    for (const r of reflections) {
      const parts: string[] = [];
      if (r.learned) parts.push(r.learned);
      if (r.grateful) parts.push("Bersyukur: " + r.grateful);
      if (r.improve) parts.push("Perlu diperbaiki: " + r.improve);

      const content = parts.join("\n\n");
      if (content) {
        result.push({
          date: r.date,
          type: "reflection",
          content,
          mood: r.mood,
        });
      }
    }

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [reflections]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
          <BookHeart size={28} className="text-primary/30" />
        </div>
        <p className="text-sm font-semibold text-text-primary mb-1">Belum ada cerita</p>
        <p className="text-xs text-text-secondary max-w-xs mx-auto">
          Setiap kali kamu merefleksikan hari, ceritamu akan tersimpan di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry, i) => {
        const lines = entry.content.split("\n\n");
        return (
          <div key={i} className="bg-surface rounded-2xl border border-border p-5">
            <p className="text-xs text-text-secondary/50 mb-3 font-medium">
              {formatDiaryDate(entry.date)}
            </p>
            <div className="space-y-3">
              {lines.map((line, li) => (
                <p key={li} className="text-sm text-text-primary leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
            {entry.mood && (
              <p className="text-xs text-text-secondary/60 mt-3 pt-3 border-t border-border">
                Suasana hati: {entry.mood}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
