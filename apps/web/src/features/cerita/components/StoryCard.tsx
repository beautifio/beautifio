"use client";

import Link from "next/link";
import { Clock, Heart, MessageSquare } from "lucide-react";
import { Badge } from "@beautifio/ui";
import type { Story } from "@beautifio/types";

export function StoryCard({ story }: { story: Story }) {
  const categoryName = story.category?.name ?? "";
  const categorySlug = story.category?.slug ?? "";

  return (
    <Link href={`/cerita/${story.slug}`} className="block">
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group">
        {story.cover_image && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={story.cover_image}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6">
          <Badge variant="secondary" className="mb-2">
            {categoryName}
          </Badge>
          <h3 className="text-base font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {story.title}
          </h3>
          <p className="text-xs text-text-secondary mt-2 line-clamp-2">
            {story.content.replace(/<[^>]*>/g, "").slice(0, 120)}...
          </p>
          <div className="flex items-center gap-4 mt-4 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {story.reading_time} menit
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} />
              {story.like_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} />
              {story.comment_count}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
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
