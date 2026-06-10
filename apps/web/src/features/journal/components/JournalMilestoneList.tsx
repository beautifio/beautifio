"use client";

import { Trophy, CheckCircle2, Circle } from "lucide-react";
import type { JournalMilestone } from "@beautifio/types";

export function JournalMilestoneList({ milestones }: { milestones: JournalMilestone[] }) {
  const achieved = milestones.filter((m) => m.is_achieved).length;

  if (milestones.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
          <Trophy size={22} className="text-text-secondary/40" />
        </div>
        <p className="text-sm font-semibold text-text-primary">Belum ada milestone</p>
        <p className="text-xs text-text-secondary mt-1">Tambah milestone untuk perjalananmu</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary">Milestone</h3>
        <span className="text-xs text-text-secondary">{achieved}/{milestones.length} tercapai</span>
      </div>

      <div className="space-y-2">
        {milestones.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
              m.is_achieved
                ? "border-success/30 bg-success/5"
                : "border-border bg-surface"
            }`}
          >
            {m.is_achieved ? (
              <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
            ) : (
              <Circle size={18} className="text-text-secondary flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${
                  m.is_achieved ? "text-success" : "text-text-primary"
                }`}>
                  {m.title}
                </span>
                {m.is_achieved && (
                  <span className="text-[10px] font-medium text-success">Selesai</span>
                )}
              </div>
              {m.description && (
                <p className="text-xs text-text-secondary mt-0.5">{m.description}</p>
              )}
              {m.achieved_at && (
                <p className="text-[10px] text-text-secondary mt-1">
                  Tercapai {new Date(m.achieved_at).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
