"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Heart, MapPin, Sparkles,
} from "lucide-react";
import { Button, Input } from "@beautifio/ui";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { createJourney, journeyUrl } from "@/lib/journey-queries";
import { getDreamTemplate } from "@beautifio/utils";
import type { DreamTemplate } from "@beautifio/types";

interface OnboardingQuestion {
  id: string;
  label: string;
  type: "single_select";
  options: string[];
}

interface PhasePreview {
  phase_name: string;
  phase_number: number;
  age_min: number;
  age_max: number;
}

interface JourneyOnboardingModalProps {
  open: boolean;
  template: DreamTemplate;
  onClose: () => void;
}

export function JourneyOnboardingModal({
  open,
  template,
  onClose,
}: JourneyOnboardingModalProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<number | null>(null);
  const [phasePreview, setPhasePreview] = useState<PhasePreview | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions: OnboardingQuestion[] = (template as any)?.onboarding_questions || [];

  const totalSteps = 2 + (questions.length > 0 ? 1 : 0);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setAge(null);
      setPhasePreview(null);
      setAnswers({});
      setCreating(false);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!age || age < 10 || age > 40 || !supabase) {
      setPhasePreview(null);
      return;
    }
    supabase
      .rpc("determine_current_phase", {
        p_user_age: age,
        p_template_slug: template.slug,
      })
      .then(({ data, error: rpcErr }: any) => {
        if (rpcErr || !data || data.length === 0) {
          setPhasePreview(null);
          return;
        }
        setPhasePreview({
          phase_name: data[0].phase_name,
          phase_number: data[0].phase_number,
          age_min: data[0].age_min,
          age_max: data[0].age_max,
        });
      });
  }, [age, template.slug]);

  const canProceedStep = () => {
    if (step === 0) return age !== null && age >= 10 && age <= 40;
    if (step === 1 && questions.length > 0) {
      return questions.every((q) => answers[q.id]);
    }
    return true;
  };

  const handleFinish = async () => {
    if (!user || creating) return;
    setCreating(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Supabase not configured");

      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - age!);
      const birthDateStr = birthDate.toISOString().split("T")[0];

      const { error: updateErr } = await supabase
        .from("users")
        .update({ birth_date: birthDateStr })
        .eq("id", user.id);
      if (updateErr) console.error("Failed to save birth_date", updateErr);

      if (Object.keys(answers).length > 0) {
        await supabase
          .from("users")
          .update({ onboarding_data: answers as any })
          .eq("id", user.id);
      }

      const journey = await createJourney(
        user.id,
        template.slug,
        template.title,
        template.emoji,
        template.category,
        age
      );

      if (journey) {
        router.refresh();
        router.push(journeyUrl(journey));
      } else {
        setError("Gagal membuat perjalanan. Coba lagi.");
        setCreating(false);
      }
    } catch (e: any) {
      setError(e?.message || "Terjadi kesalahan. Coba lagi.");
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div
        className="w-full max-w-content bg-surface rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface z-10 pt-4 pb-2 px-6 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <div className="flex-1 flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    i <= step ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>
        </div>

        <div className="px-6 pt-4 pb-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          {/* Step 1: Age Input + Phase Preview */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MapPin size={24} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">
                  Berapa Usiamu?
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Untuk menentukan fase yang tepat untuk perjalananmu
                </p>
              </div>

              <Input
                label="Usia"
                type="number"
                min={10}
                max={40}
                placeholder="Masukkan usiamu"
                value={age !== null ? String(age) : ""}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setAge(isNaN(v) ? null : v);
                }}
              />

              {age !== null && (age < 10 || age > 40) && (
                <p className="text-xs text-destructive text-center">
                  Usia harus antara 10–40 tahun
                </p>
              )}

              {phasePreview && (
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-accent" />
                    <p className="text-xs font-semibold text-accent uppercase tracking-wide">
                      Fase Kamu
                    </p>
                  </div>
                  <p className="text-sm text-text-primary font-semibold">
                    Berdasarkan usiamu ({age} tahun), kamu akan mulai di{" "}
                    <span className="text-accent">
                      Fase {phasePreview.phase_number}: {phasePreview.phase_name}
                    </span>
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Rentang usia fase ini: {phasePreview.age_min}–{phasePreview.age_max} tahun
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Dream-specific Questions */}
          {step === 1 && questions.length > 0 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">
                  Ceritakan Tentang Dirimu
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Agar perjalananmu lebih personal
                </p>
              </div>

              <div className="space-y-5">
                {questions.map((q) => (
                  <div key={q.id}>
                    <p className="text-sm font-semibold text-text-primary mb-2">
                      {q.label}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                          }
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
                            answers[q.id] === opt
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border bg-surface text-text-secondary hover:border-primary/30"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1b (when no questions): just acts as age-only flow */}
          {step === 1 && questions.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <Heart size={24} className="text-success" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                Siap Memulai!
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Kamu akan memulai perjalanan mimpi{" "}
                <span className="font-semibold text-text-primary">
                  {template.emoji} {template.title}
                </span>
              </p>
              {phasePreview && (
                <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/20 text-left">
                  <p className="text-sm text-text-primary">
                    Mulai di <span className="font-semibold text-accent">
                      Fase {phasePreview.phase_number}: {phasePreview.phase_name}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3 / Summary */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <Heart size={24} className="text-success" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">
                  Siap Memulai!
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Periksa kembali sebelum memulai perjalanan
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-secondary mb-1">Mimpi</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {template.emoji} {template.title}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-secondary mb-1">Usia</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {age} tahun
                  </p>
                </div>

                {phasePreview && (
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <p className="text-xs text-text-secondary mb-1">Fase Awal</p>
                    <p className="text-sm font-semibold text-accent">
                      Fase {phasePreview.phase_number}: {phasePreview.phase_name}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Rentang usia: {phasePreview.age_min}–{phasePreview.age_max} tahun
                    </p>
                  </div>
                )}

                {Object.keys(answers).length > 0 && (
                  <div className="p-4 rounded-xl bg-surface border border-border">
                    <p className="text-xs text-text-secondary mb-2">Jawaban Kamu</p>
                    <div className="space-y-1.5">
                      {questions.map((q) => (
                        answers[q.id] && (
                          <div key={q.id} className="flex items-start gap-2 text-sm">
                            <span className="text-text-secondary shrink-0">{q.label}</span>
                            <span className="text-text-primary font-medium">: {answers[q.id]}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4">
          <div className="flex gap-3">
            {step < totalSteps - 1 ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setStep(step + 1)}
                disabled={!canProceedStep()}
              >
                Lanjut <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleFinish}
                loading={creating}
              >
                <Heart size={16} /> Mulai Perjalanan
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
