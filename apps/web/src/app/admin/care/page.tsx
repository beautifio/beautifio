"use client";

import { useState, useEffect } from "react";
import { HeartHandshake, RefreshCw, CheckCircle, PlayCircle, XCircle, Clock, UserPlus, StickyNote } from "lucide-react";
import { Badge, Button } from "@beautifio/ui";

const STATUS_LABELS: Record<string, string> = { pending: "Pending", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

export default function CarePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, sRes, uRes] = await Promise.all([
        fetch("/api/admin/care/tickets"),
        fetch("/api/admin/care/stats"),
        fetch("/api/admin/users?limit=100"),
      ]);
      if (tRes.ok) { const { data } = await tRes.json(); setTickets(data || []); }
      if (sRes.ok) { const { data } = await sRes.json(); setStats(data); }
      if (uRes.ok) { const { data } = await uRes.json(); setAdminUsers(data?.filter((u: any) => ["admin", "superadmin"].includes(u.role)) || []); }
    } catch (e) { console.error("Failed to load", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  async function updateStatus(id: string, status: string) {
    try {
      await fetch("/api/admin/care/tickets", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      await fetchAll();
    } catch (e) { console.error("Update failed", e); }
  }

  async function assignTicket(id: string, assigned_to: string | null) {
    try {
      await fetch("/api/admin/care/tickets", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, assigned_to }) });
      await fetchAll();
    } catch (e) { console.error("Assign failed", e); }
  }

  const filtered = statusFilter ? tickets.filter((t) => t.status === statusFilter) : tickets;

  const CATEGORY_LABELS: Record<string, string> = {
    kekerasan: "Kekerasan", pelecehan: "Pelecehan", kecemasan: "Kecemasan", depresi: "Depresi",
    trauma: "Trauma", hubungan: "Hubungan", karir: "Karir", keuangan: "Keuangan",
    adiksi: "Adiksi", spiritual: "Spiritual", keluarga: "Keluarga", pendidikan: "Pendidikan",
    identitas: "Identitas", lainnya: "Lainnya",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Care Tickets</h1>

      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {["pending", "in_progress", "resolved", "closed"].map((s) => {
            const count = stats.by_status[s];
            return (
              <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${statusFilter === s ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300" : "bg-white border-gray-200 hover:border-amber-200"}`}>
                <div className="flex items-center gap-2">
                  {s === "pending" ? <Clock className="w-4 h-4 text-yellow-500" /> : s === "in_progress" ? <PlayCircle className="w-4 h-4 text-blue-500" /> : s === "resolved" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                  <span className="text-[10px] font-medium text-gray-500">{STATUS_LABELS[s]}</span>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">{count}</p>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Tidak ada tiket</p>}
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
                    <Badge variant="accent" className="text-[10px]">{CATEGORY_LABELS[t.category] || t.category}</Badge>
                    {t.partner_type && <span className="text-[10px] text-gray-400">{t.partner_type}</span>}
                  </div>
                  {t.story && <p className="text-sm text-gray-900 line-clamp-3 mb-1">{t.story}</p>}
                  {t.form_data && typeof t.form_data === "object" && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.keys(t.form_data).map((key) => {
                        const val = (t.form_data as any)[key];
                        return val ? <span key={key} className="text-[10px] px-2 py-0.5 bg-gray-50 rounded-full text-gray-500">{key}: {String(val)}</span> : null;
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                    <span className="font-medium">{t.users?.full_name || t.users?.email}</span>
                    <span>{new Date(t.created_at).toLocaleString("id-ID")}</span>
                    {t.assigned_to && <span>Assigned to {adminUsers.find((u) => u.id === t.assigned_to)?.full_name || t.assigned_to}</span>}
                    {t.resolved_at && <span>Resolved {new Date(t.resolved_at).toLocaleString("id-ID")}</span>}
                  </div>
                  {t.notes && <p className="text-[10px] text-gray-400 mt-1 italic">Notes: {t.notes}</p>}
                </div>

                <div className="flex flex-col gap-1 flex-shrink-0">
                  {t.status === "pending" && (
                    <button onClick={() => updateStatus(t.id, "in_progress")}
                      className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center cursor-pointer" title="Take">
                      <PlayCircle className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                  )}
                  {t.status === "in_progress" && (
                    <button onClick={() => updateStatus(t.id, "resolved")}
                      className="w-7 h-7 rounded-lg hover:bg-green-50 flex items-center justify-center cursor-pointer" title="Resolve">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    </button>
                  )}
                  {(t.status === "pending" || t.status === "in_progress") && (
                    <select onChange={(e) => assignTicket(t.id, e.target.value || null)} defaultValue={t.assigned_to || ""}
                      className="w-7 text-[8px] p-0 border-0 bg-transparent cursor-pointer" title="Assign">
                      <option value="">—</option>
                      {adminUsers.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
