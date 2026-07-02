import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "redaksi"].includes(profile?.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { data: bible } = await supabase.from("app_settings").select("value").eq("key", "content_bible").maybeSingle()
  const { data: pin } = await supabase.from("app_settings").select("value").eq("key", "bible_pin").maybeSingle()
  return NextResponse.json({ bible: bible?.value || "", pin: pin?.value || "" })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "redaksi"].includes(profile?.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { bible, pin, current_pin } = await request.json()

  // If changing bible, verify PIN
  if (bible !== undefined) {
    const { data: stored } = await supabase.from("app_settings").select("value").eq("key", "bible_pin").maybeSingle()
    const validPin = stored?.value || "123456"
    if (current_pin !== validPin) return NextResponse.json({ error: "PIN salah" }, { status: 403 })

    await supabase.from("app_settings").upsert({ key: "content_bible", value: bible }, { onConflict: "key" })
  }

  // If changing PIN (superadmin only)
  if (pin !== undefined) {
    if (profile?.role !== "superadmin") return NextResponse.json({ error: "Hanya superadmin" }, { status: 403 })
    await supabase.from("app_settings").upsert({ key: "bible_pin", value: pin }, { onConflict: "key" })
  }

  return NextResponse.json({ success: true })
}
