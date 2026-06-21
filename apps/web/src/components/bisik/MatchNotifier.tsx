"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth-store"

export function BisikMatchNotifier() {
  const user = useAuthStore((s) => s.user)
  const bisikMatchCount = useAuthStore((s) => s.bisikMatchCount)
  const setBisikMatchCount = useAuthStore((s) => s.setBisikMatchCount)
  const incrementBisikMatch = useAuthStore((s) => s.incrementBisikMatch)
  const clearBisikMatch = useAuthStore((s) => s.clearBisikMatch)
  const pathname = usePathname()

  const [toast, setToast] = useState<string | null>(null)

  // Auto-clear badge when navigating to any /bisik page
  useEffect(() => {
    if (pathname.startsWith("/bisik") && bisikMatchCount > 0) {
      clearBisikMatch()
    }
  }, [pathname])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    if (!supabase) return

    // Initial count: chats with no messages (expires_at is null)
    supabase
      .from("bisik_chats")
      .select("id", { count: "exact", head: true })
      .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .in("status", ["active", "pending"])
      .is("expires_at", null)
      .then(({ count }) => {
        if (count && count > 0) {
          const current = useAuthStore.getState().bisikMatchCount
          if (count > current) setBisikMatchCount(count)
        }
      })

    const channel = supabase
      .channel("bisik-global-match")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "bisik_chats",
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        incrementBisikMatch()
        showToast()
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "bisik_chats",
        filter: `initiator_id=eq.${user.id}`,
      }, () => {
        incrementBisikMatch()
        showToast()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const showToast = () => {
    setToast("🎉 Match baru! Ada yang ingin ngobrol denganmu.")
    setTimeout(() => setToast(null), 3000)
  }

  return toast ? (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom fade-in duration-300"
      style={{ background: "#084463", color: "#FFFFFF" }}
    >
      {toast}
    </div>
  ) : null
}
