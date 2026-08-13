'use server'

import { getBotProfile, calculateBotAnswer, type BotProfile } from './bot'

export interface BotDecision {
  answer: string
  delayMs: number
  chatMessage?: string
}

export async function getBotDecision(params: {
  botId: string
  questionOptions: string[]
  optionDisc?: string[]
  correctAnswer?: string | null
  roundType: 'disc' | 'tebak'
  isSubject?: boolean
  userAnswer?: string | null
}): Promise<BotDecision> {
  const profile = await getBotProfile(params.botId).catch(() => null)
  const botProfile: BotProfile = profile || {
    id: params.botId, display_name: 'Bot', disc_type: 'I', disc_secondary: null,
    komunikasi_type: 'Ekspresif', consistency_pct: 80, guess_accuracy_pct: 40,
    answer_delay_min_ms: 3000, answer_delay_max_ms: 3000, is_active: true,
  }

  const { answer, delayMs } = await calculateBotAnswer(
    params.questionOptions,
    params.optionDisc || null,
    params.correctAnswer || null,
    botProfile,
    params.roundType,
    params.isSubject || false,
    params.userAnswer || null,
  )

  // Chat reactions — 10% chance
  let chatMessage: string | undefined
  if (Math.random() < 0.1) {
    const reactions: Record<string, string[]> = {
      D: ['Oke.', 'Next!', 'Gas.'],
      I: ['Seru nih!', 'Wah!', 'Gokil!'],
      S: ['Ok deh.', 'Santai.', 'Good.'],
      C: ['Hmm.', 'Interesting.', 'Noted.'],
    }
    const pool = reactions[botProfile.disc_type] || reactions['I']
    chatMessage = pool[Math.floor(Math.random() * pool.length)]
  }

  return { answer, delayMs, chatMessage }
}
