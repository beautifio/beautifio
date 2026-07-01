"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Heart, Sparkles, TrendingUp, Users, Feather, Monitor } from "lucide-react"
import type { InspirasiItem } from "@/lib/inspirasi-data"
import { CATEGORY_LABELS, CATEGORY_COLORS, SOURCE_LABEL, AUTHOR_TYPE_BADGE, ARCH_LABELS } from "@/lib/inspirasi-data"

interface InspirasiCardProps {
  item: InspirasiItem
  isSuggested?: boolean
  userId?: string | null
}

const CATEGORY_ICONS: Record<string, typeof Heart> = {
  "mind-body": Heart,
  "glow-glowup": Sparkles,
  "levelup-career": TrendingUp,
  "relationship": Users,
  "creative-space": Feather,
  "tech-gaming": Monitor,
}

export default function InspirasiCard({ item }: InspirasiCardProps) {
  const router = useRouter()

  const handleClick = useCallback(() => {
    router.push(`/inspirasi/${item.slug}`)
  }, [router, item.slug])

  const authorType = item.author_type || (item.source as any) || "cerita_pembaca"
  const authorBadge = AUTHOR_TYPE_BADGE[authorType] || AUTHOR_TYPE_BADGE.cerita_pembaca
  const categoryLabel = item.category_label || (item.category_id ? CATEGORY_LABELS[item.category_id] : item.category) || item.category
  const CategoryIcon = item.category_id ? CATEGORY_ICONS[item.category_id] : null
  const categoryKey = item.category_id || Object.entries(CATEGORY_LABELS).find(([,v]) => v === item.category)?.[0]
  const categoryColor = categoryKey ? CATEGORY_COLORS[categoryKey] : null
  const initials = item.initials || item.author?.charAt(0) || "?"

  return (
    <div
      onClick={handleClick}
      className="flex gap-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      {/* Thumbnail — 2:1 */}
      <div className="w-40 aspect-[2/1] rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
        {item.cover_image ? (
          <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : categoryColor ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1"
            style={{ background: categoryColor.primary + "15" }}>
            {CategoryIcon && <CategoryIcon size={22} style={{ color: categoryColor.primary, opacity: 0.4 }} />}
            <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: categoryColor.primary, opacity: 0.5 }}>{categoryLabel}</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <BookOpen className="w-6 h-6 text-gray-300" />
          </div>
        )}
        {item.architecture && (
          <span className="absolute top-1 left-1 text-[8px] font-bold bg-black/60 text-white px-1 py-0.5 rounded">
            {ARCH_LABELS[item.architecture]}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Badges row */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[10px] font-semibold ${authorBadge.color} uppercase tracking-wider`}>
              {authorBadge.label}
            </span>
            {item.category_id && CategoryIcon && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                <CategoryIcon className="w-3 h-3" />
                {categoryLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {item.title}
          </h3>
        </div>

        {/* Author */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-[7px] font-bold text-purple-700 shrink-0">
            {initials}
          </div>
          <span className="text-[11px] text-gray-500 truncate">{item.author}</span>
        </div>
      </div>
    </div>
  )
}
