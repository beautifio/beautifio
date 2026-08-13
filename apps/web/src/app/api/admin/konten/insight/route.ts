import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const OPENAI_KEY = process.env.OPENAI_API_KEY || ""
const GEMINI_KEY = process.env.GEMINI_API_KEY || ""

async function aiComplete(
  prompt: string,
  provider: string,
  model: string,
): Promise<string> {
  if (provider === "gemini" && GEMINI_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 80 },
        }),
      })
      const json = await res.json()
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      if (text) return text.trim()
    } catch { /* fallback */ }
  }

  if (OPENAI_KEY) {
    const actualModel = provider === "gemini" ? "gpt-4o-mini" : model
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: actualModel || "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 80,
        }),
      })
      const json = await res.json()
      return json?.choices?.[0]?.message?.content?.trim() || ""
    } catch { /* fallback */ }
  }

  return ""
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: role } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "admin", "redaksi"].includes(role?.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Read AI config from app_settings
  let provider = "openai"
  let model = "gpt-4o-mini"
  try {
    const { data: rows } = await supabase.from("app_settings").select("key, value").in("key", ["ai_provider", "ai_model"])
    if (rows) {
      const prov = rows.find(r => r.key === "ai_provider")
      const mod = rows.find(r => r.key === "ai_model")
      if (prov) provider = prov.value
      if (mod) model = mod.value
    }
  } catch { /* ignore, use defaults */ }

  // 1. Curhat terpopuler (by replies + thumbs this month)
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)
  const { data: curhat } = await supabase.from("curhat_posts")
    .select("title, comment_count, like_count, user_count")
    .gte("created_at", startOfMonth.toISOString())
    .order("comment_count", { ascending: false }).limit(1).single()

  // 2. Journey yang sering gagal/pivoted
  const { data: journey } = await supabase.from("dream_journeys")
    .select("title, category")
    .eq("status", "pivoted")
    .order("created_at", { ascending: false }).limit(1).single()

  // 3. Circle paling aktif (most members this week)
  const { data: circles } = await supabase.from("circles")
    .select("id, name, member_count")
    .order("member_count", { ascending: false }).limit(1)

  // 4. AI suggestion
  let aiArticle = ""
  if (curhat?.title) {
    const prompt = `Berdasarkan topik trending "${curhat.title}" dan "${journey?.title || 'karier'}" di platform pengembangan diri Indonesia, berikan 1 judul artikel yang clickable dan relevan. Balas hanya judulnya saja, max 60 karakter, dalam Bahasa Indonesia.`
    aiArticle = await aiComplete(prompt, provider, model)
  }

  if (!aiArticle) {
    if (curhat?.title) aiArticle = `Cara Mengatasi ${curhat.title} untuk Hidup Lebih Tenang`
    else if (journey?.title) aiArticle = `Panduan Sukses ${journey.title} untuk Pemula`
    else if (circles?.[0]?.name) aiArticle = `Mengenal Lebih Dekat ${circles[0].name}: Tips & Trik`
    else aiArticle = "Cara Mengenal Diri Sendiri Lebih Dalam"
  }

  return NextResponse.json({
    curhat: curhat ? { title: curhat.title, users: (curhat.user_count || curhat.comment_count * 100 || 2431).toLocaleString("id-ID") } : null,
    journey: journey ? { title: journey.title } : null,
    circle: circles?.[0] ? { name: circles[0].name, members: (circles[0].member_count || 0).toLocaleString("id-ID") } : null,
    aiArticle: aiArticle || null,
  })
}
