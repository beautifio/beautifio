"use client";

import { CheckCircle2, BookOpen, Flame, XCircle, RefreshCw } from "lucide-react";
import type { GrowthTimelineEvent } from "@beautifio/types";

interface JourneyTimelineProps {
  events: GrowthTimelineEvent[];
}

function getEventIcon(type: string) {
  switch (type) {
    case "activity_completed":
      return <Flame size={14} className="text-accent" />;
    case "reflection_written":
      return <BookOpen size={14} className="text-primary" />;
    case "small_win_completed":
      return <CheckCircle2 size={14} className="text-success" />;
    case "big_win_completed":
      return <CheckCircle2 size={14} className="text-success" />;
    case "big_win_failed":
      return <XCircle size={14} className="text-danger" />;
    case "journey_pivoted":
      return <RefreshCw size={14} className="text-accent" />;
    default:
      return <Flame size={14} className="text-text-secondary" />;
  }
}

export function JourneyTimeline({ events }: JourneyTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-text-secondary">Belum ada aktivitas</p>
        <p className="text-xs text-text-secondary/60 mt-1">
          Selesaikan aktivitas harianmu untuk memulai
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-4">
            <div className="relative z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {getEventIcon(event.event_type)}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <p className="text-sm font-medium text-text-primary">
                {event.title}
              </p>
              {event.description && (
                <p className="text-xs text-text-secondary mt-0.5">
                  {event.description}
                </p>
              )}
              <p className="text-[11px] text-text-secondary/50 mt-1">
                {formatDate(event.event_date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hari ini";
  if (date.toDateString() === yesterday.toDateString()) return "Kemarin";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}
