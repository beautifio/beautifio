"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Heart, ArrowRight, Compass } from "lucide-react";
import { Button, Card } from "@beautifio/ui";
import type { BigWin } from "@beautifio/types";
import {
  getJmEncouragement,
  getJmTransferableSkills,
  getJmCareerPaths,
} from "@beautifio/utils";

interface FailureModalProps {
  bigWin: BigWin;
  dreamSlug: string;
  developedSkills?: string[];
  onConfirm: () => void;
  onClose: () => void;
}

export function FailureModal({ bigWin, dreamSlug, developedSkills, onConfirm, onClose }: FailureModalProps) {
  const encouragements = useMemo(() => getJmEncouragement(dreamSlug), [dreamSlug]);
  const encouragement = useMemo(
    () => encouragements[Math.floor(Math.random() * encouragements.length)],
    [encouragements]
  );

  const transferableSkills = useMemo(() => getJmTransferableSkills(dreamSlug), [dreamSlug]);

  const careerPaths = useMemo(
    () => getJmCareerPaths(dreamSlug),
    [dreamSlug]
  );

  const [showAll, setShowAll] = useState(false);
  const visiblePaths = showAll ? careerPaths : careerPaths.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full max-w-content bg-bg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-warning" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Tidak apa-apa.</h2>
          <p className="text-sm text-text-secondary mt-2">{encouragement}</p>
        </div>

        <Card className="p-4 mb-4 bg-success/5 border-success/20">
          <h3 className="text-sm font-bold text-text-primary mb-3">
            ✨ Skill yang sudah kamu kembangkan:
          </h3>
          <div className="flex flex-wrap gap-2">
            {transferableSkills.map((s) => (
              <span
                key={s}
                className="text-xs px-3 py-1.5 rounded-full bg-success/10 text-success font-medium"
              >
                ✅ {s}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-4 mb-4 bg-accent/5 border-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <Compass size={16} className="text-accent" />
            <h3 className="text-sm font-bold text-text-primary">
              Alternatif masa depan:
            </h3>
          </div>
          <p className="text-xs text-text-secondary mb-4">
            Skill yang kamu pelajari berguna untuk banyak hal. Berikut beberapa jalur yang bisa kamu jelajahi:
          </p>

          <div className="space-y-3">
            {visiblePaths.map((path, i) => (
              <div key={i} className="p-3 rounded-xl bg-accent/5 border border-accent/10">
                <p className="text-sm font-bold text-text-primary">{path.title}</p>
                <p className="text-xs text-text-secondary mt-1">{path.description}</p>
                {path.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {path.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {path.benchmarks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-accent/10">
                    <p className="text-[10px] font-semibold text-text-secondary/60 mb-1">
                      Belajar dari:
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      {path.benchmarks[0].name} — {path.benchmarks[0].context}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {careerPaths.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full mt-3 py-2 text-xs font-semibold text-accent hover:text-accent/80 transition-colors cursor-pointer text-center"
            >
              Lihat Semua Peluang ({careerPaths.length} jalur)
            </button>
          )}
        </Card>

        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={onClose}
          >
            Masih Lanjut
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex-1"
            onClick={onConfirm}
          >
            Tandai Gagal
          </Button>
        </div>
      </div>
    </div>
  );
}
