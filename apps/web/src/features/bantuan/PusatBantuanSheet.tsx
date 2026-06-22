"use client";

import { useState } from "react";
import { X, Phone, Shield, BookOpen, Heart, MessageCircle, Users, ChevronRight, ExternalLink, ArrowLeft, AlertTriangle } from "lucide-react";
import { LEMBAGA_BANTUAN, KATEGORI_LABEL } from "@/lib/bantuan-data";
import {
  SAFE_CATEGORIES, EMERGENCY_CONTACTS, RESOURCES, SUPPORT_GUIDES,
  SAFE_STORIES, SAFE_MENTORS, SAFE_CIRCLES,
  detectSafeCategories,
} from "@/lib/safe-space-data";
import type { SafeCategory } from "@/lib/safe-space-data";

type Tab = "bantuan" | "safe" | "darurat";
type SafeView = "main" | "resources" | "emergency" | "guide" | "contacts" | "guides";

const KATEGORI_KEYS = Object.keys(KATEGORI_LABEL);

function waUrl(nomor: string, kategori: string): string {
  const text = encodeURIComponent(
    `Halo, saya butuh bantuan terkait ${kategori}. Saya tahu dari Beautifio. Mohon info lebih lanjut.`
  );
  return `https://wa.me/${nomor}?text=${text}`;
}

