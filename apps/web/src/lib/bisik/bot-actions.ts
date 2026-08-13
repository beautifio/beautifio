'use server'

import { createClient } from "@/lib/supabase/server"
import { generateSystemPrompt, generateCardContent, DISC_STYLES, SHARED_GUARDRAILS } from "./bot-personas"
import { getMondayThisWeek } from "@/lib/date-utils"

// ── Anti-AI Text Stripper ──
function stripAIArtifacts(text: string): string {
  let result = text

  // Remove markdown
  result = result.replace(/\*\*([^*]+)\*\*/g, '$1')
  result = result.replace(/\*([^*]+)\*/g, '$1')
  result = result.replace(/`([^`]+)`/g, '$1')
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove bullet/list artifacts
  result = result.replace(/^[\s]*[-*+]\s+/gm, '')
  result = result.replace(/^\d+[.)]\s+/gm, '')

  // Remove em-dash
  result = result.replace(/—/g, ', ')

  // Remove fancy quotes
  result = result.replace(/[""]/g, '"')
  result = result.replace(/['']/g, "'")

  // Remove excessive punctuation
  result = result.replace(/!{2,}/g, '!')
  result = result.replace(/\?{2,}/g, '?')
  result = result.replace(/\.{3,}/g, '...')

  // Remove AI greetings
  result = result.replace(/^(Halo[!]*|Hai[!]*|Hi[!]*)\s*/gi, '')

  // Clean leading/trailing whitespace
  result = result.trim()

  // Remove empty lines
  result = result.replace(/\n{3,}/g, '\n\n')

  return result
}

// ── Check if a user is a bisik bot ──
export async function isBisikBot(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase.from('tebak_bot_profiles')
    .select('id')
    .eq('id', userId)
    .eq('is_active', true)
    .single()
  return !!data
}

// ── Check weekly limit: can user invite a bot this week? ──
export async function canUserInviteBotThisWeek(): Promise<{
  allowed: boolean
  reason?: string
  existingBotChatId?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, reason: 'Login dulu' }

  const weekStart = getMondayThisWeek()
  const { data: existing } = await supabase.from('bisik_bot_chats')
    .select('chat_id, status')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (existing) {
    return {
      allowed: false,
      reason: 'Kamu udah ngobrol sama 1 bot minggu ini. Yuk lanjut minggu depan!',
      existingBotChatId: existing.chat_id,
    }
  }

  return { allowed: true }
}

// ── Get available bots for discover (active, not full) ──
export async function getAvailableBots(): Promise<Array<{
  id: string
  displayName: string
  age: number
  bio: string
  discType: string
  openingLine: string
  full: boolean
}>> {
  const supabase = await createClient()

  const { data: profiles } = await supabase.from('tebak_bot_profiles')
    .select('*')
    .eq('is_active', true)
    .limit(10)

  if (!profiles) return []

  return profiles.map(p => ({
    id: p.id,
    displayName: p.display_name || 'Teman',
    age: 0,
    bio: p.bio || '',
    discType: p.disc_type || 'I',
    openingLine: '',
    full: (p.active_chat_count || 0) >= 3,
  }))
}

// ── Auto-accept bot invite + create chat ──
export async function inviteBotToChat(botId: string): Promise<{
  success: boolean
  chatId?: string
  chatSlug?: string
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Login dulu' }

  // 1. Check weekly limit
  const weekStart = getMondayThisWeek()
  const { data: existingWeek } = await supabase.from('bisik_bot_chats')
    .select('id')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (existingWeek) {
    return { success: false, error: 'Kamu udah ngobrol sama bot minggu ini' }
  }

  // 2. Check bot user limit (max 3 per week)
  const { data: botWeekly } = await supabase.from('bisik_bot_weekly')
    .select('user_count')
    .eq('bot_id', botId)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (botWeekly && botWeekly.user_count >= 3) {
    return { success: false, error: 'Bot ini lagi penuh minggu ini. Coba bot lain yuk!' }
  }

  // 3. Get bot profile from DB
  const { data: botProfile } = await supabase.from('tebak_bot_profiles')
    .select('*').eq('id', botId).single()
  if (!botProfile) return { success: false, error: 'Bot tidak ditemukan' }

  // 4. Create bisik_chats for bot-user
  const { data: chat, error: chatError } = await supabase.from('bisik_chats')
    .insert({
      initiator_id: user.id,
      receiver_id: botId,
      status: 'active',
      expires_at: null,
    })
    .select('id')
    .single()

  if (chatError || !chat) return { success: false, error: 'Gagal buat chat' }

  // 5. Create bisik_bot_chats record
  const { error: botChatError } = await supabase.from('bisik_bot_chats')
    .insert({
      user_id: user.id,
      bot_id: botId,
      chat_id: chat.id,
      week_start: weekStart,
      status: 'active',
    })

  if (botChatError) return { success: false, error: 'Gagal simpan bot chat' }

  // 6. Update bisik_bot_weekly counter
  await supabase.from('bisik_bot_weekly')
    .upsert({
      bot_id: botId,
      week_start: weekStart,
      user_count: (botWeekly?.user_count || 0) + 1,
    }, { onConflict: 'bot_id, week_start' })

  // 7. Update active_chat_count
  await supabase.from('tebak_bot_profiles')
    .update({ active_chat_count: (botWeekly?.user_count || 0) + 1 })
    .eq('id', botId)

  // 8. Bot sends opening message
  const systemPrompt = generateSystemPrompt(
    botProfile.display_name,
    botProfile.disc_type,
    botProfile.bio || '',
    botProfile.interests || [],
    botProfile.typing_style || 'medium',
    botProfile.emoji_style || 'sedikit',
    0,
  )
  const openerPrompt = `Ini pesan PERTAMA kamu ke teman baru. Sapa dengan gaya natural — sesuai kepribadian DISC ${botProfile.disc_type}. JANGAN panjang — 1 kalimat aja. Obrolan ringan. Balas HANYA teks pesannya.`

  let openingMessage = 'hai, lagi ngapain?'
  try {
    const reply = await callAI(systemPrompt, openerPrompt)
    if (reply) openingMessage = stripAIArtifacts(reply)
  } catch { /* default */ }

  await supabase.from('bisik_messages').insert({
    chat_id: chat.id,
    sender_id: botId,
    content: openingMessage,
    is_read: false,
  })

  return { success: true, chatId: chat.id }
}

// ── Generate & send bot reply ──
export async function botReplyToMessage(chatId: string, userMessage: string): Promise<{
  success: boolean
  content?: string
  frozen?: boolean
  error?: string
}> {
  const supabase = await createClient()

  // 1. Get bot chat record
  const { data: botChat } = await supabase.from('bisik_bot_chats')
    .select('*, chat:chat_id(receiver_id)')
    .eq('chat_id', chatId)
    .single()

  if (!botChat) return { success: false, error: 'Bukan chat bot' }
  if (botChat.status === 'frozen') return { success: false, error: 'Chat sudah selesai', frozen: true }

  // 2. Check reply limit
  if (botChat.reply_count >= 50) {
    // Shouldn't get here — frontend should block. But freeze just in case.
    await supabase.from('bisik_bot_chats')
      .update({ status: 'frozen', ended_at: new Date().toISOString() })
      .eq('id', botChat.id)
    return { success: false, error: 'Chat sudah selesai', frozen: true }
  }

  const newReplyCount = botChat.reply_count + 1

  // 3. Get bot profile from DB
  const { data: botProfile } = await supabase.from('tebak_bot_profiles')
    .select('*').eq('id', botChat.bot_id).single()
  if (!botProfile) return { success: false, error: 'Bot tidak ditemukan' }

  // 4. Fetch last 5 messages for context
  const { data: recentMessages } = await supabase.from('bisik_messages')
    .select('sender_id, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(10)

  const contextMessages = (recentMessages || []).reverse()
  const contextText = contextMessages.map(m => {
    const label = m.sender_id === botChat.bot_id ? botProfile.display_name : 'User'
    return `${label}: ${m.content}`
  }).join('\n')

  // 6. Build system prompt
  const systemPrompt = generateSystemPrompt(
    botProfile.display_name,
    botProfile.disc_type,
    botProfile.bio || '',
    botProfile.interests || [],
    botProfile.typing_style || 'medium',
    botProfile.emoji_style || 'sedikit',
    newReplyCount,
  )

  // 7. Build user prompt with context
  let userPrompt = `## RIWAYAT CHAT:\n${contextText}\n\n`

  if (newReplyCount >= 50) {
    userPrompt += `## PESAN PAMITAN (reply ke-${newReplyCount})!
Kamu harus PAMIT. Tutup hangat, 2-3 kalimat. Ninggalin kesan baik.
Langsung balas pesannya aja.`
  } else if (newReplyCount >= 48) {
    userPrompt += `## OBROLAN SUDAH PANJANG. Mulai arahkan ke penutupan natural.`
  } else if (!userMessage) {
    // No user message yet — opening greeting
    userPrompt += `## PESAN PERTAMA\nIni pesan pembuka kalian. Sapa dengan gaya natural sesuai kepribadian DISC ${botProfile.disc_type}. Obrolan ringan, 1-2 kalimat aja. Jangan formal.`
  } else {
    userPrompt += `## PESAN BARU:\nUser: ${userMessage}\n\nBalas natural sebagai ${botProfile.display_name}. 1-4 kalimat. Chat biasa.`
  }

  // 8. Call AI
  let replyText = ''
  try {
    const aiReply = await callAI(systemPrompt, userPrompt)
    replyText = stripAIArtifacts(aiReply)
  } catch (e) {
    return { success: false, error: 'AI gagal merespon' }
  }

  if (!replyText) return { success: false, error: 'AI tidak menghasilkan respon' }

  // 9. Calculate typing duration based on reply length (simulates human typing)
  const charCount = replyText.length
  let typingMs: number
  if (charCount < 60) typingMs = (4 + Math.floor(Math.random() * 3)) * 1000       // 4-7s
  else if (charCount < 150) typingMs = (8 + Math.floor(Math.random() * 6)) * 1000  // 8-14s
  else typingMs = (15 + Math.floor(Math.random() * 10)) * 1000                     // 15-25s

  await new Promise(r => setTimeout(r, typingMs))

  // 10. Insert reply
  const { error: insertError } = await supabase.from('bisik_messages').insert({
    chat_id: chatId,
    sender_id: botChat.bot_id,
    content: replyText,
    is_read: false,
  })

  if (insertError) return { success: false, error: 'Gagal kirim pesan' }

  // 10. Update reply count
  const isFrozen = newReplyCount >= 50
  await supabase.from('bisik_bot_chats')
    .update({
      reply_count: newReplyCount,
      ...(isFrozen ? { status: 'frozen', ended_at: new Date().toISOString() } : {}),
    })
    .eq('id', botChat.id)

  return { success: true, content: replyText, frozen: isFrozen }
}

