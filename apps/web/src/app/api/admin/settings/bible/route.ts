import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const STYLE_KEYS = ["standard", "cerpen"] as const

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "redaksi"].includes(profile?.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Load all bibles
  const keys = STYLE_KEYS.map(k => `content_bible_${k}`)
  const { data: rows } = await supabase.from("app_settings").select("key, value").in("key", keys)
  const bibles: Record<string, string> = {}
  rows?.forEach(r => { const style = r.key.replace("content_bible_", ""); bibles[style] = r.value })
  STYLE_KEYS.forEach(k => { if (!bibles[k]) bibles[k] = "" })

  const { data: pin } = await supabase.from("app_settings").select("value").eq("key", "bible_pin").maybeSingle()
  return NextResponse.json({ ...bibles, pin: pin?.value || "" })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "redaksi"].includes(profile?.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { bible, style, current_pin, pin } = await request.json()

  // Change bible: verify PIN
  if (bible !== undefined && style) {
    const { data: stored } = await supabase.from("app_settings").select("value").eq("key", "bible_pin").maybeSingle()
    const validPin = stored?.value || "123456"
    if (current_pin !== validPin) return NextResponse.json({ error: "PIN salah" }, { status: 403 })

    await supabase.from("app_settings").upsert(
      { key: `content_bible_${style}`, value: bible },
      { onConflict: "key" }
    )
  }

  // Change PIN (superadmin only)
  if (pin !== undefined) {
    if (profile?.role !== "superadmin") return NextResponse.json({ error: "Hanya superadmin" }, { status: 403 })
    await supabase.from("app_settings").upsert({ key: "bible_pin", value: pin }, { onConflict: "key" })
  }

  return NextResponse.json({ success: true })
}
