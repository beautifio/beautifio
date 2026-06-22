"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface CareMessage {
  id: string; session_id: string; sender_id: string | null;
  sender_role: 'user' | 'officer' | 'system';
  content: string; created_at: string;
}

interface CareSession {
  id: string; category: string; status: string;
  user_name: string; user_phone: string | null;
  user_address: string | null;
}

export default function AdminCareReply() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<CareSession | null>(null);
  const [messages, setMessages] = useState<CareMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasReplied, setHasReplied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.from('care_chat_sessions')
      .select('*').eq('id', sessionId).single()
      .then(({ data }) => setSession(data));

    supabase.from('care_chat_messages')
      .select('*').eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data ?? []);
        const hasOfficerMsg = (data ?? []).some(
          m => m.sender_role === 'officer');
        setHasReplied(hasOfficerMsg);
      });

    const channel = supabase
      .channel(`admin-care-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'care_chat_messages',
        filter: `session_id=eq.${sessionId}`,
      }, p => setMessages(prev => [...prev, p.new as CareMessage]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('care_chat_messages').insert({
      session_id: sessionId,
      sender_id: user?.id,
      sender_role: 'officer',
      content: input.trim(),
    });

    if (!hasReplied) {
      setHasReplied(true);
      await supabase.from('care_chat_sessions')
        .update({
          status: 'active',
          officer_id: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
    }

    setInput('');
    setSending(false);
  }

  const statusLabel: Record<string, string> = {
    waiting: 'Menunggu', active: 'Aktif', closed: 'Selesai',
  };
  const statusColor: Record<string, string> = {
    waiting: '#F59E0B', active: '#22C55E', closed: '#9CA3AF',
  };
  const categoryEmoji: Record<string, string> = {
    psikologi: '🧠', agama: '🕌', umum: '📞',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column',
      height: '100svh', background: '#F8FAFC' }}>

      <div style={{ background: '#084463', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0 }}>
        <button onClick={() => router.push('/admin/care')}
          style={{ background: 'none', border: 'none',
            color: '#FFFFFF', cursor: 'pointer',
            fontSize: 20, padding: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'Poppins', fontSize: 15,
            fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            {session?.user_name || 'Memuat...'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {session?.category && (
              <span style={{ fontFamily: 'Inter', fontSize: 11,
                color: 'rgba(255,255,255,0.75)' }}>
                {categoryEmoji[session.category]} {session.category}
              </span>
            )}
            {session?.status && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4,
                marginLeft: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%',
                  background: statusColor[session.status] }} />
                <span style={{ fontFamily: 'Inter', fontSize: 11,
                  color: 'rgba(255,255,255,0.75)' }}>
                  {statusLabel[session.status]}
                </span>
              </div>
            )}
          </div>
          {session?.user_phone && (
            <p style={{ fontFamily: 'Inter', fontSize: 10,
              color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
              📞 {session.user_phone}
              {session?.user_address && ` · ${session.user_address}`}
            </p>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto',
        padding: '16px', display: 'flex',
        flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => {
          const isOfficer = msg.sender_role === 'officer';
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
              justifyContent: isOfficer
                ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                background: isOfficer ? '#084463' : '#E8F4F8',
                color: isOfficer ? '#FFFFFF' : '#1E2938',
                borderRadius: isOfficer
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                padding: '10px 14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                <p style={{ fontFamily: 'Inter', fontSize: 13,
                  margin: 0, lineHeight: 1.6 }}>{msg.content}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 10,
                  margin: '4px 0 0',
                  color: isOfficer
                    ? 'rgba(255,255,255,0.6)' : '#9CA3AF',
                  textAlign: isOfficer ? 'right' : 'left' }}>
                  {new Date(msg.created_at)
                    .toLocaleTimeString('id-ID',
                      { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '12px 16px', background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex', gap: 10, alignItems: 'flex-end',
        flexShrink: 0,
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <textarea value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault(); sendMessage();
            }
          }}
          placeholder="Ketik balasan..."
          rows={1}
          style={{ flex: 1, border: '1.5px solid #E2E8F0',
            borderRadius: 20, padding: '10px 16px',
            fontFamily: 'Inter', fontSize: 14,
            resize: 'none', outline: 'none',
            maxHeight: 100, overflow: 'auto' }} />
        <button onClick={sendMessage}
          disabled={sending || !input.trim()}
          style={{ width: 44, height: 44, borderRadius: '50%',
            background: input.trim() ? '#084463' : '#E2E8F0',
            border: 'none',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
            flexShrink: 0, transition: 'background 0.2s ease' }}>
          ➤</button>
      </div>
    </div>
  );
}
