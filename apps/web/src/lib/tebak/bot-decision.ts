'use server'

import { createClient } from "@/lib/supabase/server"

export interface BotConfig {
  disc: { primary: string; secondary: string }
  speed: { min: number; max: number }
  reactions: { win: string[]; lose: string[]; draw: string[] }
  rematch_max: number
  rematch_accept_rate: number
}

export interface BotDecision {
  answer: string
  delayMs: number
  chatMessage?: string
}

const DISC_WEIGHTS: Record<string, Record<string, number>> = {
  D: { D: 0.60, I: 0.25, S: 0.10, C: 0.05 },
  I: { D: 0.25, I: 0.60, S: 0.10, C: 0.05 },
  S: { D: 0.05, I: 0.10, S: 0.60, C: 0.25 },
  C: { D: 0.05, I: 0.05, S: 0.30, C: 0.60 },
}

function weightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights)
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let r = Math.random() * total
  for (const [key, weight] of entries) {
    r -= weight
    if (r <= 0) return key
  }
  return entries[entries.length - 1][0]
}

function jitter(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min)
}

export async function getBotDecision(params: {
  botId: string
  questionOptions: string[]
  optionDisc?: string[]
  correctAnswer?: string | null
  roundType: 'disc' | 'tebak'
  isSubject?: boolean
  context?: 'pre_round' | 'post_answer' | 'game_end' | 'game_start'
  gameResult?: 'win' | 'lose' | 'draw'
  rematchCount?: number
}): Promise<BotDecision> {
  const supabase = await createClient()

  // Load bot config
  const { data: bot } = await supabase.from('users')
    .select('bot_config').eq('id', params.botId).eq('is_bot', true).single()

  const config: BotConfig = (bot?.bot_config as BotConfig) || {
    disc: { primary: 'I', secondary: 'D' },
    speed: { min: 2000, max: 4000 },
    reactions: { win: ['GG!'], lose: ['Nice!'], draw: ['Tie!'] },
    rematch_max: 3,
    rematch_accept_rate: 0.5,
  }

  const primary = config.disc.primary

  // ── DISC rounds: weighted by personality ──
  if (params.roundType === 'disc' && params.optionDisc?.length) {
    const weightMap = DISC_WEIGHTS[primary] || DISC_WEIGHTS['I']
    const answer = weightedRandom(weightMap)
    return {
      answer,
      delayMs: jitter(config.speed.min, config.speed.max),
    }
  }

  // ── Tebak rounds ──
  const options = params.questionOptions

  // Subject: bot picks any answer
  // D bots pick the most "extreme" option (first one)
  if (params.isSubject) {
    const answer = primary === 'D' ? options[0] : options[Math.floor(Math.random() * options.length)]
    return {
      answer,
      delayMs: jitter(config.speed.min, config.speed.max),
    }
  }

  // Guesser: roll vs bot_win_rate
  const { data: userData } = await supabase.from('users')
    .select('bot_win_rate').eq('id', params.botId).single()
  const winRate = userData?.bot_win_rate ?? 50

  const isCorrect = Math.random() * 100 < winRate
  const answer = isCorrect && params.correctAnswer
    ? params.correctAnswer
    : options.filter(o => o !== params.correctAnswer)[Math.floor(Math.random() * (options.length - 1))] || options[0]

  // Chat reaction — 20% chance on game events
  let chatMessage: string | undefined
  if (params.context && Math.random() < 0.2) {
    if (params.context === 'game_end' && params.gameResult) {
      const pool = config.reactions[params.gameResult]
      chatMessage = pool?.[Math.floor(Math.random() * pool.length)]
    } else if (params.context === 'post_answer') {
      const phrases = primary === 'D' ? ['Hmm.', 'Ok.', 'Next!']
        : primary === 'I' ? ['Wah!', 'Seru nih!', 'Gokil!']
        : primary === 'S' ? ['Ok deh.', 'Santai.', 'Good.']
        : ['Interesting.', 'Noted.', 'Hmm.']
      chatMessage = phrases[Math.floor(Math.random() * phrases.length)]
    }
  }

  return {
    answer,
    delayMs: jitter(config.speed.min, config.speed.max),
    chatMessage,
  }
}
