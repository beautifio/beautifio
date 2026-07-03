import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabase.from("app_settings").select("value").eq("key", "content_examples").maybeSingle()
  const examples = data?.value ? JSON.parse(data.value) : {}
  return NextResponse.json({ examples })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "redaksi"].includes(profile?.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { examples, current_pin } = await request.json()

  // Verify PIN
  const { data: stored } = await supabase.from("app_settings").select("value").eq("key", "bible_pin").maybeSingle()
  if (current_pin !== (stored?.value || "123456")) return NextResponse.json({ error: "PIN salah" }, { status: 403 })

  await supabase.from("app_settings").upsert(
    { key: "content_examples", value: JSON.stringify(examples) },
    { onConflict: "key" }
  )

  return NextResponse.json({ success: true })
}
