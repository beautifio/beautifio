'use server'

import { createClient } from "@/lib/supabase/server"
import {
  getVolunteerPersona,
  getVolunteerForCategory,
  generateVolunteerPrompt,
  generateFirstMessage,
} from "./ai-volunteers"
import { detectUrgency } from "./ai-urgency"
import { getServerUser } from "@/lib/auth/server-auth"

// ── Check if human officers are online ──
export async function isHumanOfficerOnline(category: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase.from('care_officer_schedule')
    .select('is_online')
    .eq('category', category)
    .maybeSingle()
  return !!data?.is_online
}

// ── Get any available human officer ──
export async function getAvailableHumanOfficer(category: string): Promise<string | null> {
  const supabase = await createClient()
  const { data: schedule } = await supabase.from('care_officer_schedule')
    .select('is_online')
    .eq('category', category)
    .maybeSingle()

  if (!schedule?.is_online) return null

  // Find online officers with least sessions
  const { data: officers } = await supabase.from('care_officers')
    .select('id, user_id')
    .eq('is_online', true)

  if (!officers?.length) return null

  // Count active sessions per officer, pick least busy
  let bestId = officers[0].user_id
  let minSessions = Infinity

  for (const o of officers) {
    const { count } = await supabase.from('care_chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('officer_id', o.user_id)
      .eq('status', 'active')
    const n = count || 0
    if (n < minSessions) { minSessions = n; bestId = o.user_id }
  }

  return bestId
}

// ── Create session + auto-assign AI in one server call ──
export async function createCareSession(
  category: string,
  userName: string,
  userPhone: string | null,
  userAddress: string | null,
): Promise<{ sessionId: string; success: boolean; aiAssigned: boolean; aiName?: string }> {
  const supabase = await createClient()
  const user = await getServerUser()
  if (!user) throw new Error('Unauthorized')

  const { data: session } = await supabase.from('care_chat_sessions')
    .insert({
      user_id: user.id,
      category,
      user_name: userName,
      user_phone: userPhone,
      user_address: userAddress,
      status: 'waiting',
    }).select().single()

  if (!session) throw new Error('Failed to create session')

  await supabase.from('care_chat_messages').insert({
    session_id: session.id,
    sender_id: user.id,
    sender_role: 'system',
    content: `Halo ${userName}! Kamu terhubung dengan layanan ${category} Beautifio Care. Ceritakan apa yang ingin kamu konsultasikan.`,
  })

  const result = await assignAIVolunteer(session.id, category)
  return { sessionId: session.id, success: true, aiAssigned: result.success, aiName: result.aiName }
}

// ── Send message + AI reply in one server call ──
export async function careSendMessage(
  sessionId: string,
  content: string,
): Promise<{ success: boolean; ended?: boolean }> {
  const supabase = await createClient()
  const user = await getServerUser()
  if (!user) throw new Error('Unauthorized')

  const { data: session } = await supabase.from('care_chat_sessions')
    .select('*').eq('id', sessionId).single()
  if (!session) throw new Error('Session not found')

  // Insert user message
  await supabase.from('care_chat_messages').insert({
    session_id: sessionId,
    sender_id: user.id,
    sender_role: 'user',
    content,
  })

  // AI reply
  if (session.is_ai_officer && session.status === 'active') {
    const result = await aiCareReply(sessionId, content)
    return { success: true, ended: result?.ended }
  }

  // Fallback: try assign AI if still waiting
  if (!session.is_ai_officer && session.status === 'waiting') {
    const r = await assignAIVolunteer(sessionId, session.category)
    if (r.success) {
      const result = await aiCareReply(sessionId, content)
      return { success: true, ended: result?.ended }
    }
  }

  return { success: true }
}

// ── Auto-assign AI volunteer to session ──
export async function assignAIVolunteer(
  sessionId: string,
  category: string,
): Promise<{ success: boolean; error?: string; aiName?: string }> {
  const supabase = await createClient()

  // Check session exists and is waiting
  const { data: session } = await supabase.from('care_chat_sessions')
    .select('*').eq('id', sessionId).single()
  if (!session) return { success: false, error: 'Session not found' }
  if (session.status !== 'waiting') return { success: false, error: 'Session already assigned' }
  if (session.is_ai_officer) return { success: false, error: 'Already AI' }

  // Check human availability
  const humanOnline = await isHumanOfficerOnline(category)
  if (humanOnline) return { success: false, error: 'Human officer available, no AI needed' }

  // Pick AI volunteer
  const persona = getVolunteerForCategory(category)
  if (!persona) return { success: false, error: 'No AI volunteer for this category' }

  // Check daily limit
  const { data: vol } = await supabase.from('care_ai_volunteers')
    .select('id').eq('user_id', persona.userId).single()
  const volunteerId = vol?.id
  if (!volunteerId) return { success: false, error: 'Volunteer not found' }

  const { data: dailyCounter } = await supabase.from('care_ai_daily_counter')
    .select('session_count')
    .eq('volunteer_id', volunteerId)
    .eq('date', new Date().toISOString().split('T')[0])
    .maybeSingle()

  if ((dailyCounter?.session_count || 0) >= 10) {
    return { success: false, error: 'AI volunteer at daily limit' }
  }

  // Assign via RPC (SECURITY DEFINER — bypasses RLS)
  const introMsg = generateFirstMessage(persona)
  const { data: assigned, error: rpcError } = await supabase.rpc('care_assign_ai', {
    p_session_id: sessionId,
    p_officer_id: persona.userId,
    p_category: category,
    p_intro_message: introMsg,
  })

  if (rpcError || !assigned) return { success: false, error: 'Failed to assign AI volunteer' }

  // Increment daily counter
  await supabase.from('care_ai_daily_counter')
    .upsert({
      volunteer_id: volunteerId,
      date: new Date().toISOString().split('T')[0],
      session_count: (dailyCounter?.session_count || 0) + 1,
    }, { onConflict: 'volunteer_id, date' })

  return { success: true, aiName: persona.displayName }
}

// ── AI reply to user message ──
export async function aiCareReply(
  sessionId: string,
  userMessage: string,
): Promise<{ success: boolean; content?: string; ended?: boolean; error?: string }> {
  const supabase = await createClient()

  // 1. Get session
  const { data: session } = await supabase.from('care_chat_sessions')
    .select('*').eq('id', sessionId).single()
  if (!session || !session.is_ai_officer) return { success: false, error: 'Not an AI session' }
  if (session.status === 'closed') return { success: false, error: 'Session closed' }

  // 2. Get persona
  const persona = getVolunteerPersona(session.officer_id)
  if (!persona) return { success: false, error: 'AI volunteer not found' }

  // 3. Urgency check
  const urgency = detectUrgency(userMessage)
  if (urgency.shouldEndChat) {
    await supabase.rpc('care_insert_ai_message', {
      p_session_id: sessionId, p_sender_id: persona.userId, p_content: urgency.message,
    })
    await supabase.rpc('care_close_session', { p_session_id: sessionId })
    return { success: true, content: urgency.message, ended: true }
  }

  // 4. Count existing AI replies in this session
  const { count: replyCount } = await supabase.from('care_chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('sender_id', persona.userId)

  const currentCount = (replyCount || 0) + 1
  const isFirst = currentCount === 1

  // 5. Check reply limit
  if (currentCount >= 60) {
    const personaName = persona.displayName
    const pamitMsg = `Kita sudahi dulu ya kak sesi ini. Terima kasih udah sharing sama aku. Kalau masih butuh, Care selalu buka ya kak. Dan kalau volunteer kami udah tersedia, aku kabarin. Kamu gak sendirian kak ${personaName === 'Dinda' ? '🌱' : personaName === 'Raka' ? '💪' : personaName === 'Mila' ? '🌸' : personaName === 'Tara' ? '🚀' : '✨'}`
    await supabase.rpc('care_insert_ai_message', {
      p_session_id: sessionId, p_sender_id: persona.userId, p_content: pamitMsg,
    })
    await supabase.rpc('care_close_session', { p_session_id: sessionId })
    return { success: true, content: pamitMsg, ended: true }
  }

  // 6. Fetch last 5 messages for context
  const { data: recentMessages } = await supabase.from('care_chat_messages')
    .select('sender_role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(10)

  const contextMessages = (recentMessages || []).reverse()
  const contextText = contextMessages.map(m => {
    const label = m.sender_role === 'officer' ? 'Officer' : 'User'
    return `${label}: ${m.content}`
  }).join('\n')

  // 7. Build prompt
  const systemPrompt = generateVolunteerPrompt(persona, currentCount, isFirst)

  let userPrompt = `## RIWAYAT CHAT:\n${contextText}\n\n`

  if (currentCount >= 60) {
    userPrompt += `## PESAN PAMITAN (reply ke-${currentCount}/60)\nKamu harus PAMIT. Tutup dengan hangat, rangkum 2-3 poin utama, dan undang balik.\nBalas pesannya langsung, 2-4 kalimat.`
  } else if (currentCount >= 55) {
    userPrompt += `## SESI SUDAH PANJANG\nMulai arahkan ke penutupan secara natural. Jangan tiba2 pamit.\nBalas chat normal seperti sebelumnya.`
  } else {
    userPrompt += `## PESAN BARU:\nUser: ${userMessage}\n\nBalas sebagai Kak ${persona.displayName}. Sesuai gaya kamu. ${urgency.level === 'yellow' ? '\nLEVEL KUNING — user menunjukkan tanda2 kelelahan mental. Validasi dengan hati2. Jangan panik. Jangan abaikan.' : ''}`
  }

  // 8. Call AI with timeout
  let replyText = ''
  try {
    const aiPromise = callAI(systemPrompt, userPrompt)
    const timeoutPromise = new Promise<string>((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 20000))
    replyText = await Promise.race([aiPromise, timeoutPromise])
    replyText = stripAIArtifacts(replyText)
  } catch (e) {
    console.error('[CARE-AI] AI call failed:', e)
    replyText = `Hai kak, maaf ya aku lagi ada kendala teknis nih. Coba cerita lagi ya, aku dengerin kok.`
  }

  if (!replyText) return { success: false, error: 'AI failed to respond' }

  // Natural typing delay — simulate reading + composing
  const readDelay = 1000
  const typingDelay = Math.min(12000, replyText.length * 80)
  await new Promise(resolve => setTimeout(resolve, readDelay + typingDelay))

  // 9. Insert reply via RPC (SECURITY DEFINER — bypasses RLS)
  await supabase.rpc('care_insert_ai_message', {
    p_session_id: sessionId, p_sender_id: persona.userId, p_content: replyText,
  })

  // 10. If approaching limit (60), close
  if (currentCount >= 60) {
    await supabase.rpc('care_close_session', { p_session_id: sessionId })
  }

  return { success: true, content: replyText, ended: currentCount >= 60 }
}

// ── Human takeover: switch from AI to human volunteer ──
export async function humanTakeoverCheck(sessionId: string): Promise<void> {
  const supabase = await createClient()
  const { data: session } = await supabase.from('care_chat_sessions')
    .select('*, ai_category_override').eq('id', sessionId).single()
  if (!session?.is_ai_officer || session.status === 'closed') return

  const category = session.ai_category_override || session.category
  const humanOnline = await isHumanOfficerOnline(category)
  if (!humanOnline) return

  const humanId = await getAvailableHumanOfficer(category)
  if (!humanId) return

  const persona = getVolunteerPersona(session.officer_id)

  // AI announces handover
  const { data: human } = await supabase.from('users')
    .select('full_name').eq('id', humanId).single()
  const humanName = human?.full_name || 'Volunteer'

  await supabase.from('care_chat_messages').insert({
    session_id: sessionId,
    sender_id: persona?.userId || session.officer_id,
    sender_role: 'officer',
    content: `Hii Kak, selanjutnya akan di bantu oleh ${humanName}.`,
    is_read: false,
  })

  // Switch to human
  await supabase.from('care_chat_sessions').update({
    officer_id: humanId,
    is_ai_officer: false,
  }).eq('id', sessionId)
}

// ── AI call ──
async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const supabase = await createClient()

  let provider = 'openai'
  let model = 'gpt-4o'
  try {
    const { data: settings } = await supabase.from('app_settings')
      .select('key, value').in('key', ['ai_provider', 'ai_model'])
    if (settings) {
      const prov = settings.find(s => s.key === 'ai_provider')
      const mod = settings.find(s => s.key === 'ai_model')
      if (prov) provider = prov.value
      if (mod) model = mod.value
    }
  } catch { /* defaults */ }

  if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    try { return await callGemini(systemPrompt, userPrompt, model) } catch { /* fallback */ }
  }

  if (process.env.OPENAI_API_KEY) {
    return await callOpenAI(systemPrompt, userPrompt, model === 'gemini-2.5-pro' ? 'gpt-4o' : model)
  }

  throw new Error('No AI provider')
}

async function callGemini(systemPrompt: string, userPrompt: string, model: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.8 },
      }),
      signal: ctrl.signal,
    })
    const json = await res.json()
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } finally {
    clearTimeout(timer)
  }
}

async function callOpenAI(systemPrompt: string, userPrompt: string, model: string): Promise<string> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 300, temperature: 0.8 }),
      signal: ctrl.signal,
    })
    const json = await res.json()
    return json?.choices?.[0]?.message?.content || ''
  } finally {
    clearTimeout(timer)
  }
}

function stripAIArtifacts(text: string): string {
  let result = text
  result = result.replace(/\*\*([^*]+)\*\*/g, '$1')
  result = result.replace(/\*([^*]+)\*/g, '$1')
  result = result.replace(/`([^`]+)`/g, '$1')
  result = result.replace(/—/g, ', ')
  result = result.replace(/[""]/g, '"')
  result = result.replace(/!{2,}/g, '!')
  result = result.replace(/\?{2,}/g, '?')
  result = result.replace(/^(Halo[!]*|Hai[!]*|Hi[!]*)\s*/gi, '')
  result = result.trim()
  return result
}
