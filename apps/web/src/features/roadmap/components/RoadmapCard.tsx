"use client";

import { useState } from "react";
import Link from "next/link";
import { X, CheckCircle2, Clock, Users, Target, Heart } from "lucide-react";
import { Badge } from "@beautifio/ui";
import { ROADMAP_CATEGORIES, ROADMAP_V3_SEED } from "@beautifio/utils";
import type { RoadmapTemplate } from "@beautifio/types";

function RoadmapPreviewModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const roadmap = ROADMAP_V3_SEED[slug];
  if (!roadmap) return null;

  const allHabits = roadmap.dailyWins.flatMap((dw) => dw.habits);
  const totalBigWins = roadmap.bigWins.length;
  const dream = roadmap.dream;
  const blueprint = roadmap.blueprint;
  const realityCheck = roadmap.realityCheck;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-surface z-10 flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary">Pratinjau Roadmap</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center cursor-pointer">
            <X size={16} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className={`bg-gradient-to-r ${roadmap.color} p-4 rounded-xl`}>
            <span className="text-2xl">{roadmap.emoji}</span>
            <h2 className="text-lg font-bold text-white mt-2">{dream.title}</h2>
            <p className="text-sm text-white/80 mt-1">{dream.description}</p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
            <Target size={16} className="text-accent" />
            <div className="flex-1">
              <p className="text-[10px] font-medium text-accent/70 uppercase tracking-wider">🎯 Impian</p>
              <p className="text-xs font-semibold text-text-primary">{dream.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-3 rounded-xl border border-border">
              <Clock size={14} className="text-primary" />
              <span className="text-[11px] text-text-primary font-medium">{roadmap.duration}</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-border">
              <CheckCircle2 size={14} className="text-green-500" />
              <span className="text-[11px] text-text-primary font-medium">{totalBigWins} Milestone Besar</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">📚 Yang Akan Dipelajari</p>
            <div className="flex flex-wrap gap-1.5">
              {blueprint.skills.slice(0, 4).map((s, i) => (
                <Badge key={i} variant="accent" className="text-[10px]">{s}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">🔥 Kebiasaan Harian</p>
            <div className="space-y-1.5">
              {allHabits.slice(0, 4).map((h) => (
                <div key={h.id} className="flex items-center gap-2 text-xs text-text-primary">
                  <span className="text-accent">●</span>
                  {h.title}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">❤️ Tantangan Terbesar</p>
            <div className="space-y-1.5">
              {realityCheck.hardTruths.slice(0, 2).map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                  <span className="text-destructive mt-0.5">⚠</span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <Link
            href={`/roadmap/${slug}`}
            className="block w-full py-3 rounded-xl bg-primary text-white text-sm font-bold text-center hover:bg-primary/90 transition-colors"
          >
            Mulai Perjalanan
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RoadmapCard({ template }: { template: RoadmapTemplate }) {
  const [showPreview, setShowPreview] = useState(false);
  const catInfo = ROADMAP_CATEGORIES.find((c) => c.slug === template.category);
  const roadmap = ROADMAP_V3_SEED[template.slug];
  const dream = roadmap?.dream;

  const totalHabits = roadmap?.dailyWins.flatMap((dw) => dw.habits).length ?? 0;
  const totalSkills = roadmap?.smallWins.flatMap((sw) => sw.skills).length ?? 0;
  const totalBigWins = roadmap?.bigWins.length ?? 0;
  const altFutures = roadmap?.alternativeFutures ?? [];

  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group">
        <div className={`bg-gradient-to-r ${template.color || "from-primary to-secondary"} px-5 pt-5 pb-4`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-2xl">{roadmap?.emoji || "📋"}</span>
              <h3 className="text-lg font-bold text-white mt-2">{dream?.title || template.title}</h3>
              <p className="text-sm text-white/70 mt-1 line-clamp-2 leading-snug">
                {dream?.description || template.description}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 space-y-3">
          <div className="flex items-center gap-2">
            {catInfo && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">
                {catInfo.emoji} {catInfo.label}
              </Badge>
            )}
            <Badge variant="accent" className="text-[10px] px-1.5 py-0 leading-none">
              {template.estimated_duration || "Variatif"}
            </Badge>
          </div>

          {dream?.whyMatters && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-accent/5 border border-accent/10">
              <SparklesIcon size={14} />
              <p className="text-[10px] text-text-secondary leading-relaxed">{dream.whyMatters}</p>
            </div>
          )}

          {roadmap?.blueprint?.skills && roadmap.blueprint.skills.length > 0 && (
            <div>
              <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Skills utama</p>
              <div className="flex flex-wrap gap-1">
                {roadmap.blueprint.skills.slice(0, 4).map((s, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-text-secondary">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-[10px] text-text-secondary pt-1 border-t border-border">
            <span className="flex items-center gap-1">
              <span>✅</span> {totalHabits} kebiasaan
            </span>
            <span className="flex items-center gap-1">
              <span>⚡</span> {totalSkills} skill
            </span>
            <span className="flex items-center gap-1">
              <span>🏆</span> {totalBigWins} milestone
            </span>
          </div>

          {altFutures.length > 0 && (
            <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
              <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Alternatif karir
              </p>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                {altFutures.slice(0, 3).map((af) => af.title).join(", ")}{altFutures.length > 3 ? " dan lainnya" : ""}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link
              href={`/roadmap/${template.slug}`}
              className="flex-1 py-2.5 rounded-lg bg-primary text-white text-xs font-bold text-center hover:bg-primary/90 transition-colors"
            >
              Mulai Perjalanan
            </Link>
            <button
              onClick={() => setShowPreview(true)}
              className="py-2.5 px-4 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:bg-muted transition-colors cursor-pointer"
            >
              Pratinjau
            </button>
          </div>
        </div>
      </div>

      {showPreview && (
        <RoadmapPreviewModal slug={template.slug} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}

function SparklesIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent flex-shrink-0 mt-0.5">
      <path d="M12 3l1.91 5.09L19 10l-5.09 1.91L12 17l-1.91-5.09L5 10l5.09-1.91z" />
      <path d="M18 14l.91 2.09L21 17l-2.09.91L18 20l-.91-2.09L15 17l2.09-.91z" />
    </svg>
  );
}
