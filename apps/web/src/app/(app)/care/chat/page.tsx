"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface CareSchedule {
  id: string; category: string; is_online: boolean;
  next_available: string | null; message: string | null;
}

export default function CareChatPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<CareSchedule[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Record<string, string>>({
    nama: '', phone: '', alamat: ''
  });
  const [starting, setStarting] = useState(false);

  const types = [
    { key: 'psikologi', label: 'Psikologi', emoji: '🧠',
      desc: 'Konseling kesehatan mental & emosional' },
    { key: 'agama', label: 'Konseling Agama', emoji: '🕌',
      desc: 'Bimbingan spiritual & keagamaan' },
    { key: 'umum', label: 'Konsultasi Umum', emoji: '📞',
      desc: 'Tidak tahu ke mana? Kami bantu arahkan' },
  ];

  useEffect(() => {
    createClient()?.from('care_officer_schedule')
      .select('*')
      .then(({ data }) => setSchedules(data ?? []));
  }, []);

  function getSchedule(type: string) {
    return schedules.find(s => s.category === type);
  }

  function getCountdown(nextAvailable: string | null) {
    if (!nextAvailable) return null;
    const diff = new Date(nextAvailable).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const d = new Date(nextAvailable).toLocaleDateString('id-ID',
      { weekday:'long', day:'numeric', month:'short' });
    const t = new Date(nextAvailable).toLocaleTimeString('id-ID',
      { hour:'2-digit', minute:'2-digit' });
    return `${d} pukul ${t} WIB`;
  }

  async function handleStartChat() {
    if (!form.nama.trim()) { alert('Nama harus diisi'); return; }
    setStarting(true);
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: session } = await supabase
      .from('care_chat_sessions')
      .insert({
        user_id: user?.id,
        category: selectedType,
        user_name: form.nama,
        user_phone: form.phone || null,
        user_address: form.alamat || null,
        status: 'waiting',
      }).select().single();
    if (!supabase) return;
    await supabase.from('care_chat_messages').insert({
      session_id: session.id,
      sender_id: user?.id,
      sender_role: 'system',
      content: `Halo ${form.nama}! Kamu terhubung dengan ` +
        `layanan ${selectedType} Beautifio Care. ` +
        `Ceritakan apa yang ingin kamu konsultasikan.`,
    });
    router.push(`/care/chat/${session.id}`);
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100svh',
      paddingBottom: 40 }}>
      <div style={{ background: '#084463', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => step > 1
          ? setStep(1) : router.back()}
          style={{ background: 'none', border: 'none',
            color: '#FFFFFF', cursor: 'pointer',
            fontSize: 20, padding: 0 }}>←</button>
        <h1 style={{ fontFamily: 'Poppins', fontSize: 18,
          fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          Chat Beautifio Care
        </h1>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 480,
        margin: '0 auto' }}>

        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'Poppins', fontSize: 18,
              fontWeight: 700, color: '#1E2938',
              margin: '0 0 8px' }}>
              Konsultasi apa yang kamu butuhkan?
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: 13,
              color: '#647488', marginBottom: 20 }}>
              Pilih kategori konsultasi.
            </p>
            <div style={{ display: 'flex',
              flexDirection: 'column', gap: 12 }}>
              {types.map(t => {
                const sched = getSchedule(t.key);
                const isOnline = sched?.is_online ?? false;
                const nextAvail = getCountdown(sched?.next_available ?? null);
                return (
                  <div key={t.key}
                    onClick={() => {
                      setSelectedType(t.key); setStep(2);
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 16, padding: '16px 20px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      display: 'flex', alignItems: 'center',
                      gap: 14,
                    }}>
                    <div style={{ width: 52, height: 52,
                      borderRadius: 14, background: '#F0F9FF',
                      fontSize: 26, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0 }}>
                      {t.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Poppins',
                        fontSize: 14, fontWeight: 700,
                        color: '#1E2938', margin: '0 0 2px' }}>
                        {t.label}
                      </p>
                      <p style={{ fontFamily: 'Inter',
                        fontSize: 12, color: '#647488',
                        margin: '0 0 6px' }}>{t.desc}</p>
                      <div style={{ display: 'flex',
                        alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8,
                          borderRadius: '50%',
                          background: isOnline
                            ? '#22C55E' : '#9CA3AF' }} />
                        <span style={{ fontFamily: 'Inter',
                          fontSize: 11,
                          color: isOnline ? '#15803D' : '#9CA3AF' }}>
                          {isOnline ? 'Petugas tersedia' :
                            nextAvail
                              ? `Kembali ${nextAvail}`
                              : 'Tidak ada petugas'}
                        </span>
                      </div>
                    </div>
                    <span style={{ color: '#6BB9D4',
                      fontSize: 18 }}>→</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && selectedType && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center',
              gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 28 }}>
                {types.find(t => t.key === selectedType)?.emoji}
              </span>
              <h2 style={{ fontFamily: 'Poppins', fontSize: 18,
                fontWeight: 700, color: '#1E2938', margin: 0 }}>
                {types.find(t => t.key === selectedType)?.label}
              </h2>
            </div>
            <p style={{ fontFamily: 'Inter', fontSize: 13,
              color: '#647488', marginBottom: 20,
              lineHeight: 1.6 }}>
              Perkenalkan dirimu sebelum mulai chat.
              Data ini hanya digunakan untuk sesi ini.
            </p>
            {[
              { key: 'nama', label: 'Nama (boleh nama panggilan)',
                required: true, placeholder: 'Nama panggilanmu' },
              { key: 'phone', label: 'Nomor telepon (opsional)',
                placeholder: '08xxx' },
              { key: 'alamat', label: 'Kota / Domisili (opsional)',
                placeholder: 'Jakarta, Bandung, dll' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: 'Inter', fontSize: 12,
                  fontWeight: 600, color: '#647488',
                  display: 'block', marginBottom: 6 }}>
                  {field.label} {field.required && '*'}
                </label>
                <input value={form[field.key] || ''}
                  onChange={e => setForm(p =>
                    ({...p, [field.key]: e.target.value}))}
                  placeholder={field.placeholder}
                  style={{ width: '100%',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 12, padding: '12px 14px',
                    fontFamily: 'Inter', fontSize: 13,
                    boxSizing: 'border-box', outline: 'none' }} />
              </div>
            ))}
            <button onClick={handleStartChat} disabled={starting}
              style={{
                width: '100%',
                background: starting ? '#9CA3AF' : '#084463',
                color: '#FFFFFF', border: 'none',
                borderRadius: 14, padding: '14px',
                fontFamily: 'Poppins', fontSize: 15,
                fontWeight: 700,
                cursor: starting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(8,68,99,0.3)',
              }}>
              {starting ? 'Memulai...' : 'Mulai Chat →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
