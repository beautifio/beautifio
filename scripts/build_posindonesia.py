#!/usr/bin/env python3
"""Rebuild supabase/seed/data/kodepos_posindonesia_resolved.json.

This is the *official* postal-code source for Beautifio. It resolves a kode pos
for every desa/kelurahan in the BPS/Dagri hierarchy, preferring the POS
Indonesia harvest over the older derived datasets.

Sources
-------
1. --overlay   edigius/kodepos-wilayah `official_overlay.json`
               {kode_dagri_desa: kodepos}, harvested 2026-11-13 from
               https://kodepos.posindonesia.co.id (Kepmendagri 300.2.2-2430/2025).
               https://raw.githubusercontent.com/edigius/kodepos-wilayah/main/official_overlay.json
2. --harvest-dir  that repo's `harvest/*.json` (516 files, one per kab/kota),
               raw rows {kodepos, desa, kecamatan, kab, prov}. Used for name
               joins when the exact kode_dagri is absent (renamed/split desa).
3. --cahyadsn  cahyadsn/wilayah_kodepos json (LEGACY, 2019)
4. --sooluh    sooluh/kodepos json (LEGACY, derived from the same old source)

Why the switch
--------------
cahyadsn + sooluh agree with each other 100% but disagree with POS Indonesia on
44.4% of villages — they are the same stale derived dataset. Independent checks
(e.g. Manggeng, Aceh Barat Daya: old 23760 vs official 23762) confirm the POS
Indonesia values. See docs/wilayah-data.md.

Resolution order (most trustworthy first)
----------------------------------------
  posindonesia_exact      exact kode_dagri in the official overlay
  posindonesia_name       (kab, kecamatan, desa) name join in the official harvest
  posindonesia_kecamatan  official district-level mode (harvest / overlay prefix)
  code                    legacy cahyadsn exact join
  name_kec_desa           legacy sooluh (kecamatan, desa) join
  name_kecamatan          legacy sooluh district-level join
  fallback_kecamatan      sibling mode (ESTIMATE — currently 0 rows)

Usage
-----
  python3 scripts/build_posindonesia.py \
    --wilayah-csv /path/wilayah_bps_dagri.csv \
    --overlay      /path/official_overlay.json \
    --harvest-dir  /path/harvest_all \
    --cahyadsn     /path/wilayah_kodepos.json \
    --sooluh       /path/kodepos.json \
    --out          supabase/seed/data/kodepos_posindonesia_resolved.json
"""

import argparse
import collections
import csv
import difflib
import glob
import json
import os
import re


def n(s):
    return re.sub(r"[^A-Z0-9]", "", (s or "").upper())


def clean_kab(s):
    return re.sub(r"^(KABUPATEN|KAB\.?|KOTA)\s+", "", (s or "").upper(), flags=re.I).strip()


def mode(counter):
    return counter.most_common(1)[0][0] if counter else None


