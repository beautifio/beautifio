"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface CareCategory {
  id: string
  name: string
  emoji: string
  description: string
  contact_name: string
  contact_phone: string
  contact_wa: string
  contact_email: string
  panduan_steps: string[]
  template_laporan: string
  template_wa: string
  template_email: string
  display_order: number
}

interface CareSchedule {
  id: string
  category: string
  is_online: boolean
  next_available: string
  message: string
}

interface ChatMessage {
  id: string
  session_id: string
  sender_id: string
  sender_role: "user" | "officer" | "system"
  content: string
  created_at: string
}

type View = "main" | "chat-form" | "chat-room"

export default function CarePage() {
  const router = useRouter()
  const supabase = createClient()
  const [view, setView] = useState<View>("main")
  const [categories, setCategories] = useState<CareCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CareCategory | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [schedule, setSchedule] = useState<CareSchedule[]>([])
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Chat state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [chatCategory, setChatCategory] = useState("psikologi")
  const [identity, setIdentity] = useState({ name: "", phone: "", address: "" })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatError, setChatError] = useState("")

  useEffect(() => {
    if (!supabase) return
    supabase.from("care_categories").select("*").eq("is_active", true).order("display_order").then(({ data }) => setCategories(data ?? []))
    supabase.from("care_officer_schedule").select("*").then(({ data }) => setSchedule(data ?? []))
  }, [])

  // Load messages for active session
  useEffect(() => {
    if (!sessionId || !supabase) return
    supabase.from("care_chat_messages").select("*").eq("session_id", sessionId).order("created_at").then(({ data }) => setMessages(data ?? []))

    const channel = supabase.channel(`care-messages-${sessionId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "care_chat_messages",
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId])

  const startChat = async () => {
    if (!supabase || !identity.name) return
    setSending(true)
    setChatError("")
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from("care_chat_sessions").insert({
      user_id: user?.id ?? null,
      category: chatCategory,
      user_name: identity.name,
      user_phone: identity.phone || null,
      user_address: identity.address || null,
      status: "waiting",
    }).select().single()
    if (error) { setChatError("Gagal memulai chat. Coba lagi."); setSending(false); return }
    setSessionId(data.id)
    setView("chat-room")
    setSending(false)
  }

  const sendMessage = async () => {
    if (!supabase || !sessionId || !chatInput.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("care_chat_messages").insert({
      session_id: sessionId,
      sender_id: user?.id ?? null,
      sender_role: "user",
      content: chatInput.trim(),
    })
    setChatInput("")
  }

  const scheduleFor = (cat: string) => schedule.find(s => s.category === cat)

  const getSchedule = useCallback((cat: string) => scheduleFor(cat), [schedule])

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100svh", paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{ background: "#084463", padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => view === "main" ? router.back() : setView("main")}
          style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer", fontSize: 20, padding: 0, lineHeight: 1 }}>
          ←
        </button>
        <div>
          <h1 style={{ fontFamily: "Poppins", fontSize: 18, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Beautifio Care</h1>
          <p style={{ fontFamily: "Inter", fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>
            {view === "chat-form" ? "Mulai Chat" : view === "chat-room" ? "Percakapan" : "Kami ada untukmu"}
          </p>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {view === "main" && (
          <>
            {/* === JALUR 1: DARURAT === */}
            <DaruratSection />

            {/* === JALUR 2: LAPORKAN MASALAH === */}
            <h2 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: "#1E2938", marginBottom: 4, marginTop: 24 }}>
              Laporkan Masalahmu
            </h2>
            <p style={{ fontFamily: "Inter", fontSize: 13, color: "#647488", marginBottom: 16 }}>
              Pilih kategori yang sesuai dengan situasimu
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => { setSelectedCategory(selectedCategory?.id === cat.id ? null : cat); setShowReportForm(false) }}
                  style={{
                    background: selectedCategory?.id === cat.id ? "#084463" : "#FFFFFF",
                    color: selectedCategory?.id === cat.id ? "#FFFFFF" : "#1E2938",
                    border: selectedCategory?.id === cat.id ? "2px solid #084463" : "1.5px solid #E2E8F0",
                    borderRadius: 14, padding: "16px 12px", fontFamily: "Poppins", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", textAlign: "center", transition: "all 0.2s ease",
                    boxShadow: selectedCategory?.id === cat.id ? "0 4px 12px rgba(8,68,99,0.2)" : "0 1px 4px rgba(0,0,0,0.05)",
                  }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.emoji}</div>
                  {cat.name}
                </button>
              ))}
            </div>

            {selectedCategory && !showReportForm && (
              <CategoryPanel category={selectedCategory} onReport={() => setShowReportForm(true)} />
            )}
            {showReportForm && selectedCategory && (
              <ReportForm category={selectedCategory} onClose={() => setShowReportForm(false)}
                onSent={() => { setSubmitted(true); setShowReportForm(false) }} />
            )}
            {submitted && !showReportForm && !selectedCategory && (
              <div style={{ background: "#F0FDF4", border: "1px solid #22C55E", borderRadius: 16, padding: 20, marginBottom: 24, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                <p style={{ fontFamily: "Inter", fontSize: 13, color: "#166534" }}>Laporan terkirim. Tim kami akan menindaklanjuti.</p>
              </div>
            )}

            {/* === JALUR 3: CHAT CARE === */}
            <h2 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: "#1E2938", marginBottom: 4, marginTop: 24 }}>
              Chat dengan Petugas Care
            </h2>
            <p style={{ fontFamily: "Inter", fontSize: 13, color: "#647488", marginBottom: 16 }}>
              Konsultasi langsung melalui chat dengan petugas terlatih
            </p>
            <ChatSection schedule={schedule} onStartChat={(cat) => { setChatCategory(cat); setView("chat-form") }} />
          </>
        )}

        {view === "chat-form" && (
          <ChatIdentityForm
            category={chatCategory}
            schedule={schedule}
            identity={identity}
            setIdentity={setIdentity}
            onStart={startChat}
            sending={sending}
            error={chatError}
          />
        )}

        {view === "chat-room" && sessionId && (
          <ChatRoom
            sessionId={sessionId}
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSend={sendMessage}
            schedule={getSchedule(chatCategory)}
          />
        )}
      </div>
    </div>
  )
}

/* =========== DARURAT SECTION =========== */
function DaruratSection() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #DC2626, #B91C1C)",
      borderRadius: 16, padding: "16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <p style={{ fontFamily: "Poppins", fontSize: 14, fontWeight: 700, color: "#FFFFFF", margin: "0 0 2px" }}>🆘 Keadaan Darurat?</p>
        <p style={{ fontFamily: "Inter", fontSize: 12, color: "rgba(255,255,255,0.85)", margin: 0 }}>
          Segera hubungi layanan darurat nasional 112
        </p>
      </div>
      <a href="tel:112" style={{
        background: "#FFFFFF", color: "#DC2626", padding: "8px 16px", borderRadius: 10,
        fontFamily: "Poppins", fontSize: 14, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
      }}>
        📞 112
      </a>
    </div>
  )
}

/* =========== CATEGORY PANEL =========== */
function CategoryPanel({ category, onReport }: { category: CareCategory; onReport: () => void }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "20px", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 28 }}>{category.emoji}</span>
        <h3 style={{ fontFamily: "Poppins", fontSize: 15, fontWeight: 700, color: "#1E2938", margin: 0 }}>{category.name}</h3>
      </div>
      <p style={{ fontFamily: "Inter", fontSize: 13, color: "#647488", lineHeight: 1.6, marginBottom: 16 }}>{category.description}</p>

      {(category.contact_phone || category.contact_wa || category.contact_email) && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, color: "#647488", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
            Hubungi Langsung
          </p>
          {category.contact_name && (
            <p style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 600, color: "#1E2938", marginBottom: 10 }}>{category.contact_name}</p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {category.contact_phone && (
              <a href={`tel:${category.contact_phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#084463", color: "#FFFFFF", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontFamily: "Inter", fontWeight: 500, textDecoration: "none" }}>
                📞 {category.contact_phone}
              </a>
            )}
            {category.contact_wa && (
              <a href={`https://wa.me/${category.contact_wa}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#22C55E", color: "#FFFFFF", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontFamily: "Inter", fontWeight: 500, textDecoration: "none" }}>
                💬 WhatsApp
              </a>
            )}
            {category.contact_email && (
              <a href={`mailto:${category.contact_email}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#6BB9D4", color: "#FFFFFF", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontFamily: "Inter", fontWeight: 500, textDecoration: "none" }}>
                📧 Email
              </a>
            )}
          </div>
        </div>
      )}

      {/* Panduan Steps */}
      {category.panduan_steps && category.panduan_steps.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, color: "#647488", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
            📋 Panduan Langkah
          </p>
          {(Array.isArray(category.panduan_steps) ? category.panduan_steps : JSON.parse(category.panduan_steps as any)).map((step: string, i: number) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#084463", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "Inter", flexShrink: 0, marginTop: 1 }}>
                {i + 1}
              </div>
              <p style={{ fontFamily: "Inter", fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>{step}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={onReport} style={{
        width: "100%", padding: "12px", background: "#F8FAFC", border: "1.5px solid #E2E8F0",
        borderRadius: 12, cursor: "pointer", fontFamily: "Poppins", fontSize: 13, fontWeight: 600, color: "#084463",
      }}>
        📝 Buat Laporan Tertulis
      </button>
    </div>
  )
}

/* =========== REPORT FORM =========== */
function ReportForm({ category, onClose, onSent }: { category: CareCategory; onClose: () => void; onSent: () => void }) {
  const [form, setForm] = useState({ subject: "", description: "", is_anonymous: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    setSubmitting(true)
    setError("")
    const supabase = createClient()
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from("beautifio_care_tickets").insert({
      user_id: form.is_anonymous ? null : user?.id,
      category: category.name,
      story: `${form.subject}\n\n${form.description}`,
      status: "pending",
    })
    if (err) { setError("Gagal mengirim. Coba lagi."); setSubmitting(false); return }
    setSubmitting(false)
    onSent()
  }

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontFamily: "Poppins", fontSize: 15, fontWeight: 700, color: "#1E2938", margin: 0 }}>
          Buat Laporan — {category.name}
        </h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#647488" }}>✕</button>
      </div>

      {error && <p style={{ fontFamily: "Inter", fontSize: 12, color: "#DC2626", marginBottom: 12 }}>{error}</p>}

      <label style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "#647488", display: "block", marginBottom: 6 }}>Judul Laporan</label>
      <input value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}
        placeholder="Ringkasan singkat masalahmu" maxLength={100}
        style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontFamily: "Inter", fontSize: 13, marginBottom: 14, boxSizing: "border-box" }} />

      <label style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "#647488", display: "block", marginBottom: 6 }}>Ceritakan Masalahmu</label>
      <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
        placeholder="Ceritakan secara detail apa yang terjadi..." rows={5}
        style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontFamily: "Inter", fontSize: 13, marginBottom: 14, resize: "none", boxSizing: "border-box" }} />

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
        <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm(p => ({...p, is_anonymous: e.target.checked}))} style={{ width: 16, height: 16 }} />
        <span style={{ fontFamily: "Inter", fontSize: 13, color: "#647488" }}>Kirim sebagai anonim</span>
      </label>

      <button onClick={handleSubmit} disabled={!form.subject || !form.description || submitting} style={{
        width: "100%", background: "#084463", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "13px",
        fontFamily: "Poppins", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: (!form.subject || !form.description) ? 0.5 : 1,
      }}>
        {submitting ? "Mengirim..." : "Kirim Laporan"}
      </button>
    </div>
  )
}

