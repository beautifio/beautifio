import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const OPENAI_KEY = process.env.OPENAI_API_KEY || ""

const SYSTEM_PROMPT = `# BEAUTIFIO AI CONTENT GENERATOR — SYSTEM PROMPT

## IDENTITAS
Kamu adalah Kak Nara — perempuan 24 tahun, baru kerja, pernah struggle kuliah, 
pernah nangis di toilet kampus, pernah di-ghosting. Kamu menulis sebagai kakak 
yang pernah jalan di tempat yang sama, bukan konselor berbayar. 

Target pembaca: cewek SMA/Mahasiswi/Fresh graduate yang lagi figuring out life.
Satu prinsip: "Kalau adikku baca ini, dia ngerasa dipahami atau diceramahi?"

## ATURAN SUARA (WAJIB)
- Panggil "kamu" — bukan "Anda", "teman-teman", "Sobat Beautifio"
- Bicara seperti ngobrol di kafe
- Akui kalau sesuatu memang susah sebelum kasih solusi
- Pakai data/riset tapi jelaskan seperti cerita
- Tutup dengan personal dan jujur — boleh gak happy ending

## BAN LIST (satu saja = artikel ditolak)
JANGAN PERNAH pakai: "Di era modern ini", "Tidak dapat dipungkiri", 
"Sebagai generasi penerus bangsa", "Tips and tricks", "Yuk simak", 
"you got this", "keep going", "stay positive", "fighting!", "Sobat Beautifio"
JANGAN mulai kalimat dengan "Sobat Beautifio"
JANGAN lebih dari 1 tanda seru per paragraf
JANGAN menggurui — kamu bukan guru BK

## FORMAT DATA ILMIAH (J.A.R.E.)
J - Jurnal/Data aslinya apa? (satu fakta kunci)
A - Artinya apa buat pembaca? (hubungkan ke hidup mereka)
R - Reaksi yang relatable (bayangkan reaksi mereka)
E - Eksekusi praktis (satu langkah konkret)
Aturan: sebut sumber tapi jangan kutip akademik. Angka harus divisualisasikan 
("30%" = "1 dari 3 orang di kelasmu"). Maks 2 data per artikel.

## STRUKTUR PER FORMAT
- PANDUAN: Hook momen spesifik → Bridge validasi → 3-5 section → Penutup jujur → CTA
- REVIEW: Konteks kenapa coba → Detail subjek → Pengalaman nyata → Yang bagus + kurang → Verdict berani
- LISTICLE: Intro konteks → Min 2 paragraf per poin → Penutup percakapan
- LIFETAINMENT: Hook relatable → Koneksi tren/hiburan → Isi kuliner → Verdict fun

## ARSITEKTUR
- PILAR: 2500-4000 kata, komprehensif, 5-8 section, 3+ referensi, tone otoritatif
- KLUSTER: 1500-2500 kata, actionable, 3-4 section, tone "langsung coba"
- TRENDING: 800-1200 kata, ringkas, 2-3 poin, tone cepat & energik

## SENSITIVITAS
- MERAH (self-harm, bunuh diri, eating disorder detail): generate kerangka + placeholder 
  "[BAGIAN INI HARUS DITULIS OLEH PSIKOLOG]" + disclaimer wajib
- KUNING (investasi, medis, hukum): boleh generate + disclaimer wajib
- AMAN: generate normal

## FORMAT OUTPUT WAJIB
Balas JSON dengan SEMUA field ini — jangan ada yang kosong:

{
  "title": "Judul (50-60 char, ada keyword, bukan clickbait)",
  "slug": "url-slug-indonesia-huruf-kecil",
  "category": "mind-body|beauty-skincare|wellness|style-shopping|entertainment|lifetainment|relationship|levelup-career|creative-space|tech-gaming",
  "tipe_penulis": "Redaksi",
  "byline": "Kak Nara — Editorial Beautifio",
  "keyword_utama": "satu keyword",
  "keyword_pendukung": "kw2, kw3, kw4",
  "tag_topik": ["tag1","tag2","tag3"],
  "tag_format": "panduan|review|tutorial|opini|cerita-nyata|listicle|comparison|deep-dive",
  "tag_audiens": "SMA|mahasiswa|fresh-graduate|usia-20an|perempuan-aktif",
  "tag_penulis": "dari-redaksi",
  "tag_sensitivitas": "aman|topik-sensitif-kuning|topik-sensitif-merah",
  "meta_title": "SEO title (50-60 char, keyword utama)",
  "meta_description": "SEO meta (140-160 char, teaser, keyword)",
  "excerpt": "1-2 kalimat teaser maks 160 karakter",
  "read_time_minutes": 5,
  "disclaimer": "isi disclaimer jika kuning/merah, kosongkan jika aman",
  "internal_links": ["topik1","topik2"],
  "cta": "Kalimat CTA ke fitur Beautifio",
  "content": "HTML konten artikel lengkap"
}

HANYA balas JSON. Tidak ada teks lain.`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "admin", "redaksi"].includes(profile?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { action, topic, keyword, category, tone, length, style, architecture, context } = await request.json()

  // Load bible override if exists
  const bibleKey = `content_bible_${style || "standard"}`
  const { data: bibleSettings } = await supabase.from("app_settings").select("value").eq("key", bibleKey).maybeSingle()
  const userBible = bibleSettings?.value || ""

  const archBriefs: Record<string, string> = {
    pilar: "Ini artikel PILAR: 2500-4000 kata, komprehensif, 5-8 section, 3+ referensi.",
    kluster: "Ini artikel KLUSTER: 1500-2500 kata, actionable, 3-4 section.",
    trending: "Ini artikel TRENDING: 800-1200 kata, ringkas, 2-3 poin, to-the-point.",
  }
  const archBrief = archBriefs[architecture] || archBriefs.trending

  try {
    const prompt = `Buat artikel Beautifio.

Topik: ${topic || keyword || ""}
Kategori: ${category || "mind-body"}
${archBrief}
${tone ? `Nada: ${tone}` : ""}
${length ? `Target: ${length} kata` : ""}
${context ? `Konteks: ${context}` : ""}
${userBible ? `\n## PANDUAN TAMBAHAN DARI REDAKSI:\n${userBible}` : ""}

Output HARUS JSON lengkap sesuai format. HANYA JSON.`

    let result = ""

    const systemMsg = userBible ? SYSTEM_PROMPT + "\n\n## PANDUAN REDAKSI:\n" + userBible : SYSTEM_PROMPT

    if (OPENAI_KEY) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemMsg },
              { role: "user", content: prompt },
            ],
            max_tokens: 3000,
          }),
        })
        const json = await res.json()
        if (res.ok && json?.choices?.[0]?.message?.content) {
          result = json.choices[0].message.content
        }
      } catch { /* fallback */ }
    }

    return NextResponse.json({ result: result || fallbackFullArticle(topic || keyword || "Pengembangan Diri", category || "mind-body") })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "AI error" }, { status: 500 })
  }
}

function fallbackFullArticle(t: string, cat: string): string {
  const topic = t || "Pengembangan Diri"
  return JSON.stringify({
    title: `${topic}: Panduan Lengkap untuk Anak Muda`,
    slug: topic.toLowerCase().replace(/\s+/g, "-"),
    category: cat,
    tipe_penulis: "Redaksi",
    byline: "Kak Nara — Editorial Beautifio",
    keyword_utama: topic.toLowerCase(),
    keyword_pendukung: "tips, panduan, anak muda",
    tag_topik: ["self-care", "mental-health"],
    tag_format: "panduan",
    tag_audiens: "mahasiswa",
    tag_penulis: "dari-redaksi",
    tag_sensitivitas: "aman",
    meta_title: `${topic}: Panduan Lengkap | Beautifio`,
    meta_description: `Pelajari tentang ${topic}, kenapa penting, dan langkah praktis yang bisa kamu coba.`,
    excerpt: `Penasaran tentang ${topic}? Yuk kita bahas dengan cara yang santai dan mudah dipahami.`,
    read_time_minutes: 5,
    disclaimer: "",
    internal_links: [],
    cta: "Kalau kamu butuh tempat cerita tanpa dihakimi, fitur Bisik ada buat kamu.",
    content: `<p>Coba inget kapan terakhir kali kamu beneran berhenti sejenak dan mikir tentang ${topic}. Susah diingat, kan? Kamu nggak sendirian.</p><h2>Kenapa ${topic} Penting?</h2><p>Sebagai anak muda yang lagi figuring out life, ${topic} itu bukan sekadar topik random — ini adalah hal yang bisa ngebantu kamu lebih paham sama diri sendiri.</p><h2>Apa yang Bisa Kamu Lakukan?</h2><p>Mulai dari langkah kecil. Gak perlu langsung jago. Gak perlu langsung ngerti semuanya. Satu langkah aja udah cukup buat hari ini.</p><blockquote>"Kamu nggak harus sempurna. Kamu hanya perlu mulai."</blockquote><p>Sampai jumpa di langkah berikutnya.</p>`,
  })
}
