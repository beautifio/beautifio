"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export type Branding = {
  logoHorizontal: string
  logoSquare: string
  heroImage: string
  heroImageMobile: string
}

const EMPTY: Branding = { logoHorizontal: "", logoSquare: "", heroImage: "", heroImageMobile: "" }
const KEYS = {
  logo_horizontal_url: "logoHorizontal",
  logo_square_url: "logoSquare",
  hero_image_url: "heroImage",
  hero_image_mobile_url: "heroImageMobile",
} as const

let cache: Branding | null = null
let inflight: Promise<Branding> | null = null

function load(): Promise<Branding> {
  if (cache) return Promise.resolve(cache)
  if (inflight) return inflight
  if (!supabase) return Promise.resolve(EMPTY)
  inflight = Promise.resolve(
    supabase.from("app_settings").select("key, value").in("key", Object.keys(KEYS))
  ).then(({ data }) => {
    const next: Branding = { ...EMPTY }
    data?.forEach((row: { key: string; value: string | null }) => {
      const k = KEYS[row.key as keyof typeof KEYS]
      if (k) next[k] = row.value || ""
    })
    cache = next
    return next
  }).catch(() => EMPTY).finally(() => { inflight = null })
  return inflight
}

/** Admin-managed logo + hero images from `app_settings`, fetched once per page load. */
export function useBranding(): Branding {
  const [b, setB] = useState<Branding>(cache ?? EMPTY)
  useEffect(() => {
    let alive = true
    load().then((v) => { if (alive) setB(v) })
    return () => { alive = false }
  }, [])
  return b
}
