"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, Lock, Image, BookHeart } from "lucide-react";
import { Button } from "@beautifio/ui";
import { JOURNAL_CATEGORIES, generateSlug, saveJournal, ROADMAP_TEMPLATES } from "@beautifio/utils";


export default function CreateJournalPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalCategory, setGoalCategory] = useState<string | null>(null);
  const [roadmapSlug, setRoadmapSlug] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const slug = generateSlug(title);
    const now = new Date().toISOString();

    saveJournal({
      id: `jrnl-user-${Date.now()}`,
      user_id: "u-user",
      title: title.trim(),
      slug: `${slug}-${Date.now()}`.slice(0, 60),
      description: description.trim() || undefined,
      goal_category: goalCategory || undefined,
      roadmap_slug: roadmapSlug || undefined,
      is_public: isPublic,
      entry_count: 0,
      follower_count: 0,
      reaction_count: 0,
      created_at: now,
      updated_at: now,
      author_name: "Kamu",
      author_initials: "KM",
    });

    router.push(`/jurnal/${slug}`);
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 flex items-start gap-2 mb-4">
          <BookHeart size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <p className="font-medium">Fitur ini akan dipindahkan</p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-400">
              Catat perjalanan mimpimu di <button onClick={() => router.push("/journey")} className="underline font-medium cursor-pointer">Journey</button> — fitur refleksi harian yang lebih terpadu.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-all active:scale-90"
          >
            <ArrowLeft size={18} className="text-text-primary" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">Buat Jurnal Baru</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Judul Jurnal *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Road to Medical School"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary/50 transition-colors"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan tentang perjalanan ini..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">Kategori Tujuan</label>
            <div className="flex flex-wrap gap-2">
              {JOURNAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setGoalCategory(goalCategory === cat.value ? null : cat.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    goalCategory === cat.value
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-surface text-text-secondary border-border hover:border-primary/30"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">Hubungkan dengan Roadmap (opsional)</label>
            <div className="flex flex-wrap gap-2">
              {ROADMAP_TEMPLATES.map((rt) => (
                <button
                  key={rt.slug}
                  type="button"
                  onClick={() => setRoadmapSlug(roadmapSlug === rt.slug ? null : rt.slug)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    roadmapSlug === rt.slug
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-surface text-text-secondary border-border hover:border-primary/30"
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">Privasi</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  isPublic
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-surface text-text-secondary border-border hover:border-primary/30"
                }`}
              >
                <Globe size={16} />
                <span>Publik</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  !isPublic
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-surface text-text-secondary border-border hover:border-primary/30"
                }`}
              >
                <Lock size={16} />
                <span>Pribadi</span>
              </button>
            </div>
          </div>

          <Button type="submit" disabled={!title.trim()} className="w-full">
            <BookHeart size={14} />
            <span>Buat Jurnal</span>
          </Button>
        </form>
      </div>

    </div>
  );
}
