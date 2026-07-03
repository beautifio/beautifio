import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabase.from("app_settings").select("value").eq("key", "content_examples").maybeSingle()
  const examples = data?.value ? JSON.parse(data.value) : {}
  return NextResponse.json({ examples })
}
