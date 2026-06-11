"use client";

import { useEffect, useState } from "react";
import { BookHeart, Trophy, Sparkles, Quote, Heart, Star } from "lucide-react";
import { Card } from "@beautifio/ui";
import type { JourneyDailyReflection } from "@beautifio/types";

interface StoryEntry {
  date: string;
  type: "reflection" | "celebration" | "note";
  content: string;
  mood?: string;
}

interface JourneyStoryProps {
  userId: string;
  journeyId: string;
}

export function JourneyStory({ userId, journeyId }: JourneyStoryProps) {
  const [entries, setEntries] = useState<StoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { getTimeline } = await import("@/lib/journey-queries");
        const events = await getTimeline(userId, journeyId);
        const timelineEntries: StoryEntry[] = [];

        const { getTodayReflection } = await import("@/lib/journey-queries");
        const todayRef = await getTodayReflection(userId);

        for (const event of events) {
          if (event.event_type === "small_win_completed") {
            timelineEntries.push({
              date: event.event_date,
              type: "celebration",
              content: event.title || "Menyelesaikan satu pencapaian!",
            });
          } else if (event.event_type === "big_win_completed") {
            timelineEntries.push({
              date: event.event_date,
              type: "celebration",
              content: "🏆 BIG WIN: " + (event.title || "Pencapaian besar!"),
            });
          } else if (event.event_type === "reflection_written") {
            timelineEntries.push({
              date: event.event_date,
              type: "reflection",
              content: event.description || event.title || "",
            });
          }
        }

        if (todayRef) {
          const parts: string[] = [];
          if (todayRef.learned) parts.push("Mempelajari: " + todayRef.learned);
          if (todayRef.grateful) parts.push("Bersyukur: " + todayRef.grateful);
          if (todayRef.improve) parts.push("Perlu diperbaiki: " + todayRef.improve);
          if (parts.length > 0) {
            timelineEntries.unshift({
              date: new Date().toISOString().split("T")[0],
              type: "reflection",
              content: parts.join(". "),
              mood: todayRef.mood,
            });
          }
        }

        timelineEntries.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setEntries(timelineEntries);
      } catch (e) {
        console.error("Failed to load story", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, journeyId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-surface border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
          <BookHeart size={28} className="text-primary/30" />
        </div>
        <p className="text-sm font-semibold text-text-primary mb-1">Belum ada cerita</p>
        <p className="text-xs text-text-secondary max-w-xs mx-auto">
          Setiap kali kamu menyelesaikan aktivitas, merefleksikan hari, atau merayakan pencapaian — ceritamu akan tersimpan di sini.
        </p>
      </div>
    );
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

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-secondary/60 mb-2">
        Setiap catatan adalah bagian dari perjalanan hidupmu.
      </p>
      {entries.map((entry, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              entry.type === "celebration"
                ? "bg-success/10"
                : entry.type === "reflection"
                ? "bg-primary/10"
                : "bg-accent/10"
            }`}>
              {entry.type === "celebration" ? (
                <Trophy size={14} className="text-success" />
              ) : entry.type === "reflection" ? (
                <Quote size={14} className="text-primary" />
              ) : (
                <Star size={14} className="text-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary/60 mb-1">{formatDate(entry.date)}</p>
              <p className="text-sm text-text-primary leading-relaxed">{entry.content}</p>
              {entry.mood && (
                <p className="text-xs text-text-secondary/60 mt-1">Suasana hati: {entry.mood}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
