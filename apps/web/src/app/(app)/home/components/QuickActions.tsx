"use client";

import { useEffect, useState } from "react";
import { Gift, Shield, Ticket } from "lucide-react";
import Link from "next/link";

export function QuickActions({ onRuangAman }: { onRuangAman: () => void }) {
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/familia/vouchers/active");
        if (res.ok) {
          const { data } = await res.json();
          setActiveCount(data?.length || 0);
        }
      } catch {
        // silent
      }
    })();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href="/familia"
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 hover:border-amber-200 transition-all relative"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Gift size={20} className="text-amber-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-gray-900">Familia</p>
          <p className="text-[10px] text-gray-500">Dapatkan benefit eksklusif</p>
        </div>
        {activeCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
            {activeCount}
          </div>
        )}
      </Link>

      <Link
        href="/familia/vouchers/me"
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:border-blue-200 transition-all relative"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Ticket size={20} className="text-blue-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-gray-900">Voucherku</p>
          <p className="text-[10px] text-gray-500">Lihat voucher aktif</p>
        </div>
      </Link>

      <button
        onClick={onRuangAman}
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 hover:border-red-200 transition-all text-left col-span-2"
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
