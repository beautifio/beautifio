"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

export default function TierBadge() {
  const { user } = useAuth()
  const [tier, setTier] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetch("/api/profil/identity")
      .then(r => r.json())
      .then(d => { if (d?.user?.tier && d.user.tier !== "reguler") setTier(d.user.tier) })
      .catch(() => {})
  }, [user])

  if (!tier) return null

  return (
    <span style={{
      position: "absolute", bottom: -4, right: -4,
      fontSize: 11, lineHeight: 1,
    }} title={tier === "ultimate" ? "Ultimate" : "Pro"}>
      {tier === "ultimate" ? "💎" : "👑"}
    </span>
  )
}
