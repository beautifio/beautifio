"use client";

import { ShieldCheck, Trophy, Sparkles, TrendingUp, Heart } from "lucide-react";

interface GrowthReflectionSectionProps {
  dreamSlug: string;
  dreamTitle: string;
  totalDone: number;
  totalTarget: number;
}

const MESSAGES = [
  "Kegagalan adalah data — kamu sekarang tahu apa yang belum berhasil.",
  "Proses lebih penting dari hasil — kamu tetap bertumbuh.",
  "Setiap langkah, maju atau mundur, adalah progres.",
  "Kamu lebih kuat dari yang kamu kira — buktinya kamu masih di sini.",
];

export function GrowthReflectionSection({ dreamSlug, dreamTitle, totalDone, totalTarget }: GrowthReflectionSectionProps) {
  const pct = totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;
  const doneAny = totalDone > 0;

  return (
    <div className="space-y-4">
      {/* Growth Progress */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-success/5 to-primary/5 border border-success/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Trophy size={20} className="text-success" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Growth Wins</h3>
            <p className="text-[10px] text-text-secondary">
              {totalDone} dari {totalTarget} milestone - {pct}% terselesaikan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-bold text-success">{pct}%</span>
        </div>
      </div>

      {/* What You've Gained (instead of "You Failed") */}
      {doneAny && (
        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Yang Telah Kamu Peroleh</span>
          </div>
          <ul className="space-y-1.5">
            <li className="flex items-start gap-2 text-[11px] text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
              Disiplin dan konsistensi dalam latihan
            </li>
            <li className="flex items-start gap-2 text-[11px] text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
              Pemahaman lebih dalam tentang {dreamTitle}
            </li>
            <li className="flex items-start gap-2 text-[11px] text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
              Mental lebih tangguh dalam menghadapi tantangan
            </li>
            <li className="flex items-start gap-2 text-[11px] text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
              Kemampuan belajar mandiri
            </li>
          </ul>
        </div>
      )}

      {/* Encouragement */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-2">
          <Heart size={14} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-text-primary">Ingatlah</p>
            <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
              {MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}
            </p>
            <p className="text-[11px] text-text-secondary mt-2 leading-relaxed">
              Perjalanan menuju {dreamTitle} bukanlah garis lurus. Setiap tantangan adalah bagian dari proses.
              Teruslah melangkah, apapun yang terjadi.
            </p>
          </div>
        </div>
      </div>

      {/* Life Capital Growth */}
      <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200/50">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-purple-600" />
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Life Capital Growth</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-white/60 dark:bg-white/5">
            <p className="text-[10px] text-text-secondary">Knowledge</p>
            <p className="text-xs font-bold text-text-primary">+3 poin</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/60 dark:bg-white/5">
            <p className="text-[10px] text-text-secondary">Character</p>
            <p className="text-xs font-bold text-text-primary">+5 poin</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/60 dark:bg-white/5">
            <p className="text-[10px] text-text-secondary">Skill</p>
            <p className="text-xs font-bold text-text-primary">+2 poin</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/60 dark:bg-white/5">
            <p className="text-[10px] text-text-secondary">Spiritual</p>
            <p className="text-xs font-bold text-text-primary">+1 poin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
