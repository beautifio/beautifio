"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@beautifio/ui";
import type { MonthlyReview } from "@beautifio/types";

function getMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatMonth(month: string): string {
  const d = new Date(month + "T00:00:00");
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

interface MonthlyReviewSectionProps {
  userId: string;
  onReviewSaved: () => void;
}

export function MonthlyReviewSection({ userId, onReviewSaved }: MonthlyReviewSectionProps) {
  const [review, setReview] = useState<MonthlyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changed, setChanged] = useState("");
  const [learned, setLearned] = useState("");
  const [grateful, setGrateful] = useState("");
  const [focusNext, setFocusNext] = useState("");
  const [saving, setSaving] = useState(false);

  const loadReview = useCallback(async () => {
    setLoading(true);
    try {
      const { getLatestMonthlyReview } = await import("@/lib/journey-queries");
      const latest = await getLatestMonthlyReview(userId);

      if (latest) {
        const month = getMonthStart();
        if (latest.month === month) {
          setReview(latest);
        }
      }

      if (!latest || latest.month !== getMonthStart()) {
        setEditing(true);
      }
    } catch {
      setEditing(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const handleSave = async () => {
    if (!changed && !learned && !grateful && !focusNext) return;
    setSaving(true);
    try {
      const { saveMonthlyReview, getActiveJourney } = await import("@/lib/journey-queries");
      const journey = await getActiveJourney(userId);
      const month = getMonthStart();
      await saveMonthlyReview(userId, journey?.id || null, month, {
        changed,
        learned,
        grateful,
        focus_next: focusNext,
      });
      setEditing(false);
      onReviewSaved();
      await loadReview();
    } catch {
      console.error("Failed to save monthly review");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
          <BarChart3 size={24} className="text-primary/30" />
        </div>
        <p className="text-sm text-text-secondary">Memuat...</p>
      </div>
    );
  }

  if (!editing && review) {
    return (
      <div className="space-y-4">
        <div className="bg-surface rounded-2xl border border-border p-5">
          <p className="text-xs text-text-secondary/50 mb-1">Bulan ini</p>
          <p className="text-sm font-medium text-text-primary mb-4">
            {formatMonth(review.month)}
          </p>
          <div className="space-y-4">
            {review.changed && (
              <div>
                <p className="text-xs font-semibold text-text-secondary/60 mb-1">Apa yang berubah?</p>
                <p className="text-sm text-text-primary">{review.changed}</p>
              </div>
            )}
            {review.learned && (
              <div>
                <p className="text-xs font-semibold text-text-secondary/60 mb-1">Apa yang kupelajari?</p>
                <p className="text-sm text-text-primary">{review.learned}</p>
              </div>
            )}
            {review.grateful && (
              <div>
                <p className="text-xs font-semibold text-text-secondary/60 mb-1">Apa yang kusyukuri?</p>
                <p className="text-sm text-text-primary">{review.grateful}</p>
              </div>
            )}
            {review.focus_next && (
              <div>
                <p className="text-xs font-semibold text-text-secondary/60 mb-1">Fokus bulan depan?</p>
                <p className="text-sm text-text-primary">{review.focus_next}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setChanged(review.changed || "");
              setLearned(review.learned || "");
              setGrateful(review.grateful || "");
              setFocusNext(review.focus_next || "");
              setEditing(true);
            }}
            className="text-xs text-primary hover:underline mt-4 inline-block"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-2xl border border-border p-5">
        <p className="text-xs text-text-secondary/50 mb-1">Review Bulan Ini</p>
        <p className="text-sm font-medium text-text-primary mb-4">
          {formatMonth(getMonthStart())}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary/60 block mb-1">
              Apa yang berubah bulan ini?
            </label>
            <textarea
              value={changed}
              onChange={(e) => setChanged(e.target.value)}
              placeholder="Contoh: Mulai konsisten belajar setiap hari..."
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/30 resize-none h-20 outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary/60 block mb-1">
              Apa yang kupelajari?
            </label>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="Contoh: Disiplin itu bukan soal motivasi, tapi kebiasaan..."
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/30 resize-none h-20 outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary/60 block mb-1">
              Apa yang kusyukuri?
            </label>
            <textarea
              value={grateful}
              onChange={(e) => setGrateful(e.target.value)}
              placeholder="Contoh: Keluarga yang selalu mendukung..."
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/30 resize-none h-20 outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary/60 block mb-1">
              Fokus bulan depan?
            </label>
            <textarea
              value={focusNext}
              onChange={(e) => setFocusNext(e.target.value)}
              placeholder="Contoh: Menyelesaikan small win pertama..."
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/30 resize-none h-20 outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {review && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Batal
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
