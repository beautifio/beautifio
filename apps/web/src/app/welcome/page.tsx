"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Compass, Search } from "lucide-react";

export default function WelcomeScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="max-w-content mx-auto w-full px-6 pt-12 pb-8 flex-1 flex flex-col">
        {/* Header */}
        <div
          className={`flex flex-col items-center text-center transition-all duration-800 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#084463] flex items-center justify-center shadow-lg mb-4">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L20 12L30 14L22 22L24 32L16 26L8 32L10 22L2 14L12 12L16 2Z" fill="white" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-[#1e293b] leading-tight">
            Selamat Datang
          </h1>
          <p className="text-sm text-[#64748b] mt-3 max-w-[320px] leading-relaxed">
            Temukan arah hidup, lingkungan yang tepat, dan peluang terbaik untuk
            masa depanmu.
          </p>
        </div>

        {/* Cards */}
        <div className="flex-1 flex flex-col justify-center gap-4 mt-10">
          {/* Card 1: Sudah Punya Tujuan */}
          <div
            className={`group bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(8,68,99,0.16)] transition-all duration-500 cursor-pointer border border-[#e2e8f0] hover:border-[#084463]/20 ${
              visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "300ms" }}
            onClick={() => router.push("/discover")}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#084463]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#084463]/15 transition-colors">
                <Compass size={24} className="text-[#084463]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1e293b]">
                  Saya Sudah Punya Tujuan
                </h3>
                <p className="text-sm text-[#64748b] mt-1 leading-relaxed">
                  Saya sudah tahu apa yang ingin saya capai.
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#084463] group-hover:gap-2.5 transition-all">
                  Lanjut Discovery
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Masih Bingung */}
          <div
            className={`group bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(8,68,99,0.16)] transition-all duration-500 cursor-pointer border border-[#e2e8f0] hover:border-[#084463]/20 ${
              visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "500ms" }}
            onClick={() => router.push("/onboarding")}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFC64F]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFC64F]/25 transition-colors">
                <Search size={24} className="text-[#FFC64F]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1e293b]">
                  Saya Masih Bingung
                </h3>
                <p className="text-sm text-[#64748b] mt-1 leading-relaxed">
                  Saya ingin menemukan minat dan tujuan yang cocok.
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#FFC64F] group-hover:gap-2.5 transition-all">
                  Temukan Arah Saya
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div
          className={`mt-auto pt-8 space-y-3 transition-all duration-800 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "700ms" }}
        >
          <Link
            href="/login"
            className="flex items-center justify-center w-full h-13 rounded-full bg-[#084463] text-white font-semibold text-sm shadow-sm hover:bg-[#084463]/90 active:scale-[0.98] transition-all cursor-pointer"
          >
            Masuk
          </Link>

          <Link
            href="/register"
            className="flex items-center justify-center w-full h-13 rounded-full border-2 border-[#084463] text-[#084463] font-semibold text-sm hover:bg-[#084463]/5 active:scale-[0.98] transition-all cursor-pointer"
          >
            Daftar
          </Link>

          <Link
            href="/home"
            className="block w-full text-center text-[#64748b] text-sm py-2 hover:text-[#1e293b] transition-colors cursor-pointer"
          >
            Lewati Dulu
          </Link>
        </div>
      </div>
    </div>
  );
}
