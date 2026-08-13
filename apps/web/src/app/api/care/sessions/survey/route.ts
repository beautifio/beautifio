import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { session_id, rating, comment } = await request.json()
  if (!session_id || !rating) return NextResponse.json({ error: "session_id and rating required" }, { status: 400 })

  // Verify user is session participant
  const { data: session } = await supabase.from('care_chat_sessions')
    .select('user_id, officer_id, category, status')
    .eq('id', session_id).single()
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
  if (session.user_id !== user.id) return NextResponse.json({ error: "Not your session" }, { status: 403 })

  // Check rating ≤ 3 requires comment
  if (rating <= 3 && !comment?.trim()) {
    return NextResponse.json({ error: "Komentar wajib diisi untuk rating di bawah 4" }, { status: 400 })
  }

  await supabase.from('care_satisfaction_surveys').upsert({
    session_id,
    user_id: user.id,
    officer_id: session.officer_id,
    rating,
    comment: comment?.trim() || null,
    category: session.category,
  }, { onConflict: 'session_id' })

  return NextResponse.json({ success: true })
}
