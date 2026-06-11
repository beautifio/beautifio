"use client";

import { useState, useEffect } from "react";
import { Sun, BookOpen, MessageSquare, Heart, Target } from "lucide-react";
import { Badge, Button } from "@beautifio/ui";
import type { DailyReflection } from "@beautifio/types";
import { getStoredReflections, saveReflection } from "@beautifio/utils";

const REFLECTION_FIELDS = [
  { key: "learned", label: "What I Learned Today", icon: BookOpen, emoji: "📖" },
  { key: "improved", label: "What I Can Improve", icon: Target, emoji: "🎯" },
  { key: "tomorrow", label: "Plan for Tomorrow", icon: Sun, emoji: "☀️" },
  { key: "challenge", label: "Challenge I Faced", icon: MessageSquare, emoji: "💪" },
  { key: "grateful", label: "I'm Grateful For", icon: Heart, emoji: "🙏" },
] as const;

export function RoadmapV3DailyReflections({ roadmapSlug }: { roadmapSlug: string }) {
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const todayKey = new Date().toISOString().slice(0, 10);
  const hasToday = reflections.some((r) => r.date === todayKey);

  const [form, setForm] = useState({
    learned: "",
    improved: "",
    tomorrow: "",
    challenge: "",
    grateful: "",
  });

  useEffect(() => {
    setReflections(getStoredReflections(roadmapSlug));
  }, [roadmapSlug]);

  const handleSubmit = () => {
    if (!form.learned.trim()) return;
    const reflection: DailyReflection = {
      id: `ref-${Date.now()}`,
      roadmapSlug,
      date: todayKey,
      learned: form.learned.trim(),
      improved: form.improved.trim() || "-",
      tomorrow: form.tomorrow.trim() || "-",
      challenge: form.challenge.trim() || "-",
      grateful: form.grateful.trim() || "-",
    };
    saveReflection(reflection);
    setReflections(getStoredReflections(roadmapSlug));
    setForm({ learned: "", improved: "", tomorrow: "", challenge: "", grateful: "" });
    setShowForm(false);
  };

  const sorted = [...reflections].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sun size={16} className="text-amber-500" />
          <h3 className="text-base font-bold text-text-primary">Daily Reflections</h3>
          <Badge variant="default" className="text-[10px]">{reflections.length}</Badge>
        </div>
        {!hasToday && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            + Refleksi Hari Ini
          </button>
        )}
      </div>

      {hasToday && !showForm && (
        <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-center mb-4">
          <p className="text-sm font-bold text-success">Refleksi hari ini sudah dicatat ✅</p>
        </div>
      )}

      {showForm && (
        <div className="p-4 rounded-xl bg-surface border border-border mb-4 space-y-3">
          {REFLECTION_FIELDS.map((field) => {
            const val = form[field.key as keyof typeof form];
            return (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-xs font-bold text-text-secondary mb-1.5">
                  <field.icon size={12} /> {field.emoji} {field.label}
                </label>
                <textarea
                  value={val}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={`Tulis ${field.label.toLowerCase()}...`}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary resize-none"
                />
              </div>
            );
          })}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSubmit} size="sm" disabled={!form.learned.trim()}>Simpan Refleksi</Button>
            <Button onClick={() => setShowForm(false)} size="sm" variant="secondary">Batal</Button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !showForm && (
        <div className="p-6 rounded-xl bg-muted/30 border border-dashed border-border text-center">
          <Sun size={24} className="mx-auto text-text-secondary/40 mb-2" />
          <p className="text-sm font-medium text-text-primary">Belum ada refleksi</p>
          <p className="text-xs text-text-secondary mt-1">Mulai catat refleksi harianmu untuk tracking growth</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((ref) => {
          const date = new Date(ref.date);
          const dateStr = date.toLocaleDateString("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          });
          return (
            <div key={ref.id} className="p-4 rounded-xl bg-surface border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Sun size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-text-secondary">{dateStr}</span>
              </div>
              <div className="space-y-2.5">
                {REFLECTION_FIELDS.map((field) => {
                  const val = ref[field.key as keyof DailyReflection] as string;
                  if (!val || val === "-") return null;
                  return (
                    <div key={field.key}>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide flex items-center gap-1">
                        <field.icon size={10} /> {field.label}
                      </p>
                      <p className="text-sm text-text-primary mt-0.5 leading-relaxed">{val}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
