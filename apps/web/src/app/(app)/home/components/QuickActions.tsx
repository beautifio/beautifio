"use client";

import { useEffect, useState } from "react";
import { Gift, Shield, Ticket, ShoppingBag, Calendar, Heart } from "lucide-react";
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
        href="/voucher"
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 hover:border-amber-200 transition-all relative"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Ticket size={20} className="text-amber-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-gray-900">Voucher</p>
          <p className="text-[10px] text-gray-500">Klaim voucher merchant</p>
        </div>
        {activeCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
            {activeCount}
          </div>
        )}
      </Link>

      <Link
        href="/belanja"
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:border-blue-200 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <ShoppingBag size={20} className="text-blue-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-gray-900">Belanja</p>
          <p className="text-[10px] text-gray-500">Deals & diskon partner</p>
        </div>
      </Link>

      <Link
        href="/event"
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:border-purple-200 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
          <Calendar size={20} className="text-purple-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-gray-900">Event</p>
          <p className="text-[10px] text-gray-500">Workshop & career expo</p>
        </div>
      </Link>

      <Link
        href="/curhat"
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 hover:border-rose-200 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
          <Heart size={20} className="text-rose-500" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-gray-900">Curhat</p>
          <p className="text-[10px] text-gray-500">Cerita anonim publik</p>
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
