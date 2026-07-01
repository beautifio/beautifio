import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const OPENAI_KEY = process.env.OPENAI_API_KEY || ""

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check role
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "admin", "redaksi"].includes(profile?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { action, content, title, keywords, context } = await request.json()

  try {
    let result = ""

    if (OPENAI_KEY) {
      result = await callOpenAI(action, content, title, keywords, context)
    } else {
      result = generateTemplate(action, content, title, keywords, context)
    }

    return NextResponse.json({ result })
  } catch (e: any) {
    console.error("AI API error:", e)
    return NextResponse.json({ result: generateTemplate(action, content, title, keywords, context) })
  }
}

async function callOpenAI(action: string, content: string, title: string, keywords: string[], context?: string): Promise<string> {
  const prompts: Record<string, string> = {
    improve: `Perbaiki tulisan berikut agar lebih engaging dan profesional. Jaga tone dan makna asli:\n\n${content}`,
    rewrite: `Tulis ulang paragraf ini dengan gaya yang berbeda:\n\n${content}`,
    expand: `Kembangkan paragraf ini dengan 2-3 kalimat tambahan yang relevan:\n\n${content}`,
    simplify: `Sederhanakan teks ini agar lebih mudah dipahami:\n\n${content}`,
    meta: `Buat meta description maksimal 160 karakter untuk artikel berjudul "${title}" dengan kata kunci: ${keywords.join(", ")}`,
    faq: `Buat 5 FAQ (pertanyaan dan jawaban) untuk artikel berjudul "${title}" tentang: ${keywords.join(", ")}. Format tiap FAQ dalam JSON: [{"q":"...","a":"..."}]`,
    suggest: `Berdasarkan konten ini, berikan 3 saran untuk meningkatkan kualitas artikel:\n\n${content}`,
    keywords: `Dari konten berikut, ekstrak 5-10 kata kunci yang relevan (pisahkan dengan koma):\n\n${content}`,
  }

  const prompt = prompts[action] || content
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Kamu adalah AI SEO expert dan content coach untuk Beautifio, platform pengembangan diri Indonesia. Jawab dalam Bahasa Indonesia. Singkat dan actionable." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    }),
  })
  const json = await res.json()
  return json?.choices?.[0]?.message?.content || "Maaf, AI sedang tidak tersedia."
}

function generateTemplate(action: string, content: string, title: string, keywords: string[], context?: string): string {
  const kw = keywords.slice(0, 3)
  switch (action) {
    case "improve":
      return `Gunakan kalimat aktif. Tambahkan data atau contoh konkret. Buka dengan hook yang kuat. Akhiri dengan call-to-action.\n\nContoh: "${content.slice(0, 80)}..."\n\nCoba tambahkan: "Penelitian dari Harvard menunjukkan bahwa..." atau "Seorang psikolog terkenal pernah berkata..."`
    case "rewrite":
      return `Versi alternatif:\n\n"${content.split(".")[0] || content.slice(0, 100)}..."\n\nBisa juga dimulai dengan: "Pernahkah kamu merasa..." atau "Bayangkan jika..."`
    case "expand":
      return `Kembangkan dengan:\n\n1. Contoh nyata dari kehidupan sehari-hari\n2. Data atau statistik pendukung\n3. Kutipan dari ahli di bidang ${kw.join(", ")}\n4. Analogi yang mudah dipahami`
    case "simplify":
      return `Sederhanakan:\n\n- Gunakan kalimat pendek (<20 kata)\n- Hindari jargon teknis\n- Gunakan kata sehari-hari\n- Satu ide per paragraf\n\n${content.slice(0, 120)}...`
    case "meta":
      return `Pelajari ${kw.join(", ")} bersama Beautifio. ${title.slice(0, 50)}. Dapatkan insight mendalam dan tips praktis untuk pengembangan dirimu.`
    case "faq":
      return JSON.stringify([
        { q: `Apa itu ${kw[0] || title}?`, a: `${kw[0] || title} adalah proses memahami dan mengembangkan potensi diri melalui refleksi dan tindakan nyata.` },
        { q: `Mengapa ${kw[1] || "ini"} penting?`, a: `Karena ${kw[1] || "hal ini"} membantu kamu membuat keputusan yang lebih baik dan hidup yang lebih bermakna.` },
        { q: `Bagaimana cara memulai ${kw[0] || "perjalanan ini"}?`, a: `Mulai dengan langkah kecil: refleksi harian, journaling, dan menerapkan tips dari artikel ini secara konsisten.` },
        { q: `Apa manfaat ${kw[2] || "jangka panjangnya"}?`, a: `Kamu akan lebih mengenal diri sendiri, meningkatkan kualitas hubungan, dan mencapai tujuan hidup dengan lebih jelas.` },
        { q: `Apakah ada riset yang mendukung?`, a: `Ya, banyak penelitian psikologi positif menunjukkan bahwa ${kw[0] || "praktik ini"} terbukti meningkatkan kesejahteraan mental.` },
      ])
    case "suggest":
      return `1. Tambahkan data atau statistik dari sumber terpercaya\n2. Gunakan lebih banyak contoh konkret dan studi kasus\n3. Perbaiki struktur heading (pastikan H1 → H2 → H3)\n4. Tambahkan internal link ke artikel Beautifio lain tentang ${kw.join(", ")}\n5. Sertakan call-to-action di akhir artikel`
    case "keywords":
      return [...new Set([...kw, "psikologi positif", "kesehatan mental", "self-improvement", "mindfulness", "growth mindset"])].join(", ")
    default:
      return "Pilih salah satu action: improve, rewrite, expand, simplify, meta, faq, suggest, keywords"
  }
}
