"use client";

import { useState } from "react";
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp,
  AlertTriangle, Trophy,
} from "lucide-react";
import type { BigWin, SmallWin } from "@beautifio/types";

interface BigWinCardProps {
  bigWin: BigWin;
  onCompleteSmallWin: (id: string, reflection?: string) => void;
  onFail: () => void;
}

export function BigWinCard({ bigWin, onCompleteSmallWin, onFail }: BigWinCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [newReflection, setNewReflection] = useState("");
  const [completingId, setCompletingId] = useState<string | null>(null);

  const statusIcon = bigWin.is_completed
    ? "✅"
    : bigWin.is_failed
    ? "❌"
    : "⏳";

  const smallWins = bigWin.small_wins || [];
  const completedCount = smallWins.filter((sw) => sw.is_completed).length;

  const handleComplete = async (sw: SmallWin) => {
    setCompletingId(sw.id);
    await onCompleteSmallWin(sw.id, newReflection || undefined);
    setNewReflection("");
    setCompletingId(null);
  };

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden transition-all ${
        bigWin.is_completed
          ? "border-success/30"
          : bigWin.is_failed
          ? "border-danger/30 opacity-60"
          : "border-border"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <span className="text-xl">{statusIcon}</span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-bold ${
              bigWin.is_completed ? "text-success" : "text-text-primary"
            }`}
          >
            {bigWin.title}
          </p>
          {smallWins.length > 0 && (
            <p className="text-xs text-text-secondary mt-0.5">
              {completedCount}/{smallWins.length}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-text-secondary" />
        ) : (
          <ChevronDown size={16} className="text-text-secondary" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          {bigWin.description && (
            <p className="text-xs text-text-secondary mb-3">{bigWin.description}</p>
          )}

          <div className="space-y-2">
            {smallWins.map((sw) => (
              <div key={sw.id} className="flex items-start gap-3">
                <button
                  onClick={() => !sw.is_completed && handleComplete(sw)}
                  disabled={sw.is_completed}
                  className="mt-0.5 cursor-pointer"
                >
                  {sw.is_completed ? (
                    <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                  ) : (
                    <Circle size={18} className="text-text-secondary/40 flex-shrink-0" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      sw.is_completed
                        ? "text-text-secondary line-through"
                        : "text-text-primary"
                    }`}
                  >
                    {sw.title}
                  </p>
                  {sw.description && !sw.is_completed && (
                    <p className="text-xs text-text-secondary/60 mt-0.5">{sw.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!bigWin.is_completed && !bigWin.is_failed && (
            <button
              onClick={onFail}
              className="flex items-center gap-1.5 text-xs text-danger/70 hover:text-danger mt-4 cursor-pointer transition-colors"
            >
              <AlertTriangle size={12} />
              Tidak tercapai?
            </button>
          )}
        </div>
      )}
    </div>
  );
}
