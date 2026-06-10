"use client";

import { useState, useMemo } from "react";
import {
  Shield, Phone, BookOpen, MessageCircle, Heart, Users,
  ChevronRight, ExternalLink, X, AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import type { SafeCategory } from "@/lib/safe-space-data";
import {
  SAFE_CATEGORIES, EMERGENCY_CONTACTS, RESOURCES, SUPPORT_GUIDES,
  SAFE_STORIES, SAFE_MENTORS, SAFE_CIRCLES,
  getGuideForCategory, detectSafeCategories,
} from "@/lib/safe-space-data";

type View = "main" | "resources" | "emergency" | "guide" | "stories" | "mentors" | "circles" | "guides" | "contacts";

export function SafeSpaceModal({
  open,
  onClose,
  storyCategory,
}: {
  open: boolean;
  onClose: () => void;
  storyCategory: string;
}) {
  const [view, setView] = useState<View>("main");
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const safeCategories = useMemo(() => detectSafeCategories(storyCategory), [storyCategory]);
  const isSensitive = safeCategories.length > 0;

  if (!open) return null;

  const guides = SUPPORT_GUIDES;
  const allResources = RESOURCES;
  const contacts = EMERGENCY_CONTACTS;

  function renderMain() {
    return (
      <div className="space-y-3">
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Safe Space</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kamu tidak sendiri. Kami di sini untuk mendukungmu.
          </p>
        </div>

        {isSensitive && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              Cerita yang kamu baca mengandung topik sensitif. Jika kamu
              mengalami hal serupa, kami menyediakan dukungan.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setView("emergency")}
            className="p-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-colors text-left cursor-pointer"
          >
            <Phone className="w-5 h-5 text-red-500 mb-1" />
            <p className="text-xs font-semibold text-gray-900">Kontak Darurat</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Hotline & bantuan langsung</p>
          </button>
          <button
            onClick={() => setView("resources")}
            className="p-3 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-left cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-blue-500 mb-1" />
            <p className="text-xs font-semibold text-gray-900">Pusat Sumber Daya</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Artikel & panduan</p>
          </button>
          <button
            onClick={() => setView("guides")}
            className="p-3 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors text-left cursor-pointer"
          >
            <Heart className="w-5 h-5 text-green-500 mb-1" />
            <p className="text-xs font-semibold text-gray-900">Panduan Langkah</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Yang harus dilakukan</p>
          </button>
          <button
            onClick={() => setView("contacts")}
            className="p-3 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors text-left cursor-pointer"
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

  function renderEmergency() {
    return (
      <div className="space-y-3">
        <button onClick={() => setView("main")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer mb-2">
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

  function renderResources() {
    return (
      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        <button onClick={() => setView("main")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer mb-2 sticky top-0 bg-white pb-1">
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

  function renderGuides() {
    const guide = selectedGuide
      ? guides.find((g) => g.id === selectedGuide)
      : null;

    if (guide) {
      return (
        <div className="space-y-3">
          <button onClick={() => setSelectedGuide(null)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer mb-2">
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
        <button onClick={() => setView("main")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer mb-2">
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
                className="w-full p-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/30 transition-colors text-left cursor-pointer"
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

  function renderContacts() {
    return (
      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        <button onClick={() => setView("main")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer mb-2 sticky top-0 bg-white pb-1">
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

  function renderView() {
    switch (view) {
      case "main": return renderMain();
      case "emergency": return renderEmergency();
      case "resources": return renderResources();
      case "guides": return renderGuides();
      case "contacts": return renderContacts();
      default: return renderMain();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl px-5 pt-5 pb-8 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
        {renderView()}
      </div>
    </div>
  );
}

export function NeedHelpButton({
  onClick,
  storyCategory,
}: {
  onClick: () => void;
  storyCategory: string;
}) {
  const safeCategories = detectSafeCategories(storyCategory);
  const isSensitive = safeCategories.length > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
        isSensitive
          ? "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm"
          : "bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-sm"
      }`}
    >
      <Shield className="w-4 h-4" />
      <span>{isSensitive ? "Butuh Bantuan? — Safe Space" : "Pusat Bantuan & Sumber Daya"}</span>
    </button>
  );
}
