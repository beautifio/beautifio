"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

type Tab = "cards" | "topics" | "names" | "violations" | "bans"

interface BisikCard {
  id: string
  topic_id: string
  content: string
  user_id: string
  is_active: boolean
  created_at: string
  expires_at: string
  topic?: { name: string; emoji: string }
  user?: { email: string }
}

interface Topic {
  id: string
  name: string
  emoji: string
  is_active: boolean
  display_order: number
}

export default function AdminBisik() {
  const [tab, setTab] = useState<Tab>("cards")
  const [cards, setCards] = useState<BisikCard[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [editTopic, setEditTopic] = useState<Topic | null>(null)
  const [topicName, setTopicName] = useState("")
  const [topicEmoji, setTopicEmoji] = useState("")
  const [topicOrder, setTopicOrder] = useState(0)
  const [topicActive, setTopicActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Names tab
  interface NameUser {
    id: string
    email: string
    bisik_anonymous_name: string
    bisik_custom_name: string | null
  }
  const [nameUsers, setNameUsers] = useState<NameUser[]>([])
  const [nameSearch, setNameSearch] = useState("")
  const [nameWordCount, setNameWordCount] = useState(0)
  const [nameTotalUsers, setNameTotalUsers] = useState(0)
  const [nameLoading, setNameLoading] = useState(false)
  const [resetting, setResetting] = useState<string | null>(null)

  // Violations & bans tab
  interface Violation {
    id: string
    user_id: string
    chat_id: string
    message_id: string
    violation_type: string
    original_snippet: string
    created_at: string
    user?: { email: string; bisik_anonymous_name: string }
  }
  interface BanUser {
    id: string
    user_id: string
    reason: string
    banned_until: string
    ban_count: number
    created_at: string
    user?: { email: string; bisik_anonymous_name: string }
  }
  const [violations, setViolations] = useState<Violation[]>([])
  const [bannedUsers, setBannedUsers] = useState<BanUser[]>([])
  const [violationFilter, setViolationFilter] = useState("")
  const [vLoading, setVLoading] = useState(false)

  const loadViolations = async () => {
    if (!supabase) return
    setVLoading(true)
    const { data } = await supabase
      .from("bisik_violations")
      .select("*, user:users(email, bisik_anonymous_name)")
      .order("created_at", { ascending: false })
      .limit(50)
    setViolations(data ?? [])
    setVLoading(false)
  }

  const loadBans = async () => {
    if (!supabase) return
    setVLoading(true)
    const { data } = await supabase
      .from("bisik_bans")
      .select("*, user:users(email, bisik_anonymous_name)")
      .order("created_at", { ascending: false })
    setBannedUsers(data ?? [])
    setVLoading(false)
  }

  const unbanUser = async (userId: string) => {
    if (!confirm("Cabut ban user ini?")) return
    if (!supabase) return
    await supabase.from("bisik_bans").update({ banned_until: new Date().toISOString() }).eq("user_id", userId)
    loadBans()
  }

  const loadNames = async () => {
    if (!supabase) return
    setNameLoading(true)
    const [{ count: wc }, { count: uc }, { data: users }] = await Promise.all([
      supabase.from("bisik_name_words").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).not("bisik_anonymous_name", "is", null),
      supabase
        .from("users")
        .select("id, email, bisik_anonymous_name, bisik_custom_name")
        .not("bisik_anonymous_name", "is", null)
        .order("bisik_anonymous_name", { ascending: true }),
    ])
    setNameWordCount(wc ?? 0)
    setNameTotalUsers(uc ?? 0)
    setNameUsers(users ?? [])
    setNameLoading(false)
  }

  const resetName = async (userId: string) => {
    if (!confirm("Generate ulang anonymous name untuk user ini?")) return
    if (!supabase) return
    setResetting(userId)
    const { data: newName } = await supabase.rpc("generate_bisik_anonymous_name")
    if (newName) {
      await supabase.from("users").update({ bisik_anonymous_name: newName }).eq("id", userId)
    }
    setResetting(null)
    loadNames()
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!supabase) return
    setLoading(true)
    const [cardsRes, topicsRes] = await Promise.all([
      supabase
        .from("bisik_cards")
        .select("*, topic:bisik_topics(name, emoji), user:users(email)")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase.from("bisik_topics").select("*").order("display_order"),
    ])
    setCards(cardsRes.data ?? [])
    setTopics(topicsRes.data ?? [])
    setLoading(false)
  }

  const deactivateCard = async (id: string) => {
    if (!confirm("Nonaktifkan kartu ini?")) return
    await supabase!.from("bisik_cards").update({ is_active: false }).eq("id", id)
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  const deleteCard = async (id: string) => {
    if (!confirm("Hapus permanen kartu ini?")) return
    await supabase!.from("bisik_cards").delete().eq("id", id)
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  const openNewTopic = () => {
    setEditTopic(null)
    setTopicName("")
    setTopicEmoji("💬")
    setTopicOrder(topics.length + 1)
    setTopicActive(true)
    setShowTopicModal(true)
  }

  const openEditTopic = (t: Topic) => {
    setEditTopic(t)
    setTopicName(t.name)
    setTopicEmoji(t.emoji || "💬")
    setTopicOrder(t.display_order)
    setTopicActive(t.is_active)
    setShowTopicModal(true)
  }

  const saveTopic = async () => {
    if (!supabase || !topicName.trim()) return
    setSaving(true)
    setError("")
    try {
      if (editTopic) {
        await supabase
          .from("bisik_topics")
          .update({ name: topicName.trim(), emoji: topicEmoji, display_order: topicOrder, is_active: topicActive })
          .eq("id", editTopic.id)
      } else {
        await supabase.from("bisik_topics").insert({
          name: topicName.trim(),
          emoji: topicEmoji,
          display_order: topicOrder,
          is_active: topicActive,
        })
      }
      setShowTopicModal(false)
      loadData()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteTopic = async (id: string) => {
    if (!supabase) return
    const { count } = await supabase
      .from("bisik_cards")
      .select("*", { count: "exact", head: true })
      .eq("topic_id", id)
      .eq("is_active", true)
    if (count && count > 0) {
      alert(`Topik ini masih dipakai ${count} kartu aktif. Nonaktifkan dulu.`)
      return
    }
    if (!confirm("Hapus topik ini?")) return
    await supabase.from("bisik_topics").delete().eq("id", id)
    loadData()
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
        <h1 className="text-lg font-bold text-gray-900">Bisik</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab("cards")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === "cards" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Kartu Aktif ({cards.length})
          </button>
          <button
            onClick={() => setTab("topics")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === "topics" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Topik ({topics.length})
          </button>
          <button
            onClick={() => { setTab("names"); loadNames() }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === "names" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Names
          </button>
          <button
            onClick={() => { setTab("violations"); loadViolations() }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === "violations" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Pelanggaran
          </button>
          <button
            onClick={() => { setTab("bans"); loadBans() }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === "bans" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Banned
          </button>
        </div>
      </div>

      {tab === "cards" && (
        <div className="space-y-2">
          {cards.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">Tidak ada kartu aktif</p>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="p-4 rounded-xl bg-white border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {card.topic?.emoji} {card.topic?.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(card.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => deactivateCard(card.id)}
                      className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-medium hover:bg-amber-100 cursor-pointer"
                    >
                      Nonaktifkan
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="px-2 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-medium hover:bg-red-100 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  &ldquo;{card.content.slice(0, 100)}{card.content.length > 100 ? "..." : ""}&rdquo;
                </p>
                <p className="text-[10px] text-gray-400">
                  {card.user?.email || "(no email)"} · Exp: {new Date(card.expires_at).toLocaleDateString("id-ID")}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "topics" && (
        <div>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">No</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Nama</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Emoji</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Urutan</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t, i) => (
                  <tr key={t.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 text-gray-700">{i + 1}</td>
                    <td className="py-3 px-2 text-gray-700 font-medium">{t.name}</td>
                    <td className="py-3 px-2 text-gray-700">{t.emoji || "💬"}</td>
                    <td className="py-3 px-2 text-gray-700">{t.display_order}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          t.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {t.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditTopic(t)}
                          className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-medium hover:bg-blue-100 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTopic(t.id)}
                          className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-medium hover:bg-red-100 cursor-pointer"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={openNewTopic}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            + Tambah Topik Baru
          </button>
        </div>
      )}

      {tab === "names" && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700">
                Kata tersedia: {nameWordCount}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700">
                User dengan nama: {nameTotalUsers}
              </span>
            </div>
          </div>

          <input
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            placeholder="Cari anonymous name..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400 mb-4"
          />

          {nameLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Anonymous Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Custom Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {nameUsers
                    .filter((u) =>
                      !nameSearch ||
                      u.bisik_anonymous_name.toLowerCase().includes(nameSearch.toLowerCase()) ||
                      u.email?.toLowerCase().includes(nameSearch.toLowerCase())
                    )
                    .map((u) => (
                      <tr key={u.id} className="border-b border-gray-100">
                        <td className="py-3 px-2 text-gray-700 max-w-[200px] truncate">{u.email || "(no email)"}</td>
                        <td className="py-3 px-2 text-gray-700 font-mono">{u.bisik_anonymous_name}</td>
                        <td className="py-3 px-2 text-gray-700 font-mono">{u.bisik_custom_name || "—"}</td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => resetName(u.id)}
                            disabled={resetting === u.id}
                            className="px-2 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-medium hover:bg-amber-100 disabled:opacity-40 cursor-pointer"
                          >
                            {resetting === u.id ? "..." : "Reset Nama"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {nameUsers.length === 0 && (
                <p className="text-sm text-gray-500 py-8 text-center">Tidak ada data</p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "violations" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs">
              Total: {violations.length}
            </span>
            <select
              value={violationFilter}
              onChange={(e) => setViolationFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none"
            >
              <option value="">Semua tipe</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="real_name">Real Name</option>
            </select>
          </div>

          {vLoading ? (
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin mx-auto py-8" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">User</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Tipe</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Snippet</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {violations
                    .filter((v) => !violationFilter || v.violation_type === violationFilter)
                    .map((v) => (
                      <tr key={v.id} className="border-b border-gray-100">
                        <td className="py-3 px-2 text-gray-700 max-w-[150px] truncate">
                          {v.user?.bisik_anonymous_name || v.user?.email || "(unknown)"}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            v.violation_type === "phone" ? "bg-red-50 text-red-700" :
                            v.violation_type === "email" ? "bg-amber-50 text-amber-700" :
                            "bg-blue-50 text-blue-700"
                          }`}>
                            {v.violation_type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-500 font-mono max-w-[200px] truncate">
                          {v.original_snippet}
                        </td>
                        <td className="py-3 px-2 text-gray-400">
                          {new Date(v.created_at).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {violations.length === 0 && (
                <p className="text-sm text-gray-500 py-8 text-center">Belum ada pelanggaran</p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "bans" && (
        <div>
          {vLoading ? (
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin mx-auto py-8" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">User</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Alasan</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Ban ke-</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Sisa Waktu</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bannedUsers
                    .filter((b) => new Date(b.banned_until) > new Date())
                    .map((b) => {
                      const remaining = Math.ceil((new Date(b.banned_until).getTime() - Date.now()) / 60000)
                      return (
                        <tr key={b.id} className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-700 max-w-[150px] truncate">
                            {b.user?.bisik_anonymous_name || b.user?.email || "(unknown)"}
                          </td>
                          <td className="py-3 px-2 text-gray-700 max-w-[200px] truncate">{b.reason || "—"}</td>
                          <td className="py-3 px-2 text-gray-700">{b.ban_count}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              remaining > 60 ? "bg-green-50 text-green-700" :
                              remaining > 10 ? "bg-amber-50 text-amber-700" :
                              "bg-red-50 text-red-700"
                            }`}>
                              {remaining} menit
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => unbanUser(b.user_id)}
                              className="px-2 py-1 rounded bg-green-50 text-green-700 text-[10px] font-medium hover:bg-green-100 cursor-pointer"
                            >
                              Cabut Ban
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
              {bannedUsers.filter((b) => new Date(b.banned_until) > new Date()).length === 0 && (
                <p className="text-sm text-gray-500 py-8 text-center">Tidak ada user yang dibanned</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Topic modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTopicModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 mx-4 animate-in slide-in-from-bottom">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              {editTopic ? "Edit Topik" : "Tambah Topik Baru"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nama Topik</label>
                <input
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                  placeholder="Nama topik"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Emoji</label>
                <input
                  value={topicEmoji}
                  onChange={(e) => setTopicEmoji(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                  placeholder="💬"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Display Order</label>
                <input
                  type="number"
                  value={topicOrder}
                  onChange={(e) => setTopicOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-amber-400"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={topicActive}
                  onChange={(e) => setTopicActive(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowTopicModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={saveTopic}
                  disabled={!topicName.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40 cursor-pointer"
                >
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
