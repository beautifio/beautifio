"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, Lock, ChevronDown } from "lucide-react";
import { ProgressBar } from "@beautifio/ui";
import type { RoadmapTemplateMilestone, RoadmapTask } from "@beautifio/types";
import { useAuthStore } from "@/stores/auth-store";
import { AuthModal } from "@/components/AuthModal";

function loadTaskStates(slug: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`beautifio_roadmap_${slug}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTaskStates(slug: string, states: Record<string, boolean>) {
  try {
    localStorage.setItem(`beautifio_roadmap_${slug}`, JSON.stringify(states));
  } catch {}
}

export function MilestoneTimeline({
  milestones,
  slug,
}: {
  milestones: RoadmapTemplateMilestone[];
  slug?: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(milestones[0]?.id ?? null);
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>({});
  const [showAuth, setShowAuth] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (slug) setTaskStates(loadTaskStates(slug));
  }, [slug]);

  const toggleTask = useCallback((key: string) => {
    if (isLoading) return;
    if (!user) {
      setShowAuth(true);
      return;
    }
    setTaskStates((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (slug) saveTaskStates(slug, next);
      return next;
    });
  }, [slug, user]);

  const totalTasks = milestones.reduce((sum, m) => sum + (m.tasks as RoadmapTask[]).length, 0);
  const doneTasks = milestones.reduce((sum, m) =>
    sum + (m.tasks as RoadmapTask[]).filter((t) => taskStates[`${m.id}-${t.title}`]).length, 0
  );
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <>
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-text-primary">Milestones</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">{doneTasks}/{totalTasks} tugas</span>
          <ProgressBar value={progress} size="sm" variant="accent" showLabel />
        </div>
      </div>

      <div className="space-y-2">
        {milestones.map((milestone, index) => {
          const tasks = (milestone.tasks as RoadmapTask[]) ?? [];
          const doneInMilestone = tasks.filter((t) => taskStates[`${milestone.id}-${t.title}`]).length;
          const isComplete = doneInMilestone === tasks.length && tasks.length > 0;
          const isExpanded = expanded === milestone.id;

          return (
            <div
              key={milestone.id}
              className={`rounded-sm border transition-all ${
                isComplete
                  ? "border-success/30 bg-success/5"
                  : isExpanded
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-surface"
              }`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : milestone.id)}
                className="w-full flex items-center gap-3 p-4 cursor-pointer text-left"
              >
                {isComplete ? (
                  <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                ) : (
                  <Circle size={20} className={isExpanded ? "text-primary" : "text-text-secondary"} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${
                      isComplete ? "text-success" : "text-text-primary"
                    }`}>
                      {milestone.title}
                    </span>
                    {isComplete && (
                      <span className="text-[10px] font-medium text-success">Selesai</span>
                    )}
                  </div>
                  {milestone.description && (
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{milestone.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-text-secondary">{doneInMilestone}/{tasks.length} tugas</span>
                    {milestone.estimated_days && (
                      <span className="text-[10px] text-text-secondary">· estimasi {milestone.estimated_days} hari</span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-text-secondary transition-transform flex-shrink-0 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExpanded && tasks.length > 0 && (
                <div className="px-4 pb-4 space-y-1.5">
                  {tasks.map((task) => {
                    const taskKey = `${milestone.id}-${task.title}`;
                    const done = taskStates[taskKey] ?? false;
                    return (
                      <button
                        key={taskKey}
                        onClick={() => toggleTask(taskKey)}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-sm text-left transition-all cursor-pointer ${
                          done
                            ? "bg-success/5 text-text-secondary"
                            : "hover:bg-muted/50 text-text-primary"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all ${
                            done
                              ? "bg-success border-success"
                              : "border-border"
                          }`}
                        >
                          {done && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${done ? "line-through" : ""}`}>{task.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>

    <AuthModal
      open={showAuth}
      onClose={() => setShowAuth(false)}
    />
    </>
  );
}
