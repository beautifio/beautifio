import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const OPENAI_KEY = process.env.OPENAI_API_KEY || ""
const GEMINI_KEY = process.env.GEMINI_API_KEY || ""

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "admin", "redaksi"].includes(profile?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { keyword } = await request.json()
  if (!keyword?.trim()) return NextResponse.json({ error: "keyword required" }, { status: 400 })

  // Get AI provider settings
  let provider = "openai"
  let model = "gpt-4o-mini"
  try {
    const { data: settings } = await supabase.from("app_settings").select("key, value").in("key", ["ai_provider", "ai_model"])
    if (settings) {
      const prov = settings.find(s => s.key === "ai_provider")
      const mod = settings.find(s => s.key === "ai_model")
      if (prov) provider = prov.value
      if (mod) model = mod.value
    }
  } catch { /* defaults */ }

  const prompt = `Berdasarkan keyword "${keyword.trim()}", berikan insight konten untuk platform pengembangan diri Beautifio (target: perempuan muda Indonesia 18-28 tahun).

Berikan dalam format JSON:
{
  "suggestions": [
    { "title": "Judul artikel (max 60 char, clickable)", "angle": "sudut pandang unik (10 kata)", "category": "kategori Beautifio (mind-body/beauty-skincare/wellness/style-shopping/entertainment/lifetainment/relationship/levelup-career/creative-space/tech-gaming/opinion/news/sports/tokoh)" }
  ],
  "trendingTopics": ["topik1", "topik2", "topik3"],
  "searchVolume": "low/medium/high",
  "competition": "low/medium/high"
}

Beri 3-5 suggestions. HANYA JSON.`

  let result = ""
  try {
    if (provider === "gemini" && GEMINI_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`
      const res = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.8 },
        }),
      })
      const json = await res.json()
      result = json?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    } else if (OPENAI_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "Authorization": `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 500, temperature: 0.8 }),
      })
      const json = await res.json()
      result = json?.choices?.[0]?.message?.content || ""
    }
  } catch { /* fallback */ }

  // Parse JSON from response
  let parsed: any = { suggestions: [], trendingTopics: [], searchVolume: "low", competition: "low" }
  if (result) {
    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      parsed = JSON.parse(cleaned)
    } catch {
      // Try extracting JSON from text
      const match = result.match(/\{[\s\S]*\}/)
      if (match) {
        try { parsed = JSON.parse(match[0]) } catch { /* use fallback */ }
      }
    }
  }

  return NextResponse.json(parsed)
}
