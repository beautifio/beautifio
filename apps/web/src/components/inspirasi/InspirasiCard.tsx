"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { BookOpen } from "lucide-react"
import type { InspirasiItem } from "@/lib/inspirasi-data"

interface InspirasiCardProps {
  item: InspirasiItem
  isSuggested?: boolean
  userId?: string | null
}

const SOURCE_LABEL: Record<string, string> = {
  cerita: "Cerita",
  mentor: "Mentor",
  redaksi: "Redaksi",
}

export default function InspirasiCard({ item }: InspirasiCardProps) {
  const router = useRouter()

  const handleClick = useCallback(() => {
    router.push(`/inspirasi/${item.slug}`)
  }, [router, item.slug])

  const source = item.source || "cerita"
  const initials = item.initials || item.author?.charAt(0) || "?"

  return (
    <div
      onClick={handleClick}
      className="flex gap-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      {/* Thumbnail */}
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Badge */}
          <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">
            {SOURCE_LABEL[source] || source}
          </span>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mt-0.5">
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
