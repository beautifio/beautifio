"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface CareSchedule {
  id: string; category: string; is_online: boolean;
  next_available: string | null; message: string | null;
  updated_at: string | null;
}

interface CareSession {
  id: string; category: string; status: string;
  user_name: string; user_phone: string | null;
  user_address: string | null; created_at: string;
  messages: { count: number }[];
}

interface CareCategory {
  id: string; name: string; emoji: string; description: string;
  contact_phone: string | null; contact_wa: string | null;
  contact_email: string | null; is_active: boolean;
  display_order: number;
}

const categoryEmoji: Record<string,string> = {
  psikologi: '🧠', agama: '🕌', umum: '📞',
};

export default function AdminCarePage() {
  const [activeTab, setActiveTab] = useState<'status'|'sessions'|'categories'>('status');
  const [schedules, setSchedules] = useState<CareSchedule[]>([]);
  const [sessions, setSessions] = useState<CareSession[]>([]);
  const [categories, setCategories] = useState<CareCategory[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.from('care_officer_schedule')
      .select('*').order('category')
      .then(({ data }) => setSchedules(data ?? []));
    supabase.from('care_chat_sessions')
      .select('*, messages:care_chat_messages(count)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setSessions(data ?? []));
    supabase.from('care_categories')
      .select('*').order('display_order')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  async function toggleOnline(schedule: CareSchedule) {
    setSaving(schedule.id);
    const supabase = createClient();
    await supabase?.from('care_officer_schedule')
      .update({
        is_online: !schedule.is_online,
        updated_at: new Date().toISOString(),
      })
      .eq('id', schedule.id);
    setSchedules(prev => prev.map(s =>
      s.id === schedule.id ? { ...s, is_online: !s.is_online } : s
    ));
    setSaving(null);
  }

  async function updateNextAvailable(scheduleId: string, value: string) {
    const supabase = createClient();
    await supabase?.from('care_officer_schedule')
      .update({
        next_available: value || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scheduleId);
    setSchedules(prev => prev.map(s =>
      s.id === scheduleId ? { ...s, next_available: value } : s
    ));
  }

  async function updateMessage(scheduleId: string, value: string) {
    const supabase = createClient();
    await supabase?.from('care_officer_schedule')
      .update({
        message: value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scheduleId);
  }

  const tabs = [
    { key: 'status' as const, label: 'Status Petugas' },
    { key: 'sessions' as const, label: `Sesi Chat (${sessions.length})` },
    { key: 'categories' as const, label: 'Kategori' },
  ];

  return (
    <div style={{ maxWidth: 900, padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Poppins', fontSize: 22,
          fontWeight: 700, color: '#1E2938', margin: '0 0 4px' }}>
          Beautifio Care
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 13,
          color: '#647488', margin: 0 }}>
          Kelola petugas, sesi chat, dan kategori bantuan
        </p>
      </div>

      <div style={{ display: 'flex', gap: 4,
        borderBottom: '1px solid #E2E8F0', marginBottom: 24 }}>
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none', border: 'none',
              padding: '10px 16px', cursor: 'pointer',
              fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
              color: activeTab === tab.key ? '#084463' : '#647488',
              borderBottom: activeTab === tab.key
                ? '2px solid #084463' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.2s ease',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* STATUS PETUGAS */}
      {activeTab === 'status' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {schedules.map(schedule => (
            <div key={schedule.id} style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: 16, padding: 20,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex',
                  alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>
                    {categoryEmoji[schedule.category] || '💬'}
                  </span>
                  <div>
                    <p style={{ fontFamily: 'Poppins', fontSize: 15,
                      fontWeight: 700, color: '#1E2938', margin: 0,
                      textTransform: 'capitalize' }}>
                      {schedule.category}
                    </p>
                    <p style={{ fontFamily: 'Inter', fontSize: 12,
                      color: schedule.is_online ? '#15803D' : '#9CA3AF',
                      margin: 0 }}>
                      {schedule.is_online ? '● Online' : '● Offline'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex',
                  alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 13,
                    color: '#647488' }}>
                    {schedule.is_online ? 'Online' : 'Offline'}
                  </span>
                  <button
                    onClick={() => toggleOnline(schedule)}
                    disabled={saving === schedule.id}
                    style={{
                      width: 52, height: 28, borderRadius: 14,
                      border: 'none', cursor: 'pointer',
                      position: 'relative',
                      background: schedule.is_online
                        ? '#22C55E' : '#E2E8F0',
                      opacity: saving === schedule.id ? 0.6 : 1,
                      transition: 'background 0.2s ease',
                    }}>
                    <div style={{
                      position: 'absolute', top: 3,
                      left: schedule.is_online ? 27 : 3,
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#FFFFFF',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s ease',
                    }} />
                  </button>
                </div>
              </div>

              {!schedule.is_online && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontFamily: 'Inter', fontSize: 12,
                    fontWeight: 600, color: '#647488',
                    display: 'block', marginBottom: 6 }}>
                    Petugas kembali pada:
                  </label>
                  <input type="datetime-local"
                    defaultValue={schedule.next_available
                      ? new Date(schedule.next_available)
                          .toISOString().slice(0, 16)
                      : ''}
                    onChange={e => updateNextAvailable(
                      schedule.id,
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : ''
                    )}
                    style={{ width: '100%',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 10, padding: '10px 14px',
                      fontFamily: 'Inter', fontSize: 13,
                      boxSizing: 'border-box', outline: 'none',
                      maxWidth: 280 }} />
                </div>
              )}

              <div>
                <label style={{ fontFamily: 'Inter', fontSize: 12,
                  fontWeight: 600, color: '#647488',
                  display: 'block', marginBottom: 6 }}>
                  Pesan untuk user saat offline:
                </label>
                <input defaultValue={schedule.message || ''}
                  onBlur={e => updateMessage(
                    schedule.id, e.target.value)}
                  placeholder="Tulis pesan..."
                  style={{ width: '100%',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 10, padding: '10px 14px',
                    fontFamily: 'Inter', fontSize: 13,
                    boxSizing: 'border-box', outline: 'none' }} />
                <p style={{ fontFamily: 'Inter', fontSize: 11,
                  color: '#9CA3AF', marginTop: 4 }}>
                  Pesan ini tampil di ruang chat saat petugas offline
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SESI CHAT */}
      {activeTab === 'sessions' && (
        <div>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <p style={{ fontFamily: 'Inter', fontSize: 14,
                color: '#647488' }}>Belum ada sesi chat</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%',
                borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    {['Nama User','Kategori','Status','Waktu','Aksi'].map(h => (
                      <th key={h} style={{ fontFamily: 'Inter',
                        fontSize: 11, fontWeight: 600,
                        color: '#647488', textAlign: 'left',
                        padding: '8px 12px', textTransform: 'uppercase',
                        letterSpacing: '0.5px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <tr key={session.id}
                      style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: 12,
                        fontFamily: 'Inter', fontSize: 13,
                        color: '#1E2938', fontWeight: 500 }}>
                        {session.user_name}
                        {session.user_phone && (
                          <div style={{ fontSize: 11, color: '#647488' }}>
                            {session.user_phone}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{ fontFamily: 'Inter',
                          fontSize: 12, textTransform: 'capitalize',
                          color: '#1E2938' }}>
                          {categoryEmoji[session.category]}{' '}
                          {session.category}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          background: session.status === 'active'
                            ? '#F0FDF4'
                            : session.status === 'waiting'
                            ? '#FFF8E7' : '#F1F5F9',
                          color: session.status === 'active'
                            ? '#15803D'
                            : session.status === 'waiting'
                            ? '#92400E' : '#647488',
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 11, fontFamily: 'Inter',
                          fontWeight: 600 }}>
                          {session.status === 'active' ? 'Aktif'
                            : session.status === 'waiting'
                            ? 'Menunggu' : 'Selesai'}
                        </span>
                      </td>
                      <td style={{ padding: 12,
                        fontFamily: 'Inter', fontSize: 12,
                        color: '#647488' }}>
                        {new Date(session.created_at)
                          .toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short',
                            hour: '2-digit', minute: '2-digit',
                          })}
                      </td>
                      <td style={{ padding: 12 }}>
                        {session.status !== 'closed' && (
                          <Link href={`/admin/care/chat/${session.id}`}
                            style={{
                              background: '#084463', color: '#FFFFFF',
                              padding: '6px 14px', borderRadius: 8,
                              fontSize: 12, fontFamily: 'Inter',
                              fontWeight: 600, textDecoration: 'none',
                              display: 'inline-block',
                            }}>
                            Balas
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* KATEGORI */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categories.map(cat => (
            <div key={cat.id} style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: 14, padding: '16px 20px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                <div>
                  <p style={{ fontFamily: 'Poppins', fontSize: 14,
                    fontWeight: 600, color: '#1E2938', margin: 0 }}>
                    {cat.name}
                  </p>
                  <p style={{ fontFamily: 'Inter', fontSize: 11,
                    color: '#647488', margin: 0 }}>
                    {cat.contact_phone && `📞 ${cat.contact_phone}`}
                    {cat.contact_wa && ` · 💬 ${cat.contact_wa}`}
                    {cat.contact_email && ` · 📧 ${cat.contact_email}`}
                  </p>
                </div>
              </div>
              <span style={{
                background: cat.is_active ? '#F0FDF4' : '#F1F5F9',
                color: cat.is_active ? '#15803D' : '#647488',
                padding: '3px 10px', borderRadius: 20,
                fontSize: 11, fontFamily: 'Inter', fontWeight: 600,
              }}>
                {cat.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          ))}
          <p style={{ fontFamily: 'Inter', fontSize: 12,
            color: '#9CA3AF', textAlign: 'center' }}>
            Edit detail kategori via Supabase Dashboard
          </p>
        </div>
      )}
    </div>
  );
}
