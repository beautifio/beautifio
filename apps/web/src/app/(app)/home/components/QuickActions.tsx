"use client";

import { Gift, Shield } from "lucide-react";
import Link from "next/link";

export function QuickActions({ onRuangAman }: { onRuangAman: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href="/familia"
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 hover:border-amber-200 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Gift size={20} className="text-amber-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-gray-900">Familia</p>
          <p className="text-[10px] text-gray-500">Dapatkan benefit eksklusif</p>
        </div>
      </Link>

      <button
        onClick={onRuangAman}
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 hover:border-red-200 transition-all text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <Shield size={20} className="text-red-500" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-gray-900">Ruang Aman</p>
          <p className="text-[10px] text-gray-500">Butuh bantuan?</p>
        </div>
      </button>
    </div>
  );
}
