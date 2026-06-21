"use client"

import { useState, useEffect } from "react"
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
  display_order: number
}

interface CareOfficer {
  id: string
  name: string
  category_id: string
  is_online: boolean
  next_available: string
  category: { name: string; emoji: string } | null
}

export default function CarePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<CareCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CareCategory | null>(null)
  const [officers, setOfficers] = useState<CareOfficer[]>([])
  const [showReportForm, setShowReportForm] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.from("care_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setCategories(data ?? []))
    supabase.from("care_officers")
      .select("*, category:care_categories(name, emoji)")
      .then(({ data }) => setOfficers(data ?? []))
  }, [])

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100svh", paddingBottom: 80 }}>
      {/* Header Peacock */}
      <div style={{
        background: "#084463",
        padding: "16px 16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "none", border: "none",
            color: "#FFFFFF", cursor: "pointer", fontSize: 20,
            padding: 0, lineHeight: 1,
          }}
        >
          ←
        </button>
        <div>
          <h1 style={{
            fontFamily: "Poppins", fontSize: 18,
            fontWeight: 700, color: "#FFFFFF", margin: 0,
          }}>
            Beautifio Care
          </h1>
          <p style={{
            fontFamily: "Inter", fontSize: 12,
            color: "rgba(255,255,255,0.7)", margin: 0,
          }}>
            Kami ada untukmu
          </p>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Emergency Banner */}
        <div style={{
          background: "linear-gradient(135deg, #DC2626, #B91C1C)",
          borderRadius: 16,
          padding: "14px 16px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <p style={{
              fontFamily: "Poppins", fontSize: 14,
              fontWeight: 700, color: "#FFFFFF", margin: "0 0 2px",
            }}>
              🆘 Keadaan Darurat?
            </p>
            <p style={{
              fontFamily: "Inter", fontSize: 12,
              color: "rgba(255,255,255,0.85)", margin: 0,
            }}>
              Segera hubungi layanan darurat nasional
            </p>
          </div>
          <a href="tel:112" style={{
            background: "#FFFFFF",
            color: "#DC2626",
            padding: "8px 16px",
            borderRadius: 10,
            fontFamily: "Poppins",
            fontSize: 14, fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}>
            📞 112
          </a>
        </div>

        {/* Section: Laporkan Masalah */}
        <h2 style={{
          fontFamily: "Poppins", fontSize: 16,
          fontWeight: 700, color: "#1E2938", marginBottom: 4,
        }}>
          Laporkan Masalahmu
        </h2>
        <p style={{
          fontFamily: "Inter", fontSize: 13,
          color: "#647488", marginBottom: 16,
        }}>
          Pilih kategori yang sesuai dengan situasimu
        </p>

        {/* Grid Kategori */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10, marginBottom: 16,
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(
                  selectedCategory?.id === cat.id ? null : cat
                )
                setShowReportForm(false)
              }}
              style={{
                background: selectedCategory?.id === cat.id
                  ? "#084463" : "#FFFFFF",
                color: selectedCategory?.id === cat.id
                  ? "#FFFFFF" : "#1E2938",
                border: selectedCategory?.id === cat.id
                  ? "2px solid #084463" : "1.5px solid #E2E8F0",
                borderRadius: 14,
                padding: "16px 12px",
                fontFamily: "Poppins",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s ease",
                boxShadow: selectedCategory?.id === cat.id
                  ? "0 4px 12px rgba(8,68,99,0.2)"
                  : "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>
                {cat.emoji}
              </div>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Panel Detail Kategori */}
        {selectedCategory && !showReportForm && (
          <CategoryPanel
            category={selectedCategory}
            onReport={() => setShowReportForm(true)}
          />
        )}

        {/* Form Laporan */}
        {showReportForm && selectedCategory && (
          <ReportForm
            category={selectedCategory}
            onClose={() => setShowReportForm(false)}
          />
        )}

        {/* Section: Chat Petugas */}
        <h2 style={{
          fontFamily: "Poppins", fontSize: 16,
          fontWeight: 700, color: "#1E2938",
          marginBottom: 4, marginTop: 8,
        }}>
          Chat dengan Petugas
        </h2>
        <p style={{
          fontFamily: "Inter", fontSize: 13,
          color: "#647488", marginBottom: 16,
        }}>
          Konsultasi langsung dengan petugas Beautifio Care
        </p>

        <OfficerSection officers={officers} router={router} />
      </div>
    </div>
  )
}

