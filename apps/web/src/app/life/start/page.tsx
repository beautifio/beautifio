"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles, GraduationCap, Heart, Brain, Users, Target, Compass } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import {
  STAGE_INFO, ZONE_INFO,
  completeOnboarding,
} from "@beautifio/utils";
import type { LifeStage, GrowthZone, SpiritualPreference } from "@beautifio/types";

const STAGES: LifeStage[] = ["sd", "smp", "sma", "university", "early-career", "professional", "mastery"];
const ZONES: GrowthZone[] = ["comfort", "fear", "learning", "growth"];

const SPIRIT_PREFS: { value: SpiritualPreference; label: string; emoji: string }[] = [
  { value: "islam", label: "Islam", emoji: "🕌" },
  { value: "kristen", label: "Kristen", emoji: "⛪" },
  { value: "katholik", label: "Katolik", emoji: "✝️" },
  { value: "hindu", label: "Hindu", emoji: "🕉️" },
  { value: "buddha", label: "Buddha", emoji: "☸️" },
  { value: "konghucu", label: "Konghucu", emoji: "🏮" },
];

const DREAMS = [
  { slug: "football-player", title: "Pemain Bola", emoji: "⚽" },
  { slug: "doctor", title: "Dokter", emoji: "🩺" },
  { slug: "entrepreneur", title: "Pengusaha", emoji: "💼" },
  { slug: "programmer", title: "Programmer", emoji: "💻" },
  { slug: "musician", title: "Musisi", emoji: "🎵" },
  { slug: "content-creator", title: "Content Creator", emoji: "🎬" },
  { slug: "digital-marketer", title: "Digital Marketer", emoji: "📱" },
  { slug: "runner", title: "Runner", emoji: "🏃" },
  { slug: "athlete", title: "Atlet", emoji: "🏅" },
  { slug: "beauty-creator", title: "Beauty Creator", emoji: "💄" },
  { slug: "golfer", title: "Pegolf", emoji: "⛳" },
];

export const dynamic = "force-dynamic";

