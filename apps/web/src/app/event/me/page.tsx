"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Ticket, Download } from "lucide-react";

export default function EventMePage() {
  const router = useRouter();
  const [regs, setRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "past" | "all">("upcoming");

  useEffect(() => {
    fetch("/api/events/my-registrations")
      .then(r => r.json())
      .then(d => setRegs(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = regs.filter((r: any) => r.event && new Date(r.event.event_date) > new Date());
  const past = regs.filter((r: any) => !r.event || new Date(r.event?.event_date) <= new Date());
  const filtered = tab === "upcoming" ? upcoming : tab === "past" ? past : regs;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl border animate-pulse" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-6 pt-6">
        <button onClick={() => router.push("/event")} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-90 mb-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <ArrowLeft size={16} style={{ color: "#647488" }} />
        </button>

        <h1 className="text-xl font-bold mb-4" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Eventku</h1>

        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
          {[
            { key: "upcoming" as const, label: "📅 Mendatang", count: upcoming.length },
            { key: "past" as const, label: "✅ Selesai", count: past.length },
            { key: "all" as const, label: "Semua", count: regs.length },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={{ background: tab === t.key ? "#FFFFFF" : "transparent", color: tab === t.key ? "#1E2938" : "#647488", boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Ticket size={40} style={{ color: "#E2E8F0", margin: "0 auto 12px" }} />
              <p className="text-sm font-medium" style={{ color: "#647488" }}>Belum ada event yang didaftar</p>
              <p className="text-xs mt-1" style={{ color: "#647488" }}>Jelajahi event menarik di halaman Event</p>
            </div>
          ) : (
            filtered.map((r: any) => (
              <div key={r.id} className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{
                    background: r.status === "confirmed" ? "rgba(34,197,94,0.1)" : r.status === "pending" ? "rgba(255,198,79,0.1)" : "rgba(239,68,68,0.1)",
                    color: r.status === "confirmed" ? "#22C55E" : r.status === "pending" ? "#1E2938" : "#EF4444",
                  }}>
                    {r.status === "confirmed" ? "✅ Dikonfirmasi" : r.status === "pending" ? "⏳ Menunggu" : "❌ Ditolak"}
                  </span>
                  {r.event && <span className="text-[10px]" style={{ color: "#647488" }}>{formatDate(r.event.event_date)}</span>}
                </div>
                {r.event ? (
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/event/${r.event.slug}`} className="text-sm font-semibold hover:underline flex-1 min-w-0 truncate" style={{ color: "#1E2938" }}>
                      {r.event.title}
                    </Link>
                    {r.status === "confirmed" && r.event && (
                      <button onClick={() => window.open(`/event/${r.event.slug}/tiket?reg=${r.id}`, "_blank")}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors shrink-0"
                        style={{ background: "rgba(8,68,99,0.08)", color: "#084463" }}>
                        <Download size={10} /> Tiket
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold" style={{ color: "#1E2938" }}>Event (dihapus)</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
