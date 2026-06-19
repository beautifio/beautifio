'use server'
import { createClient } from "@/lib/supabase/server"
import { generateNickname } from "@/lib/anonymous"

export type BisikCategory = 'karir' | 'keluarga' | 'percintaan' | 'pendidikan' | 'kesehatan_mental' | 'pertemanan' | 'keuangan'
export type BisikMood = 'didengar' | 'mendengarkan' | 'keduanya'

export async function joinBisikQueue(
  category: BisikCategory,
  moodCheck: BisikMood
): Promise<{ sessionId: string; participantId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Cek user tidak punya active session
  const { data: activeSession } = await supabase
    .from('bisik_participants')
    .select('session_id')
    .eq('user_id', user.id)
    .in('session_id', (await supabase.from('bisik_sessions').select('id').in('status', ['waiting', 'matched', 'active'])).data?.map(s => s.id) || [])
    .maybeSingle()
  if (activeSession) {
    // User sudah punya sesi aktif, kembali ke sesi tersebut
    return { sessionId: activeSession.session_id, participantId: '' }
  }

  // Step 1: Cari session waiting dengan kategori sama (bukan milik user)
  const { data: existingSessions } = await supabase
    .from('bisik_sessions')
    .select('id')
    .eq('category', category)
    .eq('status', 'waiting')
    .not('participants.user_id', 'eq', user.id)
    .order('created_at', { ascending: true })
    .limit(1)

  const existingSession = existingSessions?.[0]

  if (existingSession) {
    // Step 2: Atomic claim
    const { data: claimed } = await supabase
      .from('bisik_sessions')
      .update({ status: 'matched', matched_at: new Date().toISOString() })
      .eq('id', existingSession.id)
      .eq('status', 'waiting')
      .select('id')
      .single()

    if (claimed) {
      const nickname = generateNickname()
      const { data: participant } = await supabase
        .from('bisik_participants')
        .insert({ session_id: claimed.id, user_id: user.id, nickname, mood_check: moodCheck })
        .select('id')
        .single()

      await supabase.from('bisik_sessions').update({ status: 'active' }).eq('id', claimed.id)

      return { sessionId: claimed.id, participantId: participant!.id }
    }
  }

  // Step 3: Buat session baru sebagai participant A
  const nickname = generateNickname()
  const { data: newSession } = await supabase
    .from('bisik_sessions')
    .insert({ category, status: 'waiting' })
    .select('id')
    .single()

  const { data: participant } = await supabase
    .from('bisik_participants')
    .insert({ session_id: newSession!.id, user_id: user.id, nickname, mood_check: moodCheck })
    .select('id')
    .single()

  return { sessionId: newSession!.id, participantId: participant!.id }
}

export async function sendBisikMessage(sessionId: string, senderId: string, content: string): Promise<void> {
  const supabase = await createClient()
  if (!content.trim() || content.length > 500) throw new Error('Invalid content')
  await supabase.from('bisik_messages').insert({ session_id: sessionId, sender_id: senderId, content })
}

export async function endBisikSession(sessionId: string, reason: 'user_exit' | 'timeout'): Promise<void> {
  const supabase = await createClient()
  await supabase.from('bisik_sessions').update({
    status: 'ended', ended_at: new Date().toISOString(), end_reason: reason,
  }).eq('id', sessionId)
}

export async function reportBisikSession(
  sessionId: string, reporterId: string, reason: string, detail?: string
): Promise<void> {
  const supabase = await createClient()
  await supabase.from('bisik_reports').insert({
    session_id: sessionId, reporter_id: reporterId, reason, detail: detail || null,
  })
  await supabase.from('bisik_sessions').update({
    status: 'reported', ended_at: new Date().toISOString(),
  }).eq('id', sessionId)
}
