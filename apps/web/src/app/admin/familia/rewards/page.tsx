"use client";

import { useState, useEffect } from "react";
import { Trash2, Trophy, RefreshCw, Plus, Save, X } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import type { FamiliaAchievementReward, AchievementTrigger, RewardType } from "@beautifio/types";

const TRIGGER_LABELS: Record<string, string> = { discovery_complete: "Discovery Complete", roadmap_milestones: "Roadmap Milestones", circle_days: "Circle Days", mentor_program: "Mentor Program", journal_entries: "Journal Entries", story_posted: "Story Posted" };
const REWARD_TYPE_LABELS: Record<string, string> = { voucher: "Voucher", discount: "Discount", special_benefit: "Special Benefit" };
const COLORS = ["from-emerald-500 to-teal-500", "from-amber-500 to-orange-500", "from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-rose-500 to-red-500"];

export default function RewardsPage() {
  const [rewards, setRewards] = useState<FamiliaAchievementReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", trigger_type: "journal_entries" as string, trigger_value: 1, reward_type: "voucher" as string, reward_description: "" });
  const [saving, setSaving] = useState(false);

  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/familia/rewards");
      if (res.ok) { const { data } = await res.json(); setRewards(data || []); }
    } catch (e) { console.error("Failed to load rewards", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRewards(); }, []);

  async function remove(id: string) {
    if (!confirm("Hapus reward ini?")) return;
    try { await fetch(`/api/familia/rewards/${id}`, { method: "DELETE" }); await fetchRewards(); } catch (e) { console.error("Delete failed", e); }
  }

  async function createReward() {
    if (!form.title) return;
    setSaving(true);
    try {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      await fetch("/api/familia/rewards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, color, is_active: true, icon: "trophy" }) });
      setShowAdd(false);
      setForm({ title: "", description: "", trigger_type: "journal_entries", trigger_value: 1, reward_type: "voucher", reward_description: "" });
      await fetchRewards();
    } catch (e) { console.error("Create failed", e); } finally { setSaving(false); }
  }

  if (loading) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Rewards</h1>
        <Button variant="accent" size="sm" onClick={() => setShowAdd(true)} className="cursor-pointer"><Plus className="w-4 h-4" /> Tambah Reward</Button>
      </div>
      <div className="space-y-2">
        {rewards.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${r.color || "from-emerald-500 to-teal-500"} flex items-center justify-center flex-shrink-0`}><Trophy className="w-5 h-5 text-white" /></div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-900">{r.title}</span>
              <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px]">{TRIGGER_LABELS[r.trigger_type] || r.trigger_type}</Badge>
                <span className="text-[10px] text-amber-600 font-medium">{r.reward_description}</span>
              </div>
            </div>
            <button onClick={() => remove(r.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center flex-shrink-0 cursor-pointer"><Trash2 className="w-4 h-4 text-red-400" /></button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Tambah Reward</h3>
              <button onClick={() => setShowAdd(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Trigger</label>
                <select value={form.trigger_type} onChange={(e) => setForm({ ...form, trigger_type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Trigger Value</label><input type="number" value={form.trigger_value} onChange={(e) => setForm({ ...form, trigger_value: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Reward Type</label>
                <select value={form.reward_type} onChange={(e) => setForm({ ...form, reward_type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  {Object.entries(REWARD_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Reward Description</label><input value={form.reward_description} onChange={(e) => setForm({ ...form, reward_description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" size="sm" className="flex-1 cursor-pointer" onClick={() => setShowAdd(false)} disabled={saving}>Batal</Button>
              <Button variant="accent" size="sm" className="flex-1 cursor-pointer" onClick={createReward} disabled={saving || !form.title}><Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
