#!/usr/bin/env python3
"""
Regenerate supabase/seed/wilayah_indonesia.sql from the source datasets.

Sources
-------
1. --wilayah-csv   BPS/Dagri administrative hierarchy (Master Data Command
                   Center/data/processed/wilayah_bps_dagri.csv). Columns:
                   level,parent_code_bps,kode_bps,nama_bps,kode_dagri,nama_dagri
                   Levels: provinsi, kabupaten, kecamatan, desa_kelurahan.
2. --kodepos-official  supabase/seed/data/kodepos_posindonesia_resolved.json
                   PRIMARY. Built by scripts/build_posindonesia.py from the
                   official POS Indonesia harvest (edigius/kodepos-wilayah,
                   kodepos.posindonesia.co.id, Kepmendagri 2025). Per-village
                   {kode_dagri: [kodepos, source]}. Strongly recommended: the
                   legacy datasets below disagree with POS Indonesia on 44.4%
                   of villages (they are the same stale 2019-derived source).
3. --kodepos-code  cahyadsn/wilayah_kodepos json (LEGACY fallback)
                   https://raw.githubusercontent.com/cahyadsn/wilayah_kodepos/master/json/wilayah_kodepos.json
4. --kodepos-named sooluh/kodepos json (LEGACY fallback)
                   https://raw.githubusercontent.com/sooluh/kodepos/master/data/kodepos.json

Resolution order for kodepos (most trustworthy first)
-----------------------------------------------------
  posindonesia_exact / posindonesia_name / posindonesia_kecamatan
                    official POS Indonesia, exact / name / district level
  code              legacy cahyadsn exact kode_dagri join
  name_kec_desa     legacy (kecamatan, desa) name join, unambiguous or >=80%
  name_desa_unik    legacy village name alone, only when it maps to one code
  name_kecamatan    legacy district/regency name join
  fallback_kecamatan mode of already-resolved siblings in the same kecamatan
                     (ESTIMATE — currently 0 rows)

Usage
-----
  python3 generate_wilayah.py \
    --wilayah-csv wilayah_bps_dagri.csv \
    --kodepos-official supabase/seed/data/kodepos_posindonesia_resolved.json \
    --kodepos-code wilayah_kodepos.json \
    --kodepos-named kodepos.json \
    --out wilayah_indonesia.sql
"""

import argparse
import collections
import csv
import io
import json
import os
import re


def norm(s):
    return re.sub(r"[^A-Z0-9]", "", (s or "").upper())


def clean_kab(s):
    return re.sub(r"^(KAB\.?|KOTA)\s+", "", (s or "").upper(), flags=re.I).strip()


def csv_field(v):
    """CSV-safe: always quote, double inner quotes, flatten newlines/tabs."""
    if v is None:
        return "\\N"
    s = str(v).replace("\r", " ").replace("\n", " ").replace("\t", " ").replace('"', '""')
    return '"' + s + '"'


