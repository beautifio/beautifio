"use client"

import { useState, useEffect, useCallback } from "react"

export interface IdentityData {
  user: {
    name: string
    bio: string
    avatar: string | null
    completeness: number
    missingFields: string[]
    tier: "reguler" | "pro" | "ultimate"
    mitraRole: string | null
  }
  disc: {
    primary: { key: string; label: string; desc: string; emoji: string; count: number } | null
    secondary: { key: string; label: string; desc: string; emoji: string; count: number } | null
    gameCount: number
    scores: Record<string, number>
  } | null
  tesAh: {
    latest: { module: string; scores: any; completed_at: string }
    modules: Record<string, any>
  } | null
  lifeEngine: {
    level: number
    totalPoints: number
    growthZone: string | null
    capitals: Record<string, { total: number }>
  } | null
  journey: {
    id: string
    title: string
    emoji: string
    status: string
    bigWinsTotal: number
    bigWinsDone: number
  } | null
  timeline: { date: string; emoji: string; title: string; description: string | null }[]
  activity: {
    bisik: { activeChats: number; unread: number }
    care: { activeSessions: number }
    circle: { joined: number }
    baca: { totalRead: number; totalMinutes: number } | null
  }
  unreadNotifications: number
}

export function useIdentity() {
  const [data, setData] = useState<IdentityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIdentity = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/profil/identity")
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (e: any) {
      setError(e.message || "Gagal memuat data profil")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIdentity()
  }, [fetchIdentity])

  return { data, loading, error, refetch: fetchIdentity }
}
