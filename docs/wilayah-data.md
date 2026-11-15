# Data Wilayah Indonesia + Kode Pos

Dipakai oleh `components/form/WilayahPicker.tsx` (dropdown berjenjang di
`/daftar-mitra` **dan** `/profil/edit`) dan ditampilkan di `/admin/mitra`.

## Isi

| Level | Tabel | Jumlah |
|-------|-------|--------|
| Provinsi | `indonesia_provinces` | 34 |
| Kabupaten/Kota | `indonesia_regencies` | 514 (416 Kabupaten + 98 Kota) |
| Kecamatan | `indonesia_districts` | 7.219 |
| Desa/Kelurahan | `indonesia_villages` | 82.852 |
| Kode pos terisi | | **82.852 (100%)** |
| Kode pos estimasi | | **0** |

## Sumber kode pos (sejak 2026-11-15)

**Primer: POS Indonesia resmi.** Data panen dari
`kodepos.posindonesia.co.id` yang diterbitkan lewat repo terbuka
[edigius/kodepos-wilayah](https://github.com/edigius/kodepos-wilayah)
(struktur wilayah mengikuti Kepmendagri No. 300.2.2-2430 Tahun 2025,
panen 2026-11-13):

1. `official_overlay.json` — 80.576 entri `kode_dagri_desa → kodepos`.
2. `harvest/*.json` — 516 file, satu per kabupaten/kota, baris mentah
   `{kodepos, desa, kecamatan, kab, prov}` (96.006 baris). Dipakai untuk
   join nama bila kode_dagri tidak cocok (desa pecah/berganti nama).

Turunan ringkas yang **disimpan di repo**:
`supabase/seed/data/kodepos_posindonesia_resolved.json`
(`{kode_dagri: [kodepos, sumber]}` untuk seluruh 82.852 desa, 3,7 MB).
Dibangun ulang oleh `scripts/build_posindonesia.py`.

**Fallback lama (hanya 1.386 desa / 1,7%)**:
`cahyadsn/wilayah_kodepos` dan `sooluh/kodepos`. Keduanya adalah dataset
turunan 2019 yang sama persis (cocok 100% satu sama lain).

### Kenapa sumber lama diganti

| Perbandingan | Hasil |
|---|---|
| cahyadsn vs sooluh | 100% cocok (sumber kembar) |
| cahyadsn vs POS Indonesia resmi | **44,4% berbeda** (32.936 desa) |
| POS Indonesia vs sooluh | 55,7% cocok |

Contoh terverifikasi independen: Kec. **Manggeng**, Aceh Barat Daya —
sumber lama `23760`, POS Indonesia `23762`. `kodepos.id`,
`sejarah-negara.com`, dan 3 sumber lain mengonfirmasi **23762**. Nilai lama
ternyata usang, jadi seluruh seed dialihkan ke sumber resmi.

## `kodepos_source` (audit trail)

| Nilai | Jumlah | Arti |
|-------|--------|------|
| `posindonesia_exact` | 74.228 | Join eksak `kode_dagri` ke overlay resmi |
| `posindonesia_name` | 6.545 | Join nama (kab + kecamatan + desa) ke harvest resmi |
| `posindonesia_kecamatan` | 693 | Modus resmi tingkat kecamatan (desa baru/pecah) |
| `code` | 154 | Fallback cahyadsn eksak |
| `name_kec_desa` | 1.220 | Fallback sooluh (kecamatan + desa) |
| `name_kecamatan` | 12 | Fallback sooluh tingkat kecamatan |
| `fallback_kecamatan` | **0** | ESTIMASI modus tetangga — tidak ada lagi |

**98,3% bersumber resmi POS Indonesia, 0% estimasi.** Untuk 693 desa
`posindonesia_kecamatan`, UI menampilkan hint *"Kode pos tingkat kecamatan
dari POS Indonesia — cek bila desamu punya kode berbeda"* dan field tetap
bisa diedit.

### Kasus khusus Papua

6 provinsi Papua pemekaran 2022 memakai `kode_dagri` lama (`91.x`) tetapi
`kode_bps` sudah baru (`94.x/95.x/96.x`). Harvest resmi memakai kode baru,
jadi `scripts/build_posindonesia.py` mencoba `kode_dagri` → `parent_code_bps`
→ alias nama kabupaten. Tanpa ini 11 desa Papua (Paniai, Yahukimo,
Mamberamo Tengah) tak akan pernah cocok.

## Hierarki wilayah

`Master Data Command Center/data/processed/wilayah_bps_dagri.csv`
(SIG BPS / Kemendagri, 90.630 baris). Kolom `kode_bps`, `kode_dagri`,
`parent_code_bps`. Hierarki 100% konsisten, tanpa kode duplikat.

## Regenerasi

```bash
# 1. Unduh sumber resmi (sekali, atau saat ada panen baru)
curl -sL https://raw.githubusercontent.com/edigius/kodepos-wilayah/main/official_overlay.json \
  -o /tmp/official_overlay.json
# harvest/*.json: 516 file dari folder `harvest/` repo tersebut

# 2. Bangun resolved json
python3 scripts/build_posindonesia.py \
  --wilayah-csv  /path/wilayah_bps_dagri.csv \
  --overlay      /tmp/official_overlay.json \
  --harvest-dir  /tmp/harvest_all \
  --cahyadsn     /path/wilayah_kodepos.json \
  --sooluh       /path/kodepos.json \
  --out          supabase/seed/data/kodepos_posindonesia_resolved.json

# 3. Bangun SQL seed
python3 supabase/seed/generate_wilayah.py \
  --wilayah-csv      /path/wilayah_bps_dagri.csv \
  --kodepos-official supabase/seed/data/kodepos_posindonesia_resolved.json \
  --kodepos-code     /path/wilayah_kodepos.json \
  --kodepos-named    /path/kodepos.json \
  --out              supabase/seed/wilayah_indonesia.sql

# 4. Terapkan (idempotent: TRUNCATE + COPY)
ssh root@31.97.49.146 \
  'docker exec -i supabase-db-... psql -U postgres -d postgres' \
  < supabase/seed/wilayah_indonesia.sql
```

Skema: `00014_wilayah_reference.sql` (tabel + RLS read-only),
`00016_kodepos_source.sql` (kolom provenance),
`00017_kodepos_source_values.sql` (dokumentasi nilai). RLS diaktifkan dengan
policy `USING (true)` untuk SELECT; write tetap diblokir mengikuti
`20261026020000_lock_down_anon_writes.sql`.

## Penyimpanan di aplikasi

`public.users` dan `public.mitra_applications` menyimpan **nama** (bukan id):
`province`, `regency`, `kecamatan`, `kelurahan`, `kodepos`. Karena itu
`WilayahPicker` menyediakan `resolveWilayahFromNames()` yang menerjemahkan
nama tersimpan kembali menjadi id saat halaman dibuka, supaya dropdown
berjenjang tetap bisa dipakai (bukan cuma menampilkan teks mati).
`/profil/edit` tetap menyinkronkan kolom legacy `city` untuk pembaca lama
(`/onboarding`, voucher).