export function PusatBantuanSheet({
  open,
  onClose,
  initialTab,
  storyCategory,
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
  storyCategory?: string;
}) {
  const [tab, setTab] = useState<Tab>(initialTab || "bantuan");
  const [selectedKategori, setSelectedKategori] = useState<string | null>(null);
  const [safeView, setSafeView] = useState<SafeView>("main");
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const safeCategories = storyCategory ? detectSafeCategories(storyCategory) : [];
  const isSensitive = safeCategories.length > 0;

  if (!open) return null;

  const filtered = selectedKategori
    ? LEMBAGA_BANTUAN.filter((l) => l.kategori === selectedKategori)
    : [];

  const guides = SUPPORT_GUIDES;
  const allResources = RESOURCES;
  const contacts = EMERGENCY_CONTACTS;

  function renderBantuanTab() {
    if (selectedKategori) {
      return (
        <div>
          <button
            onClick={() => setSelectedKategori(null)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
          >
            ← Kembali ke kategori
          </button>
          <p className="text-xs text-gray-400 mb-3">
            Klik lembaga untuk menghubungi via WhatsApp.
          </p>
          <div className="space-y-3">
            {filtered.map((l) => (
              <a
                key={l.id}
                href={waUrl(l.nomor, KATEGORI_LABEL[l.kategori])}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{l.nama}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{l.deskripsi}</p>
                    {l.jamOperasional && (
                      <p className="text-xs text-gray-400 mt-1">🕐 {l.jamOperasional}</p>
                    )}
                    <p className="text-xs text-gray-400">{l.wilayah}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div>
        {isSensitive && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              Konten yang kamu lihat mengandung topik sensitif. Pilih lembaga bantuan yang sesuai.
            </p>
          </div>
        )}
        <p className="text-sm text-gray-500 mb-4">
          Pilih kategori bantuan yang kamu butuhkan. Kami akan menghubungkanmu ke lembaga terpercaya.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {KATEGORI_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedKategori(key)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 transition-all"
            >
              <span className="text-xl">{KATEGORI_LABEL[key].split(" ")[0]}</span>
              <span className="text-sm font-medium text-gray-700">
                {KATEGORI_LABEL[key].replace(/^(\S+)\s/, "")}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderSafeMain() {
    return (
      <div className="space-y-3">
        {isSensitive && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              Jika kamu mengalami hal serupa, kami menyediakan dukungan dan panduan.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSafeView("emergency")}
            className="p-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-colors text-left"
          >
            <Phone className="w-5 h-5 text-red-500 mb-1" />
            <p className="text-xs font-semibold text-gray-900">Kontak Darurat</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Hotline & bantuan langsung</p>
          </button>
          <button
            onClick={() => setSafeView("resources")}
            className="p-3 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-left"
          >
            <BookOpen className="w-5 h-5 text-blue-500 mb-1" />
            <p className="text-xs font-semibold text-gray-900">Pusat Sumber Daya</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Artikel & panduan</p>
          </button>
          <button
            onClick={() => setSafeView("guides")}
            className="p-3 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors text-left"
          >
            <Heart className="w-5 h-5 text-green-500 mb-1" />
            <p className="text-xs font-semibold text-gray-900">Panduan Langkah</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Yang harus dilakukan</p>
          </button>
          <button
            onClick={() => setSafeView("contacts")}
            className="p-3 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors text-left"
          >
            <MessageCircle className="w-5 h-5 text-purple-500 mb-1" />
            <p className="text-xs font-semibold text-gray-900">Dukungan Komunitas</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Circle & teman sebaya</p>
          </button>
        </div>
        {safeCategories.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Kategori yang terdeteksi:</p>
            <div className="flex flex-wrap gap-1.5">
              {safeCategories.map((cat) => {
                const info = SAFE_CATEGORIES.find((c) => c.key === cat);
                return info ? (
                  <span key={cat} className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
                    {info.emoji} {info.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderSafeEmergency() {
    return (
      <div className="space-y-3">
        <button onClick={() => setSafeView("main")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>
        <h3 className="text-sm font-bold text-gray-900">Kontak Darurat</h3>
        <p className="text-xs text-gray-500">Hubungi salah satu kontak berikut jika kamu dalam situasi darurat.</p>
        <div className="space-y-2">
          {contacts.map((c) => (
            <div key={c.name} className="p-3 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                {c.phone.startsWith("http") ? (
                  <a href={c.phone} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                    Buka <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <a href={`tel:${c.phone}`} className="text-sm font-bold text-red-600 hover:text-red-700">{c.phone}</a>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderSafeResources() {
    return (
      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        <button onClick={() => setSafeView("main")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-2 sticky top-0 bg-white pb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>
        <h3 className="text-sm font-bold text-gray-900">Pusat Sumber Daya</h3>
        <p className="text-xs text-gray-500">Artikel dan panduan untuk membantu kamu.</p>
        <div className="space-y-2">
          {allResources.map((r) => {
            const cat = SAFE_CATEGORIES.find((c) => c.key === r.category);
            return (
              <div key={r.id} className="p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{cat?.emoji}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{cat?.label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{r.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSafeGuides() {
    const guide = selectedGuide
      ? guides.find((g) => g.id === selectedGuide)
      : null;

    if (guide) {
      return (
        <div className="space-y-3">
          <button onClick={() => setSelectedGuide(null)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Semua panduan
          </button>
          <h3 className="text-sm font-bold text-gray-900">{guide.title}</h3>
          <ol className="space-y-2">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-green-50 border border-green-100">
                <span className="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-gray-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <button onClick={() => setSafeView("main")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>
        <h3 className="text-sm font-bold text-gray-900">Panduan Langkah</h3>
        <p className="text-xs text-gray-500">Pilih panduan sesuai situasimu.</p>
        <div className="space-y-2">
          {guides.map((g) => {
            const cat = SAFE_CATEGORIES.find((c) => c.key === g.category);
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGuide(g.id)}
                className="w-full p-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/30 transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{cat?.emoji}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{cat?.label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{g.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{g.steps.length} langkah</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSafeContacts() {
    return (
      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        <button onClick={() => setSafeView("main")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-2 sticky top-0 bg-white pb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>
        <h3 className="text-sm font-bold text-gray-900">Dukungan Komunitas</h3>
        <p className="text-xs text-gray-500">Temukan dukungan dari circle dan teman sebaya.</p>
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Circle Terkait</h4>
          <div className="space-y-2">
            {SAFE_CIRCLES.map((c) => (
              <div key={c.id} className="p-3 rounded-xl border border-purple-100 bg-purple-50/30">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                </div>
                <p className="text-xs text-gray-500">{c.description}</p>
                <p className="text-[10px] text-gray-400 mt-1">{c.memberCount} anggota</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Mentor Pendukung</h4>
          <div className="space-y-2">
            {SAFE_MENTORS.map((m) => (
              <div key={m.slug} className="p-3 rounded-xl border border-amber-100 bg-amber-50/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-700">
                    {m.initials}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                </div>
                <p className="text-xs font-medium text-amber-700">{m.expertise}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Cerita Terkait</h4>
          <div className="space-y-2">
            {SAFE_STORIES.map((s) => (
              <div key={s.slug} className="p-3 rounded-xl border border-gray-200">
                <p className="text-xs font-semibold text-gray-900">{s.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderSafeTab() {
    if (safeView !== "main") {
      switch (safeView) {
        case "emergency": return renderSafeEmergency();
        case "resources": return renderSafeResources();
        case "guides": return renderSafeGuides();
        case "contacts": return renderSafeContacts();
        default: return renderSafeMain();
      }
    }
    return renderSafeMain();
  }

  function renderDaruratTab() {
    return (
      <div className="space-y-4">
        <div className="text-center mb-2">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-7 h-7 text-red-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Kontak Darurat</h3>
          <p className="text-sm text-gray-500 mt-1">
            Hubungi segera jika dalam keadaan darurat
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {contacts.slice(0, 3).map((c) => (
            <a
              key={c.name}
              href={c.phone.startsWith("http") ? c.phone : `tel:${c.phone}`}
              target={c.phone.startsWith("http") ? "_blank" : undefined}
              rel={c.phone.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-red-600 font-medium">{c.phone}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{c.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            </a>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-800 font-medium mb-2">Semua kontak darurat:</p>
          <div className="space-y-2">
            {contacts.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{c.name}</span>
                <span className="text-red-600 font-medium">{c.phone}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-center pt-2">
          Jika dalam keadaan darurat yang mengancam jiwa, segera hubungi <strong>112</strong>.
        </p>
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "bantuan", label: "Butuh Bantuan", icon: "📞" },
    { key: "safe", label: "Safe Space", icon: "🛡️" },
    { key: "darurat", label: "Darurat", icon: "🆘" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-gray-900">Pusat Bantuan</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelectedKategori(null); setSafeView("main"); setSelectedGuide(null); }}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-amber-500 text-amber-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {tab === "bantuan" && renderBantuanTab()}
          {tab === "safe" && renderSafeTab()}
          {tab === "darurat" && renderDaruratTab()}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-[11px] text-gray-400 text-center">
            Jika dalam keadaan darurat yang mengancam jiwa, segera hubungi <strong>112</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
