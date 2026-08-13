"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2, Heart, X, Crown, Plus, MessageCircle,
  Clock, ChevronRight, AlertTriangle, ArrowLeft,
  Send, Edit2, Sparkles, Search,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { swipeLeft, swipeRight, getDiscoverCards } from "@/lib/bisik/swipe-actions"
import type { BisikCard as BisikCardType } from "@/lib/bisik/swipe-actions"
import BisikCard from "@/components/bisik/BisikCard"

const hashColor = (name: string): string => {
  const colors = ["#084463","#6BB9D4","#FFC64F","#22C55E","#084463","#FFC64F","#EF4444","#6BB9D4","#084463","#6BB9D4"]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

type View = "menu" | "cards"
type SubTab = "temukan" | "obrolan" | "buat"

interface Topic {
  id: string
  name: string
  emoji: string
}

interface BisikChat {
  id: string
  card_id: string
  initiator_id: string
  receiver_id: string
  status: string
  created_at: string
  expires_at: string | null
  last_message?: { content: string; created_at: string; sender_id?: string } | null
  card?: { content: string; topic?: { name: string; emoji: string } | null } | null
  has_unread?: boolean
}

export default function BisikHome() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  // const supabase = createClient() // use singleton

  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const [view, setView] = useState<View>("menu")
  const [subTab, setSubTab] = useState<SubTab>("temukan")

  // Auto-load cards when entering Cards view
  useEffect(() => {
    if (view === "cards" && subTab === "temukan") loadSwipeCards(true)
    if (view === "cards" && subTab === "obrolan") loadChats()
  }, [view, subTab])
  const [loading, setLoading] = useState(true)
  const [bisikName, setBisikName] = useState("")
  const bisikNameRef = useRef(bisikName);
  bisikNameRef.current = bisikName;
  const [isPro, setIsPro] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create card state
  const [topics, setTopics] = useState<Topic[]>([])
  const [activeCards, setActiveCards] = useState<any[]>([])
  const [cardTopic, setCardTopic] = useState("")
  const [cardContent, setCardContent] = useState("")
  const [cardSubmitting, setCardSubmitting] = useState(false)
  const [newCardId, setNewCardId] = useState<string | null>(null)
  const [maxCards, setMaxCards] = useState(5)

  // Swipe deck state
  const [swipeCards, setSwipeCards] = useState<BisikCardType[]>([])
  const [isMatching, setIsMatching] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [maxAllowed, setMaxAllowed] = useState(5)
  const [unreadCount, setUnreadCount] = useState(0)

  // Chats list state
  const [chats, setChats] = useState<BisikChat[]>([])

  // Match popup state
  const [matchPopup, setMatchPopup] = useState<{
    chatId: string; name: string;
    myInitial: string; theirInitial: string;
    color1: string; color2: string;
  } | null>(null)

  // Name modal state
  const [showNameModal, setShowNameModal] = useState(false)
  const [customName, setCustomName] = useState("")
  const [nameValidation, setNameValidation] = useState<{ valid: boolean; reason?: string } | null>(null)
  const [nameSaving, setNameSaving] = useState(false)

  // Load user profile data
  useEffect(() => {
    if (authLoading || !user || !supabase) return
    loadProfile()
  }, [user, authLoading])

  const loadProfile = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data: profile } = await supabase
        .from("users")
        .select("bisik_anonymous_name, bisik_custom_name")
        .eq("id", user!.id)
        .single()

      const name = profile?.bisik_custom_name || profile?.bisik_anonymous_name || ""
      setBisikName(name)

      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle()
      setIsPro(!!sub)

      const { data: top } = await supabase
        .from("bisik_topics")
        .select("id, name, emoji")
        .eq("is_active", true)
        .order("display_order")
      setTopics(top ?? [])

      const { data: cards } = await supabase
        .from("bisik_cards")
        .select("id, topic:bisik_topics(name, emoji), content, created_at")
        .eq("user_id", user!.id)
        .eq("is_active", true)
      setActiveCards(cards ?? [])

      const { data: mx } = await supabase
        .rpc("get_user_max_chats", { p_user_id: user!.id })
      setMaxCards(mx ?? 5)
    } catch (err) {
      // console.error("Bisik loadProfile error:", err)
      setError("Gagal memuat profil. Coba lagi.")
    }
    setLoading(false)
  }

  // Realtime match listener
  useEffect(() => {
    if (!supabase || !user) return

    const channel = supabase
      .channel("bisik-match-listener")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "bisik_chats",
        filter: `receiver_id=eq.${user.id}`,
      }, async (payload) => {
        const newChat = payload.new as any
        const { data: owner } = await supabase!
          .from("users")
          .select("bisik_anonymous_name, bisik_custom_name")
          .eq("id", newChat.initiator_id)
          .single()
        const matchName = owner?.bisik_custom_name || owner?.bisik_anonymous_name || "Anonymous"
        const name = bisikNameRef.current
        setMatchPopup({
          chatId: newChat.id,
          name: matchName,
          myInitial: (name[0] || "?").toUpperCase(),
          theirInitial: (matchName[0] || "?").toUpperCase(),
          color1: hashColor(name),
          color2: hashColor(matchName),
        })
        loadChats()
      })
      .subscribe()

    return () => { supabase?.removeChannel(channel) }
  }, [user, supabase])

  const loadChats = async () => {
    if (!supabase || !user) return
    const { data, error } = await supabase
      .from("bisik_chats")
      .select("*")
      .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })

    if (error) { setChats([]); return }
    if (!data || data.length === 0) { setChats([]); return }

    const chats = data as any[]
    const cardIds = [...new Set(chats.map((c: any) => c.card_id).filter(Boolean))]
    const chatIds = chats.map(c => c.id)

    // Fetch card content and last messages in parallel
    const [cardRes, msgRes] = await Promise.all([
      cardIds.length > 0
        ? supabase.from("bisik_cards").select("id, content").in("id", cardIds)
        : Promise.resolve({ data: [] }),
      supabase.from("bisik_messages")
        .select("chat_id, content, created_at, sender_id, is_read")
        .in("chat_id", chatIds)
        .order("created_at", { ascending: false })
    ])

    const cardMap: Record<string, any> = {}
    ;((cardRes as any)?.data ?? []).forEach((c: any) => { cardMap[c.id] = c })

    const msgMap: Record<string, { content: string; created_at: string; sender_id?: string; is_read?: boolean }> = {}
    ;((msgRes as any)?.data ?? []).forEach((m: any) => {
      if (!msgMap[m.chat_id]) msgMap[m.chat_id] = m
    })

    const mapped = chats.map((c: any) => {
      const msg = msgMap[c.id]
      const isInitiator = c.initiator_id === user.id
      const otherId = isInitiator ? c.receiver_id : c.initiator_id
      const hasUnread = msg && msg.sender_id !== user.id && !msg.is_read
      return {
        ...c,
        card: c.card_id ? cardMap[c.card_id] || null : null,
        last_message: msg ? { content: msg.content, created_at: msg.created_at, sender_id: msg.sender_id } : null,
        has_unread: hasUnread,
      }
    })

    setChats(mapped)
    setUnreadCount(mapped.filter(c => c.has_unread).length)
  }

  // Load chats on mount and when view/subTab changes
  useEffect(() => {
    if (!user || authLoading || !supabase) return
    loadChats()
  }, [user, authLoading, view, subTab])

  // ---- CREATE CARD ----

  const handleCreateCard = async () => {
    if (!supabase || !user || !cardTopic || cardContent.trim().length < 10) return

    if (activeCards.length >= maxCards) {
      setError(`Kamu sudah punya ${activeCards.length} kartu aktif. Hapus kartu lama atau upgrade ke Pro.`)
      return
    }

    setCardSubmitting(true)
    try {
      const { data } = await supabase
        .from("bisik_cards")
        .insert({
          user_id: user.id,
          topic_id: cardTopic,
          content: cardContent.trim(),
        })
        .select("id")
        .single()

      if (data) {
        const topicInfo = topics.find(t => t.id === cardTopic)
        setNewCardId(data.id)
        setCardTopic("")
        setCardContent("")
        setView("cards")
        setSubTab("obrolan")
        setActiveCards(prev => [...prev, {
          id: data.id,
          content: cardContent.trim(),
          topic: topicInfo ? { name: topicInfo.name, emoji: topicInfo.emoji } : null
        }])
      }
    } catch (err) {
      // console.error("Create card error:", err)
      setError("Gagal membuat kartu. Coba lagi.")
    }
    setCardSubmitting(false)
  }

  const deleteCard = async (cardId: string) => {
    if (!supabase) return
    await supabase.from("bisik_cards").update({ is_active: false }).eq("id", cardId)
    setNewCardId(null)
    setActiveCards(prev => prev.filter(c => c.id !== cardId))
    setView("menu")
  }

  // ---- SWIPE ----

  const loadSwipeCards = async (skipTopicFilter = false) => {
    if (!user || !supabase) return
    setLoading(true)
    try {
      const { data: profile } = await supabase
        .from("users")
        .select("bisik_topic_ids")
        .eq("id", user.id)
        .single()

      const topicIds = (profile?.bisik_topic_ids as string[]) ?? []
      const cards = await getDiscoverCards(user.id, topicIds, { skipTopicFilter })
      setSwipeCards(cards as BisikCardType[])
    } catch (err) {
      // console.error("Load swipe cards error:", err)
    }
    setLoading(false)
  }

  const handleSwipeLeft = async (card: BisikCardType) => {
    if (!user) return
    setSwipeCards(prev => prev.filter(c => c.id !== card.id))
    swipeLeft(card.id, card.user_id)
  }

  const handleSwipeRight = async (card: BisikCardType) => {
    if (!user) return
    // Remove card immediately for instant transition
    setSwipeCards(prev => prev.filter(c => c.id !== card.id))
    // Fire server action in background
    setIsMatching(true)
    try {
      const result = await swipeRight(card)
      setIsMatching(false)
      if (result.error === "CHAT_LIMIT_REACHED") {
        setMaxAllowed(result.maxAllowed ?? 5)
        setShowLimitModal(true)
      } else if (result.botChatId) {
        router.push(`/bisik/chat/${result.botChatId}`)
      }
    } catch {
      setIsMatching(false)
    }
  }

  // ---- NAME MODAL ----

  const checkNameAvailability = async () => {
    if (!supabase || !user || customName.length < 4) return
    const { data } = await supabase
      .rpc("validate_bisik_custom_name", {
        p_user_id: user.id,
        p_custom_name: customName,
      })
    setNameValidation(data as any)
  }

  const saveCustomName = async () => {
    if (!supabase || !user || !nameValidation?.valid) return
    setNameSaving(true)
    await supabase
      .from("users")
      .update({ bisik_custom_name: customName.toLowerCase() })
      .eq("id", user.id)
    setBisikName(customName.toLowerCase())
    setNameSaving(false)
    setShowNameModal(false)
  }

  // ---- RENDER ----

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-bg pb-24">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    )
  }

  const renderHeader = () => (
    <div className="bg-surface border-b border-border">
      <div className="max-w-content mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">Bisik</h1>
          {bisikName && (
            <button
              onClick={() => setShowNameModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-medium cursor-pointer hover:bg-primary/10 transition-colors"
            >
              <Sparkles size={14} />
              {bisikName}
              <Edit2 size={12} className="opacity-60" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const renderCardsView = () => (
    <div className="max-w-content mx-auto px-4 py-6">
      <button onClick={() => setView("menu")} className="flex items-center gap-1 text-sm text-text-secondary mb-4 cursor-pointer">
        <ArrowLeft size={16} /> Kembali
      </button>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => { setSubTab("temukan"); loadSwipeCards(true) }}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${subTab === "temukan" ? "bg-primary text-white" : "bg-muted text-text-secondary"}`}>
          Temukan
        </button>
        <button onClick={() => { setSubTab("obrolan"); loadChats() }}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${subTab === "obrolan" ? "bg-primary text-white" : "bg-muted text-text-secondary"}`}>
          Obrolan{unreadCount > 0 ? ` ${unreadCount}` : ""}
        </button>
        <button onClick={() => setSubTab("buat")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${subTab === "buat" ? "bg-primary text-white" : "bg-muted text-text-secondary"}`}>
          Buat
        </button>
      </div>

      {subTab === "temukan" && renderSwipeDeck()}
      {subTab === "obrolan" && renderChatList()}
      {subTab === "buat" && renderCreateCard()}
    </div>
  )

  const renderMenu = () => (
    <div className="max-w-content mx-auto px-4 py-6 space-y-4">
      <p className="text-base font-semibold text-text-primary">Mau ngapain hari ini?</p>

      <button
        onClick={() => setView("cards")}
        className="w-full p-5 rounded-2xl bg-surface border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all text-left cursor-pointer"
        style={{ borderLeft: '4px solid #084463' }}
      >
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">🎴</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-text-primary">Kartu Curhat</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Buat kartu, temukan teman, dan lanjutkan obrolan
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
          <ChevronRight size={20} className="text-text-secondary/40" />
        </div>
      </button>

      <div className="pt-4 border-t border-border">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Permainan</p>
        <button
          onClick={() => router.push("/tebak")}
          className="w-full p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all text-left cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">🎭</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Tebak Aku</p>
              <p className="text-xs text-text-secondary">Main tebak kepribadian lawan</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  const renderCreateCard = () => (
    <div className="max-w-content mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">Buat Kartu Curhat</h2>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
          {activeCards.length}/{maxCards} aktif
        </span>
      </div>

      {activeCards.length >= maxCards ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
          <Crown size={28} className="text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-amber-800 mb-1">Kartu curhat penuh</p>
          <p className="text-xs text-amber-600 mb-4">Hapus kartu lama atau upgrade ke Pro</p>
          <div className="flex gap-3">
            <button onClick={() => setSubTab("obrolan")} className="flex-1 py-2.5 rounded-xl border border-amber-300 text-amber-700 text-sm font-medium cursor-pointer">Lihat Chat Aktif</button>
            <button onClick={() => router.push("/bisik/upgrade")} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium cursor-pointer">Upgrade ke Pro</button>
          </div>
        </div>
      ) : (
        <>
          {/* Topic selector — chips */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Pilih Topik</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCardTopic(cardTopic === t.id ? "" : t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-all cursor-pointer ${
                    cardTopic === t.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-text-secondary hover:border-primary/30"
                  }`}
                >
                  <span className="text-base">{t.emoji}</span> {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea — card style */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Cerita Kamu</p>
            <div className="relative rounded-2xl border-2 border-border bg-surface p-4 focus-within:border-primary transition-colors">
              <textarea
                value={cardContent}
                onChange={(e) => setCardContent(e.target.value)}
                placeholder="Tulis singkat apa yang mau kamu obrolkan... (10-300 karakter)"
                maxLength={300}
                rows={4}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary/40 outline-none resize-none font-sans leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <span className="text-[10px] text-text-secondary/50">
                  {cardContent.length < 10 ? `Minimal 10 karakter (${cardContent.length}/10)` : ""}
                </span>
                <span className={`text-[10px] font-medium ${cardContent.length >= 290 ? "text-amber-500" : "text-text-secondary/50"}`}>
                  {cardContent.length}/300
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { setCardTopic(""); setCardContent(""); setError(null) }}
              className="flex-1 py-3 rounded-xl border border-border text-text-primary text-sm font-medium cursor-pointer hover:bg-muted transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleCreateCard}
              disabled={!cardTopic || cardContent.trim().length < 10 || cardSubmitting}
              className="flex-[2] py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-40 cursor-pointer hover:bg-primary/90 transition-colors"
            >
              {cardSubmitting ? "Memproses..." : "Posting Kartu"}
            </button>
          </div>
        </>
      )}
    </div>
  )

  const renderCardWaiting = () => (
    <div className="max-w-content mx-auto px-4 py-6 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Send size={28} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Kartumu sudah dipasang!</h2>
      </div>

      {activeCards.filter(c => c.id === newCardId).map((card) => (
        <div key={card.id} className="p-4 rounded-2xl bg-surface border border-border mb-6 text-left">
          <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full mb-2">
            {card.topic?.emoji} {card.topic?.name}
          </span>
          <p className="text-sm text-text-primary italic mt-1">&ldquo;{card.content}&rdquo;</p>
        </div>
      ))}

      <div className="flex items-center justify-center gap-2 mb-6">
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
        <p className="text-sm text-text-secondary">Sedang menunggu teman ngobrol...</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={async () => {
            setSubTab("temukan")
            await loadSwipeCards(true)
          }}
          className="w-full py-3 rounded-xl bg-primary text-white text-sm font-medium cursor-pointer"
        >
          Ya, Cari Obrolan Juga
        </button>
        <button
          onClick={() => setView("menu")}
          className="w-full py-3 rounded-xl border border-border text-text-primary text-sm font-medium cursor-pointer"
        >
          Lihat / Hapus Kartuku
        </button>
        {newCardId && (
          <button
            onClick={() => deleteCard(newCardId)}
            className="text-xs text-red-400 cursor-pointer hover:text-red-500"
          >
            Hapus Kartu
          </button>
        )}
      </div>
    </div>
  )

  const renderSwipeDeck = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )
    }

    return (
      <>

        {swipeCards.length === 0 ? (
              <div style={{
                height: 356, display: "flex",
                flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                textAlign: "center", padding: 24,
              }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✨</div>
                <h3 style={{
                  fontFamily: "Poppins", fontSize: 20, fontWeight: 700,
                  color: "#1E2938", marginBottom: 8,
                }}>
                  Semua kartu sudah kamu lihat
                </h3>
                <p style={{
                  fontFamily: "Inter", fontSize: 14, color: "#647488",
                  marginBottom: 24, lineHeight: 1.6,
                }}>
                  Belum ada kartu baru untuk sekarang.
                  Coba lagi nanti atau buat kartumu sendiri!
                </p>
                <button
                  onClick={() => setSubTab("buat")}
                  style={{
                    background: "#084463", color: "#FFFFFF",
                    border: "none", borderRadius: 12,
                    padding: "12px 24px",
                    fontFamily: "Poppins", fontSize: 14, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  💭 Buat Kartu Curhat
                </button>
                <button
                  onClick={() => loadSwipeCards(true)}
                  className="mt-3 px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-muted cursor-pointer"
                >
                  🔄 Segarkan
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center" style={{ minHeight: 400 }}>
                  {/* Deck container */}
                  <div style={{
                    position: "relative",
                    width: "100%", maxWidth: 280,
                    height: 356,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {/* Card stack: dari belakang ke depan */}
                    {swipeCards.slice(0, 3).map((card, index) => {
                      if (index === 0) {
                        // Kartu paling depan (aktif untuk swipe)
                        return (
                          <BisikCard
                            key={card.id}
                            card={card}
                            onSwipeLeft={() => handleSwipeLeft(card)}
                            onSwipeRight={() => handleSwipeRight(card)}
                            isTop={true}
                          />
                        )
                      }
                      const stackScale = 1 - index * 0.06
                      const stackOffset = index * 10
                      return (
                        <div key={card.id} style={{
                          position: "absolute",
                          width: "100%", maxWidth: 280,
                          height: 356,
                          transform: `scale(${stackScale}) translateY(${stackOffset}px)`,
                          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease",
                          zIndex: 3 - index,
                          opacity: stackScale,
                        }}>
                          <BisikCard
                            card={card}
                            onSwipeLeft={() => {}}
                            onSwipeRight={() => {}}
                            isTop={false}
                            stackOffset={stackOffset}
                            stackScale={stackScale}
                          />
                        </div>
                      )
                    })}
                  </div>

                  </div>

                  {/* Action buttons — fixed above navbar */}
                  <div style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 0 max(80px, calc(64px + env(safe-area-inset-bottom)))",
                    background: "linear-gradient(transparent 0%, #F8FAFC 40%)",
                    zIndex: 40,
                    pointerEvents: "none",
                  }}>
                    <div style={{ display: "flex", gap: 32, pointerEvents: "auto" }}>
                    <button
                      onClick={() => swipeCards[0] && handleSwipeLeft(swipeCards[0])}
                      style={{
                        width: 56, height: 56,
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        border: "2px solid #E2E8F0",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", fontSize: 22,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(239,68,68,0.3)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => swipeCards[0] && handleSwipeRight(swipeCards[0])}
                      disabled={isMatching}
                      style={{
                        width: 68, height: 68,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #084463, #0E7490)",
                        border: "none",
                        boxShadow: "0 8px 24px rgba(8,68,99,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", fontSize: 32,
                        transition: "all 0.2s ease",
                        opacity: isMatching ? 0.4 : 1,
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"}
                    >
                      ❤️
                    </button>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "center",
                    gap: 80, marginTop: 8,
                  }}>
                    <span style={{ fontSize: 11, color: "#647488", fontFamily: "Inter" }}>Lewati</span>
                    <span style={{ fontSize: 11, color: "#647488", fontFamily: "Inter" }}>Dengerin</span>
                  </div>
                </div>
              </>
            )}
      </>

    )
  }

  const renderChatList = () => {
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
            onClick={() => { router.push(`/bisik/chat/${chat.id}`) }}
            className="w-full flex items-start gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative">
              <MessageCircle size={18} className="text-primary" />
              {chat.has_unread && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-surface" />
              )}
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
                <p className="text-xs text-text-secondary/50">Menunggu balasan...</p>
              )}
            </div>
            <ChevronRight size={14} className="text-text-secondary shrink-0" />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      {renderHeader()}

      {error && (
        <div className="max-w-content mx-auto px-4 pt-4">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-500 cursor-pointer shrink-0"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {view === "menu" && renderMenu()}
      {view === "cards" && renderCardsView()}

      {/* Limit modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLimitModal(false)} />
          <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-24 animate-in slide-in-from-bottom">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <Crown size={22} className="text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Batas Obrolan Aktif</h3>
              <p className="text-sm text-text-secondary mt-1">
                Kamu sudah punya {maxAllowed} obrolan aktif. Upgrade ke Pro untuk lebih banyak.
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

      {/* Match popup */}
      {matchPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface rounded-2xl px-8 py-8 text-center max-w-sm mx-4 animate-in zoom-in-95">
            <p className="text-4xl mb-2">✨</p>
            <h2 className="text-lg font-bold text-text-primary mb-4">It&rsquo;s a Match!</h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
                style={{ background: matchPopup.color1 }}
              >
                {matchPopup.myInitial}
              </div>
              <span className="text-2xl">💕</span>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
                style={{ background: matchPopup.color2 }}
              >
                {matchPopup.theirInitial}
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              Kamu dan <span className="font-semibold text-primary">{matchPopup.name}</span> matched!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMatchPopup(null)}
                className="flex-1 py-3 rounded-xl border border-border text-text-primary text-sm font-medium cursor-pointer"
              >
                Tetap Cari Obrolan
              </button>
              <button
                onClick={() => {
                  setMatchPopup(null)
                  // removed history hack
                  router.push(`/bisik/chat/${matchPopup.chatId}`)
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium cursor-pointer"
              >
                💬 Mulai Ngobrol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNameModal(false)} />
          <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-24 animate-in slide-in-from-bottom">
            <h3 className="text-base font-bold text-text-primary mb-4">Nama Bisikmu</h3>

            {isPro ? (
              <>
                <p className="text-xs text-text-secondary mb-3">
                  Aturan: huruf + angka, maks 2 digit, tidak mengandung nama aslimu
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    value={customName}
                    onChange={(e) => { setCustomName(e.target.value); setNameValidation(null) }}
                    placeholder="Masukkan nama custom..."
                    maxLength={20}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg text-sm text-text-primary outline-none"
                  />
                  <button
                    onClick={checkNameAvailability}
                    disabled={customName.length < 4}
                    className="px-6 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium disabled:opacity-40 cursor-pointer"
                  >
                    Cek
                  </button>
                </div>

                {nameValidation && (
                  <p className={`text-xs mb-3 ${nameValidation.valid ? "text-green-600" : "text-red-500"}`}>
                    {nameValidation.valid ? "✅ Tersedia" : `❌ ${nameValidation.reason}`}
                  </p>
                )}

                <button
                  onClick={saveCustomName}
                  disabled={!nameValidation?.valid || nameSaving}
                  className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm disabled:opacity-40 cursor-pointer"
                >
                  {nameSaving ? "Menyimpan..." : "Simpan Nama"}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🔒</span>
                  <p className="text-lg font-semibold text-text-primary">{bisikName}</p>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  Nama anonymous ini permanen dan otomatis.
                </p>
                <button
                  onClick={() => router.push("/bisik/upgrade")}
                  className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm cursor-pointer"
                >
                  🚀 Upgrade ke Pro
                </button>
              </>
            )}
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
