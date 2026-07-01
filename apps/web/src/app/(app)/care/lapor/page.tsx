"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface CareCategory {
  id: string; name: string; emoji: string; description: string;
  contact_name: string | null; contact_phone: string | null;
  contact_wa: string | null; contact_email: string | null;
  panduan_steps: string[]; template_wa: string | null;
  template_email: string | null; is_active: boolean;
  display_order: number;
}

export default function LaporPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<CareCategory[]>([]);
  const [selected, setSelected] = useState<CareCategory | null>(null);
  const [form, setForm] = useState<Record<string, string>>({
    nama: '', tanggal: '', lokasi: '',
    deskripsi: '', tindakan: '', harapan: ''
  });

  useEffect(() => {
    createClient()?.from('care_categories')
      .select('*').eq('is_active', true)
      .order('display_order')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  function generateTemplate(template: string | null, form: Record<string, string>, selected: CareCategory | null) {
    if (!template) return '';
    return template
      .replace(/{{nama}}/g, form.nama || '[nama]')
      .replace(/{{tanggal}}/g, form.tanggal || '[tanggal]')
      .replace(/{{lokasi}}/g, form.lokasi || '[lokasi]')
      .replace(/{{deskripsi}}/g, form.deskripsi || '[deskripsi]')
      .replace(/{{tindakan}}/g, form.tindakan || '-')
      .replace(/{{harapan}}/g, form.harapan || '-')
      .replace(/{{kategori}}/g, selected?.name || '')
      .replace(/{{lembaga}}/g, selected?.contact_name || '');
  }

  const progress = (step / 4) * 100;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100svh',
      paddingBottom: 40 }}>

      {/* Header + progress */}
      <div style={{ background: '#084463',
        padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center',
          gap: 12, marginBottom: 12 }}>
          <button
            onClick={() => step > 1
              ? setStep(step-1) : router.back()}
            style={{ background: 'none', border: 'none',
              color: '#1E2938', cursor: 'pointer',
              fontSize: 20, padding: 0 }}>←</button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Poppins', fontSize: 16,
              fontWeight: 700, color: '#1E2938', margin: 0 }}>
              Laporkan Masalah
            </h1>
            <p style={{ fontFamily: 'Inter', fontSize: 11,
              color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Langkah {step} dari 4
            </p>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)',
          borderRadius: 4, height: 4 }}>
          <div style={{
            background: '#FFC64F', borderRadius: 4,
            height: 4, width: `${progress}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 480,
        margin: '0 auto' }}>

        {/* STEP 1: Pilih Kategori */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'Poppins', fontSize: 18,
              fontWeight: 700, color: '#1E2938',
              margin: '0 0 8px' }}>
              Masalah apa yang kamu alami?
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: 13,
              color: '#647488', marginBottom: 20 }}>
              Pilih kategori yang paling sesuai.
            </p>
            <div style={{ display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10, marginBottom: 24 }}>
              {categories.map(cat => (
                <button key={cat.id}
                  onClick={() => setSelected(cat)}
                  style={{
                    background: selected?.id === cat.id
                      ? '#084463' : '#FFFFFF',
                    color: selected?.id === cat.id
                      ? '#FFFFFF' : '#1E2938',
                    border: selected?.id === cat.id
                      ? '2px solid #084463'
                      : '1.5px solid #E2E8F0',
                    borderRadius: 14, padding: '16px 12px',
                    fontFamily: 'Poppins', fontSize: 13,
                    fontWeight: 600, cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: selected?.id === cat.id
                      ? '0 4px 12px rgba(8,68,99,0.2)'
                      : '0 1px 4px rgba(0,0,0,0.05)',
                  }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>
                    {cat.emoji}
                  </div>
                  {cat.name}
                </button>
              ))}
            </div>
            <button onClick={() => selected && setStep(2)}
              disabled={!selected}
              style={{
                width: '100%',
                background: selected ? '#084463' : '#E2E8F0',
                color: selected ? '#FFFFFF' : '#9CA3AF',
                border: 'none', borderRadius: 14, padding: '14px',
                fontFamily: 'Poppins', fontSize: 15,
                fontWeight: 700,
                cursor: selected ? 'pointer' : 'not-allowed',
              }}>
              Lanjut →
            </button>
          </div>
        )}

        {/* STEP 2: Panduan */}
        {step === 2 && selected && (
          <div>
            <div style={{ display: 'flex',
              alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>{selected.emoji}</span>
              <h2 style={{ fontFamily: 'Poppins', fontSize: 18,
                fontWeight: 700, color: '#1E2938', margin: 0 }}>
                {selected.name}
              </h2>
            </div>
            <p style={{ fontFamily: 'Inter', fontSize: 13,
              color: '#647488', marginBottom: 20,
              lineHeight: 1.6 }}>
              Panduan jika kamu mengalami ini:
            </p>
            <div style={{ marginBottom: 24 }}>
              {(selected.panduan_steps || []).map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, marginBottom: 14,
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#084463', color: '#1E2938',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Poppins', fontSize: 12,
                    fontWeight: 700, flexShrink: 0,
                  }}>{i+1}</div>
                  <p style={{ fontFamily: 'Inter', fontSize: 13,
                    color: '#1E2938', margin: 0,
                    lineHeight: 1.6, paddingTop: 4 }}>{s}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(3)} style={{
              width: '100%', background: '#084463',
              color: '#1E2938', border: 'none',
              borderRadius: 14, padding: '14px',
              fontFamily: 'Poppins', fontSize: 15,
              fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(8,68,99,0.3)',
            }}>
              Lanjut Buat Laporan →
            </button>
          </div>
        )}

        {/* STEP 3: Form */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: 'Poppins', fontSize: 18,
              fontWeight: 700, color: '#1E2938',
              margin: '0 0 8px' }}>
              Isi detail laporan
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: 13,
              color: '#647488', marginBottom: 20 }}>
              Template sudah disiapkan, kamu tinggal mengisi.
            </p>
            {[
              { key: 'nama', label: 'Nama lengkap',
                required: true, placeholder: 'Nama kamu' },
              { key: 'tanggal', label: 'Tanggal kejadian',
                required: true, type: 'date' },
              { key: 'lokasi', label: 'Lokasi kejadian',
                required: true, placeholder: 'Kota / alamat' },
              { key: 'deskripsi', label: 'Ceritakan kejadiannya',
                required: true, multiline: true,
                placeholder: 'Ceritakan secara detail...' },
              { key: 'tindakan',
                label: 'Tindakan yang sudah diambil',
                placeholder: 'Opsional' },
              { key: 'harapan', label: 'Harapan / permintaan',
                placeholder: 'Opsional' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: 'Inter',
                  fontSize: 12, fontWeight: 600, color: '#647488',
                  display: 'block', marginBottom: 6 }}>
                  {field.label} {field.required && '*'}
                </label>
                {field.multiline ? (
                  <textarea value={form[field.key] || ''}
                    onChange={e => setForm(p =>
                      ({...p, [field.key]: e.target.value}))}
                    placeholder={field.placeholder}
                    rows={4}
                    style={{ width: '100%',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 12, padding: '12px 14px',
                      fontFamily: 'Inter', fontSize: 13,
                      resize: 'none', boxSizing: 'border-box',
                      outline: 'none' }} />
                ) : (
                  <input type={field.type || 'text'}
                    value={form[field.key] || ''}
                    onChange={e => setForm(p =>
                      ({...p, [field.key]: e.target.value}))}
                    placeholder={field.placeholder}
                    style={{ width: '100%',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 12, padding: '12px 14px',
                      fontFamily: 'Inter', fontSize: 13,
                      boxSizing: 'border-box', outline: 'none' }} />
                )}
              </div>
            ))}
            <button onClick={() => {
              if (!form.nama || !form.tanggal ||
                  !form.lokasi || !form.deskripsi) {
                alert('Mohon isi semua field wajib (*)');
                return;
              }
              setStep(4);
            }} style={{
              width: '100%', background: '#084463',
              color: '#1E2938', border: 'none',
              borderRadius: 14, padding: '14px',
              fontFamily: 'Poppins', fontSize: 15,
              fontWeight: 700, cursor: 'pointer',
            }}>
              Generate Laporan →
            </button>
          </div>
        )}

        {/* STEP 4: Aksi */}
        {step === 4 && selected && (
          <div>
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #22C55E',
              borderRadius: 16, padding: '16px',
              marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 24 }}>✅</span>
              <div>
                <p style={{ fontFamily: 'Poppins', fontSize: 14,
                  fontWeight: 700, color: '#15803D', margin: 0 }}>
                  Laporan siap dikirimkan!
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: 12,
                  color: '#166534', margin: 0 }}>
                  Pilih cara kirim laporan di bawah
                </p>
              </div>
            </div>

            {selected.contact_name && (
              <p style={{ fontFamily: 'Poppins', fontSize: 14,
                fontWeight: 600, color: '#1E2938',
                marginBottom: 16 }}>
                Kontak: {selected.contact_name}
              </p>
            )}

            <div style={{ display: 'flex',
              flexDirection: 'column', gap: 12 }}>

              {selected.contact_phone && (
                <a href={`tel:${selected.contact_phone}`}
                  style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 16, padding: '16px 20px',
                    display: 'flex', alignItems: 'center',
                    gap: 14, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ width: 44, height: 44,
                      borderRadius: 12, background: '#F0FDF4',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 22 }}>
                      📞
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Poppins',
                        fontSize: 14, fontWeight: 700,
                        color: '#1E2938', margin: 0 }}>
                        Telepon Langsung
                      </p>
                      <p style={{ fontFamily: 'Inter',
                        fontSize: 12, color: '#647488', margin: 0 }}>
                        {selected.contact_phone}
                      </p>
                    </div>
                  </div>
                </a>
              )}

              {selected.contact_wa && (
                <div onClick={() => {
                  const msg = generateTemplate(
                    selected.template_wa, form, selected);
                  const wa = (selected.contact_wa ?? '').replace(/\D/g,'');
                  window.open(
                    `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`,
                    '_blank');
                }} style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 16, padding: '16px 20px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ display: 'flex',
                    alignItems: 'center', gap: 14,
                    marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44,
                      borderRadius: 12, background: '#F0FDF4',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 22 }}>
                      💬
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Poppins',
                        fontSize: 14, fontWeight: 700,
                        color: '#1E2938', margin: 0 }}>
                        Kirim via WhatsApp
                      </p>
                      <p style={{ fontFamily: 'Inter',
                        fontSize: 12, color: '#647488', margin: 0 }}>
                        Template pesan sudah disiapkan
                      </p>
                    </div>
                  </div>
                  <div style={{ background: '#F8FAFC',
                    borderRadius: 10, padding: '10px 12px',
                    border: '1px solid #E2E8F0' }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 11,
                      color: '#647488', margin: 0,
                      whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {generateTemplate(
                        selected.template_wa, form, selected)
                        .substring(0, 150)}...
                    </p>
                  </div>
                </div>
              )}

              {selected.contact_email && (
                <div style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 16, padding: '16px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ display: 'flex',
                    alignItems: 'center', gap: 14,
                    marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44,
                      borderRadius: 12, background: '#F0F9FF',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 22 }}>
                      📧
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Poppins',
                        fontSize: 14, fontWeight: 700,
                        color: '#1E2938', margin: 0 }}>
                        Kirim via Email
                      </p>
                      <p style={{ fontFamily: 'Inter',
                        fontSize: 12, color: '#647488', margin: 0 }}>
                        {selected.contact_email}
                      </p>
                    </div>
                  </div>
                  <div style={{ background: '#F8FAFC',
                    borderRadius: 10, padding: '10px 12px',
                    border: '1px solid #E2E8F0', marginBottom: 10,
                    maxHeight: 100, overflow: 'hidden' }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 11,
                      color: '#647488', margin: 0,
                      whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {generateTemplate(
                        selected.template_email, form, selected)
                        .substring(0, 200)}...
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => {
                      navigator.clipboard.writeText(
                        generateTemplate(
                          selected.template_email, form, selected));
                      alert('Pesan berhasil disalin!');
                    }} style={{
                      flex: 1, background: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 10, padding: '10px',
                      fontFamily: 'Inter', fontSize: 12,
                      fontWeight: 600, color: '#647488',
                      cursor: 'pointer',
                    }}>📋 Salin Pesan</button>
                    <button onClick={() => {
                      const body = generateTemplate(
                        selected.template_email, form, selected);
                      const subject = encodeURIComponent(
                        `Laporan ${selected.name} - ${form.nama}`);
                      window.location.href =
                        `mailto:${selected.contact_email}` +
                        `?subject=${subject}` +
                        `&body=${encodeURIComponent(body)}`;
                    }} style={{
                      flex: 1, background: '#084463',
                      border: 'none', borderRadius: 10,
                      padding: '10px', fontFamily: 'Inter',
                      fontSize: 12, fontWeight: 600,
                      color: '#1E2938', cursor: 'pointer',
                    }}>Buka Email App</button>
                  </div>
                </div>
              )}
            </div>

            <p style={{ fontFamily: 'Inter', fontSize: 11,
              color: '#9CA3AF', textAlign: 'center',
              marginTop: 16, lineHeight: 1.5 }}>
              Laporan ini juga tersimpan di akunmu
              untuk referensi di masa depan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
