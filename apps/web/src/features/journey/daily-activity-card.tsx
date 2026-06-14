"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, PenLine, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import type { DailyActivity } from "@beautifio/types";
import { ACTIVITY_DETAILS } from "@beautifio/utils";
import type { ActivityDetail } from "@beautifio/utils";

interface DailyActivityCardProps {
  activity: DailyActivity;
  dimensionLabel: string;
  dimensionEmoji: string;
  onComplete: (id: string) => void;
  onSaveNote?: (id: string, note: string) => void;
  estimatedMinutes?: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

export function DailyActivityCard({
  activity,
  dimensionLabel,
  dimensionEmoji,
  onComplete,
  onSaveNote,
  estimatedMinutes,
  isExpanded,
  onToggleExpand,
}: DailyActivityCardProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(activity.notes || "");

  const detailKey = `${activity.dimension}::${activity.title.toLowerCase().trim()}`;
  const detail: ActivityDetail | undefined = ACTIVITY_DETAILS[detailKey];

  const handleSaveNote = useCallback(() => {
    if (onSaveNote && noteText.trim()) {
      onSaveNote(activity.id, noteText.trim());
    }
    setShowNoteInput(false);
  }, [onSaveNote, noteText, activity.id]);

  return (
    <div
      className={`w-full rounded-xl border-2 text-left transition-all ${
        activity.is_completed
          ? "border-success/30 bg-success/5"
          : isExpanded
            ? "border-[#FF5E5B]/40 bg-accent/5"
            : "border-border hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      <div className="p-4 pb-2">
        <div className="w-full flex items-start gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); if (!activity.is_completed) onComplete(activity.id); }}
            disabled={activity.is_completed}
            className="mt-0.5 flex-shrink-0 cursor-pointer"
            aria-label={activity.is_completed ? "Selesai" : "Tandai selesai"}
          >
            {activity.is_completed ? (
              <CheckCircle2 size={20} className="text-success" />
            ) : (
              <Circle size={20} className="text-text-secondary/40 hover:text-primary/60 transition-colors" />
            )}
          </button>

          <button
            onClick={() => onToggleExpand(activity.id)}
            className="flex-1 min-w-0 text-left cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">{dimensionEmoji}</span>
                <p
                  className={`text-sm font-medium ${
                    activity.is_completed
                      ? "text-text-secondary line-through"
                      : "text-text-primary"
                  }`}
                >
                  {activity.title}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {estimatedMinutes != null && (
                  <span className="text-[11px]" style={{ color: "rgba(74, 68, 88, 0.6)" }}>
                    {estimatedMinutes} mnt
                  </span>
                )}
                {detail && (
                  isExpanded ? (
                    <ChevronUp size={14} className="text-text-secondary/40" />
                  ) : (
                    <ChevronDown size={14} className="text-text-secondary/40" />
                  )
                )}
              </div>
            </div>
            <p className="text-[11px] text-text-secondary mt-0.5">{dimensionLabel}</p>
          </button>
        </div>
      </div>

      {/* Expanded detail section */}
      {isExpanded && detail && (
        <div className="px-4 pb-3 space-y-3 border-t border-border/50 pt-3">
          <p className="text-[13px] text-text-secondary leading-relaxed">
            {detail.description}
          </p>

          {detail.tips.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-text-primary mb-1">Tips:</p>
              <ul className="space-y-1">
                {detail.tips.map((tip, i) => (
                  <li key={i} className="text-[12px] text-text-secondary leading-relaxed flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detail.warnings && (
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: "rgba(255, 94, 91, 0.08)" }}>
              <p className="text-[12px] text-[#FF5E5B] leading-relaxed">
                ⚠ Perhatikan: {detail.warnings}
              </p>
            </div>
          )}

          {detail.article_slug && (
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/15">
              <div className="flex items-start gap-2.5">
                <BookOpen size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-text-primary">Artikel yang disarankan</p>
                  <Link
                    href={`/inspirasi/${detail.article_slug}?from=journey&activity_id=${activity.id}&journey_id=${activity.journey_id}`}
                    className="inline-flex items-center gap-1 text-[12px] text-primary font-medium hover:underline mt-1"
                  >
                    Baca Sekarang →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {detail.video_url && detail.video_label && (
            <a
              href={detail.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-primary font-medium hover:underline"
            >
              ▶ {detail.video_label}
            </a>
          )}
        </div>
      )}

      {/* Notes section */}
      <div className="px-4 pb-3">
        {showNoteInput ? (
          <div className="flex items-center gap-2">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Tulis catatan singkat..."
              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-border bg-bg text-text-primary placeholder:text-text-secondary/40 outline-none focus:border-primary"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
            />
            <button
              onClick={handleSaveNote}
              className="text-xs px-2 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium"
            >
              Simpan
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNoteInput(true)}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <PenLine size={12} />
            {activity.notes ? (
              <span className="italic">{activity.notes}</span>
            ) : (
              <span>Tulis catatan...</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
