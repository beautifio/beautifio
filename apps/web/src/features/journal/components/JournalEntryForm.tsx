"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, X } from "lucide-react";
import { MOOD_OPTIONS } from "@beautifio/utils";
import { Button } from "@beautifio/ui";

interface JournalEntryFormProps {
  journalSlug: string;
  dayNumber: number;
  onSaved?: () => void;
  onClose?: () => void;
}

export function JournalEntryForm({ journalSlug, dayNumber, onSaved, onClose }: JournalEntryFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);

    const entry = {
      id: `je-user-${Date.now()}`,
      journal_id: journalSlug,
      title: title.trim() || null,
      content: content.trim(),
      mood: mood as any || null,
      day_number: dayNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const key = `beautifio_journal_entries_${journalSlug}`;
    try {
      const stored = localStorage.getItem(key);
      const entries = stored ? JSON.parse(stored) : [];
      entries.unshift(entry);
      localStorage.setItem(key, JSON.stringify(entries));
    } catch {}

    setTitle("");
    setContent("");
    setMood(null);
    setSaving(false);
    onSaved?.();
    onClose?.();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {onClose && (
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-text-primary">Tulis Entri Baru</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-muted cursor-pointer">
            <X size={16} className="text-text-secondary" />
          </button>
        </div>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Judul entri (opsional)"
        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary/50 transition-colors"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ceritakan hari ini..."
        rows={4}
        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary/50 transition-colors resize-none"
        required
      />

      <div>
        <p className="text-xs font-medium text-text-secondary mb-2">Bagaimana perasaanmu hari ini?</p>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMood(mood === opt.value ? null : opt.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${
                mood === opt.value
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-border/80 bg-surface"
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <span className="text-[8px] text-text-secondary whitespace-nowrap">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={!content.trim() || saving} className="w-full">
        <Send size={14} />
        <span>{saving ? "Menyimpan..." : "Simpan Entri"}</span>
      </Button>
    </form>
  );
}
