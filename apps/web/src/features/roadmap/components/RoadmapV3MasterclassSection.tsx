"use client";

import { useState } from "react";
import { Calendar, Clock, AlertTriangle, GitBranch, BookOpen, GraduationCap, Users, Lightbulb, Target, ArrowRight } from "lucide-react";
import { Badge } from "@beautifio/ui";
import type { AgePathStage, TimelinePhase, RealityCheck, AlternativePath, MasterclassLesson } from "@beautifio/types";

function AgePathSection({ stages }: { stages: AgePathStage[] }) {
  const [active, setActive] = useState(0);
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-primary" />
        <h3 className="text-base font-bold text-text-primary">Age Path — Progres Berdasarkan Usia</h3>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none mb-4">
        {stages.map((s, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
              active === i ? "bg-primary text-white" : "bg-surface text-text-secondary border border-border hover:border-primary/30"
            }`}
          >
            {s.ageRange}
          </button>
        ))}
      </div>
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="default" className="text-[10px]">{stages[active].ageRange}</Badge>
          <span className="text-sm font-extrabold text-text-primary">{stages[active].title}</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{stages[active].description}</p>
        <ul className="mt-3 space-y-2">
          {stages[active].milestones.map((m, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-sm text-text-primary">{m}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TimelineSection({ phases }: { phases: TimelinePhase[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-amber-500" />
        <h3 className="text-base font-bold text-text-primary">Timeline — Ekspektasi Realistis</h3>
      </div>
      <div className="relative">
        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border" />
        <div className="space-y-3">
          {phases.map((p, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center pt-1 z-10">
                <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  i === 0 ? "bg-emerald-500" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-amber-500" : i === 3 ? "bg-purple-500" : "bg-rose-500"
                }`}>
                  {i + 1}
                </div>
              </div>
              <div className="flex-1 p-3.5 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={i === 0 ? "success" : i === 1 ? "secondary" : i === 2 ? "warning" : "default"} className="text-[10px]">{p.period}</Badge>
                  <span className="text-sm font-bold text-text-primary">{p.title}</span>
                </div>
                <p className="text-xs text-text-secondary mb-2">{p.description}</p>
                <ul className="space-y-1">
                  {p.keyActions.map((a, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-text-primary">
                      <ArrowRight size={10} className="text-primary mt-0.5 flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RealityCheckSection({ check }: { check: RealityCheck }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-rose-500" />
        <h3 className="text-base font-bold text-text-primary">Reality Check</h3>
      </div>
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-rose-500" />
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide">Hard Truths</span>
          </div>
          <ul className="space-y-2.5">
            {check.hardTruths.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-primary">
                <span className="text-rose-400 text-xs mt-0.5 flex-shrink-0">✕</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Silver Linings</span>
            </div>
            <ul className="space-y-2">
              {check.silverLinings.map((s, i) => (
                <li key={i} className="text-xs text-text-primary leading-relaxed">✦ {s}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Transferable Skills</span>
            </div>
            <ul className="space-y-2">
              {check.transferableSkills.map((s, i) => (
                <li key={i} className="text-xs text-text-primary leading-relaxed">→ {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function AlternativePathsSection({ paths }: { paths: AlternativePath[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={16} className="text-accent" />
        <h3 className="text-base font-bold text-text-primary">Alternative Paths — Plan B, C, D</h3>
      </div>
      <div className="space-y-3">
        {paths.map((alt, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden">
            <div className="p-3.5 bg-muted/30 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-sm font-bold text-text-primary">Jika: {alt.scenario}</span>
              </div>
            </div>
            <div className="p-3.5 space-y-2.5">
              {alt.steps.map((step, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
                    j === 0 ? "bg-amber-500" : j === 1 ? "bg-blue-500" : "bg-emerald-500"
                  }`}>
                    {j + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={j === 0 ? "warning" : j === 1 ? "secondary" : "success"} className="text-[10px]">{step.role}</Badge>
                      <span className="text-xs font-bold text-text-primary">{step.transition}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SuccessLessonsSection({ lessons }: { lessons: MasterclassLesson[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap size={16} className="text-amber-500" />
        <h3 className="text-base font-bold text-text-primary">Masterclass Lessons — Dari Mereka yang Sudah Sampai</h3>
      </div>
      <div className="space-y-3">
        {lessons.map((l, i) => {
          const isOpen = expanded === i;
          return (
            <div key={i} className={`rounded-xl border transition-all overflow-hidden ${
              isOpen ? "border-primary/30 bg-primary/5" : "border-border bg-surface"
            }`}>
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full flex items-start gap-3 p-4 cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {l.person.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary">{l.person}</p>
                  <p className="text-[11px] text-text-secondary">{l.role}</p>
                  <p className="text-xs text-text-primary mt-1 line-clamp-2 italic">"{l.lesson}"</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                  isOpen ? "bg-primary/20 rotate-180" : "bg-muted/30"
                }`}>
                  <Lightbulb size={14} className={isOpen ? "text-primary" : "text-text-secondary"} />
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-5 space-y-3 border-t border-border pt-3">
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide flex items-center gap-1">
                      <BookOpen size={10} /> The Story
                    </p>
                    <p className="text-sm text-text-primary mt-1 leading-relaxed">{l.story}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50">
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
                      <Lightbulb size={10} /> Key Insight
                    </p>
                    <p className="text-sm text-text-primary mt-1">{l.keyInsight}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wide flex items-center gap-1">
                      <Target size={10} /> Action Item
                    </p>
                    <p className="text-sm text-text-primary mt-1">{l.actionItem}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function RoadmapV3MasterclassSection({
  agePath,
  timeline,
  realityCheck,
  alternativePaths,
  masterclassLessons,
}: {
  agePath: AgePathStage[];
  timeline: TimelinePhase[];
  realityCheck: RealityCheck;
  alternativePaths: AlternativePath[];
  masterclassLessons: MasterclassLesson[];
}) {
  const [masterclassTab, setMasterclassTab] = useState("age");

  const tabs = [
    { key: "age", label: "Age Path", icon: Calendar },
    { key: "timeline", label: "Timeline", icon: Clock },
    { key: "reality", label: "Reality Check", icon: AlertTriangle },
    { key: "alternatives", label: "Plan B", icon: GitBranch },
    { key: "lessons", label: "Lessons", icon: GraduationCap },
  ];

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = masterclassTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setMasterclassTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface text-text-secondary border border-border hover:border-primary/30"
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {masterclassTab === "age" && <AgePathSection stages={agePath} />}
      {masterclassTab === "timeline" && <TimelineSection phases={timeline} />}
      {masterclassTab === "reality" && <RealityCheckSection check={realityCheck} />}
      {masterclassTab === "alternatives" && <AlternativePathsSection paths={alternativePaths} />}
      {masterclassTab === "lessons" && <SuccessLessonsSection lessons={masterclassLessons} />}
    </div>
  );
}
