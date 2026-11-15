"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Star, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { WilayahPicker, EMPTY_WILAYAH, type WilayahValue } from "@/components/form/WilayahPicker";

const VOLUNTEER_CATS = ["psikologi", "agama", "umum"];

export default function DaftarMitraPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [role, setRole] = useState<"volunteer" | "psychologist" | null>(null);

  // Data pribadi — otomatis dari akun, tetap bisa diedit
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Wilayah — 4 dropdown berjenjang + kode pos otomatis
  const [wilayah, setWilayah] = useState<WilayahValue>(EMPTY_WILAYAH);

  const [category, setCategory] = useState("");
  const [motivation, setMotivation] = useState("");
  const [specInput, setSpecInput] = useState("");
  const [specs, setSpecs] = useState<string[]>([]);
  const [credentials, setCredentials] = useState("");
  const [experience, setExperience] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading]);

  // Auto-isi dari akun + profil (sekali saja)
  useEffect(() => {
    if (!user || authLoading) return;
    let alive = true;
    setFullName(user.full_name || user.user_metadata?.full_name || "");
    setEmail(user.email || "");
    supabase
      .from("users")
      .select("phone, province, regency, kecamatan, kelurahan, kodepos")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive || !data) return;
        if (data.phone) setPhone(data.phone);
        if (data.province || data.regency || data.kecamatan || data.kelurahan || data.kodepos) {
          setWilayah((w) => ({
            ...w,
            province: data.province || w.province,
            regency: data.regency || w.regency,
            kecamatan: data.kecamatan || w.kecamatan,
            kelurahan: data.kelurahan || w.kelurahan,
            kodepos: data.kodepos || w.kodepos,
          }));
        }
      });
    return () => { alive = false; };
  }, [user, authLoading]);

  const addSpec = () => {
    if (specInput.trim()) { setSpecs([...specs, specInput.trim()]); setSpecInput(""); }
  };

  const handleSubmit = async () => {
    if (!user || !role) return;
    if (!fullName.trim()) { setError("Nama wajib diisi"); return; }
    if (!phone.trim()) { setError("Nomor WA wajib diisi"); return; }
    if (role === "psychologist" && !credentials.trim()) { setError("Kredensial wajib diisi"); return; }
    if (role === "volunteer" && (!motivation || motivation.length < 50)) {
      setError("Motivasi minimal 50 karakter"); return;
    }
    setSaving(true);
    setError("");

    const body = {
      role,
      full_name: fullName.trim(),
      email: email || user.email,
      phone: phone.trim(),
      category,
      specialization: specs,
      credentials,
      experience_years: experience ? parseInt(experience, 10) : 0,
      motivation,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
      // lokasi berjenjang + kode pos otomatis
      province: wilayah.province,
      regency: wilayah.regency,
      kecamatan: wilayah.kecamatan,
      kelurahan: wilayah.kelurahan,
      kodepos: wilayah.kodepos,
    };

    try {
      const res = await fetch("/api/mitra/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Gagal mengirim pendaftaran");
        return;
      }
      router.push("/daftar-mitra/sukses");
    } catch {
      setError("Gagal terhubung. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-5 pt-6">
        <button
          onClick={() => (step === "form" ? setStep("choose") : router.back())}
          className="flex items-center gap-1 text-sm cursor-pointer mb-4"
          style={{ color: "#647488" }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {step === "choose" ? (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(8,68,99,0.08)" }}>
                <Heart size={28} style={{ color: "#084463" }} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>
                Bergabung sebagai Mitra
              </h1>
              <p className="text-xs mt-1" style={{ color: "#647488" }}>Pilih peran yang sesuai denganmu</p>
            </div>
            <div className="space-y-3">
              <button onClick={() => { setRole("volunteer"); setStep("form"); }}
                className="w-full p-4 rounded-xl border-2 text-left cursor-pointer transition-all"
                style={{ borderColor: "#22C55E", background: "rgba(34,197,94,0.03)" }}>
                <div className="flex items-center gap-3"><Heart size={20} style={{ color: "#22C55E" }} />
                  <span className="text-sm font-bold" style={{ color: "#1E2938" }}>Volunteer Care</span></div>
                <p className="text-xs mt-1 ml-9" style={{ color: "#647488" }}>
                  Dampingi sesama perempuan dalam konsultasi ringan. Sukarela, tidak berbayar.
                </p>
              </button>
              <button onClick={() => { setRole("psychologist"); setStep("form"); }}
                className="w-full p-4 rounded-xl border-2 text-left cursor-pointer transition-all"
                style={{ borderColor: "#FFC64F", background: "rgba(255,198,79,0.03)" }}>
                <div className="flex items-center gap-3"><Star size={20} style={{ color: "#FFC64F" }} />
                  <span className="text-sm font-bold" style={{ color: "#1E2938" }}>Psikolog Profesional</span></div>
                <p className="text-xs mt-1 ml-9" style={{ color: "#647488" }}>
                  Baca hasil tes & konsultasi berbayar. Berbagi hasil dengan platform.
                </p>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4 max-w-md">
            <h2 className="text-sm font-bold" style={{ color: "#1E2938" }}>
              {role === "volunteer" ? "💚 Daftar Volunteer" : "👩‍⚕️ Daftar Psikolog"}
            </h2>

            {/* ── Data pribadi: otomatis dari akun ── */}
            <section className="p-3 rounded-xl border bg-surface" style={{ borderColor: "#E2E8F0" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#647488" }}>
                Data Diri <span className="normal-case font-normal">(terisi otomatis, bisa diedit)</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap *"
                  className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nomor WhatsApp *" inputMode="tel"
                  className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
              </div>
            </section>

            {/* ── Wilayah: dropdown berjenjang + kode pos ── */}
            <section className="p-3 rounded-xl border bg-surface" style={{ borderColor: "#E2E8F0" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#647488" }}>
                Alamat / Wilayah <span className="normal-case font-normal">(pilih, jangan ketik)</span>
              </p>
              <WilayahPicker value={wilayah} onChange={setWilayah} compact />
            </section>

            {/* ── Field sesuai peran ── */}
            <section className="space-y-2">
              {role === "volunteer" && (
                <>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }}>
                    <option value="">Pilih kategori</option>
                    {VOLUNTEER_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)}
                    placeholder="Kenapa ingin jadi volunteer? (min 50 karakter) *" rows={3}
                    className="w-full px-3 py-2 text-xs rounded-lg border resize-none" style={{ borderColor: "#E2E8F0" }} />
                  <p className="text-[10px]" style={{ color: "#647488" }}>{motivation.length}/50 karakter</p>
                </>
              )}
              {role === "psychologist" && (
                <>
                  <div className="flex gap-2">
                    <input value={specInput} onChange={(e) => setSpecInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpec())}
                      placeholder="Spesialisasi (enter untuk tambah)"
                      className="flex-1 px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                    <button type="button" onClick={addSpec}
                      className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                      style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>Tambah</button>
                  </div>
                  {specs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {specs.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded-full"
                          style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>{s}</span>
                      ))}
                    </div>
                  )}
                  <input value={credentials} onChange={(e) => setCredentials(e.target.value)}
                    placeholder="Kredensial (S.Psi, M.Psi) *"
                    className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                  <input value={experience} onChange={(e) => setExperience(e.target.value)} type="number"
                    placeholder="Pengalaman (tahun)"
                    className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                  <input value={bankName} onChange={(e) => setBankName(e.target.value)}
                    placeholder="Nama Bank *"
                    className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                  <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Nomor Rekening *" inputMode="numeric"
                    className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                  <input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Atas Nama *"
                    className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                </>
              )}
            </section>

            {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
            <button onClick={handleSubmit} disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "#084463" }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {saving ? "Mengirim..." : "Kirim Pendaftaran"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
