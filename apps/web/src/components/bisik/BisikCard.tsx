"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface BisikCardData {
  id: string
  content: string
  topic?: { name: string; emoji: string } | null
  owner_name?: string
  created_at: string
}

interface BisikCardProps {
  card: BisikCardData
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
  stackOffset?: number
  stackScale?: number
}

const topicGradients: Record<string, string> = {
  "Karir": "linear-gradient(145deg, #084463 0%, #0E7490 100%)",
  "Mimpi": "linear-gradient(145deg, #1E3A5F 0%, #084463 100%)",
  "Hubungan": "linear-gradient(145deg, #831843 0%, #9D174D 100%)",
  "Mental Health": "linear-gradient(145deg, #065F46 0%, #047857 100%)",
  "Keluarga": "linear-gradient(145deg, #1E3A5F 0%, #1E40AF 100%)",
  "Pertemanan": "linear-gradient(145deg, #7C2D12 0%, #9A3412 100%)",
  "Finansial": "linear-gradient(145deg, #14532D 0%, #166534 100%)",
  "Pendidikan": "linear-gradient(145deg, #312E81 0%, #3730A3 100%)",
  "Hobi": "linear-gradient(145deg, #4A1D96 0%, #6D28D9 100%)",
  "Lainnya": "linear-gradient(145deg, #374151 0%, #1F2937 100%)",
}

const defaultGradient = "linear-gradient(145deg, #084463 0%, #0E7490 100%)"

function getTimeAgo(dateStr: string): string {
  const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (minutes < 1) return "Baru saja"
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

export default function BisikCard({ card, onSwipeLeft, onSwipeRight, isTop, stackOffset = 0, stackScale = 1 }: BisikCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const dragAngle = dragX * 0.05

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!isTop) return
    dragStart.current = { x: clientX, y: clientY }
    setIsDragging(true)
  }, [isTop])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return
    setDragX(clientX - dragStart.current.x)
    setDragY(clientY - dragStart.current.y)
  }, [isDragging])

  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragX > 100) {
      setIsDismissing(true)
      setDragX(500)
      setTimeout(() => { onSwipeRight() }, 300)
    } else if (dragX < -100) {
      setIsDismissing(true)
      setDragX(-500)
      setTimeout(() => { onSwipeLeft() }, 300)
    } else {
      setDragX(0)
      setDragY(0)
    }
  }, [isDragging, dragX, onSwipeLeft, onSwipeRight])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      handleStart(t.clientX, t.clientY)
    }
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      handleMove(t.clientX, t.clientY)
    }
    const onTouchEnd = () => handleEnd()

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY)
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const onMouseUp = () => handleEnd()

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: true })
    el.addEventListener("touchend", onTouchEnd)
    el.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [handleStart, handleMove, handleEnd])

  const gradient = topicGradients[card.topic?.name ?? ""] ?? defaultGradient

  const isVisible = isTop || (!isTop && stackOffset >= 0)

  if (!isVisible) return null

  return (
    <div
      ref={cardRef}
      style={{
        width: "100%",
        maxWidth: 380,
        height: 480,
        borderRadius: 24,
        background: gradient,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        position: isDismissing ? "absolute" : "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 24,
        cursor: isTop ? "grab" : "default",
        userSelect: "none",
        transform: isTop
          ? `rotate(${dragAngle}deg) translateX(${dragX}px)`
          : `scale(${stackScale}) translateY(${stackOffset}px)`,
        transition: (isDragging || isDismissing) ? "none" : "transform 0.3s ease",
        opacity: isTop ? 1 : stackScale,
        zIndex: isTop ? 3 : (stackOffset > 0 ? 2 : 1),
        touchAction: "none",
        flexShrink: 0,
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: "absolute", top: -60, right: -60,
        width: 200, height: 200,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 60, left: -40,
        width: 150, height: 150,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.04)",
        pointerEvents: "none",
      }} />

      {/* Topic chip */}
      <div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(8px)",
          color: "#FFFFFF",
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 13, fontWeight: 600,
          fontFamily: "Inter",
          border: "1px solid rgba(255,255,255,0.25)",
        }}>
          {card.topic?.emoji} {card.topic?.name}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "24px 0" }}>
        <p style={{
          fontFamily: "Poppins",
          fontSize: 22,
          fontWeight: 700,
          color: "#FFFFFF",
          lineHeight: 1.4,
          textShadow: "0 2px 8px rgba(0,0,0,0.2)",
          margin: 0,
        }}>
          &ldquo;{card.content}&rdquo;
        </p>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid rgba(255,255,255,0.15)",
        paddingTop: 16,
      }}>
        <span style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: 13, fontFamily: "Inter",
        }}>
          {card.owner_name || "Anonymous"}
        </span>
        <span style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 12, fontFamily: "Inter",
        }}>
          {getTimeAgo(card.created_at)}
        </span>
      </div>

      {/* Swipe indicator: kanan */}
      {isTop && dragX > 30 && (
        <div style={{
          position: "absolute", top: 24, left: 24,
          background: "#22C55E",
          color: "#FFFFFF",
          padding: "8px 16px",
          borderRadius: 12,
          fontSize: 18, fontWeight: 800,
          transform: "rotate(-15deg)",
          border: "3px solid #FFFFFF",
          opacity: Math.min(dragX / 100, 1),
          fontFamily: "Inter",
        }}>
          DENGERIN ❤
        </div>
      )}

      {/* Swipe indicator: kiri */}
      {isTop && dragX < -30 && (
        <div style={{
          position: "absolute", top: 24, right: 24,
          background: "#EF4444",
          color: "#FFFFFF",
          padding: "8px 16px",
          borderRadius: 12,
          fontSize: 18, fontWeight: 800,
          transform: "rotate(15deg)",
          border: "3px solid #FFFFFF",
          opacity: Math.min(Math.abs(dragX) / 100, 1),
          fontFamily: "Inter",
        }}>
          LEWATI ✗
        </div>
      )}
    </div>
  )
}
