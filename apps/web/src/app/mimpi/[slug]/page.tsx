"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, Target, MapPin, Users, Sparkles,
  Award, ChevronRight, LogIn,
} from "lucide-react";
import { Button, Card } from "@beautifio/ui";
import { getDreamTemplate, getBenchmarkForTemplate } from "@beautifio/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import type { DreamTemplate, DreamPhase, DreamPhaseSmallWin } from "@beautifio/types";

export default function MimpiPreviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const template = getDreamTemplate(slug) || null;
  const benchmark = getBenchmarkForTemplate(slug);
  const phases: (DreamPhase & { small_win_templates?: DreamPhaseSmallWin[] })[] = benchmark?.phases?.map((p) => ({
    ...p,
    small_win_templates: p.small_wins || [],
  })) || [];

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

  const showPhases = phases.length > 0;

  const successExamples = template.success_examples || [];
  const careerOptions = template.career_options || [];

  async function handleStart() {
    if (!supabase) {
      setError("Koneksi database tidak tersedia.");
      return;
    }
    setStarting(true);
    setError("");

    try {
      if (!user) {
        // Not authenticated → sign in anonymously first
        localStorage.setItem("pending_template", slug);
        const { data, error: signInErr } = await supabase.auth.signInAnonymously();
        if (signInErr) throw signInErr;
        window.location.href = "/journey";
      } else {
        // Already authenticated → just go to journey
        localStorage.setItem("pending_template", slug);
        router.push("/journey");
      }
    } catch (err: any) {
      setError(err?.message || "Gagal memulai. Coba lagi.");
      setStarting(false);
    }
  }

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
            <Sparkles size={20} className="text-accent shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-text-primary">Kenapa Mimpi Ini?</h3>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                {template.why_matters}
              </p>
            </div>
          </div>
        </Card>

        {/* Phases Section */}
        {showPhases && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-primary" />
              <h2 className="text-base font-bold text-text-primary">Tahapan Perjalanan</h2>
            </div>
            <div className="space-y-3">
              {phases.map((phase, idx) => (
                <Card key={phase.id || idx} className="p-5 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{idx + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-text-primary">{phase.phase_name}</h4>
                        {(phase.age_min || phase.age_max) && (
                          <span className="text-[10px] text-text-secondary">
                            ({phase.age_min || "?"}–{phase.age_max || "?"} thn)
                          </span>
                        )}
                      </div>

                      {phase.big_win_title && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Award size={12} className="text-accent shrink-0" />
                          <span className="text-xs text-text-secondary">{phase.big_win_title}</span>
                        </div>
                      )}

                      {phase.small_win_templates && phase.small_win_templates.length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          {phase.small_win_templates.map((sw: any) => (
                            <div
                              key={sw.id}
                              className="flex items-center gap-1.5 text-[11px] text-text-secondary"
                            >
                              <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                              <span>{sw.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-bg via-bg/95 to-transparent pt-8 pb-6 px-6">
          <div className="max-w-content mx-auto space-y-2">
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-lg"
              onClick={handleStart}
              disabled={starting || isLoading}
            >
              {starting ? "Memulai..." : "Coba Gratis 3 Hari"} <ChevronRight size={16} />
            </Button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <LogIn size={14} /> Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