export default function LifeEngineStart() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<LifeStage | null>(null);
  const [dreamSlug, setDreamSlug] = useState<string | null>(null);
  const [zone, setZone] = useState<GrowthZone | null>(null);
  const [spiritualPref, setSpiritualPref] = useState<SpiritualPreference | null>(null);
  const [saving, setSaving] = useState(false);

  const canProceed = (() => {
    if (step === 0) return stage !== null;
    if (step === 1) return true;
    if (step === 2) return zone !== null;
    if (step === 3) return spiritualPref !== null;
    return true;
  })();

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    setSaving(true);
    completeOnboarding(stage!, dreamSlug, zone!, spiritualPref!);
    await new Promise((r) => setTimeout(r, 600));
    router.push("/journey");
  };

  function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
      <div className="flex items-center gap-1.5 mb-8">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= current ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>
    );
  }

  function OptionGrid<T extends string>({ options, selected, onChange, getLabel, getEmoji }: {
    options: T[];
    selected: T | null;
    onChange: (val: T) => void;
    getLabel: (val: T) => string;
    getEmoji?: (val: T) => string;
  }) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <button key={opt} onClick={() => onChange(opt)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer text-left ${
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-text-secondary hover:border-primary/30 hover:text-text-primary hover:bg-muted/30"
              }`}
            >
              {getEmoji && <span className="text-lg">{getEmoji(opt)}</span>}
              <span>{getLabel(opt)}</span>
              {active && <Check size={16} className="ml-auto flex-shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-8 pb-8 min-h-screen flex flex-col">
        <StepIndicator current={step} total={4} />

        {step === 0 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap size={22} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Apa statusmu saat ini?</h1>
              <p className="text-sm text-text-secondary mt-2">Kami akan menyesuaikan perjalananmu berdasarkan tahap hidupmu.</p>
            </div>
            <OptionGrid
              options={STAGES}
              selected={stage}
              onChange={setStage}
              getLabel={(s) => STAGE_INFO[s].label}
              getEmoji={(s) => STAGE_INFO[s].emoji}
            />
            <div className="mt-3 text-center">
              <p className="text-xs text-text-secondary">
                {stage ? STAGE_INFO[stage].ageRange + " · " + STAGE_INFO[stage].description : "Pilih statusmu di atas"}
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Target size={22} className="text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Apa impianmu?</h1>
              <p className="text-sm text-text-secondary mt-2">Pilih bidang yang paling sesuai — atau lewati dulu jika belum yakin.</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 flex-1">
              {DREAMS.map((d) => {
                const active = dreamSlug === d.slug;
                return (
                  <button key={d.slug} onClick={() => setDreamSlug(d.slug)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer text-left ${
                      active
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border text-text-secondary hover:border-accent/30 hover:text-text-primary hover:bg-muted/30"
                    }`}
                  >
                    <span className="text-lg">{d.emoji}</span>
                    <span>{d.title}</span>
                    {active && <Check size={16} className="ml-auto flex-shrink-0 text-accent" />}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setDreamSlug(null)}
              className={`mt-3 w-full py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                dreamSlug === null
                  ? "border-text-secondary/30 bg-text-secondary/5 text-text-primary"
                  : "border-border text-text-secondary hover:border-text-secondary/30"
              }`}
            >
              {dreamSlug === null ? "✓ Lewati — belum yakin" : "Lewati dulu"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Compass size={22} className="text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Kondisi kamu saat ini paling mirip yang mana?</h1>
              <p className="text-sm text-text-secondary mt-2">Tidak ada jawaban benar atau salah. Pilih yang paling menggambarkan dirimu saat ini.</p>
            </div>
            <div className="space-y-3">
              {ZONES.map((z) => {
                const info = ZONE_INFO[z];
                const active = zone === z;
                return (
                  <button key={z} onClick={() => setZone(z)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      active
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        : "border-border hover:border-amber-300 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0 mt-0.5">{info.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${active ? "text-amber-700" : "text-text-primary"}`}>
                          {info.friendlyLabel}
                        </p>
                        <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{info.friendlyDescription}</p>
                        <p className="text-[10px] text-text-secondary/50 mt-1">({info.label})</p>
                      </div>
                      {active && <Check size={18} className="flex-shrink-0 text-amber-500 mt-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <Heart size={22} className="text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Bagaimana dengan spiritualitas?</h1>
              <p className="text-sm text-text-secondary mt-2">Kami akan menyesuaikan praktik harian dengan keyakinanmu.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SPIRIT_PREFS.map((p) => {
                const active = spiritualPref === p.value;
                return (
                  <button key={p.value} onClick={() => setSpiritualPref(p.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer text-left ${
                      active
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700"
                        : "border-border text-text-secondary hover:border-purple-300 hover:text-text-primary hover:bg-muted/30"
                    }`}
                  >
                    <span className="text-lg">{p.emoji}</span>
                    <span>{p.label}</span>
                    {active && <Check size={16} className="ml-auto flex-shrink-0 text-purple-500" />}
                  </button>
                );
              })}
            </div>
            {spiritualPref && (
              <div className="mt-4 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100">
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Kamu akan mendapatkan saran praktik harian yang sesuai dengan {SPIRIT_PREFS.find((p) => p.value === spiritualPref)?.label}.
                  Bisa diubah kapan saja di dashboard.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
          {step > 0 && (
            <Button variant="ghost" size="lg" onClick={() => setStep((s) => s - 1)} className="flex-1">
              <ArrowLeft size={16} /> Kembali
            </Button>
          )}
          <Button
            variant={step === 3 ? "accent" : "primary"}
            size="lg"
            onClick={handleNext}
            disabled={!canProceed || saving}
            loading={saving}
            className={step > 0 ? "flex-1" : "w-full"}
          >
            {step === 3 ? "Mulai Perjalanan" : "Lanjut"}
            {!saving && <ArrowRight size={16} />}
          </Button>
        </div>

        <p className="text-xs text-text-secondary text-center mt-4">Langkah {step + 1} dari 4</p>
      </div>
    </div>
  );
}
