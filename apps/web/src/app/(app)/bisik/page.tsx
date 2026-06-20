"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2, Heart, X, Crown, Plus, MessageCircle,
  Clock, ChevronRight, AlertTriangle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { swipeLeft, swipeRight } from "@/lib/bisik/swipe-actions"
import type { BisikCard } from "@/lib/bisik/swipe-actions"
import type { BisikChat, BisikMessage } from "@/lib/bisik/queries"

type Tab = "temukan" | "obrolan" | "menunggumu"

interface Topic {
  id: string
  name: string
  emoji: string
}

interface CardWithTopic extends BisikCard {
  topic: { name: string; emoji: string } | null
}

interface ChatWithTopic extends BisikChat {
  card?: { content: string } | null
  last_message?: BisikMessage | null
}

export default function BisikHome() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>("temukan")
  const [loading, setLoading] = useState(true)
  const [topics, setTopics] = useState<Topic[]>([])
  const [userTopicIds, setUserTopicIds] = useState<string[]>([])
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [cards, setCards] = useState<CardWithTopic[]>([])
  const [chats, setChats] = useState<ChatWithTopic[]>([])
  const [pendingMatches, setPendingMatches] = useState<any[]>([])
  const [showCardModal, setShowCardModal] = useState(false)
  const [cardTopic, setCardTopic] = useState("")
  const [cardContent, setCardContent] = useState("")
  const [cardSubmitting, setCardSubmitting] = useState(false)
  const [myActiveCard, setMyActiveCard] = useState<any>(null)
  const [isMatching, setIsMatching] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [maxAllowed, setMaxAllowed] = useState(5)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user || !supabase) return
    loadData()
  }, [user, authLoading, tab])

  const loadData = async () => {
    if (!supabase || !user) return
    setError(null)
    setLoading(true)
    try {
      const [topicsRes, profileRes, cardsRes] = await Promise.all([
        supabase.from("bisik_topics").select("id, name, emoji").eq("is_active", true).order("display_order"),
        supabase.from("users").select("bisik_topic_ids").eq("id", user.id).single(),
        supabase.from("bisik_cards").select("id").eq("user_id", user.id).eq("is_active", true).maybeSingle(),
      ])

      setTopics(topicsRes.data ?? [])
      setMyActiveCard(profileRes.data?.bisik_topic_ids ?? null)

      const topicIds = (profileRes.data?.bisik_topic_ids as string[]) ?? []
      setUserTopicIds(topicIds)
      setSelectedTopics(topicIds)
      setMyActiveCard(cardsRes.data ?? null)

      if (topicIds.length === 0 && tab === "temukan") {
        setShowTopicModal(true)
        setLoading(false)
        return
      }

      if (tab === "temukan" && topicIds.length > 0) {
        const { data: cardsData } = await supabase
          .from("bisik_cards")
          .select("*, topic:bisik_topics(name, emoji)")
          .in("topic_id", topicIds)
          .eq("is_active", true)
          .gt("expires_at", new Date().toISOString())
          .neq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)

        const { data: swiped } = await supabase
          .from("bisik_swipes")
          .select("card_id")
          .eq("swiper_id", user.id)
        const swipedIds = swiped?.map((s) => s.card_id) ?? []
        setCards((cardsData ?? []).filter((c) => !swipedIds.includes(c.id)) as CardWithTopic[])
      }

      if (tab === "obrolan") {
        const { data: chatsData } = await supabase
          .from("bisik_chats")
          .select("*, card:bisik_cards(content)")
          .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .in("status", ["pending", "active"])
          .order("created_at", { ascending: false })

        setChats(chatsData ?? [])
      }

      if (tab === "menunggumu") {
        const { data: myCards } = await supabase
          .from("bisik_cards")
          .select("id, content, topic:bisik_topics(name, emoji)")
          .eq("user_id", user.id)
          .eq("is_active", true)

        const myCardIds = myCards?.map((c) => c.id) ?? []

        if (myCardIds.length > 0) {
          const { data: swipes } = await supabase
            .from("bisik_swipes")
            .select("card_id, created_at, swiper_id")
            .in("card_id", myCardIds)
            .eq("direction", "right")

          const { data: existingChats } = await supabase
            .from("bisik_chats")
            .select("card_id")
            .in("card_id", myCardIds)

          const existingCardIds = existingChats?.map((c) => c.card_id) ?? []

          const newSwipes = (swipes ?? []).filter(
            (s) => !existingCardIds.includes(s.card_id),
          )

          setPendingMatches(
            newSwipes.map((s) => {
              const card = myCards?.find((c) => c.id === s.card_id)
              return { ...s, card }
            }),
          )
        }
      }
    } catch (err) {
      console.error("Bisik loadData error:", err)
      setError("Gagal memuat data. Coba lagi.")
    }
    setLoading(false)
  }

  const saveTopicPref = async () => {
    if (!supabase || !user) return
    await supabase.from("users").update({ bisik_topic_ids: selectedTopics }).eq("id", user.id)
    setUserTopicIds(selectedTopics)
    setShowTopicModal(false)
    loadData()
  }

  const handleSwipeLeft = async (cardId: string) => {
    if (!user) return
    await swipeLeft(user.id, cardId)
    setCards((prev) => prev.filter((c) => c.id !== cardId))
  }

  const handleSwipeRight = async (card: CardWithTopic) => {
    if (!user) return
    setIsMatching(true)
    const result = await swipeRight(user.id, card)
    if (result.error === "CHAT_LIMIT_REACHED") {
      setMaxAllowed(result.maxAllowed ?? 5)
      setShowLimitModal(true)
      setIsMatching(false)
      return
    }
    setCards((prev) => prev.filter((c) => c.id !== card.id))
    if (result.chatId) {
      router.push(`/bisik/chat/${result.chatId}`)
    }
    setIsMatching(false)
  }

  const createCard = async () => {
    if (!supabase || !user || !cardTopic || cardContent.trim().length < 10) return
    setCardSubmitting(true)
    await supabase.from("bisik_cards").insert({
      user_id: user.id,
      topic_id: cardTopic,
      content: cardContent.trim(),
    })
    setCardTopic("")
    setCardContent("")
    setCardSubmitting(false)
    setShowCardModal(false)
    setMyActiveCard({ id: "temp" })
  }

  const startChat = async (swiperId: string, cardId: string) => {
    if (!supabase || !user) return
    const { data: chat } = await supabase
      .from("bisik_chats")
      .insert({
        card_id: cardId,
        initiator_id: swiperId,
        receiver_id: user.id,
        status: "active",
        activated_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (chat) {
      setPendingMatches((prev) => prev.filter((m) => m.card_id !== cardId))
      router.push(`/bisik/chat/${chat.id}`)
    }
  }

  const declineMatch = (cardId: string) => {
    setPendingMatches((prev) => prev.filter((m) => m.card_id !== cardId))
  }

  const getOtherId = (chat: ChatWithTopic) => {
    if (!user) return ""
    return chat.initiator_id === user.id ? chat.receiver_id : chat.initiator_id
  }

  const chatTimeLeft = (chat: ChatWithTopic) => {
    if (!chat.expires_at) return null
    const diff = new Date(chat.expires_at).getTime() - Date.now()
    if (diff <= 0) return "Habis"
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return `${h}j ${m}m`
  }

  const activeChatCount = chats.filter((c) => c.status === "active" || c.status === "pending").length
  const freeLimit = maxAllowed

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-6">
        <AlertTriangle size={32} className="text-red-400" />
        <p className="text-sm text-text-secondary text-center">{error}</p>
        <button
          onClick={loadData}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  const renderCardStack = () => {
    if (cards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
          <p className="text-3xl">😴</p>
          <p className="text-sm font-medium text-text-primary">Sudah semua untuk sekarang</p>
          <p className="text-xs text-text-secondary">
            Coba lagi nanti atau ubah preferensi topikmu
          </p>
          <button
            onClick={() => setShowTopicModal(true)}
            className="mt-2 text-sm text-primary underline cursor-pointer"
          >
            Ubah topik
          </button>
        </div>
      )
    }

    const current = cards[0]
    return (
      <div className="flex flex-col gap-4">
        <p className="text-xs text-text-secondary text-center">{cards.length} kartu tersedia</p>
        <div
          className="rounded-2xl p-5 flex flex-col min-h-[320px]"
          style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
        >
          <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full self-start mb-3">
            {current.topic?.emoji} {current.topic?.name}
          </span>
          <p className="text-sm text-text-primary leading-relaxed italic mb-4 flex-1">
            &ldquo;{current.content}&rdquo;
          </p>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Anonymous</span>
            <span>
              {Math.floor((Date.now() - new Date(current.created_at).getTime()) / 60000) < 1
                ? "Baru saja"
                : `${Math.floor((Date.now() - new Date(current.created_at).getTime()) / 60000)} menit lalu`}
            </span>
          </div>
          <div className="flex justify-center gap-6 mt-5">
            <button
              onClick={() => handleSwipeLeft(current.id)}
              className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center cursor-pointer"
            >
              <X className="w-6 h-6 text-red-400" />
            </button>
            <button
              onClick={() => handleSwipeRight(current)}
              className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer"
            >
              <Heart className="w-6 h-6 text-primary" />
            </button>
          </div>
          <p className="text-xs text-text-secondary text-center mt-4">
            ← Lewati &nbsp;&nbsp; Ngobrol →
          </p>
        </div>
      </div>
    )
  }

  const renderChatList = () => {
    if (activeChatCount >= freeLimit) {
      return (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4">
          <div className="flex items-start gap-3">
            <Crown size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Kamu sudah di batas {freeLimit} obrolan aktif
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Upgrade ke Pro untuk lebih banyak obrolan.
              </p>
              <button
                onClick={() => router.push("/bisik/upgrade")}
                className="mt-2 text-xs font-medium text-amber-700 underline cursor-pointer"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (chats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <MessageCircle size={32} className="text-text-secondary/30" />
          <p className="text-sm text-text-secondary">Belum ada obrolan aktif</p>
          <p className="text-xs text-text-secondary/50">Temukan teman ngobrol di tab Temukan</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => router.push(`/bisik/chat/${chat.id}`)}
            className="w-full flex items-start gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {chat.card?.content?.slice(0, 60) || "Percakapan"}
              </p>
              {chat.last_message ? (
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {chat.last_message.content.slice(0, 80)}
                </p>
              ) : (
                <p className="text-xs text-text-secondary/50 mt-0.5">Menunggu balasan...</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] text-text-secondary">
                {chatTimeLeft(chat) ? `${chatTimeLeft(chat)}` : ""}
              </span>
              <ChevronRight size={14} className="text-text-secondary" />
            </div>
          </button>
        ))}
      </div>
    )
  }

  const renderPendingMatches = () => {
    if (pendingMatches.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Clock size={32} className="text-text-secondary/30" />
          <p className="text-sm text-text-secondary">Tidak ada yang menunggumu</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {pendingMatches.map((m) => (
          <div
            key={m.card_id}
            className="p-4 rounded-xl bg-surface border border-border"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {m.card?.topic?.emoji} {m.card?.topic?.name}
              </span>
            </div>
            <p className="text-sm text-text-primary italic mb-3">&ldquo;{m.card?.content}&rdquo;</p>
            <p className="text-xs text-green-600 font-medium mb-3">Seseorang ingin ngobrol!</p>
            <div className="flex gap-2">
              <button
                onClick={() => startChat(m.swiper_id, m.card_id)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium cursor-pointer"
              >
                Mulai Obrolan
              </button>
              <button
                onClick={() => declineMatch(m.card_id)}
                className="px-4 py-2.5 rounded-xl border border-border text-text-secondary text-sm cursor-pointer"
              >
                Lewati
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="bg-surface border-b border-border">
        <div className="max-w-content mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-text-primary">Bisik</h1>
            <button
              onClick={() => setShowCardModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-medium cursor-pointer"
            >
              <Plus size={14} />
              Buat Kartu
            </button>
          </div>

          <div className="flex gap-1">
            {(["temukan", "obrolan", "menunggumu"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  tab === t
                    ? "bg-primary text-white"
                    : "bg-muted text-text-secondary hover:bg-muted/70"
                }`}
              >
                {t === "temukan" && "Temukan"}
                {t === "obrolan" && `Obrolan (${chats.length})`}
                {t === "menunggumu" && `Menunggumu (${pendingMatches.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {tab === "temukan" && renderCardStack()}
            {tab === "obrolan" && renderChatList()}
            {tab === "menunggumu" && renderPendingMatches()}
          </>
        )}
      </div>

      {/* Topic preference modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTopicModal(false)} />
          <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-bold text-text-primary mb-1">Topik apa yang ingin kamu obrolkan?</h3>
            <p className="text-sm text-text-secondary mb-4">Pilih minimal 1 topik</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() =>
                    setSelectedTopics((prev) =>
                      prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id],
                    )
                  }
                  className={`px-4 py-2.5 rounded-xl text-sm border transition-all cursor-pointer ${
                    selectedTopics.includes(t.id)
                      ? "bg-primary/10 border-primary/30 text-primary font-medium"
                      : "border-border text-text-secondary"
                  }`}
                >
                  {t.emoji} {t.name}
                </button>
              ))}
            </div>
            <button
              onClick={saveTopicPref}
              disabled={selectedTopics.length === 0}
              className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm disabled:opacity-40 cursor-pointer"
            >
              Simpan Preferensi
            </button>
          </div>
        </div>
      )}

      {/* Create card modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCardModal(false)} />
          <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom">
            <h3 className="text-base font-bold text-text-primary mb-4">
              {myActiveCard ? "Kartumu Saat Ini" : "Buat Kartu Bisik"}
            </h3>

            {myActiveCard ? (
              <div className="text-center py-4">
                <p className="text-sm text-text-secondary mb-4">
                  Kamu sudah punya kartu aktif. Hapus kartu saat ini untuk membuat yang baru.
                </p>
                <button
                  onClick={async () => {
                    if (!supabase) return
                    await supabase
                      .from("bisik_cards")
                      .update({ is_active: false })
                      .eq("id", myActiveCard.id)
                    setMyActiveCard(null)
                  }}
                  className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm cursor-pointer"
                >
                  Hapus Kartu
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-xs font-medium text-primary mb-2">TOPIK</p>
                  <select
                    value={cardTopic}
                    onChange={(e) => setCardTopic(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text-primary outline-none"
                  >
                    <option value="">Pilih topik</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.emoji} {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-primary mb-2">CERITA</p>
                  <textarea
                    value={cardContent}
                    onChange={(e) => setCardContent(e.target.value)}
                    placeholder="Ceritakan apa yang ingin kamu obrolkan... (10-300 karakter)"
                    maxLength={300}
                    className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none resize-none h-24"
                  />
                  <p className="text-right text-xs text-text-secondary mt-1">{cardContent.length}/300</p>
                </div>

                <button
                  onClick={createCard}
                  disabled={!cardTopic || cardContent.trim().length < 10 || cardSubmitting}
                  className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm disabled:opacity-40 cursor-pointer"
                >
                  {cardSubmitting ? "Memproses..." : "Posting Kartu"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Limit modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLimitModal(false)} />
          <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <Crown size={22} className="text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Batas Obrolan Aktif</h3>
              <p className="text-sm text-text-secondary mt-1">
                Kamu sudah punya {freeLimit} obrolan aktif. Upgrade ke Pro untuk lebih banyak obrolan.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLimitModal(false)}
                className="flex-1 py-3 rounded-xl border border-border text-text-primary font-medium text-sm cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => router.push("/bisik/upgrade")}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-medium text-sm cursor-pointer"
              >
                Upgrade ke Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {isMatching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm font-medium text-text-primary">Mencocokkan...</p>
          </div>
        </div>
      )}
    </div>
  )
}
