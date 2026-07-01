"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Plus, Pencil, Trash2, X, Download } from "lucide-react";

type Tab = "dashboard" | "plans" | "users" | "settings" | "vouchers";

interface Plan {
  id: string; name: string; duration_type: string; tier: string;
  price_idr: number; original_price_idr: number | null;
  max_active_chats: number;
  features: string[]; is_active: boolean; display_order: number;
}

interface UserSub {
  id: string; user_id: string; plan_id: string;
  status: string; started_at: string; expires_at: string;
  payment_ref: string | null;
  plan?: { name: string };
  user?: { email: string; full_name: string };
}

const COLORS = {
  peacock: "#084463", icySky: "#6BB9D4", saffron: "#FFC64F",
  cloud: "#F8FAFC", white: "#FFFFFF", deepSlate: "#1E2938",
  slate: "#647488", success: "#22C55E", danger: "#EF4444", border: "#E2E8F0",
};

const DURATION_MAP: Record<string, string> = {
  monthly: "Bulanan", quarterly: "3 Bulan", yearly: "Tahunan", lifetime: "Seumur Hidup",
};

export default function AdminSubscriptions() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<UserSub[]>([]);
  const [loading, setLoading] = useState(true);

  // Plan modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState(0);
  const [planMaxChats, setPlanMaxChats] = useState(20);
  const [planDuration, setPlanDuration] = useState("monthly");
  const [planFeatures, setPlanFeatures] = useState("");
  const [planActive, setPlanActive] = useState(true);
  const [planTier, setPlanTier] = useState("pro");
  const [planOrigPrice, setPlanOrigPrice] = useState(0);

  // Manual sub modal
  const [showSubModal, setShowSubModal] = useState(false);
  const [subUserId, setSubUserId] = useState("");
  const [subPlanId, setSubPlanId] = useState("");
  const [subDays, setSubDays] = useState(30);
  const [subPaymentRef, setSubPaymentRef] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<{ id: string; email: string; full_name: string }[]>([]);

  // Voucher
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editVoucherId, setEditVoucherId] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherType, setVoucherType] = useState("percentage");
  const [voucherValue, setVoucherValue] = useState(20);
  const [voucherMinTier, setVoucherMinTier] = useState("");
  const [voucherMaxUses, setVoucherMaxUses] = useState(100);
  const [voucherValidFrom, setVoucherValidFrom] = useState("");
  const [voucherValidUntil, setVoucherValidUntil] = useState("");
  const [voucherActive, setVoucherActive] = useState(true);

  // Settings
  const [bankAccount, setBankAccount] = useState("");
  const [waLink, setWaLink] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [subsPage, setSubsPage] = useState(0);
  const PAGE_SIZE = 20;

  // Dashboard stats
  const [stats, setStats] = useState<any>(null);

  // Users filter
  const [subsSearch, setSubsSearch] = useState("");
  const [subsStatusFilter, setSubsStatusFilter] = useState("all");

  useEffect(() => { loadData(); }, []);

  const loadStats = async () => {
    const r = await fetch("/api/admin/subscriptions?action=stats");
    if (r.ok) setStats(await r.json());
  };

  const loadVouchers = async () => {
    const r = await fetch("/api/admin/subscriptions?action=listVouchers");
    if (r.ok) { const j = await r.json(); setVouchers(j.vouchers || []); }
  };

  const loadData = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/subscriptions?action=listAll");
    if (res.ok) {
      const json = await res.json();
      setPlans((json.plans || []).map((p: any) => ({
        ...p, features: typeof p.features === "string" ? JSON.parse(p.features || "[]") : (p.features || []),
      })));
      setSubs(json.subs || []);
      setBankAccount(json.settings?.payment_bank_account || "");
      setWaLink(json.settings?.payment_wa_link || "");
    }
    setLoading(false);
    loadVouchers();
    loadStats();
  };

  // ---- Plans ----
  const openNewPlan = () => {
    setEditPlanId(null); setPlanName(""); setPlanPrice(0);
    setPlanMaxChats(20); setPlanDuration("monthly"); setPlanTier("pro");
    setPlanOrigPrice(0);
    setPlanFeatures(""); setPlanActive(true); setShowPlanModal(true);
  };

  const openEditPlan = (p: Plan) => {
    setEditPlanId(p.id); setPlanName(p.name); setPlanPrice(p.price_idr);
    setPlanMaxChats(p.max_active_chats); setPlanDuration(p.duration_type || "monthly");
    setPlanTier(p.tier || "pro"); setPlanOrigPrice(p.original_price_idr || 0);
    setPlanFeatures(p.features.join("\n")); setPlanActive(p.is_active);
    setShowPlanModal(true);
  };

  const savePlan = async () => {
    if (!planName.trim()) return;
    setSaving(true); setError("");
    const features = planFeatures.split("\n").map(f => f.trim()).filter(Boolean);
    const res = await fetch("/api/admin/subscriptions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: editPlanId ? "updatePlan" : "createPlan",
        plan_id: editPlanId, name: planName.trim(), price_idr: planPrice,
        original_price_idr: planOrigPrice || null,
        max_active_chats: planMaxChats, duration_type: planDuration,
        tier: planTier,
        features, is_active: planActive,
      }),
    });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || "Gagal"); }
    else { setShowPlanModal(false); loadData(); }
    setSaving(false);
  };

  const deletePlan = async (id: string, name: string) => {
    if (!confirm(`Hapus plan "${name}"?`)) return;
    await fetch("/api/admin/subscriptions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deletePlan", plan_id: id }),
    });
    loadData();
  };

  const togglePlanActive = async (id: string, active: boolean) => {
    await fetch("/api/admin/subscriptions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updatePlan", plan_id: id, is_active: !active }),
    });
    loadData();
  };

  // ---- Subs ----
  const addManualSub = async () => {
    if (!subUserId || !subPlanId) return;
    setSaving(true);
    const res = await fetch("/api/admin/subscriptions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "createSub", user_id: subUserId, plan_id: subPlanId,
        duration_days: subDays, payment_ref: subPaymentRef || null,
      }),
    });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || "Gagal"); setSaving(false); return; }
    setShowSubModal(false); setSubUserId(""); setSubPlanId(""); setSubPaymentRef("");
    setSaving(false); loadData();
  };

  const cancelSub = async (id: string) => {
    if (!confirm("Batalkan subscription ini?")) return;
    await fetch("/api/admin/subscriptions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancelSub", sub_id: id }),
    });
    loadData();
  };

  const searchUsers = async (q: string) => {
    setUserSearch(q);
    if (q.length < 2) { setUserResults([]); return; }
    const res = await fetch(`/api/admin/subscriptions?action=searchUsers&q=${encodeURIComponent(q)}`);
    if (res.ok) { const j = await res.json(); setUserResults(j.users || []); }
  };

  // ---- Settings ----
  const saveSetting = async (key: string, value: string) => {
    await fetch("/api/admin/subscriptions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveSetting", key, value }),
    });
    loadData();
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }) : "-";

  const filteredSubs = subs.filter(s => {
    if (subsStatusFilter !== "all" && s.status !== subsStatusFilter) return false;
    if (subsSearch) {
      const q = subsSearch.toLowerCase();
      const name = (s.user?.full_name || "").toLowerCase();
      const email = (s.user?.email || "").toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });
  const pagedSubs = filteredSubs.slice(0, (subsPage + 1) * PAGE_SIZE);
  const hasMore = pagedSubs.length < filteredSubs.length;

  if (loading) {
    return <div className="flex items-center justify-center py-16"><div className="w-7 h-7 animate-spin rounded-full border-2 border-neutral-300" style={{ borderTopColor: COLORS.peacock }} /></div>;
  }

  return (
    <div className="space-y-4 max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: COLORS.deepSlate, fontFamily: "Poppins, sans-serif" }}>Subscription</h1>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: COLORS.cloud, border: `1px solid ${COLORS.border}` }}>
          {(["dashboard", "plans", "users", "settings", "vouchers"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={{ background: tab === t ? COLORS.white : "transparent", color: tab === t ? COLORS.deepSlate : COLORS.slate, boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>
              {t === "dashboard" ? "Dashboard" : t === "plans" ? "Plans" : t === "users" ? "Users" : t === "vouchers" ? "Voucher" : "Settings"}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: Dashboard */}
      {tab === "dashboard" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border" style={{ background: COLORS.white, borderColor: COLORS.border }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: COLORS.slate }}>Active Subs</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.peacock, fontFamily: "Poppins, sans-serif" }}>{stats?.activeTotal ?? "-"}</p>
              <div className="flex gap-3 mt-1 text-[10px]" style={{ color: COLORS.slate }}>
                <span>Pro: {stats?.byPro ?? 0}</span>
                <span>Ultimate: {stats?.byUltimate ?? 0}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl border" style={{ background: COLORS.white, borderColor: COLORS.border }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: COLORS.slate }}>MRR</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.success, fontFamily: "Poppins, sans-serif" }}>Rp {(stats?.mrr ?? 0).toLocaleString("id-ID")}</p>
              <p className="text-[10px] mt-1" style={{ color: COLORS.slate }}>Estimasi /bulan</p>
            </div>
            <div className="p-4 rounded-xl border" style={{ background: COLORS.white, borderColor: COLORS.border }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: COLORS.slate }}>Total Subs</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.deepSlate, fontFamily: "Poppins, sans-serif" }}>{stats?.totalSubs ?? "-"}</p>
              <p className="text-[10px] mt-1" style={{ color: COLORS.slate }}>Semua waktu</p>
            </div>
            <div className="p-4 rounded-xl border" style={{ background: COLORS.white, borderColor: COLORS.border }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: COLORS.slate }}>Trial Users</p>
              <p className="text-2xl font-bold" style={{ color: "#6BB9D4", fontFamily: "Poppins, sans-serif" }}>{stats?.trialUsers ?? "-"}</p>
              <p className="text-[10px] mt-1" style={{ color: COLORS.slate }}>Aktif trial</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="p-4 rounded-xl border" style={{ background: COLORS.white, borderColor: COLORS.border }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-3" style={{ color: COLORS.slate }}>Top Voucher</p>
              {stats?.topVouchers?.length > 0 ? (
                <div className="space-y-2">
                  {stats.topVouchers.map((v: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="font-mono font-semibold" style={{ color: COLORS.peacock }}>{v.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(8,68,99,0.06)", color: COLORS.deepSlate }}>{v.used}x</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs" style={{ color: COLORS.slate }}>Belum ada data</p>}
            </div>
            <div className="p-4 rounded-xl border" style={{ background: COLORS.white, borderColor: COLORS.border }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-3" style={{ color: COLORS.slate }}>Total Revenue</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.peacock, fontFamily: "Poppins, sans-serif" }}>Rp {(stats?.totalRevenue ?? 0).toLocaleString("id-ID")}</p>
              <p className="text-[10px] mt-1" style={{ color: COLORS.slate }}>Semua waktu (harga gross)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Plans */}
      {tab === "plans" && (
        <div>
          <button onClick={openNewPlan} className="mb-3 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer" style={{ background: COLORS.peacock, color: COLORS.white }}>
            <Plus size={12} /> Tambah Plan
          </button>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: COLORS.cloud, color: COLORS.slate }}>
                  <th className="text-left py-3 px-3 font-semibold">Nama</th>
                  <th className="text-left py-3 px-3 font-semibold">Tier</th>
                  <th className="text-left py-3 px-3 font-semibold">Harga</th>
                  <th className="text-left py-3 px-3 font-semibold">Chat</th>
                  <th className="text-left py-3 px-3 font-semibold">Fitur</th>
                  <th className="text-left py-3 px-3 font-semibold">Status</th>
                  <th className="text-left py-3 px-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td className="py-3 px-3 font-semibold" style={{ color: COLORS.deepSlate }}>{p.name}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
                        background: p.tier === "ultimate" ? `rgba(8,68,99,0.1)` : `rgba(255,198,79,0.15)`,
                        color: p.tier === "ultimate" ? COLORS.peacock : "#8B6914",
                      }}>{p.tier === "ultimate" ? "💎 Ultimate" : p.tier === "pro" ? "👑 Pro" : p.tier}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium" style={{ color: COLORS.peacock }}>Rp {p.price_idr.toLocaleString("id-ID")}</span>
                      {p.original_price_idr && <span className="text-[10px] line-through ml-1" style={{ color: COLORS.slate }}>Rp {p.original_price_idr.toLocaleString("id-ID")}</span>}
                      <span className="text-[10px] ml-1" style={{ color: COLORS.slate }}>/ {p.duration_type === "yearly" ? "thn" : "bln"}</span>
                    </td>
                    <td className="py-3 px-3" style={{ color: COLORS.deepSlate }}>{p.max_active_chats}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {p.features.slice(0, 3).map((f, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(107,185,212,0.1)", color: COLORS.icySky }}>{f}</span>
                        ))}
                        {p.features.length > 3 && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: COLORS.cloud, color: COLORS.slate }}>+{p.features.length - 3}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <button onClick={() => togglePlanActive(p.id, p.is_active)}
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer"
                        style={{ background: p.is_active ? `rgba(34,197,94,0.1)` : `rgba(100,116,136,0.1)`, color: p.is_active ? COLORS.success : COLORS.slate }}>
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEditPlan(p)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: "rgba(8,68,99,0.06)" }}>
                          <Pencil size={12} style={{ color: COLORS.peacock }} />
                        </button>
                        <button onClick={() => deletePlan(p.id, p.name)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: "rgba(239,68,68,0.06)" }}>
                          <Trash2 size={12} style={{ color: COLORS.danger }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center" style={{ color: COLORS.slate }}>Belum ada plan. Klik "Tambah Plan".</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Users */}
      {tab === "users" && (
        <div>
          <div className="flex gap-2 mb-3">
            <button onClick={() => { setShowSubModal(true); setError(""); setUserSearch(""); setUserResults([]); }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer" style={{ background: COLORS.peacock, color: COLORS.white }}>
              <Plus size={12} /> Tambah Subscription
            </button>

            <button onClick={() => {
              const csv = ["Nama,Email,Plan,Status,Mulai,Berakhir"].concat(
                filteredSubs.map((s: any) => `"${s.user?.full_name || s.user?.email || "Unknown"}","${s.user?.email || ""}",${s.plan?.name || "-"},${s.status},${s.started_at || ""},${s.expires_at || ""}`)
              ).join("\n");
              const blob = new Blob(["\uFEFF" + csv], { type: "text/csv" });
              const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
              a.download = "subscriptions.csv"; a.click();
            }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border"
              style={{ borderColor: COLORS.border, color: COLORS.slate }}>
              <Download size={12} /> Export CSV
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <input value={subsSearch} onChange={e => { setSubsSearch(e.target.value); setSubsPage(0); }}
              placeholder="Cari email atau nama..." className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none"
              style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
            <select value={subsStatusFilter} onChange={e => { setSubsStatusFilter(e.target.value); setSubsPage(0); }}
              className="px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }}>
              <option value="all">Semua</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: COLORS.cloud, color: COLORS.slate }}>
                  <th className="text-left py-3 px-3 font-semibold">User</th>
                  <th className="text-left py-3 px-3 font-semibold">Plan</th>
                  <th className="text-left py-3 px-3 font-semibold">Status</th>
                  <th className="text-left py-3 px-3 font-semibold">Mulai</th>
                  <th className="text-left py-3 px-3 font-semibold">Berakhir</th>
                  <th className="text-left py-3 px-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pagedSubs.map(s => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td className="py-3 px-3" style={{ color: COLORS.deepSlate }}>
                      <span className="font-medium">{s.user?.full_name || s.user?.email || "Unknown"}</span>
                      {s.user?.email && s.user?.full_name && <span className="block text-[10px]" style={{ color: COLORS.slate }}>{s.user.email}</span>}
                    </td>
                    <td className="py-3 px-3 font-medium" style={{ color: COLORS.peacock }}>{s.plan?.name || "-"}</td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                        background: s.status === "active" ? `rgba(34,197,94,0.1)` : s.status === "expired" ? `rgba(239,68,68,0.1)` : `rgba(100,116,136,0.1)`,
                        color: s.status === "active" ? COLORS.success : s.status === "expired" ? COLORS.danger : COLORS.slate,
                      }}>{s.status}</span>
                    </td>
                    <td className="py-3 px-3" style={{ color: COLORS.slate }}>{formatDate(s.started_at)}</td>
                    <td className="py-3 px-3" style={{ color: s.status === "expired" ? COLORS.danger : COLORS.slate }}>{formatDate(s.expires_at)}</td>
                    <td className="py-3 px-3">
                      {s.status === "active" && (
                        <div className="flex gap-1">
                          <button onClick={() => {
                            const days = prompt("Perpanjang berapa hari?", "30");
                            if (!days || isNaN(Number(days))) return;
                            fetch("/api/admin/subscriptions", {
                              method: "POST", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "extendSub", sub_id: s.id, days: Number(days) }),
                            }).then(() => loadData());
                          }}
                            className="text-[10px] px-2 py-1 rounded-lg font-semibold cursor-pointer"
                            style={{ background: "rgba(107,185,212,0.1)", color: "#6BB9D4" }}>+Hari</button>
                          <button onClick={() => cancelSub(s.id)}
                            className="text-[10px] px-2 py-1 rounded-lg font-semibold cursor-pointer"
                            style={{ background: "rgba(239,68,68,0.08)", color: COLORS.danger }}>Batal</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center" style={{ color: COLORS.slate }}>{subsSearch ? "Tidak ditemukan" : "Belum ada subscription."}</td></tr>
                )}
              </tbody>
            </table>
            {hasMore && (
              <div className="p-3 text-center">
                <button onClick={() => setSubsPage(p => p + 1)}
                  className="text-xs font-semibold cursor-pointer" style={{ color: COLORS.icySky }}>
                  Tampilkan lebih banyak ({filteredSubs.length - pagedSubs.length} tersisa)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Settings */}
      {tab === "settings" && (
        <div className="space-y-5 max-w-lg">
          <div className="p-4 rounded-xl border" style={{ borderColor: COLORS.border }}>
            <label className="text-xs font-semibold mb-2 block" style={{ color: COLORS.deepSlate }}>Nomor Rekening</label>
            <div className="flex gap-2">
              <input value={bankAccount} onChange={e => setBankAccount(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none border" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }}
                placeholder="BCA 1234567890 a/n Beautifio" />
              <button onClick={() => saveSetting("payment_bank_account", bankAccount)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer" style={{ background: COLORS.peacock }}>
                Simpan
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl border" style={{ borderColor: COLORS.border }}>
            <label className="text-xs font-semibold mb-2 block" style={{ color: COLORS.deepSlate }}>Link WhatsApp</label>
            <div className="flex gap-2">
              <input value={waLink} onChange={e => setWaLink(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none border" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }}
                placeholder="https://wa.me/628xxx" />
              <button onClick={() => saveSetting("payment_wa_link", waLink)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer" style={{ background: COLORS.peacock }}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Vouchers */}
      {tab === "vouchers" && (
        <div>
          <button onClick={() => { setEditVoucherId(null); setVoucherCode(""); setVoucherType("percentage"); setVoucherValue(20); setVoucherMinTier(""); setVoucherMaxUses(100); setVoucherValidFrom(""); setVoucherValidUntil(""); setVoucherActive(true); setShowVoucherModal(true); }}
            className="mb-3 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer" style={{ background: COLORS.peacock, color: COLORS.white }}>
            <Plus size={12} /> Tambah Voucher
          </button>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
            <table className="w-full text-xs">
              <thead><tr style={{ background: COLORS.cloud, color: COLORS.slate }}>
                <th className="text-left py-3 px-2 font-semibold">Kode</th>
                <th className="text-left py-3 px-2 font-semibold">Tipe</th>
                <th className="text-left py-3 px-2 font-semibold">Nilai</th>
                <th className="text-left py-3 px-2 font-semibold">Min Tier</th>
                <th className="text-left py-3 px-2 font-semibold">Kuota</th>
                <th className="text-left py-3 px-2 font-semibold">Status</th>
                <th className="text-left py-3 px-2 font-semibold">Aksi</th>
              </tr></thead>
              <tbody>
                {vouchers.map((v: any) => (
                  <tr key={v.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td className="py-3 px-2 font-mono font-semibold" style={{ color: COLORS.peacock }}>{v.code}</td>
                    <td className="py-3 px-2" style={{ color: COLORS.slate }}>{v.discount_type === "percentage" ? "Persen" : "Nominal"}</td>
                    <td className="py-3 px-2 font-medium" style={{ color: COLORS.deepSlate }}>{v.discount_type === "percentage" ? `${v.discount_value}%` : `Rp ${Number(v.discount_value).toLocaleString("id-ID")}`}</td>
                    <td className="py-3 px-2" style={{ color: COLORS.slate }}>{v.min_tier || "Semua"}</td>
                    <td className="py-3 px-2" style={{ color: COLORS.slate }}>{v.max_uses ? `${v.used_count || 0}/${v.max_uses}` : "Unlimited"}</td>
                    <td className="py-3 px-2">
                      <button onClick={() => { const up = { action: "updateVoucher", voucher_id: v.id, is_active: !v.is_active }; fetch("/api/admin/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(up) }).then(() => loadVouchers()); }}
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer"
                        style={{ background: v.is_active ? "rgba(34,197,94,0.1)" : "rgba(100,116,136,0.1)", color: v.is_active ? COLORS.success : COLORS.slate }}>
                        {v.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="py-3 px-2"><div className="flex gap-1">
                      <button onClick={() => { setEditVoucherId(v.id); setVoucherCode(v.code); setVoucherType(v.discount_type); setVoucherValue(v.discount_value); setVoucherMinTier(v.min_tier || ""); setVoucherMaxUses(v.max_uses || 100); setVoucherValidFrom(v.valid_from?.slice(0,10) || ""); setVoucherValidUntil(v.valid_until?.slice(0,10) || ""); setVoucherActive(v.is_active); setShowVoucherModal(true); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: "rgba(8,68,99,0.06)" }}><Pencil size={12} style={{ color: COLORS.peacock }} /></button>
                      <button onClick={() => { if(!confirm("Hapus voucher?")) return; fetch("/api/admin/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteVoucher", voucher_id: v.id }) }).then(() => loadVouchers()); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: "rgba(239,68,68,0.06)" }}><Trash2 size={12} style={{ color: COLORS.danger }} /></button>
                    </div></td>
                  </tr>
                ))}
                {vouchers.length === 0 && (<tr><td colSpan={7} className="py-8 text-center" style={{ color: COLORS.slate }}>Belum ada voucher.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200" style={{ background: COLORS.white }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: COLORS.deepSlate, fontFamily: "Poppins, sans-serif" }}>{editPlanId ? "Edit Plan" : "Tambah Plan"}</h3>
              <button onClick={() => setShowPlanModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: COLORS.cloud }}>
                <X size={14} style={{ color: COLORS.slate }} />
              </button>
            </div>
            <div className="space-y-3">
              <input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="Nama Plan" className="w-full px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
              <div className="grid grid-cols-2 gap-2">
                <select value={planTier} onChange={e => setPlanTier(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }}>
                  <option value="pro">👑 Pro</option>
                  <option value="ultimate">💎 Ultimate</option>
                </select>
                <select value={planDuration} onChange={e => setPlanDuration(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }}>
                  {Object.entries(DURATION_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] mb-1 block" style={{ color: COLORS.slate }}>Harga Nett (Rp)</label>
                  <input type="number" value={planPrice} onChange={e => setPlanPrice(Number(e.target.value))} className="w-full px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
                </div>
                <div>
                  <label className="text-[9px] mb-1 block" style={{ color: COLORS.slate }}>Harga Coret (Rp)</label>
                  <input type="number" value={planOrigPrice} onChange={e => setPlanOrigPrice(Number(e.target.value))} className="w-full px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
                </div>
              </div>
              <input type="number" value={planMaxChats} onChange={e => setPlanMaxChats(Number(e.target.value))} placeholder="Max Chat" className="w-full px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
              <textarea value={planFeatures} onChange={e => setPlanFeatures(e.target.value)} rows={3} placeholder="Fitur (1 per baris)" className="w-full px-3 py-2 text-xs rounded-lg border outline-none resize-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: COLORS.deepSlate }}>
                <input type="checkbox" checked={planActive} onChange={e => setPlanActive(e.target.checked)} /> Aktif
              </label>
              {error && <p className="text-xs" style={{ color: COLORS.danger }}>{error}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowPlanModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer" style={{ borderColor: COLORS.border, color: COLORS.slate }}>Batal</button>
                <button onClick={savePlan} disabled={!planName.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: COLORS.peacock }}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200" style={{ background: COLORS.white }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: COLORS.deepSlate, fontFamily: "Poppins, sans-serif" }}>{editVoucherId ? "Edit Voucher" : "Tambah Voucher"}</h3>
              <button onClick={() => setShowVoucherModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: COLORS.cloud }}><X size={14} style={{ color: COLORS.slate }} /></button>
            </div>
            <div className="space-y-3">
              <input value={voucherCode} onChange={e => setVoucherCode(e.target.value)} placeholder="Kode (contoh: BEAUTIFIO20)" className="w-full px-3 py-2 text-xs rounded-lg border outline-none uppercase" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
              <div className="flex gap-2">
                <select value={voucherType} onChange={e => setVoucherType(e.target.value)} className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }}>
                  <option value="percentage">Persentase (%)</option>
                  <option value="nominal">Nominal (Rp)</option>
                </select>
                <input type="number" value={voucherValue} onChange={e => setVoucherValue(Number(e.target.value))} placeholder="Nilai" className="w-24 px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
              </div>
              <select value={voucherMinTier} onChange={e => setVoucherMinTier(e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }}>
                <option value="">Semua Tier</option>
                <option value="pro">Pro Saja</option>
                <option value="ultimate">Ultimate Saja</option>
              </select>
              <input type="number" value={voucherMaxUses} onChange={e => setVoucherMaxUses(Number(e.target.value))} placeholder="Kuota pemakaian" className="w-full px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={voucherValidFrom} onChange={e => setVoucherValidFrom(e.target.value)} className="px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
                <input type="date" value={voucherValidUntil} onChange={e => setVoucherValidUntil(e.target.value)} className="px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: COLORS.deepSlate }}><input type="checkbox" checked={voucherActive} onChange={e => setVoucherActive(e.target.checked)} /> Aktif</label>
              {error && <p className="text-xs" style={{ color: COLORS.danger }}>{error}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowVoucherModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer" style={{ borderColor: COLORS.border, color: COLORS.slate }}>Batal</button>
                <button onClick={async () => {
                  const body: any = { action: editVoucherId ? "updateVoucher" : "createVoucher", code: voucherCode, discount_type: voucherType, discount_value: voucherValue, min_tier: voucherMinTier || null, max_uses: voucherMaxUses || null, valid_from: voucherValidFrom ? new Date(voucherValidFrom).toISOString() : new Date().toISOString(), valid_until: voucherValidUntil ? new Date(voucherValidUntil).toISOString() : null, is_active: voucherActive };
                  if (editVoucherId) body.voucher_id = editVoucherId;
                  const r = await fetch("/api/admin/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                  if (!r.ok) { const j = await r.json().catch(() => ({})); setError(j.error || "Gagal"); return; }
                  setShowVoucherModal(false); setError(""); loadVouchers();
                }} disabled={!voucherCode.trim() || !voucherValue}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: COLORS.peacock }}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Sub Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200" style={{ background: COLORS.white }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: COLORS.deepSlate, fontFamily: "Poppins, sans-serif" }}>Tambah Subscription</h3>
              <button onClick={() => setShowSubModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: COLORS.cloud }}>
                <X size={14} style={{ color: COLORS.slate }} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.deepSlate }}>Cari User</label>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.slate }} />
                  <input value={userSearch} onChange={e => searchUsers(e.target.value)}
                    placeholder="Cari email atau nama..." className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />
                </div>
                {userResults.length > 0 && (
                  <div className="mt-1 rounded-lg border overflow-hidden" style={{ borderColor: COLORS.border }}>
                    {userResults.map(u => (
                      <button key={u.id} onClick={() => { setSubUserId(u.id); setUserSearch(u.email); setUserResults([]); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 cursor-pointer" style={{ borderBottom: `1px solid ${COLORS.border}`, color: COLORS.deepSlate }}>
                        <span className="font-medium">{u.full_name || "Unknown"}</span>
                        <span className="ml-2" style={{ color: COLORS.slate }}>{u.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {subUserId && <p className="text-[10px]" style={{ color: COLORS.success }}>User dipilih: {subUserId.slice(0, 8)}...</p>}

              <select value={subPlanId} onChange={e => setSubPlanId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }}>
                <option value="">Pilih plan</option>
                {plans.filter(p => p.is_active).map(p => <option key={p.id} value={p.id}>{p.name} — Rp {p.price_idr.toLocaleString("id-ID")}</option>)}
              </select>

              <input type="number" value={subDays} onChange={e => setSubDays(Number(e.target.value))}
                placeholder="Durasi (hari)" className="w-full px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />

              <input value={subPaymentRef} onChange={e => setSubPaymentRef(e.target.value)}
                placeholder="Ref Pembayaran (opsional)" className="w-full px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.border, color: COLORS.deepSlate }} />

              {error && <p className="text-xs" style={{ color: COLORS.danger }}>{error}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowSubModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer" style={{ borderColor: COLORS.border, color: COLORS.slate }}>Batal</button>
                <button onClick={addManualSub} disabled={!subUserId || !subPlanId || saving}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: COLORS.peacock }}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
