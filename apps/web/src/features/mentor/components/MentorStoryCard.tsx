"use client";

import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import { Badge } from "@beautifio/ui";

export function MentorStoryCard({
  slug, title, readingTime, category,
}: {
  slug: string; title: string; readingTime: number; category?: string;
}) {
  return (
    <Link href={`/cerita/${slug}`} className="block">
      <div className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-secondary/30 hover:bg-surface/50 transition-all group">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-text-primary truncate group-hover:text-secondary transition-colors">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            {category && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">{category}</Badge>
            )}
            <span className="flex items-center gap-1 text-[10px] text-text-secondary">
              <Clock size={10} />{readingTime} menit
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