/* =========== CHAT SECTION =========== */
function ChatSection({ schedule, onStartChat }: { schedule: CareSchedule[]; onStartChat: (cat: string) => void }) {
  const [selectedType, setSelectedType] = useState("psikologi")

  const types = [
    { key: "psikologi", label: "Psikologi", emoji: "🧠" },
    { key: "agama", label: "Agama", emoji: "🕌" },
    { key: "umum", label: "Umum", emoji: "📞" },
  ]

  const currentSchedule = schedule.find(s => s.category === selectedType)
  const isOnline = currentSchedule?.is_online ?? false

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {types.map(t => (
          <button key={t.key} onClick={() => setSelectedType(t.key)} style={{
            flex: 1, padding: "8px 4px",
            background: selectedType === t.key ? "#084463" : "#F8FAFC",
            color: selectedType === t.key ? "#FFFFFF" : "#647488",
            border: selectedType === t.key ? "none" : "1px solid #E2E8F0",
            borderRadius: 10, cursor: "pointer", fontFamily: "Inter", fontSize: 12, fontWeight: 600,
          }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: isOnline ? "#22C55E" : "#9CA3AF" }} />
        <span style={{ fontFamily: "Inter", fontSize: 13, color: isOnline ? "#15803D" : "#647488", fontWeight: 600 }}>
          {isOnline ? "Petugas tersedia" : "Sedang tidak ada petugas online"}
        </span>
      </div>

      {currentSchedule?.message && !isOnline && (
        <p style={{ fontFamily: "Inter", fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>
          {currentSchedule.message}
        </p>
      )}

      <button onClick={() => onStartChat(selectedType)} style={{
        width: "100%", background: "#084463", color: "#FFFFFF", border: "none",
        borderRadius: 12, padding: "13px", fontFamily: "Poppins", fontSize: 14,
        fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(8,68,99,0.3)",
      }}>
        💬 Mulai Chat {isOnline ? "Sekarang" : "— Tetap Kirim Pesan"}
      </button>
    </div>
  )
}

/* =========== CHAT IDENTITY FORM =========== */
function ChatIdentityForm({
  category, schedule, identity, setIdentity, onStart, sending, error,
}: {
  category: string; schedule: CareSchedule[]; identity: { name: string; phone: string; address: string }
  setIdentity: (v: any) => void; onStart: () => void; sending: boolean; error: string
}) {
  const sched = schedule.find(s => s.category === category)
  const categoryLabel: Record<string, string> = { psikologi: "🧠 Psikologi", agama: "🕌 Agama", umum: "📞 Umum" }

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{categoryLabel[category]?.split(" ")[0]}</div>
        <h2 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: "#1E2938", margin: 0 }}>
          Chat {categoryLabel[category]?.replace(/^.{1,2}\s/, "")}
        </h2>
        <p style={{ fontFamily: "Inter", fontSize: 12, color: "#647488", marginTop: 4 }}>
          {sched?.is_online ? "✅ Petugas tersedia" : "⏰ Pesanmu akan dibaca saat petugas online"}
        </p>
      </div>

      {error && <p style={{ fontFamily: "Inter", fontSize: 12, color: "#DC2626", marginBottom: 12 }}>{error}</p>}

      <label style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "#647488", display: "block", marginBottom: 6 }}>Nama Kamu *</label>
      <input value={identity.name} onChange={e => setIdentity((p: any) => ({...p, name: e.target.value}))}
        placeholder="Nama panggilan" maxLength={50}
        style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontFamily: "Inter", fontSize: 13, marginBottom: 14, boxSizing: "border-box" }} />

      <label style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "#647488", display: "block", marginBottom: 6 }}>Nomor WhatsApp</label>
      <input value={identity.phone} onChange={e => setIdentity((p: any) => ({...p, phone: e.target.value}))}
        placeholder="08xxxxxxxxxx (opsional)" maxLength={15}
        style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontFamily: "Inter", fontSize: 13, marginBottom: 14, boxSizing: "border-box" }} />

      <label style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "#647488", display: "block", marginBottom: 6 }}>Alamat/Domisili</label>
      <input value={identity.address} onChange={e => setIdentity((p: any) => ({...p, address: e.target.value}))}
        placeholder="Kota tempat tinggal (opsional)" maxLength={100}
        style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontFamily: "Inter", fontSize: 13, marginBottom: 20, boxSizing: "border-box" }} />

      <button onClick={onStart} disabled={!identity.name || sending} style={{
        width: "100%", background: "#084463", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "13px",
        fontFamily: "Poppins", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: (!identity.name || sending) ? 0.5 : 1,
      }}>
        {sending ? "Memproses..." : "Mulai Chat"}
      </button>
    </div>
  )
}

