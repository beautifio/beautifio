"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, Sparkles, Target, Clock,
  MapPin, GraduationCap, Heart, Brain, Users,
} from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export const dynamic = "force-dynamic";

interface OnboardingData {
  age: number | null;
  city: string;
  status: string[];
  goals: string[];
  timeline: string;
  challenges: string[];
  availableTime: string;
}

const steps = [
  { id: "age", title: "Usia", subtitle: "Berapa usiamu?", icon: Heart, input: true, type: "number" },
  { id: "city", title: "Kota", subtitle: "Kamu tinggal di mana?", icon: MapPin, input: true },
  { id: "status", title: "Status", subtitle: "Apa statusmu saat ini?", icon: GraduationCap, options: ["Pelajar SMA/SMK", "Mahasiswa", "Fresh Graduate", "Bekerja", "Mencari Pekerjaan"], multi: true },
  { id: "goals", title: "Tujuan Utama", subtitle: "Apa yang ingin kamu capai?", icon: Target, options: ["Menentukan Karir", "Mengembangkan Skill", "Membangun Relasi", "Mencari Beasiswa", "Mendapatkan Mentor", "Memulai Bisnis"], multi: true, max: 3 },
  { id: "timeline", title: "Target Waktu", subtitle: "Kapan kamu ingin mencapainya?", icon: Clock, options: ["3 Bulan", "6 Bulan", "1 Tahun", "2 Tahun+"] },
  { id: "challenges", title: "Tantangan", subtitle: "Apa tantangan terbesarmu?", icon: Brain, options: ["Bingung Arah", "Kurang Mentor", "Tidak Ada Relasi", "Motivasi Turun", "Kurang Pengalaman", "Tidak Punya Waktu"], multi: true },
  { id: "time", title: "Waktu", subtitle: "Berapa waktu yang bisa kamu luangkan per hari?", icon: Clock, options: ["1-2 Jam", "3-4 Jam", "5+ Jam", "Fleksibel"] },
];

const circles = [
  { id: "1", name: "Tech Founders", desc: "Untuk kamu yang ingin membangun startup teknologi.", members: 340, tag: "Kewirausahaan" },
  { id: "2", name: "Creative Lab", desc: "Ruang berkarya untuk desainer, penulis, dan content creator.", members: 280, tag: "Kreatif" },
  { id: "3", name: "Future Leaders", desc: "Kaderisasi kepemimpinan muda untuk perubahan sosial.", members: 510, tag: "Kepemimpinan" },
  { id: "4", name: "Green Warriors", desc: "Komunitas peduli lingkungan dengan aksi nyata.", members: 195, tag: "Lingkungan" },
];

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

