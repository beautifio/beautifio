"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  redirect_url: string | null;
  redirect_label: string | null;
  is_active: boolean;
  display_order: number;
  interval_seconds?: number;
}

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase!
      .from("home_banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (data) setBanners(data);
      });
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const currentBanner = banners[current];
    const ms = (currentBanner?.interval_seconds || 4) * 1000;
    const id = setInterval(next, ms);
    return () => clearInterval(id);
  }, [banners.length, current, next]);

  if (banners.length === 0) return null;

  const b = banners[current];

  function handleTouchEnd(endX: number) {
    if (touchStart === null) return;
    const diff = touchStart - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    setTouchStart(null);
  }

  return (
    <div
      className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden bg-gray-100"
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
    >
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${idx === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
          {banner.redirect_url && (
            <a
              href={banner.redirect_url}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12"
            >
              {banner.redirect_label && (
                <span className="inline-block bg-[#FFC64F] text-[#1E2938] text-xs font-bold px-3 py-1.5 rounded-lg">
                  {banner.redirect_label}
                </span>
              )}
            </a>
          )}
        </div>
      ))}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                idx === current ? "bg-white w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