function CategoryPanel({
  category,
  onReport,
}: {
  category: CareCategory
  onReport: () => void
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 16,
      padding: "20px",
      marginBottom: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        gap: 10, marginBottom: 12,
      }}>
        <span style={{ fontSize: 28 }}>{category.emoji}</span>
        <h3 style={{
          fontFamily: "Poppins", fontSize: 15,
          fontWeight: 700, color: "#1E2938", margin: 0,
        }}>
          {category.name}
        </h3>
      </div>

      <p style={{
        fontFamily: "Inter", fontSize: 13,
        color: "#647488", lineHeight: 1.6,
        marginBottom: 16,
      }}>
        {category.description}
      </p>

      {(category.contact_phone ||
        category.contact_wa ||
        category.contact_email) && (
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontFamily: "Poppins", fontSize: 12,
            fontWeight: 600, color: "#647488",
            textTransform: "uppercase",
            letterSpacing: "0.5px", marginBottom: 10,
          }}>
            Hubungi Langsung
          </p>
          {category.contact_name && (
            <p style={{
              fontFamily: "Inter", fontSize: 13,
              fontWeight: 600, color: "#1E2938",
              marginBottom: 10,
            }}>
              {category.contact_name}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {category.contact_phone && (
              <a href={`tel:${category.contact_phone}`} style={{
                display: "inline-flex", alignItems: "center",
                gap: 6, background: "#084463", color: "#FFFFFF",
                padding: "8px 14px", borderRadius: 10,
                fontSize: 13, fontFamily: "Inter",
                fontWeight: 500, textDecoration: "none",
              }}>
                📞 {category.contact_phone}
              </a>
            )}
            {category.contact_wa && (
              <a href={`https://wa.me/${category.contact_wa}`}
                target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center",
                  gap: 6, background: "#22C55E", color: "#FFFFFF",
                  padding: "8px 14px", borderRadius: 10,
                  fontSize: 13, fontFamily: "Inter",
                  fontWeight: 500, textDecoration: "none",
                }}>
                💬 WhatsApp
              </a>
            )}
            {category.contact_email && (
              <a href={`mailto:${category.contact_email}`} style={{
                display: "inline-flex", alignItems: "center",
                gap: 6, background: "#6BB9D4", color: "#FFFFFF",
                padding: "8px 14px", borderRadius: 10,
                fontSize: 13, fontFamily: "Inter",
                fontWeight: 500, textDecoration: "none",
              }}>
                📧 Email
              </a>
            )}
          </div>
        </div>
      )}

      <button onClick={onReport} style={{
        width: "100%", padding: "12px",
        background: "#F8FAFC",
        border: "1.5px solid #E2E8F0",
        borderRadius: 12, cursor: "pointer",
        fontFamily: "Poppins", fontSize: 13,
        fontWeight: 600, color: "#084463",
      }}>
        📝 Buat Laporan Tertulis
      </button>
    </div>
  )
}

