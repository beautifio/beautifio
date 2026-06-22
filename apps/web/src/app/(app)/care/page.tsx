"use client";
import { useRouter } from 'next/navigation';

export default function CarePage() {
  const router = useRouter();

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100svh',
      paddingBottom: 80 }}>

      <div style={{
        background: '#084463', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
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

      <div style={{ padding: '20px 16px', display: 'flex',
        flexDirection: 'column', gap: 14, maxWidth: 480,
        margin: '0 auto' }}>

        {/* Card 1: DARURAT */}
        <a href="tel:112" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #991B1B, #DC2626)',
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
                margin: '0 0 6px' }}>
                Darurat
              </h2>
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
            }}>
              📞 112
            </div>
          </div>
        </a>

        {/* Card 2: LAPORKAN MASALAH */}
        <div onClick={() => router.push('/care/lapor')}
          style={{
            background: 'linear-gradient(135deg, #084463, #0E7490)',
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
              margin: '0 0 6px' }}>
              Laporkan Masalah
            </h2>
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

        {/* Card 3: CHAT CARE */}
        <div onClick={() => router.push('/care/chat')}
          style={{
            background: 'linear-gradient(135deg, #0E7490, #6BB9D4)',
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
              margin: '0 0 6px' }}>
              Chat Beautifio Care
            </h2>
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

        {/* Footer */}
        <div style={{
          textAlign: 'center', padding: '12px',
          background: '#FFFFFF', borderRadius: 14,
          border: '1px solid #E2E8F0',
        }}>
          <p style={{ fontFamily: 'Inter', fontSize: 12,
            color: '#647488', margin: 0, lineHeight: 1.6 }}>
            🔒 Semua yang kamu ceritakan bersifat rahasia
            dan tidak akan dibagikan tanpa izinmu.
          </p>
        </div>
      </div>
    </div>
  );
}
