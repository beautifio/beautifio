# Data Wilayah Indonesia + Kode Pos

Dipakai oleh `components/form/WilayahPicker.tsx` (dropdown berjenjang di
`/daftar-mitra`) dan oleh region picker lama di `/profil/edit`.

## Isi

| Level | Tabel | Jumlah |
|-------|-------|--------|
| Provinsi | `indonesia_provinces` | 34 |
| Kabupaten/Kota | `indonesia_regencies` | 514 (416 Kabupaten + 98 Kota) |
| Kecamatan | `indonesia_districts` | 7.219 |
| Desa/Kelurahan | `indonesia_villages` | 82.852 |
| Kode pos terisi | | **82.852 (100%)** |

## Sumber

1. **Hierarki**: `Master Data Command Center/data/processed/wilayah_bps_dagri.csv`
   (SIG BPS / Kemendagri, 90.630 baris). Kolom `kode_bps`, `kode_dagri`,
   `parent_code_bps`. Hierarki 100% konsisten, tanpa kode duplikat.
2. **Kode pos by kode**: `cahyadsn/wilayah_kodepos` — map `kode_dagri_desa → kodepos`.
3. **Kode pos by nama**: `sooluh/kodepos` — 83.761 entri dengan
   `code, village, district, regency, province`, **38 provinsi** (termasuk 6
   provinsi Papua pemekaran 2022 yang tidak ada di sumber #2).

## `kodepos_source` (audit trail)

| Nilai | Jumlah | Arti |
|-------|--------|------|
| `code` | 77.121 | Join eksak `kode_dagri` (paling akurat) |
| `name_kec_desa` | 5.275 | Join nama (kecamatan + desa), unambiguous / modus ≥80% |
| `name_desa_unik` | 256 | Join nama desa saja, hanya bila 1 kode pos |
| `name_kecamatan` | 165 | Data nyata level kecamatan/regency dari sooluh |
| `fallback_kecamatan` | **35 (0,04%)** | **ESTIMASI** — modus desa tetangga sekecamatan |

**99,96% berbasis data nyata.** Hanya 35 desa yang estimasi; di UI kode posnya
tetap terisi tapi muncul hint *"Perkiraan dari kecamatan yang sama — mohon
dicek & diperbaiki bila beda"*, dan field selalu bisa diedit user.

Cross-validasi dua sumber kode pos: **99,7% setuju** pada desa yang cocok di
keduanya.

## Kenapa dua sumber

Sumber #2 (2019) memakai kode Dagri lama. 5.455 dari 5.731 desa yang awalnya
tak berkode pos ternyata berada di provinsi kode `91`/`92` (Papua pemekaran).
Join by kode tidak akan pernah menutupnya — karena itu dipakai join **nama**
dari sumber #3. Pelajaran: jangan bergantung pada satu join key untuk data
administrasi yang sering berubah kode.

## Regenerasi

```bash
python3 supabase/seed/generate_wilayah.py \
  --wilayah-csv  /path/wilayah_bps_dagri.csv \
  --kodepos-code /path/wilayah_kodepos.json \
  --kodepos-named /path/kodepos.json \
  --out supabase/seed/wilayah_indonesia.sql

# Terapkan (idempotent: TRUNCATE + COPY)
ssh root@31.97.49.146 \
  'docker exec -i supabase-db-... psql -U postgres -d postgres' \
  < supabase/seed/wilayah_indonesia.sql
```

Skema: `00014_wilayah_reference.sql` (tabel + RLS read-only),
`00016_kodepos_source.sql` (kolom provenance). RLS diaktifkan dengan policy
`USING (true)` untuk SELECT; write tetap diblokir mengikuti
`20261026020000_lock_down_anon_writes.sql`.

## Tindak lanjut opsional

Untuk 35 desa estimasi, sumber paling otoritatif adalah data resmi
**POS Indonesia**. Bila tersedia, timpa baris tersebut dan set
`kodepos_source='posindonesia'`.