function ReportForm({
  category,
  onClose,
}: {
  category: CareCategory
  onClose: () => void
}) {
  const [form, setForm] = useState({
    subject: "",
    description: "",
    is_anonymous: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    const supabase = createClient()
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from("beautifio_care_tickets").insert({
      user_id: form.is_anonymous ? null : user?.id,
      category: category.name,
      story: `${form.subject}\n\n${form.description}`,
      status: "pending",
    })

    setSuccess(true)
    setSubmitting(false)
  }

  if (success) {
    return (
      <div style={{
        background: "#F0FDF4", border: "1px solid #22C55E",
        borderRadius: 16, padding: 24, textAlign: "center",
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <h3 style={{
          fontFamily: "Poppins", fontSize: 16,
          fontWeight: 700, color: "#15803D", marginBottom: 8,
        }}>
          Laporan Terkirim
        </h3>
        <p style={{
          fontFamily: "Inter", fontSize: 13,
          color: "#166534", marginBottom: 16,
        }}>
          Tim kami akan segera menindaklanjuti laporanmu.
          Kamu bisa memantau statusnya di profil.
        </p>
        <button onClick={onClose} style={{
          background: "#22C55E", color: "#FFFFFF",
          border: "none", borderRadius: 10,
          padding: "10px 20px",
          fontFamily: "Poppins", fontSize: 13,
          fontWeight: 600, cursor: "pointer",
        }}>
          Selesai
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #E2E8F0",
      borderRadius: 16, padding: 20, marginBottom: 24,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16,
      }}>
        <h3 style={{
          fontFamily: "Poppins", fontSize: 15,
          fontWeight: 700, color: "#1E2938", margin: 0,
        }}>
          Buat Laporan — {category.name}
        </h3>
        <button onClick={onClose} style={{
          background: "none", border: "none",
          cursor: "pointer", fontSize: 18, color: "#647488",
        }}>
          ✕
        </button>
      </div>

      <label style={{
        fontFamily: "Inter", fontSize: 12,
        fontWeight: 600, color: "#647488",
        display: "block", marginBottom: 6,
      }}>
        Judul Laporan
      </label>
      <input
        value={form.subject}
        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
        placeholder="Ringkasan singkat masalahmu"
        style={{
          width: "100%", border: "1.5px solid #E2E8F0",
          borderRadius: 10, padding: "10px 14px",
          fontFamily: "Inter", fontSize: 13,
          marginBottom: 14, boxSizing: "border-box",
        }}
      />

      <label style={{
        fontFamily: "Inter", fontSize: 12,
        fontWeight: 600, color: "#647488",
        display: "block", marginBottom: 6,
      }}>
        Ceritakan Masalahmu
      </label>
      <textarea
        value={form.description}
        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        placeholder="Ceritakan secara detail apa yang terjadi..."
        rows={5}
        style={{
          width: "100%", border: "1.5px solid #E2E8F0",
          borderRadius: 10, padding: "10px 14px",
          fontFamily: "Inter", fontSize: 13,
          marginBottom: 14, resize: "none",
          boxSizing: "border-box",
        }}
      />

      <label style={{
        display: "flex", alignItems: "center",
        gap: 8, marginBottom: 16, cursor: "pointer",
      }}>
        <input
          type="checkbox"
          checked={form.is_anonymous}
          onChange={e => setForm(p => ({ ...p, is_anonymous: e.target.checked }))}
          style={{ width: 16, height: 16 }}
        />
        <span style={{ fontFamily: "Inter", fontSize: 13, color: "#647488" }}>
          Kirim sebagai anonim
        </span>
      </label>

      <button
        onClick={handleSubmit}
        disabled={!form.subject || !form.description || submitting}
        style={{
          width: "100%", background: "#084463", color: "#FFFFFF",
          border: "none", borderRadius: 12, padding: "13px",
          fontFamily: "Poppins", fontSize: 14, fontWeight: 600,
          cursor: "pointer",
          opacity: (!form.subject || !form.description) ? 0.5 : 1,
        }}
      >
        {submitting ? "Mengirim..." : "Kirim Laporan"}
      </button>
    </div>
  )
}

function OfficerSection({
  officers,
  router,
}: {
  officers: CareOfficer[]
  router: any
}) {
  const [selectedType, setSelectedType] = useState("psikologi")

  const types = [
    { key: "psikologi", label: "Psikologi", emoji: "🧠" },
    { key: "agama", label: "Agama", emoji: "🕌" },
    { key: "umum", label: "Umum", emoji: "📞" },
  ]

  const activeOfficer = officers.find(o =>
    o.category?.name?.toLowerCase().includes(selectedType)
  )

  const isOnline = activeOfficer?.is_online ?? false
  const nextAvailable = activeOfficer?.next_available

  function formatNextAvailable(dt: string) {
    if (!dt) return null
    const d = new Date(dt)
    return d.toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    }) + " WIB"
  }

  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #E2E8F0",
      borderRadius: 16, padding: 20,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {types.map(t => (
          <button
            key={t.key}
            onClick={() => setSelectedType(t.key)}
            style={{
              flex: 1, padding: "8px 4px",
              background: selectedType === t.key ? "#084463" : "#F8FAFC",
              color: selectedType === t.key ? "#FFFFFF" : "#647488",
              border: selectedType === t.key
                ? "none" : "1px solid #E2E8F0",
              borderRadius: 10, cursor: "pointer",
              fontFamily: "Inter", fontSize: 12, fontWeight: 600,
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {isOnline ? (
        <div>
          <div style={{
            display: "flex", alignItems: "center",
            gap: 8, marginBottom: 16,
          }}>
            <div style={{
              width: 10, height: 10,
              borderRadius: "50%", background: "#22C55E",
            }} />
            <span style={{
              fontFamily: "Inter", fontSize: 13,
              color: "#15803D", fontWeight: 600,
            }}>
              Petugas tersedia sekarang
            </span>
          </div>
          <button
            onClick={() => router.push(`/care/chat?type=${selectedType}`)}
            style={{
              width: "100%", background: "#084463",
              color: "#FFFFFF", border: "none",
              borderRadius: 12, padding: "13px",
              fontFamily: "Poppins", fontSize: 14,
              fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(8,68,99,0.3)",
            }}
          >
            💬 Mulai Chat Sekarang
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            display: "flex", alignItems: "center",
            gap: 8, marginBottom: 8,
          }}>
            <div style={{
              width: 10, height: 10,
              borderRadius: "50%", background: "#9CA3AF",
            }} />
            <span style={{
              fontFamily: "Inter", fontSize: 13,
              color: "#647488", fontWeight: 600,
            }}>
              Tidak ada petugas online
            </span>
          </div>
          {nextAvailable && (
            <div style={{
              background: "#FFF8E7",
              border: "1px solid #FFC64F",
              borderRadius: 10, padding: "10px 14px",
              marginBottom: 12,
            }}>
              <p style={{
                fontFamily: "Inter", fontSize: 12,
                color: "#92400E", margin: 0,
              }}>
                ⏰ Petugas kembali pada:
              </p>
              <p style={{
                fontFamily: "Poppins", fontSize: 13,
                fontWeight: 700, color: "#92400E",
                margin: "4px 0 0",
              }}>
                {formatNextAvailable(nextAvailable)}
              </p>
            </div>
          )}
          <button style={{
            width: "100%", background: "#F8FAFC",
            color: "#647488", border: "1.5px solid #E2E8F0",
            borderRadius: 12, padding: "12px",
            fontFamily: "Poppins", fontSize: 13,
            fontWeight: 600, cursor: "pointer",
          }}>
            🔔 Ingatkan Saya saat Petugas Online
          </button>
        </div>
      )}
    </div>
  )
}
