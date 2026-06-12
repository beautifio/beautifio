"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookHeart, PenLine, BookOpen, Home, MapPin, Users, User, Sparkles } from "lucide-react";
import { Button } from "@beautifio/ui";
import { getAllJournals, JOURNAL_CATEGORIES } from "@beautifio/utils";
import { JournalCard } from "@/features/journal/components/JournalCard";


export default function JournalListPage() {

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const journals = useMemo(() => {
    const all = getAllJournals();
    return selectedCategory
      ? all.filter((j) => j.goal_category === selectedCategory)
      : all;
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 flex items-start gap-2 mb-4">
          <Sparkles size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <p className="font-medium">Fitur ini akan dipindahkan</p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-400">
              Catat refleksi harianmu di <button onClick={() => router.push("/journey")} className="underline font-medium cursor-pointer">Journey</button> — fitur baru yang lebih terpadu.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Journal</h1>
            <p className="text-sm text-text-secondary mt-1">
              Catat perjalanan hidupmu
            </p>
          </div>
          <Button onClick={() => router.push("/jurnal/buat")} size="sm">
            <PenLine size={14} />
            <span>Buat</span>
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              !selectedCategory
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-surface text-text-secondary border-border hover:border-primary/30 hover:text-text-primary"
            }`}
          >
            Semua
          </button>
          {JOURNAL_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-surface text-text-secondary border-border hover:border-primary/30 hover:text-text-primary"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {journals.length > 0 ? (
            journals.map((journal, i) => {
              const entriesKey = `beautifio_journal_entries_${journal.slug}`;
              let latestEntry: string | undefined;
              let lastMood: string | undefined;
              try {
                const stored = typeof window !== "undefined" ? localStorage.getItem(entriesKey) : null;
                const allEntries = stored ? JSON.parse(stored) : [];
                if (allEntries.length > 0) {
                  latestEntry = allEntries[0].content;
                  lastMood = allEntries[0].mood;
                }
              } catch {}
              return (
                <div key={journal.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 80}ms` }}>
                  <JournalCard journal={{ ...journal, latestEntry, lastMood } as any} />
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <BookHeart size={28} className="text-text-secondary/40" />
              </div>
              <p className="text-sm font-semibold text-text-primary">Belum ada jurnal</p>
              <p className="text-xs text-text-secondary mt-1">Mulai catat perjalanan hidupmu sekarang</p>
              <Button onClick={() => router.push("/jurnal/buat")} className="mt-4" size="sm">
                <PenLine size={14} />
                <span>Buat Jurnal Pertama</span>
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
