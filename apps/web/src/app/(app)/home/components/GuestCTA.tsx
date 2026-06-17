"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function GuestCTA() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5 text-center">
      <p className="text-sm text-gray-600 mb-1">Kamu belum memulai perjalanan</p>
      <p className="text-xs text-gray-400 italic mb-4">
        &ldquo;Mulailah dengan satu langkah kecil.&rdquo; — Lao Tzu
      </p>
      <button
        onClick={() => router.push("/discover")}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-all"
      >
        <Sparkles size={16} />
        Temukan Mimpiku
      </button>
    </div>
  );
}

export function GuestLandingCTA() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5 text-center">
      <p className="text-sm text-gray-600 mb-4">
        Mulai perjalananmu dan temukan siapa dirimu yang sebenarnya.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => router.push("/welcome")}
          className="px-6 py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-all"
        >
          Mulai Perjalanan
        </button>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 rounded-xl bg-white text-gray-700 text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all"
        >
          Masuk
        </button>
      </div>
    </div>
  );
}
