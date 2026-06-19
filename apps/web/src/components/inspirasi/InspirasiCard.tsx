"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Heart, MessageSquare, Bookmark, Share2, Flag, BookOpen } from "lucide-react"
import type { InspirasiItem } from "@/lib/inspirasi-data"

interface InspirasiCardProps {
  item: InspirasiItem
  isSuggested?: boolean
  userId?: string | null
}

const SOURCE_FALLBACK: Record<string, string> = {
  redaksi: "#EEEDFE",
  cerita: "#FBEAF0",
  mentor: "#E1F5EE",
}

const SOURCE_BADGE: Record<string, { label: string }> = {
  cerita: { label: "Cerita" },
  mentor: { label: "Mentor" },
  redaksi: { label: "Redaksi" },
}

export default function InspirasiCard({ item, isSuggested, userId }: InspirasiCardProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(item.like_count)
  const [saveCount, setSaveCount] = useState(item.save_count)

  const source = item.source || "cerita"
  const fallbackBg = SOURCE_FALLBACK[source] || "#F3E5F5"
  const badge = SOURCE_BADGE[source] || SOURCE_BADGE.cerita

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1))
      return !prev
    })
  }, [])

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsSaved((prev) => {
      setSaveCount((c) => (prev ? c - 1 : c + 1))
      return !prev
    })
  }, [])

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/inspirasi/${item.slug}`
    if (navigator.share) {
      try { await navigator.share({ title: item.title, text: item.content, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
    }
  }, [item])

  const handleReport = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    alert("Laporan telah dikirim. Terima kasih atas partisipasi Anda.")
  }, [])

  const handleCardClick = useCallback(() => {
    router.push(`/inspirasi/${item.slug}`)
  }, [router, item.slug])

  return (
    <div
      onClick={handleCardClick}
      className="flex overflow-hidden rounded-[14px] border border-gray-200 min-h-[120px] cursor-pointer hover:shadow-sm transition-shadow bg-white"
    >
      {/* Left panel — 38% */}
      <div className="relative w-[38%] shrink-0 flex flex-col justify-end p-3 min-h-[120px]">
        {item.cover_image ? (
          <>
            <img
              src={item.cover_image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: fallbackBg }}
          >
            <BookOpen className="w-8 h-8 opacity-40" />
          </div>
        )}

        {/* Content over gradient/fallback */}
        <div className="relative z-10">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full inline-block mb-1"
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
            }}
          >
            {badge.label}
          </span>
          <h3 className="text-[11px] font-medium text-white leading-tight line-clamp-2">
            {item.title}
          </h3>
        </div>
      </div>

      {/* Right panel — 62% */}
      <div className="flex-1 flex flex-col p-3 min-w-0">
        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2 mb-2">
          {item.content}
        </p>

        <div className="mb-auto">
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span>{item.reading_time} menit baca</span>
            <span className="text-gray-300">·</span>
            <span>{item.category}</span>
          </div>
          {isSuggested && (
            <div className="flex items-center gap-1 text-[10px] font-medium mt-1" style={{ color: "#D94040" }}>
              <span>📍 Disarankan di journey-mu</span>
            </div>
          )}
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 mt-1.5 mb-2">
          <div className="w-[18px] h-[18px] rounded-full bg-purple-200 flex items-center justify-center text-[8px] font-semibold text-purple-700 shrink-0">
            {item.initials || item.author.charAt(0)}
          </div>
          <span className="text-[9px] text-gray-600 truncate">{item.author}</span>
        </div>

        {/* Footer engagement */}
        <div className="flex items-center gap-3 pt-1.5 border-t border-gray-100">
          <button onClick={handleLike} className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-red-500 transition-colors">
            <Heart className={`w-3 h-3 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center gap-1 text-[9px] text-gray-400">
            <MessageSquare className="w-3 h-3" />
            <span>{item.comment_count}</span>
          </button>
          <button onClick={handleSave} className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-purple-600 transition-colors">
            <Bookmark className={`w-3 h-3 ${isSaved ? "fill-purple-600 text-purple-600" : ""}`} />
            <span>{saveCount}</span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleShare} className="text-gray-400 hover:text-blue-500 transition-colors" title="Bagikan">
              <Share2 className="w-3 h-3" />
            </button>
            <button onClick={handleReport} className="text-gray-400 hover:text-red-500 transition-colors" title="Laporkan">
              <Flag className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
