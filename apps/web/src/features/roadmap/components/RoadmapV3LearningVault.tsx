"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Youtube, FileText, StickyNote, Lightbulb, Trash2, ExternalLink } from "lucide-react";
import { Badge, Button } from "@beautifio/ui";
import type { LearningVaultItem } from "@beautifio/types";
import { getVaultItems, saveVaultItem, removeVaultItem } from "@beautifio/utils";

const TYPE_CONFIG = {
  story: { icon: BookOpen, label: "Story", color: "text-primary bg-primary/10" },
  article: { icon: FileText, label: "Article", color: "text-blue-600 bg-blue-50" },
  video: { icon: Youtube, label: "Video", color: "text-rose-600 bg-rose-50" },
  note: { icon: StickyNote, label: "Note", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30" },
  mentor_insight: { icon: Lightbulb, label: "Mentor Insight", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30" },
};

export function RoadmapV3LearningVault({ roadmapSlug }: { roadmapSlug: string }) {
  const [items, setItems] = useState<LearningVaultItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ type: LearningVaultItem["type"] | ""; title: string; url: string; notes: string }>({ type: "", title: "", url: "", notes: "" });

  useEffect(() => {
    setItems(getVaultItems(roadmapSlug));
  }, [roadmapSlug]);

  const handleAdd = () => {
    if (!form.title.trim() || !form.type) return;
    const item: LearningVaultItem = {
      id: `vault-${Date.now()}`,
      roadmapSlug,
      type: form.type as LearningVaultItem["type"],
      title: form.title.trim(),
      url: form.url.trim() || undefined,
      notes: form.notes.trim() || undefined,
      savedAt: new Date().toISOString(),
    };
    saveVaultItem(item);
    setItems(getVaultItems(roadmapSlug));
    setForm({ type: "", title: "", url: "", notes: "" });
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    removeVaultItem(id);
    setItems(getVaultItems(roadmapSlug));
  };

  const typeKeys = Object.keys(TYPE_CONFIG) as LearningVaultItem["type"][];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          <h3 className="text-base font-bold text-text-primary">Learning Vault</h3>
          <Badge variant="default" className="text-[10px]">{items.length}</Badge>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all"
        >
          <Plus size={16} className="text-primary" />
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-surface border border-border mb-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-text-secondary mb-1 block">Tipe</label>
            <div className="flex flex-wrap gap-1.5">
              {typeKeys.map((tk) => (
                <button
                  key={tk}
                  onClick={() => setForm({ ...form, type: tk })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    form.type === tk
                      ? "bg-primary text-white"
                      : "bg-muted/50 text-text-secondary hover:bg-muted"
                  }`}
                >
                  {TYPE_CONFIG[tk].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary mb-1 block">Judul</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Masukkan judul..."
              className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary mb-1 block">URL (opsional)</label>
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary mb-1 block">Catatan (opsional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Apa yang kamu pelajari dari ini?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm" disabled={!form.title.trim() || !form.type}>Simpan</Button>
            <Button onClick={() => setShowForm(false)} size="sm" variant="secondary">Batal</Button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm && (
        <div className="p-6 rounded-xl bg-muted/30 border border-dashed border-border text-center">
          <BookOpen size={24} className="mx-auto text-text-secondary/40 mb-2" />
          <p className="text-sm font-medium text-text-primary">Belum ada konten tersimpan</p>
          <p className="text-xs text-text-secondary mt-1">Simpan artikel, video, atau catatan belajarmu</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const config = TYPE_CONFIG[item.type];
          const Icon = config.icon;
          return (
            <div key={item.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-surface border border-border">
              <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[10px]">{config.label}</Badge>
                  <span className="text-[10px] text-text-secondary">
                    {new Date(item.savedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="text-sm font-semibold text-text-primary mt-0.5">{item.title}</p>
                {item.notes && <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{item.notes}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                      <ExternalLink size={10} /> Buka
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:bg-destructive/10 transition-all flex-shrink-0"
              >
                <Trash2 size={14} className="text-text-secondary hover:text-destructive" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
