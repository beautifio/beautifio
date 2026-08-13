import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const DEFAULT_PROVIDER = "openai"
const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o",
  gemini: "gemini-2.5-pro",
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "redaksi"].includes(profile?.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const keys = ["ai_provider", "ai_model"]
  const { data: rows } = await supabase.from("app_settings").select("key, value").in("key", keys)

  const settings: Record<string, string> = {
    ai_provider: DEFAULT_PROVIDER,
    ai_model: "",
  }
  rows?.forEach(r => { settings[r.key] = r.value })

  // If no model saved, fall back to default for current provider
  if (!settings.ai_model) {
    settings.ai_model = DEFAULT_MODELS[settings.ai_provider] || DEFAULT_MODELS.openai
  }

  return NextResponse.json({
    ...settings,
    openai_available: !!process.env.OPENAI_API_KEY,
    gemini_available: !!process.env.GEMINI_API_KEY,
  })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "redaksi"].includes(profile?.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { ai_provider, ai_model } = await request.json()

  if (ai_provider && !["openai", "gemini"].includes(ai_provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
  }

  const updates: { key: string; value: string }[] = []
  if (ai_provider) updates.push({ key: "ai_provider", value: ai_provider })
  if (ai_model) updates.push({ key: "ai_model", value: ai_model })

  if (updates.length > 0) {
    await supabase.from("app_settings").upsert(updates, { onConflict: "key" })
  }

  return NextResponse.json({ success: true })
}
