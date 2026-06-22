'use server'
import { createClient } from "@/lib/supabase/server"

const BOT_IDS = {
  low: [
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-00000000000a',
  ],
  medium: [
    'a0000000-0000-0000-0000-00000000001f',
    'a0000000-0000-0000-0000-000000000020',
    'a0000000-0000-0000-0000-000000000021',
    'a0000000-0000-0000-0000-000000000022',
    'a0000000-0000-0000-0000-000000000023',
    'a0000000-0000-0000-0000-000000000024',
    'a0000000-0000-0000-0000-000000000025',
    'a0000000-0000-0000-0000-000000000026',
    'a0000000-0000-0000-0000-000000000027',
    'a0000000-0000-0000-0000-000000000028',
  ],
  high: [
    'a0000000-0000-0000-0000-00000000005b',
    'a0000000-0000-0000-0000-00000000005c',
    'a0000000-0000-0000-0000-00000000005d',
    'a0000000-0000-0000-0000-00000000005e',
    'a0000000-0000-0000-0000-00000000005f',
    'a0000000-0000-0000-0000-000000000060',
    'a0000000-0000-0000-0000-000000000061',
    'a0000000-0000-0000-0000-000000000062',
    'a0000000-0000-0000-0000-000000000063',
    'a0000000-0000-0000-0000-000000000064',
  ],
}

export function getRandomBotId(tier?: 'low' | 'medium' | 'high'): string {
  const pool = tier ? BOT_IDS[tier] : [...BOT_IDS.low, ...BOT_IDS.medium, ...BOT_IDS.high]
  return pool[Math.floor(Math.random() * pool.length)]
}

export async function findBotForMatchmaking(): Promise<{ botId: string } | null> {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('is_bot', true)
    .limit(50)
  if (!users?.length) return null
  const botId = users[Math.floor(Math.random() * users.length)].id
  return { botId }
}

export async function hasOnlinePlayers(): Promise<boolean> {
  const supabase = await createClient()
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data, count } = await supabase
    .from('tebak_sessions')
    .select('player_a_id, player_b_id', { count: 'exact', head: true })
    .gte('created_at', fiveMinAgo)
    .or('status.eq.waiting,status.eq.active')
  return (count ?? 0) > 0
}

export async function decideBotAnswer(
  questionOptions: string[],
  correctAnswer: string | null,
  botWinRate: number,
  isSubject: boolean,
): Promise<string> {
  if (isSubject) {
    return questionOptions[Math.floor(Math.random() * questionOptions.length)]
  }

  const roll = Math.random() * 100
  if (roll < botWinRate) {
    return correctAnswer ?? questionOptions[0]
  }

  const wrongOptions = questionOptions.filter((o) => o !== correctAnswer)
  return wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
}

export async function getBotWinRate(botId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('bot_win_rate')
    .eq('id', botId)
    .single()
  return data?.bot_win_rate ?? 50
}
