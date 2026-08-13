'use server'
import { createClient } from "@/lib/supabase/server"

export interface BotProfile {
  id: string
  display_name: string
  disc_type: string
  disc_secondary: string | null
  komunikasi_type: string
  consistency_pct: number
  guess_accuracy_pct: number
  answer_delay_min_ms: number
  answer_delay_max_ms: number
  is_active: boolean
}

const DEFAULT_PROFILE: BotProfile = {
  id: '', display_name: 'Bot', disc_type: 'I', disc_secondary: null,
  komunikasi_type: 'Ekspresif', consistency_pct: 80, guess_accuracy_pct: 40,
  answer_delay_min_ms: 3000, answer_delay_max_ms: 3000, is_active: true,
}

// ── Bot pools for matchmaking ──
const BOT_POOLS = {
  low: ['a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-00000000000a'],
  medium: ['a0000000-0000-0000-0000-00000000001f','a0000000-0000-0000-0000-000000000020','a0000000-0000-0000-0000-000000000021','a0000000-0000-0000-0000-000000000022','a0000000-0000-0000-0000-000000000023','a0000000-0000-0000-0000-000000000024','a0000000-0000-0000-0000-000000000025','a0000000-0000-0000-0000-000000000026','a0000000-0000-0000-0000-000000000027','a0000000-0000-0000-0000-000000000028'],
  high: ['a0000000-0000-0000-0000-00000000005b','a0000000-0000-0000-0000-00000000005c','a0000000-0000-0000-0000-00000000005d','a0000000-0000-0000-0000-00000000005e','a0000000-0000-0000-0000-00000000005f','a0000000-0000-0000-0000-000000000060','a0000000-0000-0000-0000-000000000061','a0000000-0000-0000-0000-000000000062','a0000000-0000-0000-0000-000000000063','a0000000-0000-0000-0000-000000000064'],
}

export async function getRandomBotId(tier?: 'low' | 'medium' | 'high'): Promise<string> {
  const pool = tier ? BOT_POOLS[tier] : [...BOT_POOLS.low, ...BOT_POOLS.medium, ...BOT_POOLS.high]
  return pool[Math.floor(Math.random() * pool.length)]
}

export async function findBotForMatchmaking(): Promise<{ botId: string } | null> {
  const supabase = await createClient()
  const { data: users } = await supabase.from('users').select('id').eq('is_bot', true).limit(50)
  if (!users?.length) return null
  return { botId: users[Math.floor(Math.random() * users.length)].id }
}

export async function hasOnlinePlayers(): Promise<boolean> {
  const supabase = await createClient()
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { count } = await supabase.from('tebak_sessions').select('*', { count: 'exact', head: true }).gte('created_at', fiveMinAgo).or('status.eq.waiting,status.eq.active')
  return (count ?? 0) > 0
}

export async function getOpponentInfo(opponentId: string): Promise<{
  isBot: boolean
  displayName: string
  discType: string | null
}> {
  const supabase = await createClient()

  const { data: botProfile } = await supabase.from('tebak_bot_profiles')
    .select('disc_type')
    .eq('id', opponentId)
    .eq('is_active', true)
    .single()

  // Get display name: bisik anonymous name first, then full_name
  const { data: user } = await supabase.from('users')
    .select('full_name, is_bot, bisik_anonymous_name, bisik_custom_name')
    .eq('id', opponentId)
    .single()

  const anonName = user?.bisik_custom_name || user?.bisik_anonymous_name || user?.full_name || 'Lawan'

  if (botProfile) {
    return { isBot: true, displayName: anonName, discType: botProfile.disc_type }
  }

  if (user?.is_bot) {
    return { isBot: true, displayName: anonName, discType: null }
  }

  return { isBot: false, displayName: anonName, discType: null }
}

export async function getPlayerName(userId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('full_name, bisik_anonymous_name, bisik_custom_name').eq('id', userId).single()
  return data?.bisik_custom_name || data?.bisik_anonymous_name || data?.full_name || 'Anon'
}

export async function getBotProfile(botId: string): Promise<BotProfile> {
  const supabase = await createClient()
  const { data } = await supabase.from('tebak_bot_profiles')
    .select('*').eq('id', botId).single()
  if (!data) return DEFAULT_PROFILE

  const profile = data as BotProfile

  // Override guess accuracy with bot_win_rate from users table
  const { data: user } = await supabase.from('users')
    .select('bot_win_rate').eq('id', botId).single()
  if (user?.bot_win_rate) {
    profile.guess_accuracy_pct = user.bot_win_rate
  }

  return profile
}

export async function calculateBotAnswer(
  questionOptions: string[],
  optionDisc: string[] | null,
  correctAnswer: string | null,
  botProfile: BotProfile,
  roundType: 'disc' | 'tebak',
  isSubject: boolean,
  userAnswer?: string | null,
): Promise<{ answer: string; delayMs: number }> {
  const delayMs = botProfile.answer_delay_min_ms +
    Math.floor(Math.random() * (botProfile.answer_delay_max_ms - botProfile.answer_delay_min_ms))

  let answer: string

  if (roundType === 'disc' && optionDisc) {
    // R1-R2: DISC self-assessment — 80% consistent with disc_type
    const roll = Math.random() * 100
    if (roll < botProfile.consistency_pct) {
      // Pick option where option_disc matches bot's disc_type
      const idx = optionDisc.findIndex(d => d === botProfile.disc_type)
      answer = idx >= 0 ? questionOptions[idx] : questionOptions[Math.floor(Math.random() * questionOptions.length)]
    } else {
      // Random from other options
      const otherIdx = optionDisc.map((d, i) => i).filter(i => optionDisc[i] !== botProfile.disc_type)
      answer = questionOptions[otherIdx[Math.floor(Math.random() * otherIdx.length)]]
    }
  } else if (isSubject) {
    // R3-R4: Bot answers about itself — same 80% logic but no option_disc
    answer = questionOptions[Math.floor(Math.random() * questionOptions.length)]
  } else {
    // R3-R4: Bot is guesser — 40% guess accuracy
    const roll = Math.random() * 100
    if (roll < botProfile.guess_accuracy_pct && correctAnswer) {
      answer = correctAnswer
    } else {
      const wrongOptions = questionOptions.filter(o => o !== correctAnswer)
      answer = wrongOptions[Math.floor(Math.random() * wrongOptions.length)] || questionOptions[0]
    }
  }

  return { answer, delayMs }
}
