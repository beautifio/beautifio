"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@beautifio/ui";
import { DISCOVERY_QUESTIONS } from "@beautifio/utils";
import type { DiscoveryAnswer } from "@beautifio/types";

const STORAGE_KEY = "beautifio_discovery_answers";

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
            i <= current ? "bg-primary" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function OptionGrid({
  options,
  selected,
  onChange,
  multi = false,
  max,
}: {
  options: { value: string; label: string; emoji: string }[];
  selected: string[];
  onChange: (val: string[]) => void;
  multi?: boolean;
  max?: number;
}) {
  const toggle = (val: string) => {
    if (multi) {
      if (selected.includes(val)) {
        onChange(selected.filter((s) => s !== val));
      } else {
        if (max && selected.length >= max) return;
        onChange([...selected, val]);
      }
    } else {
      onChange([val]);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`flex items-center gap-4 p-5 rounded-sm border-2 text-left transition-all cursor-pointer ${
              active
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30"
            }`}
          >
            <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
            <span className={`text-sm font-medium flex-1 ${
              active ? "text-primary" : "text-text-primary"
            }`}>
              {opt.label}
            </span>
            {active && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check size={14} className="text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const question = DISCOVERY_QUESTIONS[step];
  const currentVal = answers[question.id] ?? [];
  const isMulti = question.multi ?? false;
  const canProceed = currentVal.length > 0;

  const update = useCallback((val: string[]) => {
    setAnswers((prev) => ({ ...prev, [question.id]: val }));
  }, [question.id]);

  const handleNext = () => {
    if (step < DISCOVERY_QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      const full: DiscoveryAnswer[] = DISCOVERY_QUESTIONS.map((q) => ({
        questionId: q.id,
        question: q.question,
        answers: answers[q.id] ?? [],
        answerLabels: (answers[q.id] ?? []).map(
          (v) => q.options.find((o) => o.value === v)?.label ?? v
        ),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
      router.push("/discover/result");
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24 min-h-screen flex flex-col">
        <StepIndicator current={step} total={DISCOVERY_QUESTIONS.length} />

        <div className="flex-1 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">
              {question.question}
            </h1>
            <p className="text-sm text-text-secondary mt-2">
              {question.subtitle}
            </p>
          </div>

          <div className="flex-1">
            <OptionGrid
              options={question.options}
              selected={currentVal}
              onChange={update}
              multi={isMulti}
              max={question.max}
            />
            {isMulti && question.max && (
              <p className="text-xs text-text-secondary mt-3 text-center">
                Pilih maksimal {question.max}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
            {step > 0 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1"
              >
                <ArrowLeft size={16} /> Kembali
              </Button>
            )}
            <Button
              variant="accent"
              size="lg"
              onClick={handleNext}
              disabled={!canProceed}
              className={step > 0 ? "flex-1" : "w-full"}
            >
              {step === DISCOVERY_QUESTIONS.length - 1
                ? "Lihat Hasil"
                : "Lanjut"}
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        <p className="text-xs text-text-secondary text-center mt-4">
          Langkah {step + 1} dari {DISCOVERY_QUESTIONS.length}
        </p>
      </div>

    </div>
  );
}
