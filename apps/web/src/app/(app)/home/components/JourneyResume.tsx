"use client";

import { ArrowRight, Flame } from "lucide-react";
import Link from "next/link";
import { journeyUrl } from "@/lib/journey-queries";
import type { DreamJourney, JourneyProgress } from "@beautifio/types";

export function JourneyResume({
  journey,
  progress,
}: {
  journey: DreamJourney;
  progress: JourneyProgress | null;
}) {
  const pct = progress
    ? Math.round((progress.big_wins_completed / Math.max(progress.big_wins_total, 1)) * 100)
    : 0;
  const streak = progress?.streak ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-xs text-gray-500 mb-1">Hari ini kamu masih di perjalanan:</p>
      <h3 className="text-base font-bold text-gray-900 mb-3">{journey.title || "Perjalanan"}</h3>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-semibold text-gray-600 shrink-0">
          {progress?.big_wins_completed ?? 0}/{progress?.big_wins_total ?? 0}
        </span>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          <Flame size={14} className="text-orange-500" />
          <span className="text-xs font-medium text-orange-600">Streak {streak} hari</span>
        </div>
      )}

      <Link
        href={journeyUrl(journey)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
      >
        Lanjutkan <ArrowRight size={14} />
      </Link>
    </div>
  );
}
