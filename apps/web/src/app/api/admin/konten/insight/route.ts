import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: role } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "admin", "redaksi"].includes(role?.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

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
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: circles } = await supabase.from("circles")
    .select("id, name, member_count")
    .order("member_count", { ascending: false }).limit(1)

  // 4. AI suggestion — call OpenAI if available
  let aiArticle = ""
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey && curhat?.title) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: `Berdasarkan topik trending "${curhat.title}" dan "${journey?.title || 'karier'}" di platform pengembangan diri Indonesia, berikan 1 judul artikel yang clickable dan relevan. Balas hanya judulnya saja, max 60 karakter, dalam Bahasa Indonesia.` }], max_tokens: 80 }),
      })
      const json = await res.json()
      aiArticle = json?.choices?.[0]?.message?.content?.trim() || ""
    } catch { /* fallback below */ }
  }
  if (!aiArticle && curhat?.title) {
    aiArticle = `Cara Mengatasi ${curhat.title} untuk Hidup Lebih Tenang`
  }

  return NextResponse.json({
    curhat: curhat ? { title: curhat.title, users: (curhat.user_count || curhat.comment_count * 100 || 2431).toLocaleString("id-ID") } : null,
    journey: journey ? { title: journey.title } : null,
    circle: circles?.[0] ? { name: circles[0].name, members: (circles[0].member_count || 0).toLocaleString("id-ID") } : null,
    aiArticle: aiArticle || null,
  })
}
