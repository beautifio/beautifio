import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const OPENAI_KEY = process.env.OPENAI_API_KEY || ""

const DEFAULT_BIBLE = `# STANDAR KONTEN BEAUTIFIO

## Nada
Santai, insightful, seperti kakak ngobrol ke adik. Pakai "kamu", bukan "Anda". Gak menggurui.

## Struktur
- Hook: 1-2 kalimat pembuka yang bikin penasaran
- Body: 3-5 section dengan H2 subheading
- Masing-masing section: 2-3 paragraf pendek (2-3 kalimat)
- Closing: 1 kalimat call-to-action positif

## Target Pembaca
Usia 15-25 tahun, anak SMA dan kuliah, lagi cari jati diri dan arah hidup, aktif di sosmed

## Format
- Gunakan bullet points dan numbered list untuk poin penting
- Sisipkan 1-2 blockquote inspiratif
- Akhiri dengan pertanyaan reflektif untuk pembaca
- Maksimal 1200 kata

## SEO
- Keyword utama di judul dan paragraf pertama
- Gunakan H2 setiap 250-350 kata
- Hindari keyword stuffing

## Dilarang
- JANGAN pakai "tentunya", "pastinya", "jelaslah", "sudah seharusnya"
- JANGAN akhiri dengan "Semoga bermanfaat" atau "Selamat mencoba"
- JANGAN gunakan kalimat pasif berlebihan
- JANGAN lebih dari 1500 kata
- JANGAN gunakan bahasa Inggris campur Indonesia berlebihan`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "admin", "redaksi"].includes(profile?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { action, topic, keyword, category, tone, length, context } = await request.json()

  // Load bible from app_settings (or use default)
  const { data: bibleSettings } = await supabase.from("app_settings").select("value").eq("key", "content_bible").maybeSingle()
  const bible = bibleSettings?.value || DEFAULT_BIBLE

  try {
    let prompt = ""
    let resultKey = "result"

    if (action === "generate_full") {
      prompt = `Buat artikel lengkap untuk Beautifio.

Topik: ${topic || keyword || ""}
Kategori: ${category || "Mind & Body"}
${tone ? `Nada: ${tone}` : ""}
${length ? `Target panjang: ${length} kata` : ""}
${context ? `Konteks tambahan: ${context}` : ""}

Format output sebagai JSON:
{
  "title": "Judul artikel (max 70 karakter, clickable, ada power word)",
  "content": "HTML konten artikel lengkap. Gunakan tag <h2> untuk subheading, <p> untuk paragraf, <blockquote> untuk kutipan, <ul>/<ol> untuk list. Maksimal 1200 kata."
}

HANYA balas JSON. Jangan ada teks lain.`
      resultKey = "result"
    } else if (action === "suggest_title") {
      prompt = `Berdasarkan topik "${topic || keyword}", berikan 5 alternatif judul artikel yang clickable, SEO-friendly, dan sesuai tone Beautifio. Balas sebagai JSON array string.`
    } else if (action === "improve") {
      prompt = `Perbaiki konten artikel berikut sesuai standar Beautifio. Jaga tone dan makna asli. Balas langsung HTML yang sudah diperbaiki:\n\n${context}`
    }

    let result = ""

    if (OPENAI_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: bible },
            { role: "user", content: prompt },
          ],
          max_tokens: action === "generate_full" ? 2500 : 500,
        }),
      })
      const json = await res.json()
      result = json?.choices?.[0]?.message?.content || ""
    } else {
      // Template fallback
      if (action === "generate_full") {
        const t = topic || keyword || "Pengembangan Diri"
        const catName = category || "Mind & Body"
        result = JSON.stringify({
          title: `Mengenal ${t}: Panduan Lengkap untuk Anak Muda`,
          content: `<p>Pernahkah kamu merasa bingung dengan ${t}? Kamu nggak sendirian. Banyak anak muda mengalami hal yang sama.</p><h2>Apa Itu ${t}?</h2><p>${t} adalah salah satu topik yang paling banyak dicari oleh generasi muda Indonesia. Yuk kita bahas lebih dalam.</p><h2>Kenapa ${t} Penting?</h2><p>Memahami ${t} bisa mengubah cara pandangmu terhadap hidup. Berikut beberapa alasannya.</p><h2>Cara Menghadapi ${t}</h2><p>Ada beberapa langkah praktis yang bisa kamu coba. Mulai dari yang paling sederhana.</p><blockquote>"Perubahan besar dimulai dari langkah kecil."</blockquote><p>Jadi, sudah siap menghadapi ${t}? Ingat, kamu nggak harus sempurna — kamu hanya perlu mulai.</p>`,
        })
      }
    }

    return NextResponse.json({ [resultKey]: result })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "AI error" }, { status: 500 })
  }
}
