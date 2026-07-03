"use client"

import { useState, useEffect } from "react"
import { Save, Lock, Eye, EyeOff, RotateCcw, Loader2 } from "lucide-react"

const DEFAULT_STANDARD = `# STANDAR KONTEN BEAUTIFIO

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

const DEFAULT_CERPEN = `# GAYA CERPEN BEAUTIFIO

## Format
- Naratif dengan sudut pandang orang pertama ("aku")
- Alur: pembuka → konflik → klimaks → resolusi
- 800-1200 kata
- Dialog sesekali (natural, gak kaku)

## Nada
- Puitis tapi gak lebay
- Emosional, menyentuh, personal
- Deskriptif — pembaca bisa "melihat" adegan

## Struktur
- Pembuka: deskripsi suasana atau momen yang kuat
- Tengah: konflik internal tokoh, keraguan, pergulatan batin
- Akhir: refleksi atau pelajaran — gak harus happy ending

## Aturan
- Tokoh harus relatable (anak muda Indonesia)
- Setting di Indonesia (kampus, kos, rumah, kafe, jalanan)
- Konflik realistis — bukan fantasi
- Akhiri dengan satu kalimat yang ngena di hati

## Dilarang
- JANGAN tokoh yang sempurna
- JANGAN akhir yang menggurui atau "dan dia pun berubah"
- JANGAN setting di luar negeri
- JANGAN lebih dari 1500 kata`

const STYLES = [
  { key: "standard", label: "📝 Standar" },
  { key: "cerpen", label: "📖 Cerpen" },
]

const DEFAULTS: Record<string, string> = {
  standard: DEFAULT_STANDARD,
  cerpen: DEFAULT_CERPEN,
}

const EX_CATEGORIES = [
  { id: "mind-body", label: "Mind & Body", icon: "❤️", desc: "Mental health, self-care, overthinking, anxiety, burnout, body image, mindfulness, self-love, journaling untuk kesehatan mental, sleep hygiene. Target: pembaca yang lagi struggle dengan pikiran sendiri." },
  { id: "beauty-skincare", label: "Beauty", icon: "✨", desc: "Skincare routine, makeup untuk pemula, review produk lokal, nail care, hair care, fragrance, beauty tools. Fokus: review jujur & budget pelajar." },
  { id: "wellness", label: "Wellness", icon: "🏃", desc: "Nutrisi, fitness, siklus menstruasi, feminine health, PMDD, zat besi, hidrasi, gaya hidup sehat. Beda dengan Mind & Body: ini fisik & biologis, bukan psikologis." },
  { id: "style-shopping", label: "Style", icon: "🛍️", desc: "Outfit ideas, fashion tips, haul review, thrift, Shopee/Tokopedia finds, OOTD, fashion budget. Angle: style bisa murah, yang penting percaya diri." },
  { id: "entertainment", label: "Entertainment", icon: "🎬", desc: "Review drakor, film, musik, K-pop, webtoon, anime, podcast, konten kreator lokal. Angle: rekomendasi personal, bukan berita industri." },
  { id: "lifetainment", label: "Lifetainment", icon: "🍽️", desc: "Kuliner + hiburan. Makanan yang relate ke drakor/film/artis, cafe aesthetic, food review fun, tempat nongkrong. Angle: tren + kuliner + opini personal." },
  { id: "relationship", label: "Relationship", icon: "👥", desc: "Pertemanan, toxic friendship, keluarga, romance, boundaries, ghosting, rejection, komunikasi. Angle: jujur & relatable, bukan advice menggurui." },
  { id: "levelup-career", label: "Career", icon: "📈", desc: "Karir, magang, bisnis, finance, side hustle, personal branding, investasi, CV, LinkedIn. Angle: actionable & realistis untuk anak muda." },
  { id: "creative-space", label: "Creative", icon: "✏️", desc: "Menulis kreatif, journaling, puisi, esai personal, literasi, buku. Eksklusif: puisi & cerpen dari Cerita Pembaca." },
  { id: "tech-gaming", label: "Tech", icon: "🖥️", desc: "AI untuk belajar, gaming, gadget budget, keamanan digital, perempuan di tech. Angle: tech itu buat semua orang, bukan cuma cowok." },
  { id: "opinion", label: "Opini & Aksi", icon: "📰", desc: "Opini, isu sosial, lingkungan, pendidikan, kebijakan publik, kritik budaya. Angle: ambil stance, ajak gerak. Bukan straight news." },
  { id: "news", label: "Berita", icon: "📢", desc: "Straight news, update kebijakan, event, beasiswa, pengumuman penting. Angle: faktual, cepat, to-the-point. Bukan opini." },
]

export default function BiblePage() {
  const [bibles, setBibles] = useState<Record<string, string>>({})
  const [storePin, setStorePin] = useState("")
  const [activeStyle, setActiveStyle] = useState("standard")
  const [editMode, setEditMode] = useState(false)
  const [showPinPopup, setShowPinPopup] = useState(false)
  const [pinTarget, setPinTarget] = useState<"bible" | "example">("bible")
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPinManager, setShowPinManager] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [role, setRole] = useState("")
  const [examples, setExamples] = useState<Record<string, any>>({})
  const [activeExample, setActiveExample] = useState("mind-body")
  const [exEditMode, setExEditMode] = useState(false)
  const [exEditContent, setExEditContent] = useState("")
  const [exEditTitle, setExEditTitle] = useState("")
  const [exSaving, setExSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings/bible")
      .then(r => r.json())
      .then(d => {
        setBibles({ standard: d.standard || DEFAULTS.standard, cerpen: d.cerpen || DEFAULTS.cerpen })
        setStorePin(d.pin || "123456")
        setLoading(false)
      })
    fetch("/api/auth/me").then(r => r.json()).then(d => setRole(d?.data?.role || ""))
    // Load example articles
    fetch("/api/admin/settings/bible/examples")
      .then(r => r.json())
      .then(d => { if (d.examples) setExamples(d.examples) })
  }, [])

  const bible = bibles[activeStyle] || ""

  const setBible = (v: string) => setBibles(prev => ({ ...prev, [activeStyle]: v }))

  const verifyPin = () => {
    if (pinInput === storePin) {
      setShowPinPopup(false); setPinError(""); setPinInput("")
      if (pinTarget === "bible") setEditMode(true)
      else if (pinTarget === "example") {
        const cur = examples[activeExample] || { title: "", content: "" }
        setExEditTitle(cur.title); setExEditContent(cur.content)
        setExEditMode(true)
      }
    } else { setPinError("PIN salah. Coba lagi."); setPinInput("") }
  }

  const saveBible = async () => {
    setSaving(true)
    const res = await fetch("/api/admin/settings/bible", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bible, style: activeStyle, current_pin: storePin }),
    })
    if (res.ok) { setSaved(true); setEditMode(false); setTimeout(() => setSaved(false), 2000) }
    else { const d = await res.json(); alert(d.error || "Gagal menyimpan") }
    setSaving(false)
  }

  const updatePin = async () => {
    if (!newPin || newPin.length < 4) return
    setSaving(true)
    const res = await fetch("/api/admin/settings/bible", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: newPin }),
    })
    if (res.ok) { setStorePin(newPin); setNewPin(""); setSaving(false) }
    else { alert("Gagal update PIN") }
    setSaving(false)
  }

  const resetBible = () => setBible(DEFAULTS[activeStyle] || "")

  const saveExample = async () => {
    if (!exEditTitle.trim() || !exEditContent.trim()) return
    setExSaving(true)
    const updated = { ...examples, [activeExample]: { title: exEditTitle, content: exEditContent } }
    const res = await fetch("/api/admin/settings/bible/examples", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examples: updated, current_pin: storePin }),
    })
    if (res.ok) { setExamples(updated); setExEditMode(false) }
    else { const d = await res.json(); alert(d.error || "Gagal menyimpan") }
    setExSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">📖 Panduan Konten</h1>
          <p className="text-xs text-gray-500 mt-0.5">Panduan penulisan AI — dipakai saat generate artikel.</p>
        </div>
        {saved && <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">✅ Tersimpan</span>}
      </div>

      {/* Style Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        {STYLES.map(s => (
          <button key={s.key} onClick={() => { setActiveStyle(s.key); setEditMode(false) }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeStyle === s.key ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {editMode ? (
        <div className="space-y-2">
          <textarea value={bible} onChange={e => setBible(e.target.value)}
            className="w-full min-h-[400px] p-4 rounded-xl border border-gray-200 text-sm font-mono outline-none resize-y"
            style={{ color: "#1E2938", background: "#FAFBFC" }} autoFocus />
          <div className="text-xs text-gray-400">{bible.length.toLocaleString("id-ID")} karakter</div>
          <div className="flex gap-2">
            <button onClick={() => setEditMode(false)} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer hover:bg-gray-50" style={{ borderColor: "#E2E8F0", color: "#647488" }}>Batal</button>
            <button onClick={saveBible} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "#084463" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan Panduan
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl border bg-white" style={{ borderColor: "#E2E8F0" }}>
          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed" style={{ color: "#1E2938" }}>{bible || "Belum ada panduan. Klik Edit untuk membuat."}</pre>
          <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #E2E8F0" }}>
            <button onClick={resetBible} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2" style={{ borderColor: "#E2E8F0", color: "#647488" }}>
              <RotateCcw size={14} /> Reset ke Default
            </button>
            <button onClick={() => { setShowPinPopup(true); setPinInput(""); setPinError(""); setPinTarget("bible") }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer flex items-center justify-center gap-2" style={{ background: "#084463" }}>
              <Lock size={14} /> Edit Panduan
            </button>
          </div>
        </div>
      )}

      {/* PIN Popup */}
      {showPinPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setShowPinPopup(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(8,68,99,0.06)" }}>
                <Lock size={24} style={{ color: "#084463" }} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Masukkan PIN</h3>
              <p className="text-xs text-gray-500 mt-1">Verifikasi untuk mengedit panduan.</p>
            </div>
            <input type="text" value={pinInput} onChange={e => { setPinInput(e.target.value.replace(/\D/g, "")); setPinError("") }} onKeyDown={e => e.key === "Enter" && verifyPin()} maxLength={6} placeholder="••••••" className="w-full text-center text-2xl tracking-widest py-3 rounded-lg border outline-none mb-2" style={{ borderColor: pinError ? "#EF4444" : "#E2E8F0" }} autoFocus />
            {pinError && <p className="text-xs text-center text-red-500 mb-2">{pinError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowPinPopup(false)} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer hover:bg-gray-50" style={{ borderColor: "#E2E8F0", color: "#647488" }}>Batal</button>
              <button onClick={verifyPin} disabled={pinInput.length < 4} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "#084463" }}>Buka Editor</button>
            </div>
            {role === "superadmin" && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid #E2E8F0" }}>
                <button onClick={() => setShowPinManager(!showPinManager)} className="flex items-center gap-1 text-xs cursor-pointer mx-auto" style={{ color: "#647488" }}>
                  {showPinManager ? <EyeOff size={12} /> : <Eye size={12} />} Ganti PIN
                </button>
                {showPinManager && (
                  <div className="mt-2 flex gap-2">
                    <input value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ""))} maxLength={6} placeholder="PIN baru (4-6 digit)" className="flex-1 px-3 py-2 rounded-lg border text-xs outline-none" style={{ borderColor: "#E2E8F0" }} />
                    <button onClick={updatePin} disabled={newPin.length < 4 || saving} className="px-3 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "#084463" }}>{saving ? "..." : "Ganti"}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Example Articles */}
      <div className="mt-6 pt-6" style={{ borderTop: "1px solid #E2E8F0" }}>
        <h3 className="text-sm font-bold text-gray-900 mb-3">📚 Contoh Artikel per Kategori</h3>
        <div className="flex gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {EX_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveExample(c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${activeExample === c.id ? "bg-primary text-white shadow-sm" : "bg-surface text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
              style={activeExample === c.id ? { background: "#084463" } : {}}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        {exEditMode ? (
          <div className="space-y-2">
            <input value={exEditTitle} onChange={e => setExEditTitle(e.target.value)} placeholder="Judul contoh..." className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
            <textarea value={exEditContent} onChange={e => setExEditContent(e.target.value)}
              className="w-full min-h-[250px] p-4 rounded-xl border border-gray-200 text-sm outline-none resize-y"
              style={{ color: "#1E2938", background: "#FAFBFC" }} />
            <div className="flex gap-2">
              <button onClick={() => setExEditMode(false)} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer" style={{ borderColor: "#E2E8F0", color: "#647488" }}>Batal</button>
              <button onClick={saveExample} disabled={exSaving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "#084463" }}>{exSaving ? "..." : "Simpan Contoh"}</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#E2E8F0" }}>
              <h4 className="text-sm font-bold mb-2" style={{ color: "#1E2938" }}>{examples[activeExample]?.title || "Belum ada contoh"}</h4>
              <div className="text-sm leading-relaxed prose prose-sm max-w-none" style={{ color: "#647488" }} dangerouslySetInnerHTML={{ __html: examples[activeExample]?.content || "<p>Belum ada contoh untuk kategori ini.</p>" }} />
            </div>
            <button onClick={() => { setShowPinPopup(true); setPinInput(""); setPinError(""); setPinTarget("example") }} className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-center gap-2" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>
              <Lock size={14} /> Edit Contoh
            </button>
          </div>
        )}
      </div>

      {/* Panduan Kategori */}
      <div className="mt-6 pt-6" style={{ borderTop: "1px solid #E2E8F0" }}>
        <h3 className="text-sm font-bold text-gray-900 mb-3">📋 Panduan Kategori</h3>
        <p className="text-xs text-gray-500 mb-3">Setiap kategori punya fokus & angle spesifik. Baca ini sebelum mulai nulis.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {EX_CATEGORIES.map(c => (
            <div key={c.id} className="p-3 rounded-xl border bg-white" style={{ borderColor: "#E2E8F0" }}>
              <p className="text-xs font-bold mb-1" style={{ color: "#1E2938" }}>{c.icon} {c.label}</p>
              <p className="text-[10px] leading-relaxed" style={{ color: "#647488" }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
