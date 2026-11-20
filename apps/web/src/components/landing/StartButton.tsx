"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@beautifio/ui"
import { supabase } from "@/lib/supabase/client"

/** Guest entry: anonymous sign-in, then into the app. */
export function useStartJourney(next = "/home") {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function start() {
    setLoading(true)
    try {
      await supabase?.auth.signInAnonymously()
    } finally {
      router.replace(next)
    }
  }
  return { loading, start }
}

export function StartButton({
  children,
  variant = "fajar",
  size = "lg",
  fullWidth,
  className = "",
  next,
}: {
  children: ReactNode
  variant?: "fajar" | "primary" | "glass"
  size?: "md" | "lg"
  fullWidth?: boolean
  className?: string
  next?: string
}) {
  const { loading, start } = useStartJourney(next)
  return (
    <Button variant={variant} size={size} fullWidth={fullWidth} loading={loading} onClick={start} className={className}>
      {loading ? "Menyiapkan…" : children}
    </Button>
  )
}

export function StartLink({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { loading, start } = useStartJourney()
  return (
    <button
      type="button"
      onClick={start}
      disabled={loading}
      className={`text-sm font-medium underline decoration-current/30 underline-offset-4 hover:decoration-current transition-colors cursor-pointer disabled:opacity-60 ${className}`}
    >
      {loading ? "Menyiapkan…" : children}
    </button>
  )
}
