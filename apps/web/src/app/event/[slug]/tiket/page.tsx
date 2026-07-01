"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, Clock, Printer, Sparkles } from "lucide-react";
import QRCode from "qrcode";

const PEACOCK = "#084463";
const SLATE = "#647488";
const DEEP_SLATE = "#1E2938";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
}
function formatShort(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
}

function TicketContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const regId = searchParams.get("reg");
  const [reg, setReg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!regId) { setLoading(false); return; }
    fetch(`/api/payment/ticket?reg=${regId}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setReg(d.data);
          QRCode.toDataURL(`beautifio:ticket:${d.data.id?.slice(0, 8).toUpperCase()}`, {
            width: 160, margin: 1, errorCorrectionLevel: "M",
            color: { dark: PEACOCK, light: "#ffffff" },
          }).then(setQrDataUrl);
        }
      })
      .finally(() => setLoading(false));
  }, [regId]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-neutral-300" style={{ borderTopColor: PEACOCK }} />
      </div>
    );
  }

  if (!reg) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
        <p className="text-sm" style={{ color: SLATE }}>Tiket tidak ditemukan</p>
      </div>
    );
  }

  const event = reg.event || {};
  const ticketCode = reg.id?.slice(0, 8).toUpperCase();
  const createdAt = reg.created_at ? formatShort(reg.created_at) : "-";

  return (
    <div className="min-h-screen py-10 px-4 print:p-0 print:py-0" style={{ background: "#F8FAFC" }}>
      <div className="max-w-lg mx-auto print:max-w-none">

        <div className="text-center mb-6 print:hidden">
          <h1 className="text-xl font-bold mb-1" style={{ color: DEEP_SLATE, fontFamily: "Poppins, sans-serif" }}>E-Ticket</h1>
          <p className="text-xs" style={{ color: SLATE }}>Tunjukkan tiket ini saat check-in</p>
          <button onClick={handlePrint}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95"
            style={{ background: PEACOCK, color: "#FFFFFF" }}>
            <Printer size={13} /> Cetak Tiket
          </button>
        </div>

        {/* Ticket Card */}
        <div className="rounded-2xl overflow-hidden print:rounded-none print:shadow-none" style={{
          background: "#FFFFFF",
          boxShadow: "0 4px 40px rgba(8,68,99,0.08)",
        }}>

          {/* Header gradient */}
          <div className="relative overflow-hidden pb-0" style={{
            background: `linear-gradient(135deg, ${PEACOCK} 0%, #0a5a7d 100%)`,
          }}>
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: "radial-gradient(circle at 25% 40%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 60%, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
            <div className="relative px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[8px] uppercase tracking-[.3em] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Beautifio</p>
                <p className="text-lg font-bold tracking-tight mt-0.5" style={{ color: "#FFFFFF", fontFamily: "Poppins, sans-serif" }}>E-Ticket</p>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold"
                style={{ background: "rgba(255,255,255,0.12)", color: "#FFFFFF", backdropFilter: "blur(4px)" }}>
                <Sparkles size={10} /> CONFIRMED
              </div>
            </div>
            {/* Decorative curve */}
            <svg viewBox="0 0 480 20" className="w-full h-5 -mb-px block" preserveAspectRatio="none">
              <path d="M0,20 C80,0 160,20 240,0 C320,20 400,0 480,20 L480,20 L0,20 Z" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Cover Image */}
          {event.image_url && (
            <div className="aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Body */}
          <div className="px-6 pt-4 pb-3">
            <h2 className="text-lg font-bold leading-tight mb-4" style={{ color: DEEP_SLATE, fontFamily: "Poppins, sans-serif" }}>
              {event.title}
            </h2>

            <div className="grid grid-cols-1 gap-2 mb-5">
              <div className="flex items-center gap-2.5 text-xs" style={{ color: SLATE }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(8,68,99,0.06)" }}>
                  <CalendarDays size={13} style={{ color: PEACOCK }} />
                </div>
                <span className="font-medium" style={{ color: DEEP_SLATE }}>{formatDate(event.event_date)}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs" style={{ color: SLATE }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(8,68,99,0.06)" }}>
                  <Clock size={13} style={{ color: PEACOCK }} />
                </div>
                <span className="font-medium" style={{ color: DEEP_SLATE }}>{formatTime(event.event_date)} WIB</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2.5 text-xs" style={{ color: SLATE }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(8,68,99,0.06)" }}>
                    <MapPin size={13} style={{ color: PEACOCK }} />
                  </div>
                  <span className="font-medium" style={{ color: DEEP_SLATE }}>{event.location}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t mb-4" style={{ borderColor: "#E2E8F0", borderStyle: "dashed" }} />

            {/* Attendee + QR */}
            <div className="flex gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-[.15em] mb-2 font-semibold" style={{ color: SLATE }}>Peserta</p>
                <p className="text-sm font-bold leading-snug" style={{ color: DEEP_SLATE }}>{reg.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: SLATE }}>{reg.email}</p>
                {reg.whatsapp && <p className="text-[11px]" style={{ color: SLATE }}>{reg.whatsapp}</p>}
              </div>

              <div className="shrink-0">
                {qrDataUrl ? (
                  <div className="w-[84px] h-[84px] rounded-xl overflow-hidden border" style={{ background: "#fff", borderColor: "#E2E8F0" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrDataUrl} width={84} height={84} alt="QR Code" />
                  </div>
                ) : (
                  <div className="w-[84px] h-[84px] rounded-xl animate-pulse" style={{ background: "#E2E8F0" }} />
                )}
              </div>
            </div>

            {/* Stub */}
            <div className="mt-4 pt-4 flex items-center justify-between border-t" style={{ borderColor: "#E2E8F0", borderStyle: "dashed" }}>
              <div>
                <p className="text-[9px] uppercase tracking-[.15em] mb-0.5 font-semibold" style={{ color: SLATE }}>Kode Tiket</p>
                <p className="text-sm font-mono font-bold tracking-[.2em]" style={{ color: PEACOCK }}>#{ticketCode}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[.15em] mb-0.5 font-semibold" style={{ color: SLATE }}>Harga</p>
                <p className="text-sm font-bold" style={{ color: PEACOCK }}>
                  {event.price ? `Rp ${event.price?.toLocaleString("id-ID")}` : "Gratis"}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between text-[10px] font-medium" style={{ color: SLATE }}>
              <span>Didaftar {createdAt}</span>
              <span>beautifio.com</span>
            </div>
          </div>
        </div>

        {/* Print-only block */}
        <div className="hidden print:block mt-6 text-center">
          <p className="text-[9px] uppercase tracking-[.3em] font-bold mb-3" style={{ color: SLATE }}>Tunjukkan saat check-in</p>
          {qrDataUrl && (
            <div className="inline-block p-3 rounded-xl border-2 border-dashed" style={{ borderColor: PEACOCK }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} width={130} height={130} alt="QR Code" />
            </div>
          )}
          <p className="text-sm font-mono font-bold tracking-[.2em] mt-2" style={{ color: PEACOCK }}>#{ticketCode}</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 12mm; size: auto; }
        }
      `}</style>
    </div>
  );
}

export default function EventTicketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-neutral-300" style={{ borderTopColor: PEACOCK }} />
      </div>
    }>
      <TicketContent />
    </Suspense>
  );
}
