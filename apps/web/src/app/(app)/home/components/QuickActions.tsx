"use client";

import { useEffect, useState } from "react";
import { Gift, Shield, Ticket, ShoppingBag, Calendar } from "lucide-react";
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
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:border-accent/30 transition-all relative"
      >
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
          <Ticket size={20} className="text-primary" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-text-primary">Voucher</p>
          <p className="text-[10px] text-text-secondary">Klaim voucher merchant</p>
        </div>
        {activeCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
            {activeCount}
          </div>
        )}
      </Link>

      <Link
        href="/belanja"
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 hover:border-secondary/30 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
          <ShoppingBag size={20} className="text-secondary" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-text-primary">Belanja</p>
          <p className="text-[10px] text-text-secondary">Deals & diskon partner</p>
        </div>
      </Link>

      <Link
        href="/event"
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/30 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Calendar size={20} className="text-primary" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-text-primary">Event</p>
          <p className="text-[10px] text-text-secondary">Workshop & career expo</p>
        </div>
      </Link>

      <button
        onClick={onRuangAman}
        className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:border-accent/30 transition-all text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
          <Shield size={20} className="text-primary" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-text-primary">Ruang Aman</p>
          <p className="text-[10px] text-text-secondary">Butuh bantuan?</p>
        </div>
      </button>
    </div>
  );
}
