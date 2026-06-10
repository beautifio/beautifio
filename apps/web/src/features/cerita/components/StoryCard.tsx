"use client";

import Link from "next/link";
import { BookOpen, Clock, Heart } from "lucide-react";
import { Badge } from "@beautifio/ui";
import type { Story } from "@beautifio/types";

const categoryLabels: Record<string, string> = {
  education: "Edukasi",
  career: "Karir",
  business: "Bisnis",
  sports: "Olahraga",
  music: "Musik",
  gaming: "Gaming",
  creator: "Kreator",
  beauty: "Kecantikan",
  technology: "Teknologi",
};

export function StoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/cerita/${story.slug}`} className="block">
      <div className="bg-card border border-border rounded-md shadow-card overflow-hidden hover:border-primary/30 transition-all group">
        {story.cover_image && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={story.cover_image}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-5">
          <Badge variant="secondary" className="mb-2">
            {categoryLabels[story.category] || story.category}
          </Badge>
          <h3 className="text-base font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {story.title}
          </h3>
          <p className="text-xs text-text-secondary mt-2 line-clamp-2">
            {story.content.replace(/<[^>]*>/g, "").slice(0, 120)}...
          </p>
          <div className="flex items-center gap-3 mt-3 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {story.reading_time} menit
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} />
              {story.like_count}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {story.comment_count}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-[8px] font-bold text-white">
              {story.author_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <span className="text-[11px] font-medium text-text-primary">
              {story.author_name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
