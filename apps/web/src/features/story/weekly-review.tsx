"use client";

import { useEffect, useState, useCallback } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@beautifio/ui";
import type { WeeklyReview } from "@beautifio/types";

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function formatDateRange(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts = { day: "numeric", month: "long", year: "numeric" } as const;
  return `${start.toLocaleDateString("id-ID", opts)} – ${end.toLocaleDateString("id-ID", opts)}`;
}

interface WeeklyReviewSectionProps {
  userId: string;
  onReviewSaved: () => void;
}

export function WeeklyReviewSection({ userId, onReviewSaved }: WeeklyReviewSectionProps) {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [proud, setProud] = useState("");
  const [difficult, setDifficult] = useState("");
  const [improve, setImprove] = useState("");
  const [saving, setSaving] = useState(false);

  const loadReview = useCallback(async () => {
    setLoading(true);
    try {
      const { getLatestWeeklyReview } = await import("@/lib/journey-queries");
      const latest = await getLatestWeeklyReview(userId);

      const { getActiveJourney } = await import("@/lib/journey-queries");
      const journey = await getActiveJourney(userId);

      if (latest) {
        const weekStart = getWeekStart();
        if (latest.week_start === weekStart) {
          setReview(latest);
        }
      }

      if (!latest || latest.week_start !== getWeekStart()) {
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
    if (!proud && !difficult && !improve) return;
    setSaving(true);
    try {
      const { saveWeeklyReview, getActiveJourney } = await import("@/lib/journey-queries");
      const journey = await getActiveJourney(userId);
      const weekStart = getWeekStart();
      await saveWeeklyReview(userId, journey?.id || null, weekStart, {
        proud,
        difficult,
        improve,
      });
      setEditing(false);
      onReviewSaved();
      await loadReview();
    } catch {
      console.error("Failed to save weekly review");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
          <CalendarDays size={24} className="text-primary/30" />
        </div>
        <p className="text-sm text-text-secondary">Memuat...</p>
      </div>
    );
  }

  if (!editing && review) {
    return (
      <div className="space-y-4">
        <div className="bg-surface rounded-2xl border border-border p-5">
          <p className="text-xs text-text-secondary/50 mb-1">Minggu ini</p>
          <p className="text-sm font-medium text-text-primary mb-4">
            {formatDateRange(review.week_start)}
          </p>
          <div className="space-y-4">
            {review.proud && (
              <div>
                <p className="text-xs font-semibold text-text-secondary/60 mb-1">Apa yang membuatku bangga?</p>
                <p className="text-sm text-text-primary">{review.proud}</p>
              </div>
            )}
            {review.difficult && (
              <div>
                <p className="text-xs font-semibold text-text-secondary/60 mb-1">Apa yang sulit?</p>
                <p className="text-sm text-text-primary">{review.difficult}</p>
              </div>
            )}
            {review.improve && (
              <div>
                <p className="text-xs font-semibold text-text-secondary/60 mb-1">Apa yang ingin kuperbaiki?</p>
                <p className="text-sm text-text-primary">{review.improve}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setProud(review.proud || "");
              setDifficult(review.difficult || "");
              setImprove(review.improve || "");
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
        <p className="text-xs text-text-secondary/50 mb-1">Review Minggu Ini</p>
        <p className="text-sm font-medium text-text-primary mb-4">
          {formatDateRange(getWeekStart())}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary/60 block mb-1">
              Apa yang membuatmu bangga minggu ini?
            </label>
            <textarea
              value={proud}
              onChange={(e) => setProud(e.target.value)}
              placeholder="Contoh: Berhasil menyelesaikan 3 small win..."
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/30 resize-none h-20 outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary/60 block mb-1">
              Apa yang sulit?
            </label>
            <textarea
              value={difficult}
              onChange={(e) => setDifficult(e.target.value)}
              placeholder="Contoh: Sulit konsisten belajar setiap hari..."
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/30 resize-none h-20 outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary/60 block mb-1">
              Apa yang ingin kuperbaiki?
            </label>
            <textarea
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              placeholder="Contoh: Bangun lebih pagi biar bisa baca sebelum kuliah..."
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
