"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { UploadWithPreview } from "@/features/media/UploadWithPreview";

type Tab = "hero" | "banners" | "logo";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  redirect_url: string | null;
  redirect_label: string | null;
  is_active: boolean;
  display_order: number;
  interval_seconds?: number;
}

const MAX_SLOTS = 10;
const INTERVAL_OPTIONS = [2, 3, 4, 5, 8, 10];

export default function MediaManagerPage() {
  const [tab, setTab] = useState<Tab>("hero");

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold mb-6">🖼️ Media Manager</h1>

      <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
        {[
          { id: "hero" as Tab, label: "Hero Landing" },
          { id: "banners" as Tab, label: "Banner Beranda" },
          { id: "logo" as Tab, label: "Logo Website" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" && <HeroSection />}
      {tab === "banners" && <BannersSection />}
      {tab === "logo" && <LogoSection />}
    </div>
  );
}

/* ─── SECTION A: HERO — 2 SLOT (DESKTOP + MOBILE) ─── */

const DESKTOP_SPECS = [
  "📐 Ukuran: 1920 × 1080px (rasio 16:9)",
  "📁 Format: JPG, PNG, WebP, GIF",
  "📦 Maks: 5MB",
  "💡 Gambar landscape/horizontal untuk tampilan desktop",
];

const MOBILE_SPECS = [
  "📐 Ukuran: 390 × 844px (rasio 9:16)",
  "📁 Format: JPG, PNG, WebP, GIF",
  "📦 Maks: 5MB",
  "💡 Gambar portrait/vertikal untuk tampilan HP",
];

function HeroSection() {
  const [desktopUrl, setDesktopUrl] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");

  useEffect(() => {
    if (!supabase) return;
    loadHero();
  }, []);

  async function loadHero() {
    const { data } = await supabase!.from("app_settings").select("key, value");
    if (!data) return;
    const desktop = data.find((d: any) => d.key === "hero_image_url");
    const mobile = data.find((d: any) => d.key === "hero_image_mobile_url");
    if (desktop?.value) setDesktopUrl(desktop.value);
    if (mobile?.value) setMobileUrl(mobile.value);
  }

  async function handleDesktopSuccess(url: string) {
    await supabase!.from("app_settings").upsert({ key: "hero_image_url", value: url, updated_at: new Date().toISOString() });
    setDesktopUrl(url);
  }

  async function handleMobileSuccess(url: string) {
    await supabase!.from("app_settings").upsert({ key: "hero_image_mobile_url", value: url, updated_at: new Date().toISOString() });
    setMobileUrl(url);
  }

  return (
    <div className="space-y-8">
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
        <p className="font-semibold mb-1">💡 Cara Kerja Hero Image</p>
        <p>Desktop (&ge;768px) pakai Hero Desktop. HP (&lt;768px) pakai Hero Mobile (fallback ke Desktop kalau kosong).</p>
      </div>

      {/* Slot A: Desktop */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">🖥️ Slot A — Hero Desktop</h3>
        <UploadWithPreview
          label="Hero Desktop"
          currentUrl={desktopUrl}
          aspectRatio={16 / 9}
          hint="16:9"
          specs={DESKTOP_SPECS}
          onUploadSuccess={handleDesktopSuccess}
        />
      </div>

      {/* Slot B: Mobile */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">📱 Slot B — Hero Mobile</h3>
        <UploadWithPreview
          label="Hero Mobile"
          currentUrl={mobileUrl}
          aspectRatio={9 / 16}
          hint="9:16"
          specs={MOBILE_SPECS}
          onUploadSuccess={handleMobileSuccess}
        />
      </div>
    </div>
  );
}

/* ─── SECTION B: BANNER BERANDA (10 SLOT TETAP) ─── */

const BANNER_SPECS = [
  "📐 Ukuran banner: 1200 × 300px (rasio 4:1)",
  "📁 Format: JPG, PNG, WebP, GIF",
  "📦 Maks: 5MB",
  "💡 Gambar landscape horizontal. Di mobile akan auto-crop bagian tengah. Hindari teks penting di pinggir kiri/kanan.",
];

function BannersSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [modalSlot, setModalSlot] = useState<number | null>(null);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);

  useEffect(() => {
    if (!supabase) return;
    loadBanners();
  }, []);

  async function loadBanners() {
    const { data } = await supabase!.from("home_banners").select("*").order("display_order", { ascending: true });
    if (data) setBanners(data);
  }

  const slots: (Banner | null)[] = Array.from({ length: MAX_SLOTS }, (_, i) =>
    banners.find((b) => b.display_order === i) || null
  );

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-0.5">
        {BANNER_SPECS.map((s, i) => <p key={i}>{s}</p>)}
      </div>

      <p className="text-sm text-gray-500">Maksimal {MAX_SLOTS} banner. Atur urutan tampil sesuai slot.</p>

      <div className="grid grid-cols-2 gap-3">
        {slots.map((banner, idx) => (
          <SlotCard
            key={idx}
            slotIndex={idx}
            banner={banner}
            onAdd={() => setModalSlot(idx)}
            onEdit={() => setEditBanner(banner)}
            onRefresh={loadBanners}
          />
        ))}
      </div>

      {modalSlot !== null && (
        <BannerFormModal slotIndex={modalSlot} onClose={() => setModalSlot(null)} onDone={() => { setModalSlot(null); loadBanners(); }} />
      )}
      {editBanner && (
        <EditBannerModal banner={editBanner} onClose={() => setEditBanner(null)} onDone={() => { setEditBanner(null); loadBanners(); }} />
      )}
    </div>
  );
}

function SlotCard({ slotIndex, banner, onAdd, onEdit, onRefresh }: {
  slotIndex: number; banner: Banner | null; onAdd: () => void; onEdit: () => void; onRefresh: () => void;
}) {
  async function handleToggle(id: string, current: boolean) {
    await supabase!.from("home_banners").update({ is_active: !current }).eq("id", id);
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm(`Hapus banner dari slot ${slotIndex + 1}?`)) return;
    await supabase!.from("home_banners").delete().eq("id", id);
    onRefresh();
  }

  if (!banner) {
    return (
      <button onClick={onAdd}
        className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer min-h-[160px]">
        <span className="text-2xl text-gray-300">+</span>
        <span className="text-xs text-gray-400">Slot {slotIndex + 1}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="aspect-[4/1] bg-gray-100 overflow-hidden">
        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-3 space-y-2">
        <p className="text-sm font-medium text-gray-900 truncate">{banner.title}</p>
        <p className="text-[10px] text-gray-400">Slot {slotIndex + 1} · {banner.interval_seconds || 4}s</p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => handleToggle(banner.id, banner.is_active)}
            className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${banner.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {banner.is_active ? "Aktif" : "Nonaktif"}
          </button>
          <button onClick={onEdit} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer">Edit</button>
          <button onClick={() => handleDelete(banner.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 cursor-pointer">🗑</button>
        </div>
      </div>
    </div>
  );
}

function BannerFormModal({ slotIndex, onClose, onDone }: {
  slotIndex: number; onClose: () => void; onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [redirectLabel, setRedirectLabel] = useState("");
  const [intervalSec, setIntervalSec] = useState(4);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleInsert(url: string) {
    if (!title || !url || !supabase) return;
    setSaving(true);
    setError("");
    try {
      const { error: insertErr } = await supabase.from("home_banners").insert({
        title, image_url: url, redirect_url: redirectUrl || null, redirect_label: redirectLabel || null,
        is_active: true, display_order: slotIndex, interval_seconds: intervalSec,
      });
      if (insertErr) throw insertErr;
      onDone();
    } catch (err: any) {
      setError(err?.message || "Gagal simpan banner");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Tambah Banner — Slot {slotIndex + 1}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
        </div>

        {BANNER_SPECS.map((s, i) => <p key={i} className="text-[11px] text-amber-700 mb-0.5">{s}</p>)}

        <div className="mt-3">
          <UploadWithPreview
            label={`Banner-${slotIndex}`}
            aspectRatio={4 / 1}
            hint="4:1"
            onUploadSuccess={handleInsert}
          />
        </div>

        <div className="mt-4 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul banner"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#084463]" />
          <input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="Link tujuan (opsional, misal /voucher)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#084463]" />
          <input value={redirectLabel} onChange={(e) => setRedirectLabel(e.target.value)} placeholder="Label tombol CTA (opsional)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#084463]" />
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Interval slide (detik)</label>
            <div className="flex gap-2">
              {INTERVAL_OPTIONS.map((s) => (
                <button key={s} onClick={() => setIntervalSec(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${intervalSec === s ? "bg-[#084463] text-white border-[#084463]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                  {s}s
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {imageUrl && !saving && (
            <button onClick={() => handleInsert(imageUrl)} disabled={!title}
              className="w-full py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
              style={{ backgroundColor: "#084463", color: "#FFFFFF" }}>
              Simpan Banner
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditBannerModal({ banner, onClose, onDone }: {
  banner: Banner; onClose: () => void; onDone: () => void;
}) {
  const [title, setTitle] = useState(banner.title);
  const [imageUrl, setImageUrl] = useState(banner.image_url);
  const [redirectUrl, setRedirectUrl] = useState(banner.redirect_url || "");
  const [redirectLabel, setRedirectLabel] = useState(banner.redirect_label || "");
  const [intervalSec, setIntervalSec] = useState(banner.interval_seconds || 4);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title || !supabase) return;
    setSaving(true);
    setError("");
    try {
      await supabase.from("home_banners").update({
        title, image_url: imageUrl, redirect_url: redirectUrl || null, redirect_label: redirectLabel || null, interval_seconds: intervalSec,
      }).eq("id", banner.id);
      onDone();
    } catch (err: any) {
      setError(err?.message || "Gagal update banner");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Edit Banner — Slot {banner.display_order + 1}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
        </div>

        <UploadWithPreview label={`Banner-${banner.display_order}`} currentUrl={banner.image_url}
          aspectRatio={4 / 1} hint="4:1" onUploadSuccess={(url) => setImageUrl(url)} />

        <div className="mt-4 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul banner"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#084463]" />
          <input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="Link tujuan"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#084463]" />
          <input value={redirectLabel} onChange={(e) => setRedirectLabel(e.target.value)} placeholder="Label tombol CTA"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#084463]" />
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Interval slide (detik)</label>
            <div className="flex gap-2">
              {INTERVAL_OPTIONS.map((s) => (
                <button key={s} onClick={() => setIntervalSec(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${intervalSec === s ? "bg-[#084463] text-white border-[#084463]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                  {s}s
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleSave} disabled={!title || saving}
            className="w-full py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
            style={{ backgroundColor: "#084463", color: "#FFFFFF" }}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION C: LOGO ─── */

const LOGO_SPECS = [
  "📐 Ukuran: bebas, disarankan min 200px lebar",
  "📁 Format: PNG dengan background transparan (terbaik) atau SVG, JPG",
  "📦 Maks: 2MB",
  "💡 Gunakan versi logo dengan warna putih atau terang karena akan tampil di atas background gelap di landing page",
];

function LogoSection() {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (!supabase) return;
    loadLogo();
  }, []);

  async function loadLogo() {
    const { data } = await supabase!.from("app_settings").select("value").eq("key", "logo_url").single();
    if (data?.value) setCurrentUrl(data.value);
  }

  async function handleUploadSuccess(url: string) {
    await supabase!.from("app_settings").upsert({ key: "logo_url", value: url, updated_at: new Date().toISOString() });
    setCurrentUrl(url);
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Logo akan tampil di sidebar admin panel dan landing page.</p>
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-0.5 mb-4">
        {LOGO_SPECS.map((s, i) => <p key={i}>{s}</p>)}
      </div>
      <UploadWithPreview
        label="Logo"
        currentUrl={currentUrl}
        aspectRatio={1 / 1}
        maxSizeMb={2}
        hint="1:1"
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
