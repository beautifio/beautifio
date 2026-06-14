"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Heart, MapPin, Minus, Plus, Sparkles } from "lucide-react";
import { Button } from "@beautifio/ui";
import { getBenchmarkForTemplate, determineUserPhase } from "@beautifio/utils";
import { saveGuestJourney } from "@/lib/guest-journey";
import type { DreamTemplate, OnboardingQuestion } from "@beautifio/types";

interface GuestOnboardingModalProps {
  open: boolean;
  template: DreamTemplate;
  onClose: () => void;
}

export function GuestOnboardingModal({
  open,
  template,
  onClose,
}: GuestOnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ageError, setAgeError] = useState<string | null>(null);

  const benchmark = getBenchmarkForTemplate(template.slug);
  const questions: OnboardingQuestion[] = (benchmark?.onboarding || []).filter((q) => q.type === "single_select");
  const totalSteps = 2 + (questions.length > 0 ? 1 : 0);

  const phaseInfo = age && benchmark
    ? determineUserPhase(benchmark.slug, age)
    : null;

  const canProceed = () => {
    if (step === 0) return age !== null && age >= 10 && age <= 40 && ageError === null;
    if (step === 1 && questions.length > 0) return questions.every((q) => answers[q.id]);
    return true;
  };

  const handleAgeChange = (value: string) => {
    const v = parseInt(value);
    if (isNaN(v)) {
      setAge(null);
      setAgeError(null);
    } else if (v < 10) {
      setAge(v);
      setAgeError("Usia minimal 10 tahun");
    } else if (v > 40) {
      setAge(v);
      setAgeError("Usia maksimal 40 tahun");
    } else {
      setAge(v);
      setAgeError(null);
    }
  };

  const adjustAge = (delta: number) => {
    const current = age ?? 10;
    const next = Math.max(10, Math.min(40, current + delta));
    setAge(next);
    setAgeError(null);
  };

  const handleFinish = () => {
    if (!template || !age) return;

    saveGuestJourney({
      templateSlug: template.slug,
      userAge: age,
      onboardingAnswers: answers,
      startDate: new Date().toISOString().split("T")[0],
      completedActivities: {},
      activityNotes: {},
    });

    onClose();
    router.push(`/coba/${benchmark?.slug || template.slug}`);
  };

  const reset = () => {
    setStep(0);
    setAge(null);
    setAnswers({});
    setAgeError(null);
  };

  if (!open || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div
        className="w-full max-w-content bg-surface rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface z-10 pt-5 pb-3 px-6 border-b border-border">
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div className="w-8 shrink-0" />
            )}
            <div className="flex-1 flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i <= step ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => { reset(); onClose(); }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer shrink-0"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>
        </div>

        <div className="px-6 pt-6 pb-6">
          {/* Step 1: Age + Phase Preview */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin size={26} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Berapa Usiamu?</h2>
                <p className="text-sm text-text-secondary mt-1.5">
                  Untuk menentukan fase perjalanan yang tepat
                </p>
              </div>

              <div className="max-w-[200px] mx-auto">
                <label className="block text-sm font-semibold text-text-primary mb-3 text-center">Usia</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjustAge(-1)}
                    className="w-11 h-11 rounded-xl border border-border flex items-center justify-center text-text-secondary hover:bg-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    min={10}
                    max={40}
                    placeholder="18"
                    value={age !== null ? String(age) : ""}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    className="w-full text-center text-2xl font-bold text-text-primary bg-muted/50 rounded-xl border border-border py-3 outline-none focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => adjustAge(1)}
                    className="w-11 h-11 rounded-xl border border-border flex items-center justify-center text-text-secondary hover:bg-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {ageError && (
                <p className="text-xs text-destructive text-center">{ageError}</p>
              )}

              {phaseInfo?.phase && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles size={14} className="text-accent" />
                    <p className="text-xs font-semibold text-accent uppercase tracking-wider">Fase Kamu</p>
                  </div>
                  <p className="text-sm text-text-primary">
                    Kamu akan memulai di{" "}
                    <span className="font-bold text-accent">
                      {phaseInfo.phase.phase_name}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                    <span>Fase {phaseInfo.phase.phase_number}</span>
                    <span className="w-1 h-1 rounded-full bg-text-secondary/30" />
                    <span>
                      {phaseInfo.phase.age_min}–{phaseInfo.phase.age_max} tahun
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Questions */}
          {step === 1 && questions.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={26} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Ceritakan Tentang Dirimu</h2>
                <p className="text-sm text-text-secondary mt-1.5">Agar saran aktivitas lebih personal</p>
              </div>

              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.id}>
                    <p className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      {q.label}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {(q.options || []).map((opt) => {
                        const selected = answers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                            className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all cursor-pointer flex items-center gap-3 ${
                              selected
                                ? "border-primary bg-primary/8 text-text-primary font-semibold ring-1 ring-primary/20"
                                : "border-border bg-surface text-text-secondary hover:border-primary/30 hover:bg-muted/30"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                selected
                                  ? "border-primary bg-primary"
                                  : "border-text-secondary/30"
                              }`}
                            >
                              {selected && <Check size={12} className="text-white" />}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1b (no questions): confirmation */}
          {step === 1 && questions.length === 0 && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Heart size={26} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Siap Memulai!</h2>
              <p className="text-sm text-text-secondary mt-1.5">
                Kamu akan mencoba perjalanan{" "}
                <span className="font-semibold text-text-primary">
                  {template.emoji} {template.title}
                </span>
              </p>
              {phaseInfo?.phase && (
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 text-left inline-block min-w-[240px]">
                  <p className="text-xs text-accent font-semibold tracking-wider uppercase mb-1">Fase Awal</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {phaseInfo.phase.phase_name}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Fase {phaseInfo.phase.phase_number} · {phaseInfo.phase.age_min}–{phaseInfo.phase.age_max} tahun
                  </p>
                </div>
              )}
              <p className="text-xs text-text-secondary/60 mt-5">
                Trial gratis 3 hari. Tidak perlu daftar.
              </p>
            </div>
          )}

          {/* Step 3 / Summary */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Heart size={26} className="text-success" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Siap Memulai!</h2>
                <p className="text-sm text-text-secondary mt-1.5">Periksa kembali sebelum memulai</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-3">
                  <span className="text-2xl">{template.emoji}</span>
                  <div>
                    <p className="text-xs text-text-secondary">Mimpi</p>
                    <p className="text-sm font-semibold text-text-primary">{template.title}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {age}
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Usia</p>
                    <p className="text-sm font-semibold text-text-primary">{age} tahun</p>
                  </div>
                </div>
                {phaseInfo?.phase && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Sparkles size={16} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-accent font-semibold tracking-wider uppercase">Fase Awal</p>
                      <p className="text-sm font-bold text-accent">{phaseInfo.phase.phase_name}</p>
                      <p className="text-[11px] text-text-secondary/70">
                        Fase {phaseInfo.phase.phase_number} · {phaseInfo.phase.age_min}–{phaseInfo.phase.age_max} tahun
                      </p>
                    </div>
                  </div>
                )}
                {Object.keys(answers).length > 0 && (
                  <div className="p-4 rounded-xl bg-surface border border-border">
                    <p className="text-xs text-text-secondary mb-3 font-semibold uppercase tracking-wider">Jawaban Kamu</p>
                    <div className="space-y-2.5">
                      {questions.map((q) => (
                        answers[q.id] && (
                          <div key={q.id} className="flex items-start gap-2">
                            <Check size={14} className="text-success mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-text-secondary">{q.label}</p>
                              <p className="text-sm font-medium text-text-primary">{answers[q.id]}</p>
                            </div>
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
          <Button
            variant="primary"
            size="lg"
            className="w-full shadow-lg"
            onClick={() => {
              if (step < totalSteps - 1) {
                setStep(step + 1);
              } else {
                handleFinish();
              }
            }}
            disabled={!canProceed()}
          >
            {step < totalSteps - 1 ? (
              <span className="flex items-center gap-2">
                Lanjut <ArrowRight size={16} />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Heart size={16} /> Mulai Coba Gratis
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
