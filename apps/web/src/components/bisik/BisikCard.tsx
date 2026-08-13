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
  const rafRef = useRef<number>(0)
  const dragTarget = useRef({ x: 0, y: 0 })

  const dragAngle = dragX * 0.05

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!isTop || isDismissing) return
    dragStart.current = { x: clientX, y: clientY }
    dragTarget.current = { x: 0, y: 0 }
    setIsDragging(true)
  }, [isTop, isDismissing])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return
    dragTarget.current = {
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y,
    }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        setDragX(dragTarget.current.x)
        setDragY(dragTarget.current.y)
        rafRef.current = 0
      })
    }
  }, [isDragging])

  const handleSwipeComplete = useCallback(() => {
    setDragX(0); setDragY(0); setIsDismissing(false)
  }, [])

  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0 }

    const dx = dragTarget.current.x
    if (dx > 100) {
      setIsDismissing(true)
      onSwipeRight()
      requestAnimationFrame(() => {
        setDragX(window.innerWidth)
        setDragY(0)
      })
    } else if (dx < -100) {
      setIsDismissing(true)
      onSwipeLeft()
      requestAnimationFrame(() => {
        setDragX(-window.innerWidth)
        setDragY(0)
      })
    } else {
      setDragX(0)
      setDragY(0)
    }
  }, [isDragging, onSwipeLeft, onSwipeRight])

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
      onTransitionEnd={isDismissing ? handleSwipeComplete : undefined}
      style={{
        width: "100%",
        maxWidth: 266,
        height: 336,
        borderRadius: 17,
        background: gradient,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        position: isTop ? "absolute" : "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: 16,
        cursor: isTop ? "grab" : "default",
        userSelect: "none",
        transform: isTop
          ? `rotate(${dragAngle}deg) translateX(${dragX}px) translateY(${dragY}px)`
          : `scale(${stackScale}) translateY(${stackOffset}px)`,
        transition: isDragging ? "none" : isDismissing ? "transform 0.4s ease-out, opacity 0.4s ease-out" : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: isTop ? 1 : isDismissing ? 0 : stackScale,
        zIndex: isTop ? 3 : (stackOffset > 0 ? 2 : 1),
        touchAction: "none",
        flexShrink: 0,
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 140, height: 140, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 40, left: -30,
        width: 100, height: 100, borderRadius: "50%",
        background: "rgba(255,255,255,0.04)", pointerEvents: "none",
      }} />

      {/* Topic chip */}
      <div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
          color: "#FFFFFF", padding: "5px 12px", borderRadius: 18,
          fontSize: 12, fontWeight: 600, fontFamily: "Inter",
          border: "1px solid rgba(255,255,255,0.25)",
        }}>
          {card.topic?.emoji} {card.topic?.name}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "44px 4px 0" }}>
        <p style={{
          fontFamily: "Poppins", fontSize: 16, fontWeight: 700,
          color: "#FFFFFF", lineHeight: 1.5,
          textShadow: "0 2px 8px rgba(0,0,0,0.2)", margin: 0,
          textAlign: "center",
        }}>
          &ldquo;{card.content}&rdquo;
        </p>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.15)",
        paddingTop: 12,
      }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter" }}>
        </span>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontFamily: "Inter" }}>
          {getTimeAgo(card.created_at)}
        </span>
      </div>

      {/* Swipe indicator: kanan */}
      {isTop && dragX > 30 && (
        <div style={{
          position: "absolute", top: 24, left: 24,
          background: "#22C55E", color: "#FFFFFF",
          padding: "8px 16px", borderRadius: 12,
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
          background: "#EF4444", color: "#FFFFFF",
          padding: "8px 16px", borderRadius: 12,
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
