"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SplashScreen() {
  const router = useRouter();
  const [logoVisible, setLogoVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisible(true), 300);
    const t2 = setTimeout(() => setContentVisible(true), 800);
    const t3 = setTimeout(() => setCtaVisible(true), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#084463] to-[#68B9D4] flex flex-col items-center justify-between px-6 py-16 overflow-hidden">
      {/* Logo */}
      <div
        className={`transition-all duration-1000 ease-out ${
          logoVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L20 12L30 14L22 22L24 32L16 26L8 32L10 22L2 14L12 12L16 2Z" fill="white" />
            </svg>
          </div>
          <span className="text-white/90 text-xl font-bold tracking-wide">
            Beautifio
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center text-center -mt-8">
        <h1
          className={`text-3xl font-bold text-white leading-tight max-w-[320px] transition-all duration-1000 ease-out delay-200 ${
            contentVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          Masa Depan{" "}
          <span className="text-[#FFC64F]">Dimulai Hari Ini</span>
        </h1>
        <p
          className={`text-sm text-white/80 mt-4 max-w-[300px] leading-relaxed transition-all duration-1000 ease-out delay-300 ${
            contentVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          Temukan arah, lingkungan, dan peluang untuk masa depan yang lebih baik.
        </p>

        {/* Illustration */}
        <div
          className={`mt-10 transition-all duration-1000 ease-out delay-500 ${
            contentVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            className="drop-shadow-2xl"
            style={{
              animation: contentVisible ? "float 3s ease-in-out infinite" : "none",
            }}
          >
            <defs>
              <linearGradient id="skyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC64F" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFC64F" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Glow */}
            <circle cx="160" cy="80" r="60" fill="url(#skyGlow)" />

            {/* Sun / Future horizon */}
            <circle cx="170" cy="90" r="20" fill="#FFC64F" opacity="0.6" />
            <circle cx="170" cy="90" r="14" fill="#FFC64F" opacity="0.9" />
            <circle cx="170" cy="90" r="8" fill="#FFF7E0" />

            {/* Mountains / Landscape */}
            <path d="M0 220 L40 160 L80 190 L120 140 L160 180 L200 130 L240 170 L240 240 L0 240Z" fill="#084463" opacity="0.5" />
            <path d="M0 240 L60 180 L110 210 L150 170 L200 200 L240 160 L240 240Z" fill="#084463" opacity="0.7" />

            {/* Person - standing, looking toward the sun */}
            <g transform="translate(80, 120)">
              {/* Body */}
              <circle cx="20" cy="10" r="14" fill="white" opacity="0.95" />
              {/* Neck */}
              <rect x="17" y="23" width="6" height="6" rx="3" fill="white" />
              {/* Upper body */}
              <path d="M6 50 L6 30 Q6 25 10 24 L30 24 Q34 25 34 30 L34 50Z" fill="white" opacity="0.95" />
              {/* Arms */}
              <path d="M6 32 Q-4 28 -8 22" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M34 32 Q44 28 48 22" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
              {/* Legs */}
              <path d="M12 50 L10 78" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M28 50 L30 78" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
              {/* Hair */}
              <path d="M6 10 Q6 -4 20 -6 Q34 -4 34 10" fill="#2D1810" />
              <path d="M8 8 Q12 0 20 -2 Q28 0 32 8" fill="#3D2810" opacity="0.5" />
              {/* Cape / flowing cloth */}
              <path d="M6 36 Q-10 44 -12 60 Q0 54 6 48Z" fill="white" opacity="0.3" />
              <path d="M34 36 Q50 44 52 60 Q40 54 34 48Z" fill="white" opacity="0.3" />
              {/* Direction lines */}
              <g opacity="0.4">
                <path d="M130 70 Q145 65 160 70" stroke="#FFC64F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M135 78 Q150 73 165 78" stroke="#FFC64F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M140 86 Q152 81 162 86" stroke="#FFC64F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </g>
            </g>

            {/* Stars / Sparkles */}
            <g opacity="0.6">
              <circle cx="40" cy="40" r="2" fill="white" />
              <circle cx="200" cy="30" r="1.5" fill="white" />
              <circle cx="60" cy="60" r="1" fill="white" />
              <circle cx="220" cy="60" r="1.5" fill="white" />
              <circle cx="30" cy="90" r="1" fill="white" />
              <circle cx="210" cy="110" r="1" fill="white" />
            </g>
          </svg>
        </div>
      </div>

      {/* CTA Group */}
      <div
        className={`w-full max-w-[320px] space-y-3 transition-all duration-1000 ease-out ${
          ctaVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <Link
          href="/welcome"
          className="flex items-center justify-center w-full h-14 rounded-full bg-[#FFC64F] text-[#084463] font-bold text-sm shadow-lg hover:bg-[#FFC64F]/90 active:scale-[0.98] transition-all cursor-pointer gap-2"
        >
          Mulai Perjalananmu
          <ArrowRight size={18} />
        </Link>

        <Link
          href="/login"
          className="flex items-center justify-center w-full h-14 rounded-full border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          Masuk
        </Link>

        <Link
          href="/home"
          className="block w-full text-center text-white/70 text-sm py-2 hover:text-white transition-colors cursor-pointer"
        >
          Lewati Dulu
        </Link>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
