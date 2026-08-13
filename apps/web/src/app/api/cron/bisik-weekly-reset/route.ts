import { NextRequest, NextResponse } from "next/server"
import { weeklyBotReset, refreshBotCards } from "@/lib/bisik/bot-actions"

export async function GET(request: NextRequest) {
  const cardsOnly = request.nextUrl.searchParams.get("cards") === "1"

  // Only require secret for destructive ops (not cards-only)
  if (!cardsOnly) {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = request.headers.get("authorization")
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    if (cardsOnly) {
      const result = await refreshBotCards()
      return NextResponse.json({ success: true, generated: result.generated, timestamp: new Date().toISOString() })
    }
    const result = await weeklyBotReset()
    return NextResponse.json({ success: true, chatsReset: result.reset, timestamp: new Date().toISOString() })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Reset failed" }, { status: 500 })
  }
}
