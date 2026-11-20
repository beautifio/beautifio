"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const pointerX = useRef<number | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("home_banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (data) setBanners(data);
      }, () => {});
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

  function handlePointerDown(e: React.PointerEvent) {
    pointerX.current = e.clientX;
  }

  function handlePointerUp(e: React.PointerEvent) {
    const startX = pointerX.current;
    pointerX.current = null;
    if (startX === null) return;
    const delta = startX - e.clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) next();
      else prev();
    } else {
      // Tap — navigate to active banner link
      const active = banners[current];
      if (active?.redirect_url) {
        if (active.redirect_url.startsWith("http")) window.open(active.redirect_url, "_blank");
        else router.push(active.redirect_url);
      }
    }
  }

  return (
    <div
      className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-laut-100 shadow-md ring-1 ring-inset ring-laut-950/5 cursor-pointer"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${idx === current ? "opacity-100" : "opacity-0"}`}
        >
          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          {banner.redirect_label && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-laut-950/70 to-transparent p-4 pt-12">
              <span className="inline-block bg-fajar text-laut-950 text-xs font-semibold px-3 py-1.5 rounded-sm shadow-sm">
                {banner.redirect_label}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-laut-950/30 px-2 py-1.5 backdrop-blur">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Banner ${idx + 1}`}
              aria-current={idx === current}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === current ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
