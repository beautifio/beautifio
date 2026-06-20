"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { enterBisikQueue } from "@/lib/bisik/swipe-actions"
import { useAuth } from "@/hooks/use-auth"

interface BisikTopic {
  id: string
  name: string
  emoji: string
}

export default function TopicSelector() {
  const router = useRouter()
  const { user } = useAuth()
  const [topics, setTopics] = useState<BisikTopic[]>([])
  const [step, setStep] = useState<"loading" | "topics" | "content">("loading")
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const supabase = createClient()
      if (!supabase) return

      const [{ data: topicsData }, { data: profile }] = await Promise.all([
        supabase.from("bisik_topics").select("id, name, emoji").eq("is_active", true).order("display_order"),
        supabase.from("users").select("bisik_topic_ids").eq("id", user.id).single(),
      ])

      setTopics(topicsData ?? [])

      if (profile && profile.bisik_topic_ids?.length > 0) {
        setSelectedTopicIds(profile.bisik_topic_ids)
        setStep("content")
      } else {
        setStep("topics")
      }
    })()
  }, [user])

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  const handleContinueFromTopics = async () => {
    if (selectedTopicIds.length === 0) return
    const supabase = createClient()
    if (!supabase) return
    await supabase.from("users").update({ bisik_topic_ids: selectedTopicIds }).eq("id", user!.id)
    setStep("content")
  }

  const handleSubmit = async () => {
    if (selectedTopicIds.length === 0) return
    setSubmitting(true)
    setError("")

    try {
      const { cardId } = await enterBisikQueue(selectedTopicIds[0], content.trim())
      router.push(`/bisik/waiting?cardId=${cardId}`)
    } catch {
      setError("Gagal masuk antrian. Coba lagi.")
      setSubmitting(false)
    }
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex-1 max-w-content mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Bisik</h1>
          <p className="text-sm text-text-secondary mt-1">Ngobrol anonim dengan orang baru</p>
        </div>

        {step === "topics" && (
          <>
            <div>
              <p className="text-xs font-medium text-primary mb-3">PILIH TOPIK (min 1)</p>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => {
                  const isSelected = selectedTopicIds.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTopic(t.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border-primary/30 text-primary font-medium"
                          : "border-border bg-surface text-text-secondary hover:border-primary/30"
                      }`}
                    >
                      {t.emoji} {t.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleContinueFromTopics}
              disabled={selectedTopicIds.length === 0}
              className="w-full bg-primary text-white rounded-full py-3 text-sm font-medium disabled:opacity-40 mt-auto"
            >
              Lanjut
            </button>
          </>
        )}

        {step === "content" && (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-primary">CERITAKAN</p>
                <button
                  onClick={() => setStep("topics")}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Ubah topik
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ceritakan singkat apa yang mau kamu obrolkan..."
                maxLength={300}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary transition-colors resize-none h-24"
              />
              <p className="text-right text-xs text-text-secondary mt-1">
                {content.length}/300
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || content.trim().length < 10}
              className="w-full bg-primary text-white rounded-full py-3 text-sm font-medium disabled:opacity-40 mt-auto"
            >
              {submitting ? "Memproses..." : "Cari teman ngobrol →"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
