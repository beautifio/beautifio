"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CarePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showAgreement, setShowAgreement] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [activeSessions, setActiveSessions] = useState(0);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: profile } = await supabase
        .from('users')
        .select('care_agreement_accepted')
        .eq('id', user.id)
        .single();
      if (!profile?.care_agreement_accepted) {
        setShowAgreement(true);
      }
      const { count } = await supabase
        .from('care_chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('status', 'closed');
      setActiveSessions(count ?? 0);
      setLoading(false);
    }
    init();
  }, []);

  async function handleAccept() {
    setAccepting(true);
    const supabase = createClient();
    if (!supabase) { setAccepting(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('users').update({
      care_agreement_accepted: true,
      care_agreement_accepted_at: new Date().toISOString(),
    }).eq('id', user?.id);
    setShowAgreement(false);
    setAccepting(false);
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center',
      alignItems: 'center', minHeight: '100svh',
      background: '#F8FAFC' }}>
      <p style={{ fontFamily: 'Inter', fontSize: 14,
        color: '#647488' }}>Memuat...</p>
    </div>
  );

  return (
    <>
      {showAgreement && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px 24px 0 0',
            padding: '28px 24px',
            paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
            maxWidth: 480, width: '100%',
            maxHeight: '88vh', overflowY: 'auto',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>💜</div>
              <h2 style={{ fontFamily: 'Poppins', fontSize: 20,
                fontWeight: 700, color: '#1E2938',
                margin: '0 0 8px' }}>
                Selamat datang di Beautifio Care
              </h2>
              <p style={{ fontFamily: 'Inter', fontSize: 14,
                color: '#647488', margin: 0, lineHeight: 1.6 }}>
                Ruang aman untuk perempuan saling mendukung
              </p>
            </div>

            <div style={{
              background: '#F8FAFC', borderRadius: 16,
              padding: '20px', marginBottom: 20,
            }}>
              <h3 style={{ fontFamily: 'Poppins', fontSize: 14,
                fontWeight: 700, color: '#1E2938',
                margin: '0 0 16px' }}>
                Panduan Komunitas
              </h3>
              {[
                { icon: '🛡️', title: 'Ruang ini aman dan rahasia',
                  desc: 'Semua yang kamu ceritakan bersifat rahasia. Kami tidak membagikan informasimu tanpa izin.' },
                { icon: '💜', title: 'Saling menghormati',
                  desc: 'Beautifio Care adalah ruang khusus perempuan. Jaga rasa hormat dan empati dalam setiap interaksi.' },
                { icon: '🚫', title: 'Dilarang menyalahgunakan',
                  desc: 'Penyalahgunaan termasuk penipuan, pelecehan, atau pemalsuan identitas akan mengakibatkan pemblokiran akun.' },
                { icon: '🤝', title: 'Lapor jika ada yang mencurigakan',
                  desc: 'Gunakan tombol laporkan jika menemukan perilaku tidak pantas. Kami akan menindaklanjuti dengan serius.' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12,
                  marginBottom: i < 3 ? 14 : 0,
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <div>
                    <p style={{ fontFamily: 'Poppins', fontSize: 13,
                      fontWeight: 600, color: '#1E2938',
                      margin: '0 0 2px' }}>
                      {item.title}
                    </p>
                    <p style={{ fontFamily: 'Inter', fontSize: 12,
                      color: '#647488', margin: 0, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontFamily: 'Inter', fontSize: 12,
              color: '#9CA3AF', textAlign: 'center',
              marginBottom: 16, lineHeight: 1.5 }}>
              Dengan menekan tombol di bawah, kamu menyatakan
              bahwa kamu adalah perempuan dan menyetujui
              panduan komunitas di atas.
            </p>

            <button onClick={handleAccept} disabled={accepting}
              style={{
                width: '100%',
                background: accepting ? '#9CA3AF' : '#084463',
                color: '#FFFFFF', border: 'none',
                borderRadius: 14, padding: '15px',
                fontFamily: 'Poppins', fontSize: 15,
                fontWeight: 700,
                cursor: accepting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(8,68,99,0.3)',
                marginBottom: 10,
              }}>
              {accepting ? 'Menyimpan...'
                : 'Saya Mengerti & Setuju 💜'}
            </button>

            <button onClick={() => router.back()} style={{
              width: '100%', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'Inter', fontSize: 13,
              color: '#9CA3AF', padding: '10px',
            }}>
              Kembali
            </button>
          </div>
        </div>
      )}

      {!showAgreement && (
        <div style={{ background: '#F8FAFC',
          minHeight: '100svh', paddingBottom: 80 }}>

          <div style={{ background: '#084463',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.back()}
              style={{ background: 'none', border: 'none',
                color: '#FFFFFF', cursor: 'pointer',
                fontSize: 20, padding: 0 }}>←</button>
            <div>
              <h1 style={{ fontFamily: 'Poppins', fontSize: 18,
                fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Beautifio Care
              </h1>
              <p style={{ fontFamily: 'Inter', fontSize: 12,
                color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                Kami ada untukmu
              </p>
            </div>
          </div>

          <div style={{ padding: '20px 16px',
            display: 'flex', flexDirection: 'column',
            gap: 14, maxWidth: 480, margin: '0 auto' }}>

            {activeSessions > 0 && (
              <div onClick={() => router.push('/care/chat')}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #6BB9D4',
                  borderRadius: 14, padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', cursor: 'pointer',
                }}>
                <span style={{ fontFamily: 'Inter', fontSize: 13,
                  color: '#084463', fontWeight: 500 }}>
                  💬 Kamu punya {activeSessions} sesi chat aktif
                </span>
                <span style={{ color: '#6BB9D4', fontSize: 13,
                  fontWeight: 600 }}>Lihat →</span>
              </div>
            )}

            <a href="tel:112" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg,#991B1B,#DC2626)',
                borderRadius: 20, padding: '24px 20px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(220,38,38,0.3)',
                cursor: 'pointer',
              }}>
                <div>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🆘</div>
                  <h2 style={{ fontFamily: 'Poppins', fontSize: 20,
                    fontWeight: 800, color: '#FFFFFF',
                    margin: '0 0 6px' }}>Darurat</h2>
                  <p style={{ fontFamily: 'Inter', fontSize: 13,
                    color: 'rgba(255,255,255,0.85)', margin: 0,
                    lineHeight: 1.5 }}>
                    Situasi mengancam jiwa?
                    Hubungi layanan darurat sekarang
                  </p>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 12, padding: '10px 16px',
                  color: '#FFFFFF', fontFamily: 'Poppins',
                  fontSize: 20, fontWeight: 800,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>📞 112</div>
              </div>
            </a>

            <div onClick={() => router.push('/care/lapor')}
              style={{
                background: 'linear-gradient(135deg,#084463,#0E7490)',
                borderRadius: 20, padding: '24px 20px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(8,68,99,0.3)',
                cursor: 'pointer',
              }}>
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
                <h2 style={{ fontFamily: 'Poppins', fontSize: 20,
                  fontWeight: 800, color: '#FFFFFF',
                  margin: '0 0 6px' }}>Laporkan Masalah</h2>
                <p style={{ fontFamily: 'Inter', fontSize: 13,
                  color: 'rgba(255,255,255,0.85)', margin: 0,
                  lineHeight: 1.5 }}>
                  Panduan lapor, kontak lembaga,
                  dan template laporan siap pakai
                </p>
              </div>
              <div style={{ color: '#FFC64F', fontSize: 28,
                fontWeight: 800 }}>→</div>
            </div>

            <div onClick={() => router.push('/care/chat')}
              style={{
                background: 'linear-gradient(135deg,#0E7490,#6BB9D4)',
                borderRadius: 20, padding: '24px 20px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(107,185,212,0.3)',
                cursor: 'pointer',
              }}>
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                <h2 style={{ fontFamily: 'Poppins', fontSize: 20,
                  fontWeight: 800, color: '#FFFFFF',
                  margin: '0 0 6px' }}>Chat Beautifio Care</h2>
                <p style={{ fontFamily: 'Inter', fontSize: 13,
                  color: 'rgba(255,255,255,0.9)', margin: 0,
                  lineHeight: 1.5 }}>
                  Konsultasi dengan petugas kami
                  Psikologi · Agama · Umum
                </p>
              </div>
              <div style={{ color: '#FFFFFF', fontSize: 28,
                fontWeight: 800 }}>→</div>
            </div>

            <div style={{ textAlign: 'center', padding: '12px',
              background: '#FFFFFF', borderRadius: 14,
              border: '1px solid #E2E8F0' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 12,
                color: '#647488', margin: 0, lineHeight: 1.6 }}>
                🔒 Semua yang kamu ceritakan bersifat rahasia
                dan tidak akan dibagikan tanpa izinmu.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
