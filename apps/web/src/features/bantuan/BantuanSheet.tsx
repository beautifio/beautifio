"use client";

import { useState } from "react";
import { X, Phone, Shield } from "lucide-react";
import { LEMBAGA_BANTUAN, KATEGORI_LABEL } from "@/lib/bantuan-data";
import type { BantuanLembaga } from "@/lib/bantuan-data";

const KATEGORI_KEYS = Object.keys(KATEGORI_LABEL);

function waUrl(nomor: string, kategori: string): string {
  const text = encodeURIComponent(
    `Halo, saya butuh bantuan terkait ${kategori}. Saya tahu dari Beautifio. Mohon info lebih lanjut.`
  );
  return `https://wa.me/${nomor}?text=${text}`;
}

export function BantuanSheet({
  open,
  onClose,
  initialCategory,
}: {
  open: boolean;
  onClose: () => void;
  initialCategory?: string;
}) {
  const [selectedKategori, setSelectedKategori] = useState<string | null>(initialCategory || null);

  if (!open) return null;

  const filtered = selectedKategori
    ? LEMBAGA_BANTUAN.filter((l) => l.kategori === selectedKategori)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-gray-900">Butuh Bantuan?</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!selectedKategori ? (
          /* Kategori Grid */
          <div className="px-6 py-5">
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
        ) : (
          /* Daftar Lembaga */
          <div className="px-6 py-5">
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
        )}

        <div className="px-6 pb-6 pt-2">
          <p className="text-[11px] text-gray-400 text-center">
            Jika dalam keadaan darurat yang mengancam jiwa, segera hubungi <strong>112</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
