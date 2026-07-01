"use client"

import { useState, useEffect } from "react"

export default function TierBadge() {
  const [tier, setTier] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/auth/tier")
      .then(r => r.json())
      .then(d => { if (d?.tier && d.tier !== "reguler") setTier(d.tier) })
      .catch(() => {})
  }, [])

  if (!tier) return null

  return (
    <span style={{
      position: "absolute", bottom: -4, right: -4,
      fontSize: 11, lineHeight: 1, pointerEvents: "none",
    }} title={tier === "ultimate" ? "Ultimate" : "Pro"}>
      {tier === "ultimate" ? "💎" : "👑"}
    </span>
  )
}