def copy_block(table, cols, records):
    buf = io.StringIO()
    buf.write(
        f"COPY public.{table} ({', '.join(cols)}) FROM STDIN "
        "WITH (FORMAT csv, DELIMITER E'\\t', NULL '\\N');\n"
    )
    for rec in records:
        buf.write("\t".join(csv_field(v) for v in rec) + "\n")
    buf.write("\\.\n\n")
    return buf.getvalue()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wilayah-csv", required=True)
    ap.add_argument("--kodepos-official", default=None,
                    help="PRIMARY: resolved POS Indonesia json from scripts/build_posindonesia.py")
    ap.add_argument("--kodepos-code", required=True)
    ap.add_argument("--kodepos-named", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    official = {}
    if a.kodepos_official:
        official = json.load(open(a.kodepos_official, encoding="utf-8"))["villages"]
    code_pos = json.load(open(a.kodepos_code, encoding="utf-8"))
    named = json.load(open(a.kodepos_named, encoding="utf-8"))
    rows = list(csv.DictReader(open(a.wilayah_csv, encoding="utf-8")))

    by_level = collections.defaultdict(list)
    for r in rows:
        by_level[r["level"]].append(r)

    kec_name = {r["kode_bps"]: r["nama_dagri"] for r in by_level["kecamatan"]}
    kab_name = {r["kode_bps"]: clean_kab(r["nama_dagri"]) for r in by_level["kabupaten"]}
    prov_name = {r["kode_bps"]: r["nama_dagri"] for r in by_level["provinsi"]}

    def name(r):
        return (r["nama_dagri"] or "").strip() or (r["nama_bps"] or "").strip()

    # Indexes over the named dataset
    by_village = collections.defaultdict(collections.Counter)          # (kec, desa)
    by_village_only = collections.defaultdict(collections.Counter)     # desa
    by_kab_kec = collections.defaultdict(collections.Counter)         # (kab, kec)
    by_kec = collections.defaultdict(collections.Counter)              # kec
    by_prov_kab = collections.defaultdict(collections.Counter)        # (prov, kab)
    for x in named:
        p, kb, kc, ds, code = (
            norm(x["province"]), norm(x["regency"]), norm(x["district"]),
            norm(x["village"]), str(x["code"]),
        )
        by_village[(kc, ds)][code] += 1
        by_village_only[ds][code] += 1
        by_kab_kec[(kb, kc)][code] += 1
        by_kec[kc][code] += 1
        by_prov_kab[(p, kb)][code] += 1

    def dominant(counter, threshold=1.0):
        if not counter:
            return None
        top, num = counter.most_common(1)[0]
        if len(counter) == 1 or num / sum(counter.values()) >= threshold:
            return top
        return None

    def resolve(r):
        kd = r["kode_dagri"]
        # PRIMARY: official POS Indonesia resolution (built offline from the
        # authoritative harvest). Covers 100% of villages with 0 estimates.
        if kd in official:
            pos, src = official[kd]
            return str(pos), src

        # LEGACY fallback — only used when the official file is absent/stale.
        if kd in code_pos:
            return str(code_pos[kd]), "code"

        ds = norm(name(r))
        kc = norm(kec_name.get(r["parent_code_bps"], ""))
        kb = norm(kab_name.get(r["parent_code_bps"][:4], ""))
        pv = norm(prov_name.get(kd.split(".")[0], ""))

        pos = dominant(by_village.get((kc, ds)), 0.8)
        if pos:
            return pos, "name_kec_desa"

        pos = dominant(by_village_only.get(ds))
        if pos:
            return pos, "name_desa_unik"

        for idx, key in (
            (by_kab_kec, (kb, kc)), (by_kec, kc), (by_prov_kab, (pv, kb)),
        ):
            pos = dominant(idx.get(key), 0.6)
            if pos:
                return pos, "name_kecamatan"

        return None, None

    villages = by_level["desa_kelurahan"]
    resolved = {r["kode_bps"]: resolve(r) for r in villages}

    # Last resort: mode of already-resolved siblings in the same kecamatan.
    by_parent = collections.defaultdict(collections.Counter)
    for r in villages:
        pos, _ = resolved[r["kode_bps"]]
        if pos:
            by_parent[r["parent_code_bps"]][pos] += 1
    parent_mode = {k: c.most_common(1)[0][0] for k, c in by_parent.items()}
    for r in villages:
        pos, src = resolved[r["kode_bps"]]
        if not pos and r["parent_code_bps"] in parent_mode:
            resolved[r["kode_bps"]] = (parent_mode[r["parent_code_bps"]], "fallback_kecamatan")

    stats = collections.Counter(src for _, src in resolved.values() if src)
    empty = sum(1 for pos, _ in resolved.values() if not pos)
    print("kodepos sources:", dict(stats), "| kosong:", empty)

    out = io.StringIO()
    out.write("-- Seed data wilayah administrasi Indonesia (BPS/Dagri) + kode pos.\n")
    out.write("-- Dibuat oleh supabase/seed/generate_wilayah.py — JANGAN edit manual.\n")
    out.write("-- Kode pos PRIMER: POS Indonesia resmi (lihat docs/wilayah-data.md).\n")
    out.write("-- 34 provinsi | 514 kab/kota | 7.219 kecamatan | 82.852 desa/kelurahan.\n")
    out.write("-- `kodepos_source`: posindonesia_* = resmi; fallback_kecamatan = ESTIMASI.\n")
    out.write("-- Idempotent: TRUNCATE + re-COPY. Jalankan sebagai postgres.\n\nBEGIN;\n")
    out.write(
        "TRUNCATE public.indonesia_villages, public.indonesia_districts, "
        "public.indonesia_regencies, public.indonesia_provinces RESTART IDENTITY CASCADE;\n\n"
    )

    out.write(copy_block(
        "indonesia_provinces", ["id", "name"],
        [(int(r["kode_bps"]), name(r)) for r in by_level["provinsi"]],
    ))

    kab_rows = []
    for r in by_level["kabupaten"]:
        nm = name(r).upper()
        kab_type = "Kota" if nm.startswith("KOTA") else "Kabupaten"
        kab_rows.append((
            int(r["kode_bps"]), int(r["parent_code_bps"]), kab_type,
            clean_kab(nm) or name(r),
        ))
    out.write(copy_block(
        "indonesia_regencies", ["id", "province_id", "type", "name"], kab_rows,
    ))

    out.write(copy_block(
        "indonesia_districts", ["id", "regency_id", "name"],
        [(r["kode_bps"], int(r["parent_code_bps"]), name(r))
         for r in by_level["kecamatan"] if name(r)],
    ))

    out.write(copy_block(
        "indonesia_villages",
        ["id", "district_id", "name", "kode_dagri", "kodepos", "kodepos_source"],
        [(r["kode_bps"], r["parent_code_bps"], name(r), r["kode_dagri"],
          resolved[r["kode_bps"]][0], resolved[r["kode_bps"]][1])
         for r in villages if name(r)],
    ))

    out.write("COMMIT;\nNOTIFY pgrst, 'reload schema';\n")
    open(a.out, "w", encoding="utf-8").write(out.getvalue())
    print("written:", a.out, round(os.path.getsize(a.out) / 1024 / 1024, 2), "MB")


if __name__ == "__main__":
    main()
