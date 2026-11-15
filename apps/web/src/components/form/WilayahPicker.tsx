"use client";

/**
 * WilayahPicker — 4-level cascading searchable dropdowns for Indonesian
 * administrative regions, with automatic postal-code fill.
 *
 * Data source: public.indonesia_* tables (34 provinsi / 514 kab-kota /
 * 7.219 kecamatan / 82.852 desa-kelurahan + kode pos).
 * Reusable in any form: pass `value` + `onChange`.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, MapPin, Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export interface WilayahValue {
  province: string;
  provinceId: number | null;
  regency: string;
  regencyId: number | null;
  kecamatan: string;
  districtId: string | null;
  kelurahan: string;
  villageId: string | null;
  kodepos: string;
  /** asal kode pos; 'fallback_kecamatan' = estimasi, perlu dicek user */
  kodeposSource?: string | null;
}

export const EMPTY_WILAYAH: WilayahValue = {
  province: "", provinceId: null,
  regency: "", regencyId: null,
  kecamatan: "", districtId: null,
  kelurahan: "", villageId: null,
  kodepos: "",
  kodeposSource: null,
};

/** Name-only shape, as stored in public.users / mitra_applications. */
export interface WilayahNames {
  province?: string | null;
  regency?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  kodepos?: string | null;
}

/**
 * Hydrate stored *name* strings back into a fully-resolved WilayahValue.
 *
 * Our tables keep only labels, not ids, but the cascading dropdowns need ids to
 * know which level to enable and which children to load. Without this, a saved
 * profile would display its location yet have every dependent dropdown locked.
 * Best-effort: a level that no longer matches (renamed region) keeps its label
 * with a null id — the user simply re-picks it. Safe to call on every mount.
 */
export async function resolveWilayahFromNames(n: WilayahNames): Promise<WilayahValue> {
  const out: WilayahValue = {
    ...EMPTY_WILAYAH,
    province: n.province || "",
    regency: n.regency || "",
    kecamatan: n.kecamatan || "",
    kelurahan: n.kelurahan || "",
    kodepos: n.kodepos || "",
  };
  const norm = (s: string) => (s || "").trim().toUpperCase();
  try {
    if (!out.province) return out;
    const { data: provs } = await supabase
      .from("indonesia_provinces").select("id,name");
    const p = (provs ?? []).find((x: any) => norm(x.name) === norm(out.province));
    if (!p) return out;
    out.provinceId = Number(p.id);

    if (!out.regency) return out;
    const { data: regs } = await supabase
      .from("indonesia_regencies").select("id,name,type")
      .eq("province_id", out.provinceId);
    // Stored value may be "Kota PEKANBARU" (label) or just "PEKANBARU".
    const r = (regs ?? []).find((x: any) =>
      norm(`${x.type} ${x.name}`) === norm(out.regency) || norm(x.name) === norm(out.regency));
    if (!r) return out;
    out.regencyId = Number(r.id);
    out.regency = `${r.type} ${r.name}`;

    if (!out.kecamatan) return out;
    const { data: dists } = await supabase
      .from("indonesia_districts").select("id,name")
      .eq("regency_id", out.regencyId);
    const d = (dists ?? []).find((x: any) => norm(x.name) === norm(out.kecamatan));
    if (!d) return out;
    out.districtId = String(d.id);

    if (!out.kelurahan) return out;
    const { data: vills } = await supabase
      .from("indonesia_villages").select("id,name,kodepos,kodepos_source")
      .eq("district_id", out.districtId).limit(1000);
    const v = (vills ?? []).find((x: any) => norm(x.name) === norm(out.kelurahan));
    if (!v) return out;
    out.villageId = String(v.id);
    if (!out.kodepos && v.kodepos) out.kodepos = String(v.kodepos);
    out.kodeposSource = v.kodepos_source ?? null;
  } catch {
    // Best-effort: keep the labels even if a lookup fails.
  }
  return out;
}

type Option = {
  id: string | number;
  label: string;
  kodepos?: string | null;
  kodeposSource?: string | null;
  raw?: any;
};

interface Props {
  value?: WilayahValue;
  onChange: (v: WilayahValue) => void;
  /** show the editable kode pos field (default true) */
  showKodepos?: boolean;
  /** compact inline style for tight forms */
  compact?: boolean;
}

