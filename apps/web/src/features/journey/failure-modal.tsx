"use client";

import { useState } from "react";
import { AlertTriangle, Heart, ArrowRight, Compass } from "lucide-react";
import { Button, Card } from "@beautifio/ui";
import { getDreamTemplate } from "@beautifio/utils";
import type { BigWin } from "@beautifio/types";

const ENCOURAGEMENTS = [
  "Tidak apa-apa. Yang penting kamu sudah berusaha.",
  "Kegagalan bukan akhir. Ini hanyalah tikungan.",
  "Setiap orang hebat pernah gagal. Yang membedakan adalah mereka bangkit lagi.",
  "Kamu berani mencoba — itu sudah lebih berani dari mereka yang diam.",
];

interface FailureModalProps {
  bigWin: BigWin;
  onConfirm: () => void;
  onClose: () => void;
}

export function FailureModal({ bigWin, onConfirm, onClose }: FailureModalProps) {
  const encouragement =
    ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

  const transferableSkills = [
    "Disiplin",
    "Ketekunan",
    "Kemampuan belajar",
    "Manajemen waktu",
  ];

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
            ✨ Skills yang sudah kamu dapat:
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
          <p className="text-xs text-text-secondary">
            Skills yang kamu pelajari berguna untuk banyak hal. Kamu bisa
            menjelajahi jalur lain yang tetap terhubung dengan mimpimu.
          </p>
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
