"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth-store"

export function BisikMatchNotifier() {
  const user = useAuthStore((s) => s.user)
  const incrementBisikMatch = useAuthStore((s) => s.incrementBisikMatch)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    if (!supabase) return

    const channel = supabase
      .channel("bisik-global-match")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "bisik_chats",
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        incrementBisikMatch()
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "bisik_chats",
        filter: `initiator_id=eq.${user.id}`,
      }, () => {
        incrementBisikMatch()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  return null
}
