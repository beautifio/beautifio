"use client"

import { useEffect, useState, useCallback } from "react"
import { listAdBanners, createAdBanner, updateAdBanner, toggleAdBanner, deleteAdBanner, getAdStats } from "@/lib/tebak/ads"
import { UploadWithPreview } from "@/features/media/UploadWithPreview"

type Banner = {
  id: string; name: string; image_url: string; click_url: string | null
  location: string; is_active: boolean; created_at: string
  impression_count?: number; click_count?: number
}

const SIZE_GUIDE: Record<string, string> = {
  match_intro: "720 × 200 px (lebar penuh, di bawah VS)",
  panduan: "320 × 120 px (kecil, di bawah teks Panduan)",
  jeda: "720 × 200 px (lebar penuh, di bawah jeda antar-soal)",
}

const ASPECT_MAP: Record<string, number> = {
  match_intro: 720 / 200,
  panduan: 320 / 120,
  jeda: 720 / 200,
}

export default function AdminAdsPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [form, setForm] = useState({ name: '', image_url: '', click_url: '', location: 'match_intro' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadKey, setUploadKey] = useState(0)

  const load = useCallback(async () => {
    const data = await getAdStats()
    setBanners(data as Banner[])
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async () => {
    if (!form.name || !form.image_url) { setMsg('Nama & gambar wajib diisi'); return }
    setSaving(true)
    setMsg('')
    try {
      let ok: boolean
      if (editingId) {
        ok = await updateAdBanner(editingId, { name: form.name, image_url: form.image_url, click_url: form.click_url || undefined, location: form.location })
      } else {
        ok = await createAdBanner({ name: form.name, image_url: form.image_url, click_url: form.click_url || undefined, location: form.location })
      }
      if (ok) {
        setMsg(editingId ? 'Banner diupdate!' : 'Banner dibuat!')
        resetForm()
        load()
      } else {
        setMsg('Gagal menyimpan banner')
      }
    } catch {
      setMsg('Gagal menyimpan banner')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (b: Banner) => {
    setEditingId(b.id)
    setForm({ name: b.name, image_url: b.image_url, click_url: b.click_url || '', location: b.location })
    setUploadKey(k => k + 1)
    setMsg('')
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({ name: '', image_url: '', click_url: '', location: 'match_intro' })
    setUploadKey(k => k + 1)
    setMsg('')
  }

  const handleToggle = async (id: string, active: boolean) => {
    await toggleAdBanner(id, active)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus banner ini?')) return
    await deleteAdBanner(id)
    load()
  }

  const getCount = (b: Banner, type: 'impressions' | 'clicks') => {
    return type === 'impressions' ? (b.impression_count ?? 0) : (b.click_count ?? 0)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Ad Banners — Admin</h1>

      {/* Panduan ukuran */}
      <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-1">
        <p className="text-sm font-semibold mb-2">📐 Panduan Ukuran Gambar</p>
        {Object.entries(SIZE_GUIDE).map(([loc, size]) => (
          <p key={loc} className="text-xs text-text-secondary">
            <span className="font-mono text-accent">{loc}</span> — {size}
          </p>
        ))}
      </div>

      {/* Form tambah / edit */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold">{editingId ? 'Edit Banner' : 'Tambah Banner Baru'}</p>
        <input className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm" placeholder="Nama banner" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <div className="space-y-2">
          <UploadWithPreview
            key={uploadKey}
            label="Upload Gambar Banner"
            aspectRatio={ASPECT_MAP[form.location] ?? 16 / 9}
            hint={SIZE_GUIDE[form.location]?.split(" ").slice(0, 3).join(" ") ?? ""}
            bucketName="landing-assets"
            currentUrl={editingId ? form.image_url : undefined}
            onUploadSuccess={(url) => setForm({ ...form, image_url: url })}
          />
        </div>
        <input className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm" placeholder="URL klik (opsional)" value={form.click_url} onChange={e => setForm({ ...form, click_url: e.target.value })} />
        <select className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
          <option value="match_intro">Match Intro</option>
          <option value="panduan">Panduan</option>
          <option value="jeda">Jeda</option>
        </select>
        <div className="flex gap-2">
          <button onClick={handleSubmit} disabled={saving || !form.name || !form.image_url} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
          </button>
          {editingId && (
            <button onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-muted">
              Batal
            </button>
          )}
        </div>
        {msg && <p className={`text-xs font-medium ${msg.includes('dibuat') || msg.includes('diupdate') ? 'text-green-500' : 'text-red-500'}`}>{msg}</p>}
      </div>

      {/* Daftar banner */}
      <div className="space-y-4">
        <p className="text-sm font-semibold">Daftar Banner ({banners.length})</p>
        {banners.length === 0 ? (
          <p className="text-xs text-text-secondary">Belum ada banner.</p>
        ) : (
          banners.map(b => (
            <div key={b.id} className={`bg-surface border rounded-xl p-4 flex gap-4 items-start ${b.is_active ? 'border-accent/30' : 'border-border opacity-60'}`}>
              <img src={b.image_url} alt="" className="w-24 h-16 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{b.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-text-secondary font-mono">{b.location}</span>
                </div>
                <div className="flex gap-4 text-xs text-text-secondary">
                  <span>👁 {getCount(b, 'impressions')}</span>
                  <span>👆 {getCount(b, 'clicks')}</span>
                  <span>{getCount(b, 'impressions') > 0 ? Math.round(getCount(b, 'clicks') / getCount(b, 'impressions') * 100 * 10) / 10 : 0}% CTR</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(b)} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400">Edit</button>
                  <button onClick={() => handleToggle(b.id, !b.is_active)} className={`text-xs px-2 py-1 rounded ${b.is_active ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {b.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400">Hapus</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
