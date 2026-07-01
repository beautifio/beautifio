'use server'

import { createClient as createServerClient } from "@/lib/supabase/server"
import { getUserTier } from "@/lib/tier"

// =============================================================================
// Reguler: Kirim undangan kenalan (butuh persetujuan)
// =============================================================================
export async function createBisikInvite(sessionId: string): Promise<{ success: boolean; message: string; inviteId?: string; chatId?: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Unauthorized" }

  const { data: session } = await supabase.from('tebak_sessions')
    .select('player_a_id, player_b_id').eq('id', sessionId).eq('status', 'finished').single()
  if (!session) return { success: false, message: "Game tidak ditemukan" }

  const partner = session.player_a_id === user.id ? session.player_b_id : session.player_a_id

  // Reject if partner is bot
  const { data: partnerUser } = await supabase.from('users').select('is_bot').eq('id', partner).single()
  if (partnerUser?.is_bot) return { success: false, message: "Bot tidak bisa diajak kenalan" }

  // Check if already have active chat
  const { data: existing } = await supabase.from('bisik_chats')
    .select('id').or(`and(initiator_id.eq.${user.id},receiver_id.eq.${partner}),and(initiator_id.eq.${partner},receiver_id.eq.${user.id})`)
    .not('status', 'in', '("ended","expired")').limit(1)
  if (existing?.length) return { success: true, message: "existing_chat", chatId: existing[0].id }

  // Check for existing pending invite
  const { data: pendingInvite } = await supabase.from('bisik_invites')
    .select('id').eq('from_user', user.id).eq('to_user', partner)
    .eq('source', 'tebak').eq('status', 'pending').maybeSingle()
  if (pendingInvite) return { success: false, message: "Undangan sudah dikirim. Menunggu respon." }

  // Create invite
  const { data: invite, error } = await supabase.from('bisik_invites').insert({
    from_user: user.id, to_user: partner, source: 'tebak',
  }).select('id').single()
  if (error) return { success: false, message: "Gagal mengirim undangan" }

  // Notify partner
  const { data: fromUser } = await supabase.from('users').select('full_name').eq('id', user.id).single()
  await supabase.from('notifications').insert({
    user_id: partner, type: 'info',
    title: '🗣️ Ajakan Kenalan dari Tebak!',
    body: `${fromUser?.full_name || 'Seseorang'} ingin kenalan denganmu setelah main Tebak.`,
    data: { invite_id: invite.id, link_url: '/bisik/chats' },
  })

  return { success: true, message: "Undangan terkirim!", inviteId: invite.id }
}

// =============================================================================
// Pro: Langsung buat chat (tembus, 24h timer)
// =============================================================================
export async function createProChatFromTebak(sessionId: string): Promise<{ success: boolean; message: string; chatId?: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Unauthorized" }

  const tier = await getUserTier(user.id)
  if (tier === 'reguler') return { success: false, message: "Fitur ini hanya untuk Pro & Ultimate" }

  const { data: session } = await supabase.from('tebak_sessions')
    .select('player_a_id, player_b_id').eq('id', sessionId).eq('status', 'finished').single()
  if (!session) return { success: false, message: "Game tidak ditemukan" }

  const partner = session.player_a_id === user.id ? session.player_b_id : session.player_a_id

  // Reject if partner is bot
  const { data: partnerUser } = await supabase.from('users').select('is_bot, full_name').eq('id', partner).single()
  if (partnerUser?.is_bot) return { success: false, message: "Bot tidak bisa diajak kenalan" }

  // Check existing chat
  const { data: existing } = await supabase.from('bisik_chats')
    .select('id').or(`and(initiator_id.eq.${user.id},receiver_id.eq.${partner}),and(initiator_id.eq.${partner},receiver_id.eq.${user.id})`)
    .not('status', 'in', '("ended","expired")').limit(1)
  if (existing?.length) return { success: true, message: "existing_chat", chatId: existing[0].id }

  // Create chat with 24h expiry
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const { data: chat, error } = await supabase.from('bisik_chats').insert({
    initiator_id: user.id, receiver_id: partner, status: 'active', expires_at: expiresAt,
  }).select('id').single()
  if (error) return { success: false, message: "Gagal membuat chat" }

  // Notify partner
  const { data: fromUser } = await supabase.from('users').select('full_name').eq('id', user.id).single()
  await supabase.from('notifications').insert({
    user_id: partner, type: 'info',
    title: '💬 Chat dari Tebak!',
    body: `${fromUser?.full_name || 'Seseorang'} mengirim chat setelah main Tebak. Balas dalam 24 jam sebelum hilang.`,
    data: { chat_id: chat.id, link_url: `/bisik/chat/${chat.id}` },
  })

  return { success: true, message: "Chat dibuka!", chatId: chat.id }
}

// =============================================================================
// Respond to invite (accept/decline)
// =============================================================================
export async function respondToBisikInvite(inviteId: string, accept: boolean): Promise<{ success: boolean; chatId?: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { data: invite } = await supabase.from('bisik_invites')
    .select('*').eq('id', inviteId).eq('to_user', user.id).eq('status', 'pending').single()
  if (!invite) return { success: false }

  if (accept) {
    // Create chat
    const { data: chat } = await supabase.from('bisik_chats').insert({
      initiator_id: invite.from_user, receiver_id: user.id, status: 'active',
    }).select('id').single()

    await supabase.from('bisik_invites').update({
      status: 'accepted', responded_at: new Date().toISOString(),
    }).eq('id', inviteId)

    // Notify sender
    const { data: accepter } = await supabase.from('users').select('full_name').eq('id', user.id).single()
    await supabase.from('notifications').insert({
      user_id: invite.from_user, type: 'info',
      title: '✅ Ajakan diterima!',
      body: `${accepter?.full_name || 'Seseorang'} menerima ajakan kenalanmu.`,
      data: { chat_id: chat?.id, link_url: `/bisik/chat/${chat?.id}` },
    })

    return { success: true, chatId: chat?.id }
  } else {
    await supabase.from('bisik_invites').update({
      status: 'declined', responded_at: new Date().toISOString(),
    }).eq('id', inviteId)

    await supabase.from('notifications').insert({
      user_id: invite.from_user, type: 'info',
      title: '❌ Ajakan ditolak',
      body: 'Lawanmu menolak ajakan kenalan. Tidak apa-apa, coba lagi nanti!',
    })

    return { success: true }
  }
}

// =============================================================================
// Get pending invites for current user
// =============================================================================
export async function getPendingInvites(): Promise<{ invited: any[]; inviting: any[] }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { invited: [], inviting: [] }

  const { data: invited } = await supabase.from('bisik_invites')
    .select('id, from_user, status, created_at, from:from_user(full_name, avatar_url)')
    .eq('to_user', user.id).eq('status', 'pending').order('created_at', { ascending: false })

  const { data: inviting } = await supabase.from('bisik_invites')
    .select('id, to_user, status, created_at, to:to_user(full_name, avatar_url)')
    .eq('from_user', user.id).eq('status', 'pending').order('created_at', { ascending: false })

  return { invited: invited || [], inviting: inviting || [] }
}
