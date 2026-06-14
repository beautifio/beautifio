"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, Target, MapPin, Users, Sparkles,
  Award, ChevronRight,
} from "lucide-react";
import { Button, Card, Skeleton } from "@beautifio/ui";
import { getDreamTemplate } from "@beautifio/utils";
import type { DreamTemplate } from "@beautifio/types";

interface PhaseData {
  id: string;
  phase_number: number;
  phase_name: string;
  age_min: number | null;
  age_max: number | null;
  big_win_title: string;
  big_win_description: string | null;
  industry_benchmark: string | null;
  over_achievement: string | null;
  behind_schedule_signal: string | null;
  sort_order: number;
  small_win_templates: {
    id: string;
    title: string;
    description: string | null;
    sort_order: number;
  }[];
}

export default function MimpiPreviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<DreamTemplate | null>(null);
  const [phases, setPhases] = useState<PhaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getDreamTemplate(slug);
    setTemplate(t || null);

    if (t) {
      fetch(`/api/mimpi/${slug}`)
        .then((r) => r.json())
        .then((data) => setPhases(data.phases || []))
        .catch(() => setPhases([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-content mx-auto px-6 pt-8 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
        <p className="text-text-secondary text-lg">Mimpi tidak ditemukan</p>
        <Link href="/mimpi" className="text-primary mt-4 text-sm font-medium">
          Lihat mimpi lainnya
        </Link>
      </div>
    );
  }

  const successExamples = template.success_examples || [];
  const careerOptions = template.career_options || [];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-32">
        {/* Back */}
        <Link
          href="/mimpi"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>

        {/* Hero */}
        <div className="p-6 rounded-2xl border border-border bg-surface mb-6">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{template.emoji}</span>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-text-primary">{template.title}</h1>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                {template.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-text-secondary capitalize">
                  {template.category}
                </span>
                <span className="text-xs text-text-secondary flex items-center gap-1">
                  <Clock size={12} /> {template.duration}
                </span>
                {template.min_age !== undefined && template.max_age !== undefined && (
                  <span className="text-xs text-text-secondary flex items-center gap-1">
                    <Users size={12} /> Usia {template.min_age}–{template.max_age} tahun
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Why Matters */}
        <Card className="p-5 mb-6 border border-accent/20 bg-accent/[0.03]">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                Kenapa Mimpi Ini?
              </p>
              <p className="text-sm text-text-primary leading-relaxed">{template.why_matters}</p>
            </div>
          </div>
        </Card>

        {/* Career Options */}
        {careerOptions.length > 0 && (
          <Card className="p-5 mb-6">
            <div className="flex items-start gap-3">
              <Target size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  Peluang Karir
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {careerOptions.map((opt) => (
                    <span
                      key={opt}
                      className="text-xs px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/15"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Success Examples */}
        {successExamples.length > 0 && (
          <Card className="p-5 mb-6">
            <div className="flex items-start gap-3">
              <Award size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">
                  Contoh Inspiratif
                </p>
                <div className="space-y-3">
                  {successExamples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-muted/50 border border-border/50"
                    >
                      <p className="text-sm font-semibold text-text-primary">{ex.name}</p>
                      <p className="text-xs text-text-secondary">{ex.role}</p>
                      <p className="text-xs text-text-secondary/70 mt-1 leading-relaxed">
                        {ex.story}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Phase Timeline */}
        {phases.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-primary" />
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Perjalanan dari Awal hingga Puncak Karier
              </p>
            </div>

            <div className="space-y-3">
              {phases.map((phase, idx) => (
                <Card
                  key={phase.id}
                  className={`p-4 border-l-4 ${
                    idx === 0
                      ? "border-l-accent"
                      : idx === phases.length - 1
                      ? "border-l-amber-500"
                      : "border-l-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                      Fase {phase.phase_number}
                    </p>
                    {phase.age_min !== null && phase.age_max !== null && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-text-secondary">
                        Usia {phase.age_min}–{phase.age_max} tahun
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-text-primary">{phase.phase_name}</p>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {phase.big_win_title}
                  </p>
                  {phase.big_win_description && (
                    <p className="text-[11px] text-text-secondary/70 mt-1">
                      {phase.big_win_description}
                    </p>
                  )}
                  {phase.industry_benchmark && (
                    <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
                      <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">
                        Benchmark
                      </p>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        {phase.industry_benchmark}
                      </p>
                    </div>
                  )}
                  {phase.small_win_templates.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/40">
                      <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                        Target fase ini
                      </p>
                      <div className="space-y-0.5">
                        {phase.small_win_templates.map((sw) => (
                          <div
                            key={sw.id}
                            className="flex items-center gap-1.5 text-[11px] text-text-secondary"
                          >
                            <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                            <span>{sw.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-bg via-bg/95 to-transparent pt-8 pb-6 px-6">
          <div className="max-w-content mx-auto">
            <Link href={`/register?mimpi=${slug}`}>
              <Button variant="primary" size="lg" className="w-full shadow-lg">
                Mulai Perjalanan Ini <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
