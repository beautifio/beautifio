"use client";

import { useState, useMemo } from "react";
import { X, Shield, ArrowLeft, ChevronRight, Phone, Send, ExternalLink } from "lucide-react";
import {
  KATEGORI, getCategoryById, waUrl, buatTemplateWA,
  PROVINSI_LIST, getKotaList, getRekomendasiRS,
} from "@/lib/ruang-aman-data";
import type { RuangAmanCategory, FormField } from "@/lib/ruang-aman-data";

type Step = "kategori" | "cerita" | "panduan" | "form" | "kontak";

export function RuangAmanSheet({
  open,
  onClose,
  initialCategory,
}: {
  open: boolean;
  onClose: () => void;
  initialCategory?: string;
}) {
  const [step, setStep] = useState<Step>("kategori");
  const [catId, setCatId] = useState<string | null>(initialCategory || null);
  const [cerita, setCerita] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedRS, setSelectedRS] = useState<string | null>(null);
  const [selectedProv, setSelectedProv] = useState("");
  const [selectedKota, setSelectedKota] = useState("");

  const cat = catId ? getCategoryById(catId) : null;

  const rsList = useMemo(() => {
    if (!selectedProv || !selectedKota) return [];
    return getRekomendasiRS(selectedProv, selectedKota);
  }, [selectedProv, selectedKota]);

  const kotaList = useMemo(() => {
    if (!selectedProv) return [];
    return getKotaList(selectedProv);
  }, [selectedProv]);

  if (!open) return null;

  function updateForm(id: string, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }

  function handlePilihKategori(id: string) {
    setCatId(id);
    setCerita("");
    setFormData({});
    setSelectedRS(null);
    setSelectedProv("");
    setSelectedKota("");
    const c = getCategoryById(id);
    if (c?.skipGuide && c?.skipForm) {
      setStep("kontak");
    } else {
      setStep("cerita");
    }
  }

  function handleCeritaNext() {
    setStep("panduan");
  }

  function handlePanduanNext() {
    if (cat?.formFields.length === 0) {
      setStep("kontak");
    } else {
      setStep("form");
    }
  }

  function handleFormNext() {
    setStep("kontak");
  }

  function handleBack() {
    if (step === "cerita") setStep("kategori");
    else if (step === "panduan") setStep("cerita");
    else if (step === "form") setStep("panduan");
    else if (step === "kontak") setStep("form");
  }

  function getFormValue(field: FormField): string {
    return formData[field.id] || "";
  }

  function renderKategori() {
    return (
      <div>
        <p className="text-sm text-gray-500 mb-4">Pilih situasi yang kamu alami:</p>
        <div className="grid grid-cols-2 gap-2.5">
          {KATEGORI.filter((k) => k.id !== "self-harm").map((k) => (
            <button
              key={k.id}
              onClick={() => handlePilihKategori(k.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 transition-all text-center"
            >
              <span className="text-xl">{k.emoji}</span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{k.label}</span>
            </button>
          ))}
          {/* Self-harm di baris terakhir, full width */}
          <button
            onClick={() => handlePilihKategori("self-harm")}
            className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 transition-all"
          >
            <span className="text-lg">🆘</span>
            <span className="text-sm font-semibold text-red-700">{KATEGORI.find((k) => k.id === "self-harm")?.label}</span>
          </button>
        </div>
      </div>
    );
  }

  function renderCerita() {
    if (!cat) return null;
    return (
      <div>
        <p className="text-sm text-gray-500 mb-1">
          {cat.emoji} <strong>{cat.label}</strong>
        </p>
        <p className="text-xs text-gray-400 mb-4">Ceritakan dengan kata-katamu sendiri apa yang terjadi.</p>
        <textarea
          value={cerita}
          onChange={(e) => setCerita(e.target.value)}
          placeholder="Apa yang kamu alami? Ceritakan dengan detail jika kamu nyaman..."
          className="w-full h-32 p-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-200"
        />
      </div>
    );
  }

  function renderPanduan() {
    if (!cat) return null;
    return (
      <div>
        <p className="text-sm text-gray-500 mb-1">
          {cat.emoji} <strong>{cat.label}</strong>
        </p>
        <p className="text-xs text-gray-400 mb-4">Berikut adalah langkah-langkah yang bisa kamu lakukan:</p>
        <div className="space-y-3">
          {(cat.guide || []).map((step, i) => (
            <div key={i} className="flex gap-3 bg-gray-50 p-3 rounded-xl">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderFormField(field: FormField) {
    const val = getFormValue(field);

    if (field.type === "location") {
      return (
        <div key={field.id} className="space-y-2">
          <label className="text-xs font-semibold text-gray-700">{field.label}</label>
          <select
            value={selectedProv}
            onChange={(e) => { setSelectedProv(e.target.value); setSelectedKota(""); setSelectedRS(null); }}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:border-amber-300"
          >
            <option value="">Pilih Provinsi</option>
            {PROVINSI_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {selectedProv && (
            <select
              value={selectedKota}
              onChange={(e) => { setSelectedKota(e.target.value); setSelectedRS(null); }}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:border-amber-300"
            >
              <option value="">Pilih Kota</option>
              {kotaList.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          )}
          {selectedKota && rsList.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">RS Rekomendasi:</p>
              {rsList.map((rs) => (
                <label key={rs.nama} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-amber-50 cursor-pointer">
                  <input
                    type="radio"
                    name="rs"
                    checked={selectedRS === rs.nama}
                    onChange={() => { setSelectedRS(rs.nama); updateForm("rs_pilihan", rs.nama); updateForm("rs_telp", rs.telp); }}
                    className="accent-amber-500"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">{rs.nama}</p>
                    <p className="text-[10px] text-gray-500">{rs.telp}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (field.type === "boolean") {
      return (
        <div key={field.id} className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">{field.label}</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value="true"
                checked={val === "true"}
                onChange={() => updateForm(field.id, "true")}
                className="accent-amber-500"
              /> Ya
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value="false"
                checked={val === "false"}
                onChange={() => updateForm(field.id, "false")}
                className="accent-amber-500"
              /> Tidak
            </label>
          </div>
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.id} className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </label>
          <select
            value={val}
            onChange={(e) => updateForm(field.id, e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:border-amber-300"
          >
            <option value="">Pilih...</option>
            {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.id} className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </label>
          <textarea
            value={val || (field.id === "deskripsi" ? cerita : "")}
            onChange={(e) => updateForm(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full p-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-200"
          />
        </div>
      );
    }

    return (
      <div key={field.id} className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700">
          {field.label} {field.required && <span className="text-red-400">*</span>}
        </label>
        <input
          type={field.type === "tel" ? "tel" : field.type === "number" ? "number" : "text"}
          value={val}
          onChange={(e) => updateForm(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="w-full p-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-200"
        />
      </div>
    );
  }

  function renderForm() {
    if (!cat) return null;
    const locationField = cat.formFields.find((f) => f.type === "location");
    const otherFields = cat.formFields.filter((f) => f.type !== "location");

    return (
      <div>
        <p className="text-sm text-gray-500 mb-1">
          {cat.emoji} <strong>{cat.label}</strong>
        </p>
        <p className="text-xs text-gray-400 mb-4">Isi data berikut untuk melengkapi laporan kamu.</p>

        {cat.waiver && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
            <p className="text-xs text-amber-800">{cat.waiver}</p>
          </div>
        )}

        <div className="space-y-3">
          {locationField && renderFormField(locationField)}
          {otherFields.map((f) => renderFormField(f))}
        </div>
      </div>
    );
  }

  function renderKontak() {
    if (!cat) return null;

    const templateWA = buatTemplateWA(cat, { ...formData, cerita });
    const allFormData = { ...formData, deskripsi: formData.deskripsi || cerita };

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500 mb-1">
          {cat.emoji} <strong>{cat.label}</strong>
        </p>

        {cat.waiver && !cat.skipForm && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-800">{cat.waiver}</p>
          </div>
        )}

        {/* External contacts */}
        {cat.externalContacts && cat.externalContacts.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">📞 Hubungi Langsung:</p>
            <div className="space-y-2">
              {cat.externalContacts.map((c) => (
                <a
                  key={c.nama}
                  href={c.nomor.startsWith("http") ? c.nomor : waUrl(c.nomor, templateWA)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-green-200 bg-green-50/50 hover:bg-green-100 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{c.nama}</p>
                    <p className="text-xs text-gray-500">{c.deskripsi}</p>
                    {c.jam && <p className="text-[10px] text-gray-400">🕐 {c.jam}</p>}
                  </div>
                  <ExternalLink className="w-4 h-4 text-green-600 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Selected RS */}
        {selectedRS && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs font-semibold text-red-700 mb-1">🚑 RS Tujuan:</p>
            <p className="text-sm font-medium text-gray-900">{selectedRS}</p>
            <a
              href={`tel:${formData.rs_telp || ""}`}
              className="text-xs font-semibold text-red-600 hover:underline mt-1 inline-block"
            >
              📞 {formData.rs_telp || ""}
            </a>
          </div>
        )}

        {/* Beautifio Care */}
        {cat.carePartnerType && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-bold text-gray-900">💚 Beautifio Care</p>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Butuh {cat.carePartnerLabel}? Kami akan hubungkan kamu dengan mitra terpercaya kami dalam 1×24 jam.
            </p>
            <p className="text-[10px] text-gray-400 mb-3">
              Data kamu akan dikirim ke tim Beautifio Care untuk ditindaklanjuti.
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderBottomBar() {
    if (step === "kategori") return null;
    return (
      <div className="shrink-0 px-6 py-3 border-t border-gray-100 bg-white space-y-2">
        {step === "cerita" && cat && (
          <button
            onClick={handleCeritaNext}
            disabled={!cerita.trim()}
            className="w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Lanjut <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {step === "panduan" && cat && (
          <button
            onClick={handlePanduanNext}
            className="w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
          >
            Lanjut <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {step === "form" && cat && (() => {
          const requiredFields = cat.formFields.filter((f) => f.required);
          const allFilled = requiredFields.every((f) => {
            if (f.type === "location") {
              const rs = getRekomendasiRS(selectedProv, selectedKota);
              return selectedRS !== null || rs.length === 0;
            }
            return (formData[f.id] || "").trim().length > 0;
          });
          return (
            <button
              onClick={handleFormNext}
              disabled={!allFilled}
              className="w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              Hubungi Lembaga Bantuan <ChevronRight className="w-4 h-4" />
            </button>
          );
        })()}
        {step === "kontak" && cat && cat.carePartnerType && (
          <button
            onClick={async () => {
              const allFormData = { ...formData, deskripsi: formData.deskripsi || cerita };
              const payload = {
                category: cat.id,
                story: cerita,
                form_data: allFormData,
                partner_type: cat.carePartnerType,
              };
              try {
                const res = await fetch("/api/beautifio-care/ticket", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (res.ok) {
                  alert("✓ Permintaan kamu sudah terkirim. Tim Beautifio Care akan menghubungimu dalam 1×24 jam.");
                  onClose();
                } else {
                  alert("Gagal mengirim. Coba lagi nanti.");
                }
              } catch {
                alert("Gagal mengirim. Cek koneksi internet kamu.");
              }
            }}
            className="w-full py-3 rounded-xl bg-[#084463] text-white text-sm font-semibold hover:bg-[#084463]/90 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Kirim ke Beautifio Care
          </button>
        )}
        {step === "kontak" && cat?.emergency && (
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-center">
            <p className="text-xs text-red-700">
              🆘 Darurat? Segera hubungi <strong className="text-red-600">{cat.emergency}</strong>
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderStep() {
    switch (step) {
      case "kategori": return renderKategori();
      case "cerita": return renderCerita();
      case "panduan": return renderPanduan();
      case "form": return renderForm();
      case "kontak": return renderKontak();
    }
  }

  const stepTitles: Record<Step, string> = {
    kategori: "Pilih Situasi",
    cerita: "Ceritakan",
    panduan: "Panduan",
    form: "Data Kamu",
    kontak: "Hubungi Bantuan",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl max-h-[calc(100dvh-5rem)] mb-20 flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            {step !== "kategori" && (
              <button onClick={handleBack} className="p-1 -ml-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Shield className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-gray-900">{stepTitles[step]}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex px-6 pt-3 pb-1 gap-1">
          {(["kategori", "cerita", "panduan", "form", "kontak"] as Step[]).map((s) => {
            const idx = ["kategori", "cerita", "panduan", "form", "kontak"].indexOf(s);
            const cur = ["kategori", "cerita", "panduan", "form", "kontak"].indexOf(step);
            const isSelfHarm = cat?.skipForm && cat?.skipGuide;
            const skipSteps = isSelfHarm ? ["kategori", "kontak"] : null;
            const visible = !skipSteps || skipSteps.includes(s);
            if (!visible) return null;
            return (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full ${
                  idx <= cur ? "bg-amber-500" : "bg-gray-200"
                } transition-all`}
              />
            );
          })}
        </div>

        {/* Step labels */}
        {!cat?.skipForm && !cat?.skipGuide && (
          <div className="flex px-6 pb-2">
            {(["kategori", "cerita", "panduan", "form", "kontak"] as Step[]).map((s) => {
              const cur = ["kategori", "cerita", "panduan", "form", "kontak"].indexOf(step);
              const idx = ["kategori", "cerita", "panduan", "form", "kontak"].indexOf(s);
              return (
                <span
                  key={s}
                  className={`flex-1 text-[9px] text-center ${
                    idx <= cur ? "text-amber-600" : "text-gray-300"
                  }`}
                >
                  {stepTitles[s]}
                </span>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {/* Self-harm waiver on contact step */}
          {cat?.id === "self-harm" && step === "kontak" && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-4 text-center">
              <p className="text-sm font-semibold text-red-700 mb-1">Kamu Tidak Sendiri ❤️</p>
              <p className="text-xs text-red-600">Bantuan tersedia 24 jam. Kamu berharga.</p>
            </div>
          )}
          {renderStep()}
        </div>

        {renderBottomBar()}
      </div>
    </div>
  );
}
