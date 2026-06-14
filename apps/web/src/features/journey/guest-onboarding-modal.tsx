"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Heart, MapPin, Sparkles } from "lucide-react";
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
  const questions: OnboardingQuestion[] = benchmark?.onboarding || [];
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
              onClick={() => { reset(); onClose(); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>
        </div>

        <div className="px-6 pt-4 pb-6">
          {/* Step 1: Age + Phase Preview */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MapPin size={24} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Berapa Usiamu?</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Untuk menentukan fase yang tepat untuk perjalananmu
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Usia</label>
                <input
                  type="number"
                  min={10}
                  max={40}
                  placeholder="Masukkan usiamu"
                  value={age !== null ? String(age) : ""}
                  onChange={(e) => handleAgeChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-secondary/40 outline-none focus:border-primary transition-colors"
                />
              </div>

              {ageError && (
                <p className="text-xs text-destructive text-center">{ageError}</p>
              )}

              {phaseInfo?.phase && (
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-accent" />
                    <p className="text-xs font-semibold text-accent uppercase tracking-wide">Fase Kamu</p>
                  </div>
                  <p className="text-sm text-text-primary font-semibold">
                    Berdasarkan usiamu ({age} tahun), kamu akan mulai di{" "}
                    <span className="text-accent">
                      Fase {phaseInfo.phase.phase_number}: {phaseInfo.phase.phase_name}
                    </span>
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Rentang usia fase ini: {phaseInfo.phase.age_min}–{phaseInfo.phase.age_max} tahun
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Questions */}
          {step === 1 && questions.length > 0 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Ceritakan Tentang Dirimu</h2>
                <p className="text-sm text-text-secondary mt-1">Agar perjalananmu lebih personal</p>
              </div>

              <div className="space-y-5">
                {questions.map((q) => (
                  <div key={q.id}>
                    <p className="text-sm font-semibold text-text-primary mb-2">{q.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {(q.options || []).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
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

          {/* Step 1b (no questions): confirmation */}
          {step === 1 && questions.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <Heart size={24} className="text-success" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Siap Memulai!</h2>
              <p className="text-sm text-text-secondary mt-1">
                Kamu akan mencoba perjalanan mimpi{" "}
                <span className="font-semibold text-text-primary">
                  {template.emoji} {template.title}
                </span>
              </p>
              {phaseInfo?.phase && (
                <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/20 text-left">
                  <p className="text-sm text-text-primary">
                    Mulai di{" "}
                    <span className="font-semibold text-accent">
                      Fase {phaseInfo.phase.phase_number}: {phaseInfo.phase.phase_name}
                    </span>
                  </p>
                </div>
              )}
              <p className="text-xs text-text-secondary/70 mt-4">
                Trial gratis 3 hari. Tidak perlu daftar.
              </p>
            </div>
          )}

          {/* Step 3 / Summary */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <Heart size={24} className="text-success" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Siap Memulai!</h2>
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
                  <p className="text-sm font-semibold text-text-primary">{age} tahun</p>
                </div>
                {phaseInfo?.phase && (
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <p className="text-xs text-text-secondary mb-1">Fase Awal</p>
                    <p className="text-sm font-semibold text-accent">
                      Fase {phaseInfo.phase.phase_number}: {phaseInfo.phase.phase_name}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Rentang usia: {phaseInfo.phase.age_min}–{phaseInfo.phase.age_max} tahun
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
                            <span className="text-text-secondary shrink-0">{q.question}</span>
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
          <Button
            variant="primary"
            size="lg"
            className="w-full"
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
              <>Lanjut <ArrowRight size={16} /></>
            ) : (
              <><Heart size={16} /> Mulai Coba Gratis</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
