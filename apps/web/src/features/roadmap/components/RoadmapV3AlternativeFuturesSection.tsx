"use client";

import type { AlternativeFuture } from "@beautifio/types";

interface Props {
  futures: AlternativeFuture[];
  mainTitle: string;
}

export function RoadmapV3AlternativeFuturesSection({ futures, mainTitle }: Props) {
  if (futures.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-text-secondary">Alternatif karir akan segera ditambahkan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/10">
        <h2 className="text-base font-bold text-text-primary">Alternative Futures</h2>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
          Jika jalur utama sebagai <strong className="text-text-primary">{mainTitle}</strong> tidak terjadi — atau jika
          kamu memutuskan untuk mengubah arah — masih ada banyak masa depan berharga yang menanti.
          Skill yang kamu bangun di perjalanan ini tidak akan pernah sia-sia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {futures.map((future, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-4 hover:border-primary/20 transition-colors">
            <h3 className="text-sm font-bold text-text-primary">{future.title}</h3>
            <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">{future.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {future.skills.map((skill) => (
                <span key={skill} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl p-5 border border-emerald-500/10">
        <div className="space-y-2">
          <p className="text-xs text-text-secondary italic leading-relaxed text-center">
            &ldquo;Your dream may evolve. Your skills remain valuable.&rdquo;
          </p>
          <p className="text-xs text-text-secondary italic leading-relaxed text-center">
            &ldquo;Every lesson learned creates new opportunities.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