export function WilayahPicker({ value, onChange, showKodepos = true, compact = false }: Props) {
  const [v, setV] = useState<WilayahValue>(value ?? EMPTY_WILAYAH);

  // keep in sync if parent resets the value
  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(v)) setV(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (next: WilayahValue) => {
    setV(next);
    onChange(next);
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <LevelSelect
        label="Provinsi"
        placeholder="Pilih provinsi"
        value={v.province}
        compact={compact}
        load={async () => {
          const { data } = await supabase
            .from("indonesia_provinces").select("id,name").order("name");
          return (data ?? []).map((r: any) => ({ id: r.id, label: r.name, raw: r }));
        }}
        onPick={(o) => emit({ ...EMPTY_WILAYAH, province: o.label, provinceId: Number(o.id) })}
      />

      <LevelSelect
        label="Kota / Kabupaten"
        placeholder={v.province ? "Pilih kota/kabupaten" : "Pilih provinsi dulu"}
        value={v.regency}
        disabled={!v.provinceId}
        compact={compact}
        load={async () => {
          const { data } = await supabase
            .from("indonesia_regencies").select("id,name,type")
            .eq("province_id", v.provinceId!).order("name");
          return (data ?? []).map((r: any) => ({
            id: r.id, label: `${r.type} ${r.name}`, raw: r,
          }));
        }}
        onPick={(o) => emit({ ...v, regency: o.label, regencyId: Number(o.id),
          kecamatan: "", districtId: null, kelurahan: "", villageId: null, kodepos: "", kodeposSource: null })}
        deps={[v.provinceId]}
      />

      <LevelSelect
        label="Kecamatan"
        placeholder={v.regencyId ? "Pilih kecamatan" : "Pilih kota dulu"}
        value={v.kecamatan}
        disabled={!v.regencyId}
        compact={compact}
        load={async () => {
          const { data } = await supabase
            .from("indonesia_districts").select("id,name")
            .eq("regency_id", v.regencyId!).order("name");
          return (data ?? []).map((r: any) => ({ id: r.id, label: r.name, raw: r }));
        }}
        onPick={(o) => emit({ ...v, kecamatan: o.label, districtId: String(o.id),
          kelurahan: "", villageId: null, kodepos: "", kodeposSource: null })}
        deps={[v.regencyId]}
      />

      <LevelSelect
        label="Desa / Kelurahan"
        placeholder={v.districtId ? "Pilih desa/kelurahan" : "Pilih kecamatan dulu"}
        value={v.kelurahan}
        disabled={!v.districtId}
        compact={compact}
        load={async () => {
          const { data } = await supabase
            .from("indonesia_villages").select("id,name,kodepos,kodepos_source")
            .eq("district_id", v.districtId!).order("name").limit(1000);
          return (data ?? []).map((r: any) => ({
            id: r.id, label: r.name, kodepos: r.kodepos,
            kodeposSource: r.kodepos_source, raw: r,
          }));
        }}
        onPick={(o) => emit({ ...v, kelurahan: o.label, villageId: String(o.id),
          kodepos: o.kodepos ?? "", kodeposSource: o.kodeposSource ?? null })}
        deps={[v.districtId]}
      />

      {showKodepos && (
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-1.5">
            <MapPin size={13} className="text-primary" /> Kode Pos
          </label>
          <input
            value={v.kodepos}
            onChange={(e) => emit({ ...v, kodepos: e.target.value.replace(/\D/g, "").slice(0, 5) })}
            inputMode="numeric"
            placeholder={v.kelurahan ? "Otomatis — bisa diedit" : "Terisi otomatis setelah pilih desa"}
            className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-bg text-text-primary outline-none focus:border-primary transition-colors"
          />
          <p className="text-[10px] text-text-secondary mt-1">
            {v.kodeposSource === "fallback_kecamatan"
              ? "Perkiraan dari kecamatan yang sama — mohon dicek & diperbaiki bila beda."
              : v.kodeposSource === "posindonesia_kecamatan"
                ? "Kode pos tingkat kecamatan dari POS Indonesia — cek bila desamu punya kode berbeda."
                : v.kodepos
                  ? "Terisi otomatis dari data POS Indonesia. Ubah bila tidak sesuai."
                  : "Pilih desa/kelurahan di atas — kode pos terisi otomatis."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Searchable dropdown level ─────────────────────────────────────────── */

function LevelSelect({
  label, placeholder, value, disabled, compact, load, onPick, deps = [],
}: {
  label: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  compact?: boolean;
  load: () => Promise<Option[]>;
  onPick: (o: Option) => void;
  deps?: any[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Lazy-load only when opened (or when deps change while open)
  useEffect(() => {
    if (!open || disabled) return;
    let alive = true;
    setLoading(true);
    load().then((data) => {
      if (alive) { setOptions(data); setLoading(false); }
    }).catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, disabled, ...deps]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, search]);

  return (
    <div className="relative" ref={boxRef}>
      <label className="text-xs font-semibold text-text-primary mb-1.5 block">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((o) => !o); setSearch(""); }}
        className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-bg text-left flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition-colors cursor-pointer"
      >
        <span className={value ? "text-text-primary" : "text-text-secondary/50"}>
          {value || placeholder}
        </span>
        <ChevronDown size={15} className="text-text-secondary shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-surface border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
          <div className="sticky top-0 bg-surface p-2 border-b border-border">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Cari ${label.toLowerCase()}...`}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-bg text-xs outline-none focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-text-secondary">
              <Loader2 size={14} className="animate-spin" /> Memuat...
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-3 text-xs text-text-secondary">Tidak ada hasil</p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => { onPick(o); setOpen(false); }}
                className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-muted transition-colors cursor-pointer ${
                  value === o.label ? "bg-primary/5 text-primary font-medium" : "text-text-primary"
                }`}
              >
                <span className="pointer-events-none">{o.label}</span>
                {o.kodepos ? (
                  <span className="text-[10px] text-text-secondary pointer-events-none">{o.kodepos}</span>
                ) : null}
                {value === o.label && <Check size={13} className="pointer-events-none" />}
              </button>
            ))
          )}
          {filtered.length > 0 && (
            <p className="px-3 py-1.5 text-[10px] text-text-secondary border-t border-border">
              {filtered.length} pilihan
            </p>
          )}
        </div>
      )}
    </div>
  );
}
