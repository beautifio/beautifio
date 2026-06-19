"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [heroUrl, setHeroUrl] = useState("");
  const [mobileHeroUrl, setMobileHeroUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("app_settings").select("key, value")
      .in("key", ["hero_image_url", "hero_image_mobile_url", "logo_url"])
      .then(({ data }) => {
        data?.forEach((row: any) => {
          if (row.key === "hero_image_url") setHeroUrl(row.value || "");
          if (row.key === "hero_image_mobile_url") setMobileHeroUrl(row.value || "");
          if (row.key === "logo_url") setLogoUrl(row.value || "");
        });
      });
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const activeHero = isMobile ? (mobileHeroUrl || heroUrl) : (heroUrl || mobileHeroUrl);

  async function handleStart() {
    setLoading(true);
    await supabase?.auth.signInAnonymously();
    router.replace("/home");
  }

  function handleLogin() {
    router.push("/login");
  }

  return (
    <div style={{
      position: "relative",
      minHeight: "100svh",
      overflow: "hidden",
      background: "#084463",
    }}>
      {/* Hero Image */}
      {activeHero && (
        <img
          src={activeHero}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 0,
          }}
        />
      )}

      {/* Gradient Overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(8,68,99,0.75) 75%, rgba(8,68,99,0.95) 100%)",
      }} />

      {/* Content Layer */}
      <div style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        padding: "0 24px",
        maxWidth: 480,
        margin: "0 auto",
        width: "100%",
      }}>
        {/* Logo — center, atas */}
        <div style={{
          paddingTop: 52,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Beautifio"
              style={{
                height: 48,
                maxWidth: 200,
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
          ) : (
            <span style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.5px",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}>
              beautifio
            </span>
          )}
        </div>

        {/* Spacer — dorong konten ke bawah */}
        <div style={{ flex: 1, minHeight: 120 }} />

        {/* Headline */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "clamp(28px, 7vw, 40px)",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.2,
            margin: "0 0 12px 0",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}>
            Masa Depan<br />Dimulai Hari Ini
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.6,
            margin: 0,
            textShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}>
            Temukan arah, tumbuh tiap hari, dan nggak sendirian menjalaninya.
          </p>
        </div>

        {/* Card Tombol */}
        <div style={{
          background: "rgba(255,255,255,0.96)",
          borderRadius: 24,
          padding: "20px",
          marginBottom: "max(32px, env(safe-area-inset-bottom, 32px))",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
        }}>
          <button onClick={handleStart} disabled={loading}
            style={{
              background: "#084463",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 12,
              padding: "15px",
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              width: "100%",
            }}>
            {loading ? "Memuat..." : "Mulai Perjalananku →"}
          </button>

          <button onClick={handleLogin} disabled={loading}
            style={{
              background: "transparent",
              color: "#084463",
              border: "1.5px solid #084463",
              borderRadius: 12,
              padding: "14px",
              fontSize: 15,
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
              cursor: "pointer",
              width: "100%",
            }}>
            Masuk
          </button>

          <button onClick={handleStart} disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "#647488",
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              padding: "4px",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              width: "100%",
            }}>
            Lihat dulu tanpa daftar
          </button>
        </div>
      </div>
    </div>
  );
}
