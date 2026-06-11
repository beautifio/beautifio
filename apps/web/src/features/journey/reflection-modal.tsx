"use client";

import { useState } from "react";
import { BookOpen, Send, X } from "lucide-react";
import { Button } from "@beautifio/ui";

interface ReflectionModalProps {
  onSave: (data: { learned: string; grateful: string; improve: string; mood: string }) => void;
  onClose: () => void;
}

const MOODS = [
  { value: "sangat_bahagia", emoji: "🌟", label: "Sangat Bahagia" },
  { value: "bahagia", emoji: "😊", label: "Bahagia" },
  { value: "biasa", emoji: "😐", label: "Biasa" },
  { value: "sedih", emoji: "😢", label: "Sedih" },
  { value: "sangat_sedih", emoji: "😭", label: "Sangat Sedih" },
];

export function ReflectionModal({ onSave, onClose }: ReflectionModalProps) {
  const [learned, setLearned] = useState("");
  const [grateful, setGrateful] = useState("");
  const [improve, setImprove] = useState("");
  const [mood, setMood] = useState("bahagia");

  const canSave = learned.trim().length > 0 || grateful.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full max-w-content bg-bg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Refleksi Harian</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg cursor-pointer">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              🌱 Apa yang saya pelajari hari ini?
            </label>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="Contoh: Belajar passing baru..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              🙏 Apa yang saya syukuri hari ini?
            </label>
            <textarea
              value={grateful}
              onChange={(e) => setGrateful(e.target.value)}
              placeholder="Contoh: Bersyukur bisa latihan hari ini..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              🔧 Apa yang akan saya perbaiki besok?
            </label>
            <textarea
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              placeholder="Contoh: Fokus sama teknik dribbling..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              😊 Bagaimana perasaanmu hari ini?
            </label>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex-1 py-3 rounded-xl text-center text-sm transition-all cursor-pointer ${
                    mood === m.value
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted border-2 border-transparent hover:bg-muted/70"
                  }`}
                >
                  <span className="text-xl block mb-1">{m.emoji}</span>
                  <span className="text-[11px] text-text-secondary">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          variant="accent"
          size="lg"
          className="w-full mt-6"
          disabled={!canSave}
          onClick={() =>
            onSave({ learned, grateful, improve, mood })
          }
        >
          <Send size={14} /> Simpan Refleksi
        </Button>
      </div>
    </div>
  );
}
