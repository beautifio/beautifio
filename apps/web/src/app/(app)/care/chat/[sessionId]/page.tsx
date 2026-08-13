"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { SurveyPopup } from '@/components/care/SurveyPopup';
import { Check, CheckCheck } from 'lucide-react';

interface CareMessage {
  id: string; session_id: string; sender_id: string | null;
  sender_role: 'user' | 'officer' | 'system';
  content: string; created_at: string;
  is_read?: boolean;
}

interface CareSession {
  id: string; category: string; status: string;
  user_name: string;
  is_ai_officer?: boolean;
  officer_id?: string | null;
}

interface CareSchedule {
  id: string; category: string; is_online: boolean;
  next_available: string | null; message: string | null;
}

export default function CareChatRoom() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { user, isLoading: authLoading } = useAuth();
  const [session, setSession] = useState<CareSession | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [user, authLoading, router]);
  const [schedule, setSchedule] = useState<CareSchedule | null>(null);
  const [messages, setMessages] = useState<CareMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.from('care_chat_sessions')
      .select('*').eq('id', sessionId).single()
      .then(({ data }) => {
        setSession(data);
        if (data?.status === 'closed') setSessionClosed(true);
        if (data?.category) {
          supabase.from('care_officer_schedule')
            .select('*').eq('category', data.category).single()
            .then(({ data: s }) => setSchedule(s));
        }
      });

    supabase.from('care_chat_messages')
      .select('*').eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []));

    const channel = supabase
      .channel(`care-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'care_chat_messages',
        filter: `session_id=eq.${sessionId}`,
      }, p => setMessages(prev => {
        const exists = prev.some(m => m.id === (p.new as CareMessage).id)
        if (exists) return prev
        // Remove temp optimistic message
        const cleaned = prev.filter(m => !m.id.startsWith('temp-'))
        return [...cleaned, p.new as CareMessage]
      }))
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public',
        table: 'care_chat_sessions',
        filter: `id=eq.${sessionId}`,
      }, p => {
        const updated = p.new as CareSession
        setSession(updated)
        if (updated?.status === 'closed') setSessionClosed(true)
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || sending || sessionClosed) return;
    setSending(true);
    const supabase = createClient();
    if (!supabase) { setSending(false); return; }
    const userMsg = input.trim();

    // Optimistic: add message immediately
    const tempId = 'temp-' + Date.now();
    setMessages(prev => [...prev, { id: tempId, session_id: sessionId, sender_id: null, sender_role: 'user', content: userMsg, created_at: new Date().toISOString() }]);
    setInput('');

    try {
      const { careSendMessage } = await import('@/lib/care/ai-actions');
      await careSendMessage(sessionId, userMsg);
    } catch (e) { console.error('[CARE-SEND]', e) }
    setSending(false);
  }

  function formatNext(dt: string | null) {
    if (!dt) return null;
    const diff = new Date(dt).getTime() - Date.now();
    if (diff <= 0) return null;
    const d = new Date(dt).toLocaleDateString('id-ID',
      { weekday:'long', day:'numeric', month:'short' });
    const t = new Date(dt).toLocaleTimeString('id-ID',
      { hour:'2-digit', minute:'2-digit' });
    return `${d} pukul ${t} WIB`;
  }

  const isOnline = schedule?.is_online ?? false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column',
      height: '100svh', background: '#F8FAFC' }}>
      <div className="max-w-content mx-auto w-full flex flex-col flex-1 overflow-hidden">

      <div style={{ background: '#084463', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0 }}>
        <button onClick={() => router.push('/care/chat')}
          style={{ background: 'none', border: 'none',
            color: '#FFFFFF', cursor: 'pointer',
            fontSize: 20, padding: 0 }}>←</button>
          <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'Poppins', fontSize: 15,
            fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Beautifio Care
          </p>
          <div style={{ display: 'flex',
            alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8,
              borderRadius: '50%',
              background: session?.is_ai_officer ? '#FFC64F' : isOnline ? '#22C55E' : '#9CA3AF' }} />
            <span style={{ fontFamily: 'Inter', fontSize: 11,
              color: 'rgba(255,255,255,0.75)' }}>
              {session?.is_ai_officer ? 'Kakak Pembimbing' : isOnline ? 'Petugas online' : 'Petugas offline'}
              {session?.category && ` · ${session.category}`}
            </span>
          </div>
        </div>
      </div>

      {/* AI / Offline Banner */}
      {session?.is_ai_officer ? (
        <div style={{ background: '#FFF8E7',
          borderBottom: '1px solid #FFC64F',
          padding: '10px 16px', flexShrink: 0 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 12,
            color: '#92400E', margin: 0, lineHeight: 1.5 }}>
             Kakak Pembimbing siap bantu sementara. Kalau petugas asli sudah tersedia nanti, kamu akan otomatis tersambung ya.
          </p>
        </div>
      ) : !session?.is_ai_officer && !isOnline && !sessionClosed ? (
        <div style={{ background: '#FFF8E7',
          borderBottom: '1px solid #FFC64F',
          padding: '12px 16px', flexShrink: 0 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 12,
            color: '#92400E', margin: 0, lineHeight: 1.5 }}>
            ⏰ Tidak ada petugas yang tersedia saat ini.
            {formatNext(schedule?.next_available ?? null) &&
              ` Tim kami akan aktif kembali pada ${formatNext(schedule?.next_available ?? null)}.`}
            {' '}Pesanmu tetap tersimpan dan akan dibalas
            saat petugas online.
          </p>
        </div>
      ) : null}

      <div style={{ flex: 1, overflowY: 'auto',
        padding: '16px', display: 'flex',
        flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => {
          const isUser = msg.sender_role === 'user';
          const isSystem = msg.sender_role === 'system';
          if (isSystem) return (
            <div key={msg.id} style={{ textAlign: 'center',
              padding: '8px 16px' }}>
              <span style={{ background: '#F1F5F9',
                borderRadius: 20, padding: '6px 14px',
                fontFamily: 'Inter', fontSize: 11,
                color: '#647488' }}>{msg.content}</span>
            </div>
          );
          return (
            <div key={msg.id} style={{ display: 'flex',
              justifyContent: isUser
                ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                background: isUser ? '#084463' : '#E8F4F8',
                color: isUser ? '#FFFFFF' : '#1E2938',
                borderRadius: isUser
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                padding: '10px 14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                <p style={{ fontFamily: 'Inter', fontSize: 13,
                  margin: 0, lineHeight: 1.6 }}>{msg.content}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 10,
                  margin: '4px 0 0',
                  color: isUser
                    ? 'rgba(255,255,255,0.6)' : '#9CA3AF',
                  textAlign: isUser ? 'right' : 'left',
                  display: 'flex', alignItems: 'center', gap: 3,
                  justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  {new Date(msg.created_at)
                    .toLocaleTimeString('id-ID',
                      { hour:'2-digit', minute:'2-digit' })}
                  {isUser && !isSystem && (
                    msg.is_read
                      ? <CheckCheck size={12} className="text-blue-400" />
                      : msg.id.startsWith('temp-')
                        ? <Check size={12} className="text-white/40" />
                        : <Check size={12} className="text-white/40" />
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '12px 16px',
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex', gap: 10, alignItems: 'flex-end',
        flexShrink: 0,
        paddingBottom: 'max(80px, calc(4rem + env(safe-area-inset-bottom)))' }}>
        <textarea value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault(); sendMessage();
            }
          }}
          placeholder={sessionClosed ? 'Sesi telah berakhir.' : aiTyping ? 'AI sedang mengetik...' : 'Tulis pesan...'}
          rows={1}
          disabled={sessionClosed || aiTyping}
          style={{ flex: 1, border: '1.5px solid #E2E8F0',
            borderRadius: 20, padding: '10px 16px',
            fontFamily: 'Inter', fontSize: 14,
            resize: 'none', outline: 'none',
            maxHeight: 100, overflow: 'auto',
            opacity: sessionClosed ? 0.5 : 1 }} />
        <button onClick={sendMessage}
          disabled={sending || !input.trim() || sessionClosed || aiTyping}
          style={{ width: 44, height: 44, borderRadius: '50%',
            background: input.trim() && !sessionClosed ? '#084463' : '#E2E8F0',
            border: 'none',
            cursor: input.trim() && !sessionClosed ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
            flexShrink: 0, opacity: sessionClosed ? 0.5 : 1,
            transition: 'background 0.2s ease' }}>➤</button>
      </div>
      </div>
      {sessionClosed && session && (
        <SurveyPopup sessionId={sessionId} officerName={session.is_ai_officer ? undefined : undefined} onClose={() => setSessionClosed(false)} />
      )}
    </div>
  );
}
