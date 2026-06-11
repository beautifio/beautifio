"use client";

import { GraduationCap, BookOpen, Target, Sparkles } from "lucide-react";
import type { LifeStage } from "@beautifio/types";
import { STAGE_INFO } from "@beautifio/utils";

interface StageAdaptedContentProps {
  stage: LifeStage;
  dreamTitle: string;
}

const STAGE_ADAPTATIONS: Record<string, { focus: string; tip: string; action: string }> = {
  sd: {
    focus: "Rasa ingin tahu dan kebiasaan belajar",
    tip: "Jangan terlalu serius! Yang penting kamu senang dulu dengan bidang ini.",
    action: "Coba 1 aktivitas menyenangkan terkait mimpi ini setiap minggu.",
  },
  smp: {
    focus: "Eksplorasi dan fondasi dasar",
    tip: "Ini waktu terbaik untuk mencoba berbagai hal. Gagal itu wajar di fase ini.",
    action: "Eksplor 1 cabang baru dari bidang ini setiap bulan.",
  },
  sma: {
    focus: "Pendalaman dan persiapan",
    tip: "Mulai serius. Tapi ingat, jalan menuju mimpi tidak selalu linier.",
    action: "Fokuskan energi pada 1-2 aspek terpenting dari bidang ini.",
  },
  university: {
    focus: "Pengembangan profesional",
    tip: "Portofolio > IPK. Bangun bukti nyata dari kemampuanmu.",
    action: "Cari 1 proyek nyata atau magang di bidang ini tahun ini.",
  },
  "early-career": {
    focus: "Spesialisasi awal",
    tip: "Jangan takut pivot. Pengalaman di bidang ini mengajarkan skill transferable.",
    action: "Kuasai 1 skill inti hingga level mahir.",
  },
  professional: {
    focus: "Puncak performa",
    tip: "Sekarang giliranmu untuk memimpin dan menginspirasi.",
    action: "Ambil 1 peran kepemimpinan atau mentoring.",
  },
  mastery: {
    focus: "Warisan dan legacy",
    tip: "Bagikan ilmumu. Generasi berikutnya butuh pengalamanmu.",
    action: "Mentori 1 orang atau buat 1 sumber belajar.",
  },
};

export function StageAdaptedContent({ stage, dreamTitle }: StageAdaptedContentProps) {
  const info = STAGE_INFO[stage];
  const adapt = STAGE_ADAPTATIONS[stage];
  if (!info || !adapt) return null;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <GraduationCap size={20} className="text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{info.emoji}</span>
            <span className="text-sm font-bold text-text-primary">{info.label}</span>
            <span className="text-[10px] text-text-secondary">({info.ageRange})</span>
          </div>
          <p className="text-[10px] text-text-secondary">{info.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5">
          <Target size={12} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-text-primary font-medium">{adapt.focus}</p>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-accent/5">
          <Sparkles size={12} className="text-accent flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-text-secondary italic">"{adapt.tip}"</p>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-success/5">
          <BookOpen size={12} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-text-primary font-semibold">{adapt.action}</p>
        </div>
      </div>
    </div>
  );
}