/* =========== CHAT ROOM =========== */
function ChatRoom({
  sessionId, messages, chatInput, setChatInput, onSend, schedule,
}: {
  sessionId: string; messages: ChatMessage[]; chatInput: string
  setChatInput: (v: string) => void; onSend: () => void; schedule: CareSchedule | undefined
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const isOnline = schedule?.is_online ?? false

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
      {/* Status bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px", marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: isOnline ? "#22C55E" : "#9CA3AF" }} />
        <span style={{ fontFamily: "Inter", fontSize: 12, color: isOnline ? "#15803D" : "#647488" }}>
          {isOnline ? "Petugas sedang online" : "Menunggu petugas"}
        </span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 12 }}>
        {/* System message - session created */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: "Inter", fontSize: 11, color: "#94A3B8", background: "#F1F5F9", padding: "4px 12px", borderRadius: 12 }}>
            Chat dimulai • {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontFamily: "Inter", fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>
              ... menunggu petugas membalas
            </p>
            <p style={{ fontFamily: "Inter", fontSize: 12, color: "#CBD5E1" }}>
              Pesanmu sudah terkirim. Sabar ya, petugas akan membalas segera.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender_role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "10px 14px", borderRadius: msg.sender_role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.sender_role === "user" ? "#084463" : msg.sender_role === "system" ? "#F1F5F9" : "#FFFFFF",
              color: msg.sender_role === "user" ? "#FFFFFF" : "#1E2938",
              border: msg.sender_role === "officer" ? "1px solid #E2E8F0" : "none",
            }}>
              <p style={{ fontFamily: "Inter", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{msg.content}</p>
              <p style={{
                fontFamily: "Inter", fontSize: 9, margin: "4px 0 0", textAlign: "right",
                color: msg.sender_role === "user" ? "rgba(255,255,255,0.5)" : "#94A3B8",
              }}>
                {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div style={{ display: "flex", gap: 8, padding: "8px 0", borderTop: "1px solid #E2E8F0", background: "#F8FAFC", marginTop: "auto" }}>
        <input value={chatInput} onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) onSend() }}
          placeholder="Ketik pesan..." maxLength={500}
          style={{ flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "10px 14px", fontFamily: "Inter", fontSize: 13, outline: "none" }} />
        <button onClick={onSend} disabled={!chatInput.trim()} style={{
          width: 44, height: 44, borderRadius: 12, background: chatInput.trim() ? "#084463" : "#E2E8F0",
          border: "none", cursor: chatInput.trim() ? "pointer" : "default", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          ➤
        </button>
      </div>
    </div>
  )
}
