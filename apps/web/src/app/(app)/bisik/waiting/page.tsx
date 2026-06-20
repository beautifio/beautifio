"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function BisikWaiting() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cardId = searchParams.get("cardId")
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    const channel = supabase
      .channel("bisik-waiting")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bisik_chats",
        },
        async (payload) => {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (payload.new.receiver_id === user?.id) {
            const chatId = payload.new.id as string
            router.replace(`/bisik/chat/${chatId}`)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  const handleCancel = async () => {
    const supabase = createClient()
    if (supabase && cardId) {
      await supabase.from("bisik_cards").update({ is_active: false }).eq("id", cardId)
    }
    router.replace("/bisik")
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#F8FAFC",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#084463",
          opacity: 0.15,
          animation: "pulse 1.5s ease-in-out infinite",
          marginBottom: 32,
        }}
      />

      <h2
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 20,
          fontWeight: 600,
          color: "#1E2938",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Sedang mencari teman ngobrol{dots}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#647488",
          textAlign: "center",
          marginBottom: 48,
          lineHeight: 1.6,
        }}
      >
        Kami sedang mencarikan seseorang yang relevan
        dengan topik yang kamu pilih.
      </p>

      <button
        onClick={handleCancel}
        style={{
          background: "none",
          border: "1.5px solid #E2E8F0",
          borderRadius: 12,
          padding: "12px 24px",
          fontSize: 14,
          color: "#647488",
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Batalkan Pencarian
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.4); opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
