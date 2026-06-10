"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Lock, ChevronDown } from "lucide-react";
import { ProgressBar } from "@beautifio/ui";
import type { RoadmapTemplateMilestone, RoadmapTask } from "@beautifio/types";

export function MilestoneTimeline({
  milestones,
  progress,
}: {
  milestones: RoadmapTemplateMilestone[];
  progress: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(milestones[0]?.id ?? null);
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>({});

  const activeMilestone = milestones.findIndex((m) => {
    const tasks = m.tasks as RoadmapTask[];
    return tasks?.some((t) => !taskStates[`${m.id}-${t.title}`]);
  });
  const currentActive = activeMilestone === -1 ? milestones.length - 1 : activeMilestone;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-text-primary">Milestones</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Progress</span>
          <ProgressBar value={progress} size="sm" variant="accent" showLabel />
        </div>
      </div>

      <div className="space-y-2">
        {milestones.map((milestone, index) => {
          const tasks = (milestone.tasks as RoadmapTask[]) ?? [];
          const doneTasks = tasks.filter((t) => taskStates[`${milestone.id}-${t.title}`]).length;
          const isComplete = doneTasks === tasks.length && tasks.length > 0;
          const isActive = index === currentActive && !isComplete;
          const isExpanded = expanded === milestone.id;

          return (
            <div
              key={milestone.id}
              className={`rounded-sm border transition-all ${
                isComplete
                  ? "border-success/30 bg-success/5"
                  : isActive
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
                ) : isActive ? (
                  <Circle size={20} className="text-primary flex-shrink-0" />
                ) : (
                  <Lock size={18} className="text-text-secondary flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${
                      isComplete ? "text-success" : isActive ? "text-primary" : "text-text-secondary"
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
                    <span className="text-[10px] text-text-secondary">{doneTasks}/{tasks.length} tugas</span>
                    {milestone.estimated_days && (
                      <span className="text-[10px] text-text-secondary">· {milestone.estimated_days} hari</span>
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
                        onClick={() => setTaskStates((prev) => ({ ...prev, [taskKey]: !done }))}
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
  );
}