// ── Generate fresh bot cards via AI ──
export async function refreshBotCards(): Promise<{ success: boolean; generated: number }> {
  const supabase = await createClient()

  const { data: profiles } = await supabase.from('tebak_bot_profiles')
    .select('*')
    .eq('is_active', true)

  if (!profiles || profiles.length === 0) {
    return { success: false, generated: 0 }
  }

  // Get topic (default first active topic)
  const { data: topic } = await supabase.from('bisik_topics')
    .select('id')
    .eq('is_active', true)
    .order('display_order')
    .limit(1)
    .single()
  const topicId = topic?.id

  let generated = 0

  for (const bot of profiles) {
    const discType = bot.disc_type || 'I'
    try {
      const styleBlock = DISC_STYLES[discType] || DISC_STYLES['I']
      const interestStr = bot.interests?.length ? bot.interests.join(', ') : 'daily life'

      const systemPrompt = `Kamu ${bot.display_name}, ${bot.bio || 'manusia biasa'}. DISC type: ${discType}. ${styleBlock}. Minat: ${interestStr}. Kamu pengguna Beautifio biasa — bukan AI, bukan asisten. Kamu cuma temen yang lagi pengen ngobrol.

${SHARED_GUARDRAILS}`

      const userPrompt = `Buat SATU kartu curhat pendek — 2 sampai 3 kalimat aja. Gaya natural, kayak kamu lagi curhat ke temen. Tema bebas, sesuai kepribadianmu. JANGAN pakai markdown. JANGAN halo/hai. JANGAN tanya "ada yang sama?". JANGAN minta temen ngobrol. Cukup kamu curhat aja. Mulai langsung.`

      const content = await callAI(systemPrompt, userPrompt)
      const cleaned = stripAIArtifacts(content).slice(0, 200)

      if (cleaned.length >= 20) {
        await supabase.from('bisik_cards').insert({
          user_id: bot.id,
          topic_id: topicId,
          content: cleaned,
          is_active: true,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        generated++
      }
    } catch {
      // Fallback: use template card
      const fallback = generateCardContent(discType)
      await supabase.from('bisik_cards').insert({
        user_id: bot.id,
        topic_id: topicId,
        content: fallback,
        is_active: true,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      generated++
    }
  }

  return { success: true, generated }
}

// ── Weekly reset cron ──
export async function weeklyBotReset(): Promise<{ success: boolean; reset: number }> {
  const supabase = await createClient()

  // Freeze all active bot chats
  const { data: activeChats } = await supabase.from('bisik_bot_chats')
    .select('id, bot_id')
    .eq('status', 'active')

  if (activeChats && activeChats.length > 0) {
    await supabase.from('bisik_bot_chats')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('status', 'active')
  }

  // Reset active_chat_count on all bot profiles
  await supabase.from('tebak_bot_profiles')
    .update({ active_chat_count: 0 })
    .not('id', 'is', null)

  // Reset bisik_bot_weekly for new week
  await supabase.from('bisik_bot_weekly')
    .delete()
    .lt('week_start', getMondayThisWeek())

  // Delete old bot cards + generate fresh ones
  const { data: botIds } = await supabase.from('tebak_bot_profiles')
    .select('id')
    .eq('is_active', true)
  if (botIds && botIds.length > 0) {
    await supabase.from('bisik_cards')
      .delete()
      .in('user_id', botIds.map(b => b.id))
  }
  await refreshBotCards()

  return { success: true, reset: activeChats?.length || 0 }
}

// ── AI Call (respects admin settings) ──
async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const supabase = await createClient()

  // Get AI settings
  let provider = 'openai'
  let model = 'gpt-4o'
  try {
    const { data: settings } = await supabase.from('app_settings')
      .select('key, value')
      .in('key', ['ai_provider', 'ai_model'])

    if (settings) {
      const prov = settings.find(s => s.key === 'ai_provider')
      const mod = settings.find(s => s.key === 'ai_model')
      if (prov) provider = prov.value
      if (mod) model = mod.value
    }
  } catch { /* defaults */ }

  // Try primary provider
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    try {
      return await callGemini(systemPrompt, userPrompt, model)
    } catch { /* fallback */ }
  }

  if (process.env.OPENAI_API_KEY) {
    return await callOpenAI(systemPrompt, userPrompt, model === 'gemini-2.5-pro' ? 'gpt-4o' : model)
  }

  throw new Error('No AI provider available')
}

async function callGemini(systemPrompt: string, userPrompt: string, model: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY!
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: 200, temperature: 0.9 },
    }),
  })

  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  if (!text) throw new Error(json?.error?.message || 'Gemini error')
  return text
}

async function callOpenAI(systemPrompt: string, userPrompt: string, model: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY!

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 200,
      temperature: 0.9,
    }),
  })

  const json = await res.json()
  const text = json?.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('OpenAI error')
  return text
}
