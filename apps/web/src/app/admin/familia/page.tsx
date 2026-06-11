"use client";

import { useState } from "react";
import {
  Plus, Pencil, Trash2, Gift, ShoppingBag, Trophy,
  Save, X, ArrowLeft, Star,
} from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import {
  FAMILIA_MERCHANTS, FAMILIA_AFFILIATE_DEALS, FAMILIA_ACHIEVEMENT_REWARDS,
  VOUCHER_TYPE_LABELS, VOUCHER_TYPE_EMOJIS,
} from "@beautifio/utils";
import type { FamiliaMerchant, FamiliaAffiliateDeal, FamiliaAchievementReward, VoucherType } from "@beautifio/types";
import { useRouter } from "next/navigation";

type Section = "merchants" | "deals" | "rewards";

const VT_ENTRIES = Object.entries(VOUCHER_TYPE_LABELS) as [VoucherType, string][];

export default function AdminFamiliaPage() {
  const router = useRouter();
  const [section, setSection] = useState<Section>("merchants");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push("/familia")} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin — Familia</h1>
            <p className="text-xs text-gray-500">Kelola merchant, deals, dan rewards</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {([
            { key: "merchants", label: "Merchant", icon: Gift },
            { key: "deals", label: "Deals", icon: ShoppingBag },
            { key: "rewards", label: "Rewards", icon: Trophy },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSection(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                section === tab.key
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {section === "merchants" && <MerchantManager />}
        {section === "deals" && <DealsManager />}
        {section === "rewards" && <RewardsManager />}
      </div>
    </div>
  );
}

function MerchantManager() {
  const [merchants, setMerchants] = useState(FAMILIA_MERCHANTS);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<FamiliaMerchant>>({});

  function startEdit(m: FamiliaMerchant) {
    setEditId(m.id);
    setForm({ ...m });
  }

  function startNew() {
    setEditId("new");
    setForm({
      id: `m-${Date.now()}`,
      name: "",
      description: "",
      logo_url: undefined,
      cover_url: undefined,
      category: "Beauty",
      voucher_types: [],
      is_active: true,
      total_vouchers: 1000,
      total_redeemed: 0,
      total_expired: 0,
      merchant_code: "",
      daily_pin: "",
      monthly_quota: 50,
      slug: "",
      created_at: new Date().toISOString(),
    });
  }

  function save() {
    if (editId === "new") {
      setMerchants([...merchants, form as FamiliaMerchant]);
    } else {
      setMerchants(merchants.map((m) => m.id === editId ? { ...m, ...form } as FamiliaMerchant : m));
    }
    setEditId(null);
    setForm({});
  }

  function remove(id: string) {
    setMerchants(merchants.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{merchants.length} merchant</span>
        <Button variant="accent" size="sm" onClick={startNew} className="cursor-pointer">
          <Plus className="w-4 h-4" /> Tambah Merchant
        </Button>
      </div>

      <div className="space-y-3">
        {merchants.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{m.name}</span>
                    <Badge variant="accent" className="text-[10px]">{m.category}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {m.voucher_types.map((vt) => (
                      <span key={vt} className="text-[10px] text-gray-400">{VOUCHER_TYPE_EMOJIS[vt]} {VOUCHER_TYPE_LABELS[vt]}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(m)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer">
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => remove(m.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
              <span>Kuota: {m.total_vouchers - m.total_redeemed}/{m.total_vouchers}</span>
              <span>Terpakai: {m.total_redeemed}</span>
              <span>Bulanan: {m.monthly_quota}</span>
            </div>
          </div>
        ))}
      </div>

      {editId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setEditId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editId === "new" ? "Tambah Merchant" : "Edit Merchant"}</h3>
              <button onClick={() => setEditId(null)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Nama</label>
                <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Deskripsi</label>
                <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Kategori</label>
                <select value={form.category || "Beauty"} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400">
                  {["Beauty", "Fashion", "Food", "Education", "Wellness"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Merchant Code</label>
                <input value={form.merchant_code || ""} onChange={(e) => setForm({ ...form, merchant_code: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Daily PIN</label>
                <input value={form.daily_pin || ""} onChange={(e) => setForm({ ...form, daily_pin: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Tipe Voucher</label>
                <div className="flex flex-wrap gap-1.5">
                  {VT_ENTRIES.map(([key, label]) => {
                    const selected = (form.voucher_types || []).includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          const cur = form.voucher_types || [];
                          const next = selected ? cur.filter((v) => v !== key) : [...cur, key];
                          setForm({ ...form, voucher_types: next });
                        }}
                        className={`text-[10px] px-2 py-1 rounded-full border cursor-pointer ${
                          selected
                            ? "bg-amber-100 border-amber-300 text-amber-700"
                            : "bg-white border-gray-200 text-gray-500"
                        }`}
                      >
                        {VOUCHER_TYPE_EMOJIS[key]} {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Monthly Quota</label>
                <input type="number" value={form.monthly_quota ?? 50} onChange={(e) => setForm({ ...form, monthly_quota: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" size="sm" className="flex-1 cursor-pointer" onClick={() => setEditId(null)}>Batal</Button>
              <Button variant="accent" size="sm" className="flex-1 cursor-pointer" onClick={save}>
                <Save className="w-4 h-4" /> Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DealsManager() {
  const [deals, setDeals] = useState(FAMILIA_AFFILIATE_DEALS);

  function remove(id: string) {
    setDeals(deals.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{deals.length} deals</span>
      </div>
      <div className="space-y-2">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {deal.image_url && <img src={deal.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{deal.title}</span>
                {deal.is_featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="accent" className="text-[10px]">{deal.platform}</Badge>
                <span className="text-xs text-gray-500">{deal.partner_name}</span>
                <span className="text-xs text-gray-400">{deal.category}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">{deal.description}</p>
            </div>
            <button onClick={() => remove(deal.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center flex-shrink-0 cursor-pointer">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardsManager() {
  const [rewards, setRewards] = useState(FAMILIA_ACHIEVEMENT_REWARDS);

  function remove(id: string) {
    setRewards(rewards.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{rewards.length} rewards</span>
      </div>
      <div className="space-y-2">
        {rewards.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${r.color || "from-emerald-500 to-teal-500"} flex items-center justify-center flex-shrink-0`}>
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-900">{r.title}</span>
              <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
              <p className="text-[10px] text-amber-600 mt-1 font-medium">{r.reward_description}</p>
            </div>
            <button onClick={() => remove(r.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center flex-shrink-0 cursor-pointer">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
