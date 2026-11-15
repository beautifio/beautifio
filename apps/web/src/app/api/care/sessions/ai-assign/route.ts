import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { assignAIVolunteer } from "@/lib/care/ai-actions"
import { getServerUser } from "@/lib/auth/server-auth"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { session_id } = body
  if (!session_id) return NextResponse.json({ error: "session_id required" }, { status: 400 })

  // Verify session belongs to user
  const { data: session } = await supabase.from('care_chat_sessions')
    .select('*').eq('id', session_id).single()
  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Not your session" }, { status: 403 })
  }

  const result = await assignAIVolunteer(session_id, session.category)
  if (!result.success) {
    return NextResponse.json({ error: result.error || 'Failed to assign', success: false }, { status: 200 })
  }

  return NextResponse.json({ success: true, ai_name: result.aiName })
}