def dom(counter, threshold=1.0):
    if not counter:
        return None
    top, num = counter.most_common(1)[0]
    return top if len(counter) == 1 or num / sum(counter.values()) >= threshold else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wilayah-csv", required=True)
    ap.add_argument("--overlay", required=True)
    ap.add_argument("--harvest-dir", required=True)
    ap.add_argument("--cahyadsn", required=True)
    ap.add_argument("--sooluh", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    rows = list(csv.DictReader(open(a.wilayah_csv, encoding="utf-8")))
    villages = [r for r in rows if r["level"] == "desa_kelurahan"]
    kec_name = {r["kode_bps"]: r["nama_dagri"] for r in rows if r["level"] == "kecamatan"}
    kab_name = {r["kode_bps"]: clean_kab(r["nama_dagri"]) for r in rows if r["level"] == "kabupaten"}
    prov_name = {r["kode_bps"]: r["nama_dagri"] for r in rows if r["level"] == "provinsi"}

    overlay = json.load(open(a.overlay, encoding="utf-8"))

    # ── official harvest indexes ───────────────────────────────────────────
    harvest_by_code = {}
    alias_prov_kab = {}
    alias_kab = collections.defaultdict(set)
    for f in glob.glob(os.path.join(a.harvest_dir, "*.json")):
        code = os.path.basename(f).replace(".json", "")
        try:
            d = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(d, dict) or "rows" not in d:
            continue
        reg = clean_kab(d.get("regency_name", ""))
        alias_prov_kab.setdefault((n(d.get("query", "")), n(reg)), code)
        alias_kab[n(reg)].add(code)
        harvest_by_code[code] = [
            (n(x.get("kecamatan")), n(x.get("desa")), str(x.get("kodepos")))
            for x in d.get("rows", []) if x.get("kodepos")
        ]

    by_name = collections.defaultdict(collections.Counter)
    by_kec = collections.defaultdict(collections.Counter)
    kec_labels = collections.defaultdict(set)
    for code, rr in harvest_by_code.items():
        for kc, ds, pos in rr:
            by_name[(code, kc, ds)][pos] += 1
            by_kec[(code, kc)][pos] += 1
            kec_labels[code].add(kc)

    overlay_pref = collections.defaultdict(collections.Counter)
    for kd, pos in overlay.items():
        overlay_pref[kd[:8]][str(pos)] += 1

    def best_kec(code, want):
        labels = kec_labels.get(code, set())
        if want in labels:
            return want
        best, score = None, 0.0
        for k in labels:
            s = difflib.SequenceMatcher(None, want, k).ratio()
            if s > score:
                best, score = k, s
        return best if score >= 0.75 else None

    def harvest_code_for(r):
        kd = r["kode_dagri"]
        code = ".".join(kd.split(".")[:2])
        if code in harvest_by_code:
            return code
        # Papua was renumbered in 2022: kode_dagri still 91.x, kode_bps is
        # already 94.x/95.x/96.x — the official harvest uses the NEW codes.
        bps = (r["parent_code_bps"] or "")[:4]
        if len(bps) == 4:
            code2 = bps[:2] + "." + bps[2:]
            if code2 in harvest_by_code:
                return code2
        pv = n(prov_name.get(kd.split(".")[0], ""))
        kb = n(kab_name.get(bps, ""))
        if (pv, kb) in alias_prov_kab:
            return alias_prov_kab[(pv, kb)]
        cands = alias_kab.get(kb) or set()
        return next(iter(cands)) if len(cands) == 1 else None

    # ── legacy sources ─────────────────────────────────────────────────────
    OLD = json.load(open(a.cahyadsn, encoding="utf-8"))
    S = json.load(open(a.sooluh, encoding="utf-8"))
    L2 = collections.defaultdict(collections.Counter)
    L1 = collections.defaultdict(collections.Counter)
    byKecS = collections.defaultdict(collections.Counter)
    byKabKecS = collections.defaultdict(collections.Counter)
    byKabS = collections.defaultdict(collections.Counter)
    for x in S:
        c = str(x["code"])
        p, kb, kc, ds = n(x["province"]), n(x["regency"]), n(x["district"]), n(x["village"])
        L2[(kc, ds)][c] += 1
        L1[ds][c] += 1
        byKecS[kc][c] += 1
        byKabKecS[(kb, kc)][c] += 1
        byKabS[(p, kb)][c] += 1

    def legacy(r):
        kd = r["kode_dagri"]
        if kd in OLD:
            return str(OLD[kd]), "code"
        ds = n(r["nama_dagri"] or r["nama_bps"])
        kc = n(kec_name.get(r["parent_code_bps"], ""))
        kb = n(kab_name.get(r["parent_code_bps"][:4], ""))
        pv = n(prov_name.get(kd.split(".")[0], ""))
        pos = dom(L2.get((kc, ds)), 0.8) or dom(L1.get(ds))
        if pos:
            return pos, "name_kec_desa"
        for idx, key in ((byKabKecS, (kb, kc)), (byKecS, kc), (byKabS, (pv, kb))):
            pos = dom(idx.get(key), 0.6)
            if pos:
                return pos, "name_kecamatan"
        return None, None

    # ── resolve ────────────────────────────────────────────────────────────
    resolved = {}
    stats = collections.Counter()
    for r in villages:
        kd = r["kode_dagri"]
        ds = n(r["nama_dagri"] or r["nama_bps"])
        kc = n(kec_name.get(r["parent_code_bps"], ""))
        pos = src = None

        if kd in overlay:
            pos, src = str(overlay[kd]), "posindonesia_exact"

        if not pos:
            code = harvest_code_for(r)
            if code:
                bk = best_kec(code, kc)
                if bk and by_name.get((code, bk, ds)):
                    pos, src = mode(by_name[(code, bk, ds)]), "posindonesia_name"

        if not pos:
            code = harvest_code_for(r)
            if code:
                bk = best_kec(code, kc)
                if bk and by_kec.get((code, bk)):
                    pos, src = mode(by_kec[(code, bk)]), "posindonesia_kecamatan"
        if not pos and overlay_pref.get(kd[:8]):
            pos, src = mode(overlay_pref[kd[:8]]), "posindonesia_kecamatan"

        if not pos:
            pos, src = legacy(r)

        if pos:
            resolved[kd] = [pos, src]
            stats[src] += 1
        else:
            stats["UNRESOLVED"] += 1

    # last resort: sibling mode in the same kecamatan (should stay at 0)
    by_parent = collections.defaultdict(collections.Counter)
    for r in villages:
        if r["kode_dagri"] in resolved:
            by_parent[r["parent_code_bps"]][resolved[r["kode_dagri"]][0]] += 1
    parent_mode = {k: mode(c) for k, c in by_parent.items()}
    for r in villages:
        kd = r["kode_dagri"]
        if kd not in resolved and r["parent_code_bps"] in parent_mode:
            resolved[kd] = [parent_mode[r["parent_code_bps"]], "fallback_kecamatan"]
            stats["fallback_kecamatan"] += 1
            stats["UNRESOLVED"] -= 1

    print("sumber:", dict(stats))
    print("terisi:", len(resolved), "/", len(villages))
    out = {
        "meta": {
            "source": "Pos Indonesia official harvest via edigius/kodepos-wilayah",
            "url": "https://github.com/edigius/kodepos-wilayah",
            "harvested": "2026-11-13",
            "overlay_keys": len(overlay),
            "harvest_files": len(harvest_by_code),
            "note": "posindonesia_* = sumber resmi; code/name_* = dataset turunan lama; fallback_kecamatan = ESTIMASI",
        },
        "villages": resolved,
    }
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))
    print("written:", a.out, round(os.path.getsize(a.out) / 1024 / 1024, 2), "MB")


if __name__ == "__main__":
    main()
