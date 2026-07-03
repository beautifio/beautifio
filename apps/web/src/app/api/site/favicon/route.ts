import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from("app_settings").select("value").eq("key", "favicon_url").maybeSingle()
  if (data?.value) return NextResponse.redirect(data.value)
  return new NextResponse(null, { status: 204 })
}
