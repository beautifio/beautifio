"use client";

import { useState } from "react";
import { Sparkles, Trophy, ArrowRight, X } from "lucide-react";
import { Button, Card } from "@beautifio/ui";
import type { BigWin } from "@beautifio/types";

interface BigWinCelebrationProps {
  bigWin: BigWin;
  onSave: (reflection: {
    most_memorable_moment: string;
    who_helped: string;
    biggest_lesson: string;
    next_steps: string;
  }) => void;
  onClose: () => void;
}

export function BigWinCelebration({ bigWin, onSave, onClose }: BigWinCelebrationProps) {
  const [mostMemorable, setMostMemorable] = useState("");
  const [whoHelped, setWhoHelped] = useState("");
  const [biggestLesson, setBiggestLesson] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  const handleSave = () => {
    onSave({
      most_memorable_moment: mostMemorable,
      who_helped: whoHelped,
      biggest_lesson: biggestLesson,
      next_steps: nextSteps,
    });
  };

  const canSave = mostMemorable.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full max-w-content bg-bg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors cursor-pointer">
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-success" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Selamat! 🎉</h2>
          <p className="text-sm text-text-secondary mt-2">
            Kamu berhasil menyelesaikan Big Win!
          </p>
        </div>

        <Card className="p-4 mb-6 bg-success/5 border-success/20">
          <p className="text-base font-bold text-text-primary">
            {bigWin.title}
          </p>
          {bigWin.description && (
            <p className="text-xs text-text-secondary mt-2">{bigWin.description}</p>
          )}
          {bigWin.why_it_matters && (
            <div className="mt-3 pt-3 border-t border-success/20">
              <p className="text-[10px] font-semibold text-success uppercase tracking-wider mb-1">
                Kenapa ini penting
              </p>
              <p className="text-xs text-text-secondary">{bigWin.why_it_matters}</p>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-primary mb-1.5 block">
              Momen paling berkesan ✨
            </label>
            <textarea
              value={mostMemorable}
              onChange={(e) => setMostMemorable(e.target.value)}
              placeholder="Apa momen paling berkesan selama mengejar Big Win ini?"
              className="w-full p-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-secondary/40 resize-none focus:outline-none focus:border-primary/50 transition-colors"
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary mb-1.5 block">
              Siapa yang membantu? 🤝
            </label>
            <textarea
              value={whoHelped}
              onChange={(e) => setWhoHelped(e.target.value)}
              placeholder="Siapa saja yang mendukung perjalananmu?"
              className="w-full p-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-secondary/40 resize-none focus:outline-none focus:border-primary/50 transition-colors"
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary mb-1.5 block">
              Pelajaran terbesar 📖
            </label>
            <textarea
              value={biggestLesson}
              onChange={(e) => setBiggestLesson(e.target.value)}
              placeholder="Apa pelajaran terbesar yang kamu dapat?"
              className="w-full p-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-secondary/40 resize-none focus:outline-none focus:border-primary/50 transition-colors"
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary mb-1.5 block">
              Langkah selanjutnya 🚀
            </label>
            <textarea
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="Apa yang ingin kamu lakukan selanjutnya?"
              className="w-full p-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-secondary/40 resize-none focus:outline-none focus:border-primary/50 transition-colors"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={onClose}
          >
            Nanti Saja
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleSave}
            disabled={!canSave}
          >
            Simpan <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
