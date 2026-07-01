'use server'

import { createClient as createServerClient } from "@/lib/supabase/server"

export async function createBisikFromTebak(sessionId: string): Promise<string | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Ambil data sesi
  const { data: session, error } = await supabase
    .from('tebak_sessions')
    .select('player_a_id, player_b_id, status')
    .eq('id', sessionId)
    .single()

  if (error || !session) return null
  if (session.status !== 'finished') return null

  const partner = session.player_a_id === user.id ? session.player_b_id : session.player_a_id

  // Cek apakah sudah ada bisik_chat antara dua user ini yang masih aktif
  const { data: existing } = await supabase
    .from('bisik_chats')
    .select('id')
    .or(`and(initiator_id.eq.${user.id},receiver_id.eq.${partner}),and(initiator_id.eq.${partner},receiver_id.eq.${user.id})`)
    .not('status', 'eq', 'ended')
    .not('status', 'eq', 'expired')
    .limit(1)

  if (existing && existing.length > 0) {
    return existing[0].id
  }

  // Buat baru
  const { data: chat, error: createError } = await supabase
    .from('bisik_chats')
    .insert({
      initiator_id: user.id,
      receiver_id: partner,
      status: 'active',
    })
    .select('id')
    .single()

  if (createError || !chat) return null
  return chat.id
}
