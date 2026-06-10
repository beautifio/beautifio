"use client";

import Link from "next/link";
import { BookHeart, Users, Heart, ChevronRight, BookOpen } from "lucide-react";
import type { Journal } from "@beautifio/types";
import { JOURNAL_CATEGORIES } from "@beautifio/utils";

const MOOD_EMOJI: Record<string, string> = {
  sangat_bahagia: "🌟", bahagia: "😊", biasa: "😐", sedih: "😢", sangat_sedih: "😭",
};

export function JournalCard({ journal }: { journal: Journal }) {
  const catInfo = JOURNAL_CATEGORIES.find((c) => c.value === journal.goal_category);
  const lastMood = (journal as any).lastMood as string | undefined;
  const latestEntry = (journal as any).latestEntry as string | undefined;

  return (
    <Link href={`/jurnal/${journal.slug}`} className="block">
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group">
        {journal.cover_image && (
          <div className="h-32 overflow-hidden">
            <img
              src={journal.cover_image}
              alt={journal.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {journal.author_initials && (
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                    {journal.author_initials}
                  </span>
                )}
                <span className="text-[11px] text-text-secondary">{journal.author_name}</span>
                {catInfo && (
                  <span className="text-[10px] bg-muted text-text-secondary px-1.5 py-0.5 rounded-full">
                    {catInfo.emoji} {catInfo.label}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-1">{journal.title}</h3>
              {journal.description && (
                <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">{journal.description}</p>
              )}
            </div>
            <ChevronRight size={16} className="text-text-secondary/40 group-hover:text-text-secondary flex-shrink-0 mt-1" />
          </div>

          {latestEntry && (
            <div className="mt-3 p-2.5 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen size={10} className="text-text-secondary" />
                <span className="text-[10px] font-medium text-text-secondary">Update Terbaru</span>
                {lastMood && MOOD_EMOJI[lastMood] && (
                  <span className="text-xs">{MOOD_EMOJI[lastMood]}</span>
                )}
              </div>
              <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">{latestEntry}</p>
            </div>
          )}

          <div className="flex items-center gap-3 mt-3 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1"><BookOpen size={12} />{journal.entry_count} entri</span>
            <span className="flex items-center gap-1"><Users size={12} />{journal.follower_count}</span>
            <span className="flex items-center gap-1"><Heart size={12} />{journal.reaction_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