function SelectGrid({
  options,
  selected,
  onChange,
  multi = false,
  max,
}: {
  options: string[];
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
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`flex items-center justify-center p-4 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
              active
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-text-secondary hover:border-primary/30 hover:text-text-primary hover:bg-muted/30"
            } ${multi && active && max && selected.length >= max ? "ring-2 ring-accent/30" : ""}`}
          >
            {opt}
            {active && <Check size={16} className="ml-2 flex-shrink-0 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}

function MatchingScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<"matching" | "results">("matching");
  const [joined, setJoined] = useState<string[]>([]);

  const toggleJoin = (id: string) => {
    setJoined((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useState(() => {
    const timer = setTimeout(() => setPhase("results"), 2500);
    return () => clearTimeout(timer);
  });

  if (phase === "matching") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">Mencocokkan Circle</p>
          <p className="text-sm text-text-secondary mt-2">
            Kami sedang mencari circle yang paling cocok untukmu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={24} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">
          Circle Rekomendasi
        </h2>
        <p className="text-sm text-text-secondary mt-2">
          Berdasarkan jawabanmu, kami menemukan circle yang cocok untukmu.
        </p>
      </div>

      <div className="space-y-3">
        {circles.map((c) => {
          const isJoined = joined.includes(c.id);
          return (
            <div
              key={c.id}
              className={`p-5 rounded-xl border-2 transition-all ${
                isJoined ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <Badge variant="secondary">{c.tag}</Badge>
                  <h3 className="text-base font-bold text-text-primary mt-2">
                    {c.name}
                  </h3>
                </div>
                <span className="text-xs text-text-secondary flex-shrink-0">
                  {c.members} anggota
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {c.desc}
              </p>
              <button
                onClick={() => toggleJoin(c.id)}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isJoined
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-text-primary hover:bg-primary/10"
                }`}
              >
                {isJoined ? "✓ Tergabung" : "Gabung Circle"}
              </button>
            </div>
          );
        })}
      </div>

      <Button
        variant="accent"
        size="lg"
        className="w-full mt-2"
        onClick={onComplete}
      >
        Ke Beranda <ArrowRight size={16} />
      </Button>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showMatching, setShowMatching] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    age: null,
    city: "",
    status: [],
    goals: [],
    timeline: "",
    challenges: [],
    availableTime: "",
  });

  const update = useCallback((key: keyof OnboardingData, val: string[]) => {
    if (key === "age") {
      const num = parseInt(val[0], 10);
      setData((prev) => ({ ...prev, age: isNaN(num) ? null : num }));
    } else {
      setData((prev) => ({ ...prev, [key]: key === "city" ? val[0] || "" : val }));
    }
  }, []);

  const canProceed = (() => {
    const s = steps[step];
    const val = data[s.id as keyof OnboardingData];
    if (s.id === "age") return data.age !== null && data.age >= 10 && data.age <= 40;
    if (s.input) return (val as string)?.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    return !!val;
  })();

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setSaving(true);

    if (user && supabase) {
      const updateData: Record<string, unknown> = {
        city: data.city,
        last_active_at: new Date().toISOString(),
      };

      if (data.age && data.age >= 10 && data.age <= 40) {
        const birthDate = new Date();
        birthDate.setFullYear(birthDate.getFullYear() - data.age);
        updateData.birth_date = birthDate.toISOString().split("T")[0];
      }

      await supabase.from("users").update(updateData).eq("id", user.id);

      const { error: goalsErr } = await supabase.from("user_goals").insert(
        data.goals.map((g) => ({
          user_id: user.id,
          goal_name: g,
          goal_category: g.toLowerCase().includes("karir")
            ? "karir"
            : g.toLowerCase().includes("skill")
            ? "skill"
            : g.toLowerCase().includes("bisnis")
            ? "bisnis"
            : "pendidikan",
          target_date: data.timeline === "3 Bulan"
            ? new Date(Date.now() + 90 * 86400000).toISOString()
            : data.timeline === "6 Bulan"
            ? new Date(Date.now() + 180 * 86400000).toISOString()
            : data.timeline === "1 Tahun"
            ? new Date(Date.now() + 365 * 86400000).toISOString()
            : new Date(Date.now() + 730 * 86400000).toISOString(),
        }))
      );

      if (goalsErr) console.error("Failed to save goals:", goalsErr);
    }

    if (!supabase) {
      await new Promise((r) => setTimeout(r, 800));
    }

    setSaving(false);
    setShowMatching(true);
  };

  const handleComplete = () => {
    router.push("/home");
  };

  if (showMatching) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-content mx-auto px-6 pt-12 pb-8">
          <MatchingScreen onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  const s = steps[step];
  const Icon = s.icon;
  const currentVal = (() => {
    const val = data[s.id as keyof OnboardingData];
    if (Array.isArray(val)) return val;
    if (s.id === "age") return data.age ? [String(data.age)] : [];
    return val ? [String(val)] : [];
  })();

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-8 pb-8 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col">
          <StepIndicator current={step} total={steps.length} />

          <div className="flex-1">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon size={22} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">
                {s.subtitle}
              </h1>
              {step === 0 && (
                <p className="text-sm text-text-secondary mt-2">
                  Ini membantu kami merekomendasikan yang terbaik untukmu.
                </p>
              )}
            </div>

            {s.input ? (
              s.type === "number" ? (
                <div className="space-y-3">
                  <input
                    autoFocus
                    type="number"
                    min={10}
                    max={40}
                    placeholder="Contoh: 16"
                    value={data.age ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        update("age", []);
                      } else {
                        const num = parseInt(val, 10);
                        if (!isNaN(num) && num >= 10 && num <= 40) {
                          update("age", [val]);
                        }
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
                    className="w-full h-13 px-4 rounded-xl border border-border bg-surface text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20 text-center text-2xl font-bold"
                  />
                  <p className="text-xs text-text-secondary text-center">
                    Masukkan usia dalam angka (10–40 tahun)
                  </p>
                </div>
              ) : (
                <input
                  autoFocus
                  placeholder="Contoh: Sleman, Yogyakarta"
                  value={(data.city as string) || ""}
                  onChange={(e) => update("city", [e.target.value])}
                  onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
                  className="w-full h-13 px-4 rounded-xl border border-border bg-surface text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              )
            ) : (
              <SelectGrid
                options={s.options || []}
                selected={currentVal}
                onChange={(val) => update(s.id as keyof OnboardingData, val)}
                multi={s.multi}
                max={s.max}
              />
            )}

            {s.multi && s.max && (
              <p className="text-xs text-text-secondary mt-3 text-center">
                Pilih maksimal {s.max}
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
              variant={step === steps.length - 1 ? "accent" : "primary"}
              size="lg"
              onClick={handleNext}
              disabled={!canProceed || saving}
              loading={saving}
              className={step > 0 ? "flex-1" : "w-full"}
            >
              {step === steps.length - 1
                ? "Simpan & Lanjutkan"
                : "Lanjut"}
              {!saving && <ArrowRight size={16} />}
            </Button>
          </div>
        </div>

        <p className="text-xs text-text-secondary text-center mt-4">
          Langkah {step + 1} dari {steps.length}
        </p>
      </div>
    </div>
  );
}
