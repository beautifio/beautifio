"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { getAllDreamTemplates } from "@beautifio/utils";

const FEATURED_SLUGS = [
  "football-player",
  "content-creator",
  "programmer",
  "entrepreneur",
  "doctor",
  "chef",
];

const FEATURED_ICONS: Record<string, string> = {
  "football-player": "⚽",
  "content-creator": "📱",
  "programmer": "💻",
  "entrepreneur": "🚀",
  "doctor": "🩺",
  "chef": "👨‍🍳",
};

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [allTemplates] = useState(() => getAllDreamTemplates());
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [stories, setStories] = useState<{ slug: string; title: string; excerpt: string; author: string }[]>([]);
  const [heroUrl, setHeroUrl] = useState("");
  const justSignedUp = useRef(false);

  const featured = allTemplates.filter((t: any) => FEATURED_SLUGS.includes(t.slug));

  useEffect(() => {
    if (user && !justSignedUp.current) router.replace("/home");
  }, [user, router]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("articles")
      .select("slug, title, excerpt, author")
      .eq("type", "story")
      .eq("is_published", true)
      .limit(2)
      .then(({ data }) => {
        if (data) setStories(data);
      });
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "hero_image_url")
      .single()
      .then(({ data }) => {
        if (data?.value) setHeroUrl(data.value);
      });
  }, []);

  if (user) return null;

  async function handleStartAsGuest(templateSlug: string) {
    if (!supabase) {
      setError("Koneksi database tidak tersedia.");
      return;
    }
    setStarting(templateSlug);
    setError("");
    try {
      localStorage.setItem("pending_template", templateSlug);
      const { error: signInErr } = await supabase.auth.signInAnonymously();
      if (signInErr) throw signInErr;
      justSignedUp.current = true;
      router.replace("/journey");
    } catch (err: any) {
      localStorage.removeItem("pending_template");
      setError(err?.message || "Gagal memulai. Coba lagi.");
      setStarting(null);
    }
  }

  const scrollToTemplates = () => {
    document.getElementById("pilih-mimpi")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="max-w-content mx-auto">
        {error && (
          <div className="px-5 pt-4">
            <p className="text-sm text-center text-red-500">{error}</p>
          </div>
        )}

        {/* ─────── SECTION 1: HERO ─────── */}
        <section
          className="relative px-5 pt-10 pb-8 overflow-hidden bg-cover bg-center"
          style={{
            backgroundColor: "#084463",
            backgroundImage: heroUrl ? `url(${heroUrl})` : undefined,
          }}
        >
          <div className="absolute inset-0" style={{
            background: heroUrl
              ? "linear-gradient(to bottom, rgba(8,68,99,0.6) 0%, rgba(8,68,99,0.85) 100%)"
              : undefined,
          }} />

          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#6BB9D4" }}>
              Beautifio
            </p>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight font-poppins text-white">
              Masa depan dimulai{" "}
              <span style={{ color: "#FFC64F" }}>hari ini.</span>
            </h1>
            <p className="text-[15px] mt-4 leading-relaxed text-white/80">
              Platform yang nemenin kamu nemuin mimpi, tumbuh tiap hari, dan nggak sendirian menjalaninya.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={scrollToTemplates}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg transition-all cursor-pointer"
                style={{ backgroundColor: "#FFC64F", color: "#1E2938" }}
              >
                Mulai Perjalananku
                <span>→</span>
              </button>
            </div>
            <Link
              href="/login"
              className="inline-block mt-4 text-sm font-medium transition-colors"
              style={{ color: "#FFFFFF" }}
            >
              Sudah punya akun? Masuk
            </Link>
          </div>
        </section>

        {/* ─────── SECTION 2: KENAPA BEAUTIFIO? ─────── */}
        <section className="px-5 py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] mb-5" style={{ color: "#647488" }}>
            Kenapa Beautifio?
          </p>
          <div className="space-y-3">
            <div
              className="flex items-start gap-3 p-3.5"
              style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0", borderRadius: 16 }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#E8F4F8" }}
              >
                <span style={{ fontSize: 18 }}>🎯</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium font-poppins" style={{ color: "#1E2938" }}>Temukan arah</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#647488" }}>
                  Nggak tahu mau jadi apa? Kita bantu kamu cari tahu lewat quiz dan 30+ cetak biru mimpi.
                </p>
              </div>
            </div>
            <div
              className="flex items-start gap-3 p-3.5"
              style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0", borderRadius: 16 }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#FFF8E7" }}
              >
                <span style={{ fontSize: 18 }}>📈</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium font-poppins" style={{ color: "#1E2938" }}>Track progress harian</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#647488" }}>
                  Pantau pertumbuhanmu di 6 dimensi hidup — bukan cuma karir, tapi karakter, relasi, dan spiritual juga.
                </p>
              </div>
            </div>
            <div
              className="flex items-start gap-3 p-3.5"
              style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0", borderRadius: 16 }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#E8F4F8" }}
              >
                <span style={{ fontSize: 18 }}>🤝</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium font-poppins" style={{ color: "#1E2938" }}>Tumbuh bersama</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#647488" }}>
                  Curhat, circle komunitas, mentor, dan ruang aman — kamu nggak perlu jalani ini sendirian.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────── SECTION 3: CERITA NYATA ─────── */}
        {stories.length > 0 && (
          <section className="px-5 py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] mb-5" style={{ color: "#647488" }}>
              Cerita nyata
            </p>
            <div className="space-y-3">
              {stories.map((s) => {
                const trimmed = s.excerpt.length > 120 ? s.excerpt.slice(0, 120) + "..." : s.excerpt;
                return (
                  <div
                    key={s.slug}
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0" }}
                  >
                    <p className="text-sm leading-relaxed italic" style={{ color: "#1E2938" }}>
                      &ldquo;{trimmed}&rdquo;
                    </p>
                    <p className="text-xs mt-2 font-medium" style={{ color: "#647488" }}>
                      — {s.author}
                    </p>
                    <Link
                      href={`/inspirasi/${s.slug}`}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-semibold transition-colors"
                      style={{ color: "#6BB9D4" }}
                    >
                      Baca cerita lengkap
                      <span>→</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─────── SECTION 4: PILIH MIMPIMU ─────── */}
        <section id="pilih-mimpi" className="px-5 py-8 scroll-mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] mb-1 font-poppins" style={{ color: "#647488" }}>
            Pilih mimpimu
          </p>
          <p className="text-xs mt-1 mb-5 leading-relaxed" style={{ color: "#647488" }}>
            30+ cetak biru mimpi lengkap dengan milestone, aktivitas harian, dan alternatif karier.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {featured.map((t: any) => (
              <button
                key={t.slug}
                onClick={() => handleStartAsGuest(t.slug)}
                disabled={starting === t.slug}
                className="p-4 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "0.5px solid #E2E8F0",
                }}
              >
                <span style={{ fontSize: 20 }}>{FEATURED_ICONS[t.slug] || t.emoji}</span>
                <p className="text-sm font-medium mt-2 leading-snug" style={{ color: "#1E2938" }}>{t.title}</p>
                <p className="text-[11px] mt-1 capitalize" style={{ color: "#647488" }}>{t.category}</p>
                {starting === t.slug && (
                  <p className="text-[10px] mt-1.5" style={{ color: "#084463" }}>Memulai...</p>
                )}
              </button>
            ))}
          </div>
          <div className="mt-5 text-center">
            <button
              onClick={() => router.push("/mimpi")}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              style={{ border: "1px solid #6BB9D4", color: "#084463" }}
            >
              Lihat Semua 30 Mimpi
              <span>→</span>
            </button>
          </div>
        </section>

        {/* ─────── SECTION 5: CTA FOOTER ─────── */}
        <section className="px-5 py-10 mt-4" style={{ backgroundColor: "#084463" }}>
          <div className="text-center">
            <h2 className="text-[22px] font-semibold font-poppins" style={{ color: "#FFFFFF" }}>
              Siap mulai?
            </h2>
            <p className="text-sm mt-2 leading-relaxed max-w-xs mx-auto" style={{ color: "#6BB9D4" }}>
              Coba gratis sekarang, nggak perlu daftar dulu. Data kamu tetap aman saat upgrade kapan saja.
            </p>
            <button
              onClick={() => handleStartAsGuest("content-creator")}
              disabled={!!starting}
              className="inline-flex items-center gap-2 px-6 py-3 mt-6 text-sm font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "#FFC64F", color: "#1E2938" }}
            >
              Mulai Sekarang
              <span>→</span>
            </button>
            <p className="text-xs mt-4" style={{ color: "#6BB9D4" }}>
              ─── atau ───
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-4 text-sm font-semibold rounded-lg transition-colors"
              style={{ border: "0.5px solid #6BB9D4", color: "#6BB9D4" }}
            >
              Sudah punya akun? Masuk
            </Link>
          </div>
        </section>

        {/* Footer spacer */}
        <div className="px-5 py-6 text-center">
          <p className="text-[11px]" style={{ color: "#647488" }}>
            Beautifio &middot; Tumbuh bersama mimpimu
          </p>
        </div>
      </div>
    </div>
  );
}
