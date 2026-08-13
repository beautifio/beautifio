"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Video, X, Repeat, Check, CheckCheck } from 'lucide-react';

interface CareMessage {
  id: string; session_id: string; sender_id: string | null;
  sender_role: 'user' | 'officer' | 'system';
  content: string; created_at: string;
  is_read?: boolean;
}

interface CareSession {
  id: string; category: string; status: string;
  user_name: string; user_phone: string | null;
  user_address: string | null;
  officer_id?: string | null;
  is_ai_officer?: boolean;
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
  const [showMeeting, setShowMeeting] = useState(false);
  const [meetingPlatform, setMeetingPlatform] = useState('zoom');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [faqGroup, setFaqGroup] = useState(0);
  const [showTransfer, setShowTransfer] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
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
      }, p => setMessages(prev => {
        const exists = prev.some(m => m.id === (p.new as CareMessage).id)
        if (exists) return prev
        const cleaned = prev.filter(m => !m.id.startsWith('temp-'))
        return [...cleaned, p.new as CareMessage]
      }))
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
    const userMsg = input.trim();

    // Optimistic: add immediately
    const tempId = 'temp-' + Date.now();
    setMessages(prev => [...prev, { id: tempId, session_id: sessionId, sender_id: user?.id || null, sender_role: 'officer', content: userMsg, created_at: new Date().toISOString() }]);

    await supabase.from('care_chat_messages').insert({
      session_id: sessionId,
      sender_id: user?.id,
      sender_role: 'officer',
      content: userMsg,
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

  async function sendMeeting() {
    if (!meetingLink.trim()) return
    setMeetingSaving(true)
    const supabase = createClient()
    if (!supabase) { setMeetingSaving(false); return }
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('care_meeting_invites').insert({
      session_id: sessionId, platform: meetingPlatform, link: meetingLink.trim(), created_by: user?.id,
    })

    const platformLabel = meetingPlatform === 'zoom' ? 'Zoom' : 'Google Meet'
    await supabase.from('care_chat_messages').insert({
      session_id: sessionId, sender_id: user?.id, sender_role: 'officer',
      content: `📹 Kak ${session?.user_name || 'Volunteer'}, undangan sesi online:\n\nPlatform: ${platformLabel}\nLink: ${meetingLink.trim()}\n\nKlik link untuk bergabung ya.`,
    })

    setShowMeeting(false)
    setMeetingLink('')
    setMeetingSaving(false)
  }

  async function openTransfer() {
    setShowTransfer(true)
    setAgentsLoading(true)
    const supabase = createClient()
    if (!supabase) { setAgentsLoading(false); return }

    const { data: vols } = await supabase.from('care_officers')
      .select('id, name, user_id, is_online, max_sessions')
      .eq('is_online', true)
      .neq('user_id', session?.officer_id ? session.officer_id : '')

    if (vols) {
      const enriched = await Promise.all(vols.map(async v => {
        const { count } = await supabase.from('care_chat_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('officer_id', v.user_id).eq('status', 'active')
        return { ...v, active_chats: count || 0 }
      }))
      setAgents(enriched)
    }
    setAgentsLoading(false)
  }

  async function handleTransfer(toUserId: string, toName: string) {
    const supabase = createClient()
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()

    // Update session
    await supabase.from('care_chat_sessions').update({
      officer_id: toUserId,
      transferred_from: session?.officer_id,
      transferred_to: toUserId,
      is_ai_officer: false,
    }).eq('id', sessionId)

    // System message
    const { data: from } = await supabase.from('care_officers')
      .select('name').eq('user_id', session?.officer_id).single()
    await supabase.from('care_chat_messages').insert({
      session_id: sessionId,
      sender_role: 'system',
      content: `🔄 ${from?.name || 'Admin'} mengoper chat ke ${toName}`,
    })

    setShowTransfer(false)
  }

  async function handleTransferToAI() {
    const supabase = createClient()
    if (!supabase) return
    await supabase.from('care_chat_sessions').update({
      officer_id: null, is_ai_officer: true, status: 'waiting',
    }).eq('id', sessionId)
    // Trigger AI assign
    fetch('/api/care/sessions/ai-assign', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    }).catch(() => {})
    setShowTransfer(false)
    // Insert system message
    await supabase.from('care_chat_messages').insert({
      session_id: sessionId, sender_role: 'system',
      content: '🔄 Chat dialihkan ke Kakak Pembimbing sementara.',
    })
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

  const FAQ_GROUPS = [
    { label: '🟢 Opening', templates: {
      psikologi: [
        'Mohon maaf sudah menunggu ya kak. Ada yang bisa kami bantu?',
        'Halo kak, terima kasih sudah berani cerita. Apa yang sedang kakak rasakan?',
        'Selamat datang di Beautifio Care kak. Ceritakan apa yang ingin kamu konsultasikan.',
      ],
      agama: [
        'Assalamualaikum / Salam sejahtera kak. Ada yang bisa kami bantu?',
        'Terima kasih sudah menghubungi Care. Ceritakan apa yang ingin kak konsultasikan.',
        'Halo kak. Kami siap mendengarkan. Apa yang sedang kakak alami?',
      ],
      umum: [
        'Halo kak, ada yang bisa kami bantu hari ini?',
        'Selamat datang di Care. Ceritakan apa yang ingin dikonsultasikan.',
        'Terima kasih sudah menghubungi kami. Ada yang bisa dibantu?',
      ],
      bisnis: [
        'Halo kak! Ada yang bisa kami bantu terkait bisnis/marketing?',
        'Selamat datang di Care Bisnis. Ceritakan tentang usaha kakak.',
        'Halo, siap bantu! Lagi ada kendala di bisnis atau marketing?',
      ],
    }},
    { label: '🔵 Probing', templates: {
      psikologi: [
        'Sejak kapan kakak mulai merasa seperti ini?',
        'Apakah ada kejadian spesifik yang memicu perasaan ini?',
        'Bagaimana pengaruhnya ke aktivitas sehari-hari kak?',
        'Apa yang sudah kak coba lakukan untuk mengatasinya?',
      ],
      agama: [
        'Apa yang membuat kakak mencari bimbingan spiritual hari ini?',
        'Apakah ada kegelisahan atau pertanyaan yang mengganjal?',
        'Bagaimana hubungan kakak dengan ibadah/komunitas saat ini?',
        'Sudah berapa lama kakak merasakan hal ini?',
      ],
      umum: [
        'Bisa dijelaskan lebih detail situasinya kak?',
        'Apa harapan kakak dari konsultasi ini?',
        'Kapan mulai terjadi dan apa pemicunya?',
      ],
      bisnis: [
        'Di tahap apa bisnis kakak sekarang? Baru mulai atau sudah berjalan?',
        'Apa tantangan terbesar yang kakak hadapi saat ini?',
        'Siapa target market kakak? Sudah ada data penjualan?',
        'Strategi marketing apa yang sudah dicoba sejauh ini?',
      ],
    }},
    { label: '🟡 Validasi', templates: {
      psikologi: [
        'Wajar banget kak merasa begitu. Banyak orang mengalami hal serupa.',
        'Kamu udah kuat loh bisa sampai sejauh ini.',
        'Aku dengerin kok kak. Gak apa-apa, cerita aja.',
        'Perasaan kak valid. Gak ada yang salah dengan apa yang kakak rasakan.',
      ],
      agama: [
        'Perjalanan spiritual setiap orang beda-beda kak. Gak perlu bandingin.',
        'Allah/Tuhan selalu bersama hamba-Nya yang bersungguh-sungguh.',
        'Kakak sudah di jalan yang benar dengan mencari bimbingan.',
      ],
      umum: [
        'Kami dengar dan paham situasi kakak.',
        'Terima kasih sudah terbuka. Itu langkah pertama yang berani.',
        'Gak apa-apa kok kak. Kita di sini buat bantu.',
      ],
      bisnis: [
        'Banyak founder sukses juga mulai dari nol kok kak.',
        'Gagal itu bagian dari proses. Yang penting terus belajar.',
        'Kakak udah berani ambil langkah, itu yang paling penting.',
      ],
    }},
    { label: '🟣 Solusi', templates: {
      psikologi: [
        'Coba kita breakdown satu per satu ya kak...',
        'Ada teknik pernapasan sederhana yang bisa dicoba kak...',
        'Saran kami, coba journaling tiap pagi 5 menit dulu kak.',
      ],
      agama: [
        'Coba kakak luangkan waktu untuk ibadah/meditasi secara rutin...',
        'Diskusi dengan guru spiritual terpercaya juga bisa membantu kak.',
        'Banyak ketenangan bisa didapat dari membaca kitab suci dengan tadabbur.',
      ],
      umum: [
        'Berdasarkan informasi yang kakak berikan, ada beberapa opsi...',
        'Coba kita lihat dari sisi lain dulu ya kak...',
        'Saran praktis: mulai dari langkah kecil yang paling mudah dulu.',
      ],
      bisnis: [
        'Coba kita lihat dari sisi marketing dulu. Strategi apa yang sudah dicoba?',
        'Saran praktis: mulai dari satu channel marketing dulu, jangan semua.',
        'Coba validasi pasar dulu sebelum scale-up. Survey kecil-kecilan ke 10 orang.',
      ],
    }},
    { label: '🔴 Tutup', templates: {
      psikologi: [
        'Kalau tidak ada lagi, saya izin mengakhiri sesi ya kak. Semangat terus! Jangan lupa follow @beautifio.space di Instagram dan TikTok ya kak — di sana banyak tips mental health, info event gratis, dan support komunitas. Sampai jumpa! 💙',
        'Terima kasih sudah sharing kak. Kami doakan yang terbaik. Follow @beautifio.space ya buat info komunitas dan tips mingguan. Semangat! 💙',
      ],
      agama: [
        'Semoga Allah/Tuhan memberi kemudahan. Kami doakan yang terbaik. Jangan lupa follow @beautifio.space di Instagram dan TikTok ya kak — banyak konten spiritual, event kajian, dan support sesama. Sampai jumpa! 💙',
      ],
      umum: [
        'Terima kasih sudah menghubungi Care. Jangan lupa follow @beautifio.space di Instagram dan TikTok untuk info komunitas, tips, dan event seru. Sampai jumpa kak! 💙',
      ],
      bisnis: [
        'Semoga lancar bisnisnya! Kalau butuh diskusi lagi, Care selalu buka. Jangan lupa follow @beautifio.space di Instagram dan TikTok — ada banyak insight bisnis, networking, dan event komunitas. Sampai jumpa! 💙',
      ],
    }},
  ];

  const currentTemplates = FAQ_GROUPS[faqGroup].templates[session?.category as keyof typeof FAQ_GROUPS[0]['templates']] || FAQ_GROUPS[faqGroup].templates['psikologi'];

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
          {session?.status === "active" && (
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              <button onClick={() => setShowMeeting(true)}
                style={{ flex: 1, padding: '5px 8px', borderRadius: 10, border: '1px solid rgba(255,198,79,0.4)', background: 'rgba(255,198,79,0.15)', color: '#FFC64F', fontSize: 10, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
                <Video size={11} className="inline mr-1" /> Sesi
              </button>
              <button onClick={openTransfer}
                style={{ flex: 1, padding: '5px 8px', borderRadius: 10, border: '1px solid rgba(255,198,79,0.4)', background: 'rgba(255,198,79,0.15)', color: '#FFC64F', fontSize: 10, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
                <Repeat size={11} className="inline mr-1" /> Oper
              </button>
              <button onClick={async () => {
              if (!confirm("Akhiri sesi konsultasi ini?")) return;
              await fetch(`/api/care/sessions/${sessionId}/close`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ by: "officer" }),
              });
              setSession((s: any) => s ? { ...s, status: "closed" } : s);
            }}
              style={{ flex: 1, padding: '5px 8px', borderRadius: 10, border: '1px solid rgba(255,198,79,0.4)', background: 'rgba(255,198,79,0.15)', color: '#FFC64F', fontSize: 10, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
              ✓ Selesai
            </button>
            </div>
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
                  color: isOfficer ? '#9CA3AF' : '#9CA3AF',
                  textAlign: isOfficer ? 'right' : 'left',
                  display: 'flex', alignItems: 'center', gap: 3,
                  justifyContent: isOfficer ? 'flex-end' : 'flex-start' }}>
                  {new Date(msg.created_at)
                    .toLocaleTimeString('id-ID',
                      { hour: '2-digit', minute: '2-digit' })}
                  {!isSystem && (
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

      <div style={{ padding: '12px 16px', background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column', gap: 6,
        flexShrink: 0,
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        {session?.status !== 'closed' && (
          <div style={{ marginBottom: 4 }}>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 4, overflowX: 'auto' }}>
              {FAQ_GROUPS.map((g, i) => (
                <button key={g.label} onClick={() => setFaqGroup(i)}
                  style={{ padding: '2px 8px', borderRadius: 16, border: faqGroup === i ? '2px solid #084463' : '1px solid transparent', background: faqGroup === i ? 'rgba(8,68,99,0.08)' : 'transparent', color: faqGroup === i ? '#084463' : '#647488', fontSize: 10, fontWeight: faqGroup === i ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {g.label}
                </button>
              ))}
            </div>
            {/* Template chips */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {currentTemplates.map((t: string, i: number) => (
                <button key={i} onClick={() => setInput(t)}
                  style={{ padding: '3px 10px', borderRadius: 16, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#647488', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {t.length > 50 ? t.slice(0, 47) + '...' : t}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', width: '100%' }}>
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
      {showMeeting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowMeeting(false)}>
          <div className="bg-surface rounded-t-2xl px-6 pt-6 pb-10 max-w-content w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-text-primary">📹 Jadwalkan Sesi Online</h2>
              <button onClick={() => setShowMeeting(false)} className="cursor-pointer"><X size={16} className="text-text-secondary/50" /></button>
            </div>
            <div className="space-y-3 mb-4">
              <select value={meetingPlatform} onChange={e => setMeetingPlatform(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-sm outline-none">
                <option value="zoom">Zoom</option>
                <option value="google_meet">Google Meet</option>
              </select>
              <input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://zoom.us/j/..." className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-sm outline-none" />
            </div>
            <button onClick={sendMeeting} disabled={!meetingLink.trim() || meetingSaving} className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 cursor-pointer">
              {meetingSaving ? "Mengirim..." : "Kirim Undangan"}
            </button>
          </div>
        </div>
      )}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowTransfer(false)}>
          <div className="bg-surface rounded-t-2xl px-6 pt-6 pb-10 max-w-content w-full" onClick={e => e.stopPropagation()} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-text-primary">🔄 Oper ke Agent Lain</h2>
              <button onClick={() => setShowTransfer(false)} className="cursor-pointer"><X size={16} className="text-text-secondary/50" /></button>
            </div>
            {agentsLoading ? (
              <p className="text-sm text-text-secondary py-4 text-center">Memuat agent...</p>
            ) : agents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-text-secondary mb-3">Tidak ada agent online saat ini.</p>
                <button onClick={handleTransferToAI} className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold cursor-pointer">
                  🤖 Alihkan ke Kakak Pembimbing
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-3">
                  {agents.map(a => (
                    <button key={a.id} onClick={() => handleTransfer(a.user_id, a.name)}
                      className="w-full p-3 rounded-xl border border-border bg-bg hover:border-primary/30 transition-colors text-left cursor-pointer flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{a.name}</p>
                        <p className="text-xs text-text-secondary">{a.active_chats} chat aktif</p>
                      </div>
                      <span className="text-xs font-medium text-primary">Pilih →</span>
                    </button>
                  ))}
                </div>
                <button onClick={handleTransferToAI} className="w-full py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium cursor-pointer">
                  🤖 Tidak cocok? Alihkan ke Kakak Pembimbing
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
