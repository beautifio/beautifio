"use client";

import { useState } from "react";
import { CheckCircle2, Circle, PenLine } from "lucide-react";
import type { DailyActivity } from "@beautifio/types";

interface DailyActivityCardProps {
  activity: DailyActivity;
  dimensionLabel: string;
  dimensionEmoji: string;
  onComplete: (id: string) => void;
  onSaveNote?: (id: string, note: string) => void;
  estimatedMinutes?: number;
}

export function DailyActivityCard({
  activity,
  dimensionLabel,
  dimensionEmoji,
  onComplete,
  onSaveNote,
  estimatedMinutes,
}: DailyActivityCardProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(activity.notes || "");

  const handleSaveNote = () => {
    if (onSaveNote && noteText.trim()) {
      onSaveNote(activity.id, noteText.trim());
    }
    setShowNoteInput(false);
  };

  return (
    <div
      className={`w-full rounded-xl border-2 text-left transition-all ${
        activity.is_completed
          ? "border-success/30 bg-success/5"
          : "border-border hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      <button
        onClick={() => !activity.is_completed && onComplete(activity.id)}
        disabled={activity.is_completed}
        className="w-full flex items-center gap-3 p-4 cursor-pointer"
      >
        <span className="text-lg flex-shrink-0">{dimensionEmoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium ${
                activity.is_completed
                  ? "text-text-secondary line-through"
                  : "text-text-primary"
              }`}
            >
              {activity.title}
            </p>
            {estimatedMinutes != null && (
              <span className="shrink-0 text-[11px] mt-0.5" style={{ color: "rgba(74, 68, 88, 0.6)" }}>
                {estimatedMinutes} mnt
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5">{dimensionLabel}</p>
        </div>
        {activity.is_completed ? (
          <CheckCircle2 size={20} className="text-success flex-shrink-0" />
        ) : (
          <Circle size={20} className="text-text-secondary/40 flex-shrink-0" />
        )}
      </button>

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
