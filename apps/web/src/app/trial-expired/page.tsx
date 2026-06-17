"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@beautifio/ui";

export default function TrialExpiredPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="max-w-sm mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles size={40} className="text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Trial 3 Hari Selesai! 🎉
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Kamu sudah buktikan kamu bisa konsisten.
            Sekarang waktunya simpan perjalananmu.
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 text-left space-y-3">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Yang akan tersimpan:
          </p>
          <ul className="space-y-2">
            {[
              "Semua aktivitas 3 harimu",
              "Progress big wins & small wins",
              "Refleksi harian",
              "Fase & benchmark usiamu",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-text-primary">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs">✓</span>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Link href="/register?upgrade=true">
            <Button variant="primary" size="lg" className="w-full shadow-lg">
              Daftar Gratis — Simpan Segalanya <ArrowRight size={16} />
            </Button>
          </Link>

          <Link
            href="/login?upgrade=true"
            className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline py-2"
          >
            <LogIn size={16} />
            Sudah punya akun? Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
