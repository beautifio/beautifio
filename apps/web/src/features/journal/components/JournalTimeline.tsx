"use client";

import { useState } from "react";
import { ChevronDown, BookHeart } from "lucide-react";
import type { JournalEntry } from "@beautifio/types";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatDate(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

const MOOD_CONFIG: Record<string, { emoji: string; bg: string; border: string }> = {
  sangat_bahagia: { emoji: "🌟", bg: "bg-yellow-50", border: "border-yellow-200" },
  bahagia: { emoji: "😊", bg: "bg-green-50", border: "border-green-200" },
  biasa: { emoji: "😐", bg: "bg-blue-50", border: "border-blue-200" },
  sedih: { emoji: "😢", bg: "bg-purple-50", border: "border-purple-200" },
  sangat_sedih: { emoji: "😭", bg: "bg-red-50", border: "border-red-200" },
};

export function JournalTimeline({
  entries,
}: {
  entries: JournalEntry[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <BookHeart size={28} className="text-text-secondary/40" />
        </div>
        <p className="text-sm font-semibold text-text-primary">Belum ada entri jurnal</p>
        <p className="text-xs text-text-secondary mt-1">Mulai tulis perjalananmu hari ini</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border" />

      <div className="space-y-3">
        {entries.map((entry) => {
          const moodCfg = entry.mood ? MOOD_CONFIG[entry.mood] : undefined;
          const isExpanded = expandedId === entry.id;
          const date = new Date(entry.created_at);

          return (
            <div key={entry.id} className="relative pl-10">
              <div className={`absolute left-[11px] w-[18px] h-[18px] rounded-full border-2 bg-bg flex items-center justify-center ${
                moodCfg ? moodCfg.border : "border-border"
              }`}>
                <span className="text-[9px]">{moodCfg?.emoji ?? "📝"}</span>
              </div>

              <div className={`rounded-xl border transition-all ${
                isExpanded
                  ? "border-primary/30 bg-primary/[0.02]"
                  : "border-border bg-surface"
              }`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full flex items-start gap-3 p-3.5 cursor-pointer text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-text-primary">
                        Hari ke-{entry.day_number}
                      </span>
                      {entry.title && (
                        <span className="text-xs text-text-secondary">· {entry.title}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-text-secondary">
                        {formatDate(date)}
                      </span>
                      {entry.mood && (
                        <span className="text-[10px]">{moodCfg?.emoji}</span>
                      )}
                    </div>
                    <p className={`text-xs text-text-secondary mt-1.5 leading-relaxed ${
                      isExpanded ? "" : "line-clamp-2"
                    }`}>
                      {entry.content}
                    </p>
                  </div>
                  <ChevronDown size={14} className={`text-text-secondary flex-shrink-0 mt-1 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
