"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Clock, ExternalLink, Trophy, CalendarDays, ClipboardList } from "lucide-react";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";

function EventDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReg, setShowReg] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", email: "", whatsapp: "", promo_code: "" });
  const [regStatus, setRegStatus] = useState<"idle" | "success" | "redirecting" | "error">("idle");
  const [regMsg, setRegMsg] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [promoApplied, setPromoApplied] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const paymentDone = searchParams.get("payment") === "success";

  const applyPromo = async () => {
    if (!event || !regForm.promo_code) return;
    setPromoLoading(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: event.id, validate_promo: true, promo_code: regForm.promo_code }),
      });
      const json = await res.json();
      if (!res.ok) { setPromoApplied({ error: json.error }); setPromoLoading(false); return; }
      setPromoApplied(json);
    } catch { setPromoApplied({ error: "Gagal validasi" }); }
    setPromoLoading(false);
  };

  const isPaid = event?.is_free === false && event?.price > 0;
  const hasDiscount = event?.discount_type && event?.discount_value;
  const finalPrice = promoApplied?.final_price ?? event?.price;
  const originalPrice = event?.price;

  const handleRegister = async () => {
    if (!event || !regForm.name || !regForm.email) return;
    setRegSubmitting(true);
    try {
      const res = await fetch("/api/payment/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event_id: event.id, ...regForm }) });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) { router.push("/login"); return; }
        setRegStatus("error"); setRegMsg(json.error); setRegSubmitting(false); return;
      }

      if (json.payment_url) {
        setRegStatus("redirecting");
        window.location.href = json.payment_url;
        return;
      }

      setRegStatus("success");
    } catch { setRegStatus("error"); setRegMsg("Gagal mendaftar"); }
    setRegSubmitting(false);
  };

  useEffect(() => {
    fetch(`/api/familia/events?slug=${slug}`)
      .then(r => r.json())
      .then(d => setEvent(d.data || null))
      .catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Jelajahi Juga", items: [
      { id: "ed-voucher", type: "familia-voucher" as const, title: "Voucher Merchant", subtitle: "Klaim voucher gratis dari merchant partner", href: "/voucher" },
      { id: "ed-belanja", type: "familia-deal" as const, title: "Belanja", subtitle: "Penawaran spesial dari partner", href: "/belanja" },
      { id: "ed-roadmap", type: "roadmap" as const, title: "Kembangkan Skill", subtitle: "Ikuti roadmap untuk capai goals", href: "/roadmap" },
    ]},
  ];

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          <div className="h-8 w-20 rounded animate-pulse" style={{ background: "#E2E8F0" }} />
          <div className="h-48 rounded-xl animate-pulse" style={{ background: "#E2E8F0" }} />
          <div className="h-32 rounded-xl animate-pulse" style={{ background: "#E2E8F0" }} />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center" style={{ background: "#F8FAFC" }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: "#1E2938" }}>Event tidak ditemukan</p>
          <button onClick={() => router.push("/event")} className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ background: "#084463" }}>← Kembali ke Event</button>
        </div>
      </div>
    );
  }

  const isUpcoming = new Date(event.event_date) > new Date();

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-6 pt-6">
        <button onClick={() => router.push("/event")} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-90 mb-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <ArrowLeft size={16} style={{ color: "#647488" }} />
        </button>

        {event.image_url ? (
          <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4">
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4 flex items-center justify-center" style={{ background: "rgba(8,68,99,0.06)" }}>
            <CalendarDays size={40} style={{ color: "#084463", opacity: 0.3 }} />
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          {paymentDone && (
            <span className="text-[11px] px-2 py-1 rounded-full font-medium animate-in fade-in"
              style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>Pembayaran berhasil diproses</span>
          )}
          <span className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(8,68,99,0.08)", color: "#084463", border: "1px solid rgba(8,68,99,0.15)" }}>{event.category}</span>
          {isUpcoming && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(34,197,94,0.08)", color: "#22C55E" }}>Pendaftaran Buka</span>}
          {event.is_free !== false && !event.discount_type && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(255,198,79,0.08)", color: "#1E2938" }}>🆓 Gratis</span>}
          {event.discount_type && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(255,198,79,0.12)", color: "#1E2938" }}>🏷 Diskon {String(event.discount_value || "").replace("%", "")}{event.discount_type === "percentage" ? "%" : ""}</span>}
          {event.price && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(8,68,99,0.08)", color: "#084463" }}>💰 Rp {event.price?.toLocaleString("id-ID")}</span>}
        </div>

        <h1 className="text-lg font-bold mb-1" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>{event.title}</h1>
        {event.partner_name && <p className="text-sm mb-4" style={{ color: "#647488" }}>Diselenggarakan oleh {event.partner_name}</p>}

        <div className="flex flex-col gap-2 mb-5 text-sm" style={{ color: "#647488" }}>
          <span className="flex items-center gap-2"><Calendar size={14} />{formatDate(event.event_date)}</span>
          <span className="flex items-center gap-2"><Clock size={14} />{formatTime(event.event_date)}</span>
          {event.location && <span className="flex items-center gap-2"><MapPin size={14} />{event.location}</span>}
        </div>

        {event.description && (
          <div className="prose prose-sm mb-6" style={{ color: "#647488", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {event.description}
          </div>
        )}

        {isUpcoming && (
          <button onClick={() => setShowReg(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer mb-6"
            style={{ background: "#084463", color: "#FFFFFF" }}>
            <ExternalLink size={14} /> Daftar Sekarang
          </button>
        )}

        {/* Registration Modal */}
        {showReg && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowReg(false)} />
            <div className="relative w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-5 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-300" style={{ background: "#FFFFFF" }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: "#1E2938" }}>📝 Daftar — {event.title}</h3>

              {regStatus === "success" ? (
                <div className="text-center py-4">
                  <span className="text-3xl">✅</span>
                  <p className="text-sm font-semibold mt-2" style={{ color: "#22C55E" }}>Pendaftaran Berhasil!</p>
                  <p className="text-xs mt-1" style={{ color: "#647488" }}>{isPaid ? "Admin akan verifikasi pendaftaranmu." : "Cek tiketmu di halaman Eventku."}</p>
                  <button onClick={() => setShowReg(false)} className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer" style={{ background: "#084463" }}>Tutup</button>
                </div>
              ) : regStatus === "redirecting" ? (
                <div className="text-center py-4">
                  <div className="w-8 h-8 mx-auto animate-spin rounded-full border-2 border-neutral-300 border-t-[#084463]" />
                  <p className="text-sm font-semibold mt-3" style={{ color: "#084463" }}>Mengarahkan ke pembayaran...</p>
                  <p className="text-xs mt-1" style={{ color: "#647488" }}>Jangan tutup halaman ini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nama Lengkap *" className="w-full px-3 py-2 text-xs border rounded" style={{ borderColor: "#E2E8F0" }} />
                  <input value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email *" type="email" className="w-full px-3 py-2 text-xs border rounded" style={{ borderColor: "#E2E8F0" }} />
                  <input value={regForm.whatsapp} onChange={e => setRegForm(f => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="No. WhatsApp" className="w-full px-3 py-2 text-xs border rounded" style={{ borderColor: "#E2E8F0" }} />

                  {isPaid && (
                    <div className="p-3 rounded-lg" style={{ background: "#F8FAFC" }}>
                      {hasDiscount && (
                        <div className="flex gap-1.5 mb-2">
                          <input value={regForm.promo_code} onChange={e => setRegForm(f => ({ ...f, promo_code: e.target.value }))}
                            placeholder="Kode promo (opsional)" className="flex-1 px-3 py-2 text-xs border rounded" style={{ borderColor: "#E2E8F0" }} />
                          <button onClick={applyPromo} disabled={promoLoading || !regForm.promo_code}
                            className="px-3 py-2 rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
                            style={{ background: "rgba(8,68,99,0.08)", color: "#084463" }}>
                            {promoLoading ? "..." : "Pakai"}
                          </button>
                        </div>
                      )}

                      {promoApplied && !promoApplied.error && promoApplied.final_price < originalPrice ? (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between"><span style={{ color: "#647488" }}>Harga normal</span><span className="line-through" style={{ color: "#647488" }}>Rp {originalPrice?.toLocaleString("id-ID")}</span></div>
                          <div className="flex justify-between"><span style={{ color: "#22C55E" }}>Diskon</span><span style={{ color: "#22C55E" }}>-Rp {(originalPrice - promoApplied.final_price).toLocaleString("id-ID")}</span></div>
                          <div className="flex justify-between pt-1 border-t" style={{ borderColor: "#E2E8F0" }}><span className="font-bold" style={{ color: "#1E2938" }}>Total</span><span className="font-bold" style={{ color: "#084463" }}>Rp {promoApplied.final_price?.toLocaleString("id-ID")}</span></div>
                        </div>
                      ) : (
                        <p className="text-xs font-semibold" style={{ color: "#084463" }}>💰 Biaya: Rp {originalPrice?.toLocaleString("id-ID")}</p>
                      )}

                      {promoApplied?.error && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{promoApplied.error}</p>}
                    </div>
                  )}

                  {!isPaid && (
                    <p className="text-xs" style={{ color: "#22C55E" }}>🆓 Event ini gratis</p>
                  )}
                  {regStatus === "error" && <p className="text-xs" style={{ color: "#EF4444" }}>{regMsg}</p>}
                  <button onClick={handleRegister} disabled={regSubmitting || !regForm.name || !regForm.email}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
                    style={{ background: "#084463" }}>
                    {regSubmitting ? "Mendaftar..." : !isPaid ? "Daftar Gratis" : `Bayar Rp ${finalPrice?.toLocaleString("id-ID")}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <EcosystemLinks groups={ecosystemGroups} />
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          <div className="h-48 rounded-xl animate-pulse" style={{ background: "#E2E8F0" }} />
        </div>
      </div>
    }>
      <EventDetailContent />
    </Suspense>
  );
}
