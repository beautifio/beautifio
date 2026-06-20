"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

type Tab = "cards" | "topics"

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
