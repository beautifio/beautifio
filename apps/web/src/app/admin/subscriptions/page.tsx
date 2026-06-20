"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

type Tab = "plans" | "users" | "settings"

interface Plan {
  id: string
  name: string
  duration_type: string
  price_idr: number
  max_active_chats: number
  features: string[]
  is_active: boolean
  display_order: number
}

interface UserSub {
  id: string
  user_id: string
  plan_id: string
  status: string
  started_at: string
  expires_at: string
  payment_ref: string | null
  plan?: { name: string }
  user?: { email: string; full_name: string }
}

export default function AdminSubscriptions() {
  const [tab, setTab] = useState<Tab>("plans")
  const [plans, setPlans] = useState<Plan[]>([])
  const [subs, setSubs] = useState<UserSub[]>([])
  const [loading, setLoading] = useState(true)

  // Plan edit
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editPlanId, setEditPlanId] = useState<string | null>(null)
  const [planName, setPlanName] = useState("")
  const [planPrice, setPlanPrice] = useState(0)
  const [planMaxChats, setPlanMaxChats] = useState(20)
  const [planFeatures, setPlanFeatures] = useState("")
  const [planActive, setPlanActive] = useState(true)

  // Manual sub
  const [showSubModal, setShowSubModal] = useState(false)
  const [subUserId, setSubUserId] = useState("")
  const [subPlanId, setSubPlanId] = useState("")
  const [subDays, setSubDays] = useState(30)
  const [subPaymentRef, setSubPaymentRef] = useState("")

  // Settings
  const [bankAccount, setBankAccount] = useState("")
  const [waLink, setWaLink] = useState("")
  const [bankSaving, setBankSaving] = useState(false)
  const [waSaving, setWaSaving] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!supabase) return
    setLoading(true)
    const [plansRes, subsRes, settingsRes] = await Promise.all([
      supabase.from("subscription_plans").select("*").order("display_order"),
      supabase
        .from("user_subscriptions")
        .select("*, plan:subscription_plans(name), user:users(email, full_name)")
        .order("created_at", { ascending: false }),
      supabase.from("app_settings").select("key, value").in("key", ["payment_bank_account", "payment_wa_link"]),
    ])
    setPlans(plansRes.data ?? [])
    setSubs(subsRes.data ?? [])
    const s = settingsRes.data ?? []
    setBankAccount(s.find((x) => x.key === "payment_bank_account")?.value ?? "")
    setWaLink(s.find((x) => x.key === "payment_wa_link")?.value ?? "")
    setLoading(false)
  }

  // ---- Plans ----
  const openNewPlan = () => {
    setEditPlanId(null)
    setPlanName("")
    setPlanPrice(0)
    setPlanMaxChats(20)
    setPlanFeatures("")
    setPlanActive(true)
    setShowPlanModal(true)
  }

  const openEditPlan = (p: Plan) => {
    setEditPlanId(p.id)
    setPlanName(p.name)
    setPlanPrice(p.price_idr)
    setPlanMaxChats(p.max_active_chats)
    setPlanFeatures((p.features as string[]).join("\n"))
    setPlanActive(p.is_active)
    setShowPlanModal(true)
  }

  const savePlan = async () => {
    if (!supabase || !planName.trim()) return
    setSaving(true)
    setError("")
    try {
      const features = planFeatures.split("\n").filter((f) => f.trim())
      if (editPlanId) {
        await supabase
          .from("subscription_plans")
          .update({
            name: planName.trim(),
            price_idr: planPrice,
            max_active_chats: planMaxChats,
            features: JSON.stringify(features),
            is_active: planActive,
          })
          .eq("id", editPlanId)
      }
      setShowPlanModal(false)
      loadData()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const togglePlanActive = async (id: string, active: boolean) => {
    await supabase!.from("subscription_plans").update({ is_active: !active }).eq("id", id)
    loadData()
  }

  // ---- Subs ----
  const addManualSub = async () => {
    if (!supabase || !subUserId || !subPlanId) return
    setSaving(true)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + subDays)
    await supabase.from("user_subscriptions").insert({
      user_id: subUserId,
      plan_id: subPlanId,
      status: "active",
      expires_at: expiresAt.toISOString(),
      payment_ref: subPaymentRef || null,
    })
    setShowSubModal(false)
    setSubUserId("")
    setSubPlanId("")
    setSubPaymentRef("")
    setSaving(false)
    loadData()
  }

  const cancelSub = async (id: string) => {
    if (!confirm("Batalkan subscription ini?")) return
    await supabase!.from("user_subscriptions").update({ status: "cancelled" }).eq("id", id)
    loadData()
  }

  const searchUser = async (q: string) => {
    if (!supabase || q.length < 2) return
    const { data } = await supabase.from("users").select("id, email, full_name").ilike("email", `%${q}%`).limit(5)
    return data ?? []
  }

  // ---- Settings ----
  const saveBankAccount = async () => {
    if (!supabase) return
    setBankSaving(true)
    await supabase.from("app_settings").upsert({ key: "payment_bank_account", value: bankAccount }, { onConflict: "key" })
    setBankSaving(false)
  }

  const saveWaLink = async () => {
    if (!supabase) return
    setWaSaving(true)
    await supabase.from("app_settings").upsert({ key: "payment_wa_link", value: waLink }, { onConflict: "key" })
    setWaSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-900">Subscription</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab("plans")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === "plans" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Plans
          </button>
          <button
            onClick={() => setTab("users")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === "users" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === "settings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* TAB: Plans */}
      {tab === "plans" && (
        <div>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Nama</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Tipe</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Harga</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Max Chat</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 text-gray-700 font-medium">{p.name}</td>
                    <td className="py-3 px-2 text-gray-700">{p.duration_type}</td>
                    <td className="py-3 px-2 text-gray-700">
                      Rp {p.price_idr.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-2 text-gray-700">{p.max_active_chats}</td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => togglePlanActive(p.id, p.is_active)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium cursor-pointer ${
                          p.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => openEditPlan(p)}
                        className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-medium hover:bg-blue-100 cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Users */}
      {tab === "users" && (
        <div>
          <button
            onClick={() => setShowSubModal(true)}
            className="mb-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            + Tambah Subscription Manual
          </button>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">User</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Plan</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Mulai</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Berakhir</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 text-gray-700">{s.user?.email || s.user_id.slice(0, 8)}</td>
                    <td className="py-3 px-2 text-gray-700">{s.plan?.name || "-"}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          s.status === "active"
                            ? "bg-green-50 text-green-700"
                            : s.status === "expired"
                              ? "bg-red-50 text-red-600"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-700 text-[10px]">
                      {new Date(s.started_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 px-2 text-gray-700 text-[10px]">
                      {new Date(s.expires_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 px-2">
                      {s.status === "active" && (
                        <button
                          onClick={() => cancelSub(s.id)}
                          className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-medium hover:bg-red-100 cursor-pointer"
                        >
                          Batalkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Settings */}
      {tab === "settings" && (
        <div className="max-w-lg space-y-6">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Nomor Rekening</label>
            <div className="flex gap-2">
              <input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                placeholder="BCA 1234567890 a/n Beautifio"
              />
              <button
                onClick={saveBankAccount}
                disabled={bankSaving}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium disabled:opacity-40 cursor-pointer"
              >
                {bankSaving ? "..." : "Simpan"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Link WhatsApp</label>
            <div className="flex gap-2">
              <input
                value={waLink}
                onChange={(e) => setWaLink(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                placeholder="https://wa.me/628xxx"
              />
              <button
                onClick={saveWaLink}
                disabled={waSaving}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium disabled:opacity-40 cursor-pointer"
              >
                {waSaving ? "..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPlanModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-4">{editPlanId ? "Edit Plan" : "Tambah Plan"}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nama Plan</label>
                <input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Harga (Rp)</label>
                <input
                  type="number"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Max Active Chats</label>
                <input
                  type="number"
                  value={planMaxChats}
                  onChange={(e) => setPlanMaxChats(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Fitur (1 baris per fitur)</label>
                <textarea
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400 resize-none h-20"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={planActive} onChange={(e) => setPlanActive(e.target.checked)} />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowPlanModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 cursor-pointer">
                  Batal
                </button>
                <button onClick={savePlan} disabled={!planName.trim() || saving} className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40 cursor-pointer">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual sub modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSubModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-4">Tambah Subscription Manual</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">User ID</label>
                <input
                  value={subUserId}
                  onChange={(e) => setSubUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                  placeholder="UUID user"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Plan</label>
                <select
                  value={subPlanId}
                  onChange={(e) => setSubPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                >
                  <option value="">Pilih plan</option>
                  {plans
                    .filter((p) => p.is_active)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Durasi (hari)</label>
                <input
                  type="number"
                  value={subDays}
                  onChange={(e) => setSubDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Payment Ref (opsional)</label>
                <input
                  value={subPaymentRef}
                  onChange={(e) => setSubPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                  placeholder="Nomor transfer"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowSubModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 cursor-pointer">
                  Batal
                </button>
                <button onClick={addManualSub} disabled={!subUserId || !subPlanId || saving} className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40 cursor-pointer">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
