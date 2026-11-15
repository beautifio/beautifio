# Rencana Harga Langganan Beautifio (2026)

> Status: **AKTIF di produksi** sejak 2026-11-15.
> 7 paket tersedia; lihat tabel "Yang SUDAH jalan" di bawah.
> Seed: `supabase/migrations/00015_weekly_duration.sql` +
> `supabase/seed/subscription_plans_2026.sql` (idempotent).
> Data dapat diubah lewat `/admin/subscriptions`.

## Prinsip penentuan harga

- Target utama: **mahasiswa kota second**, uang jajan **~Rp 1,5 juta/bulan**.
- Weekly dibuat **terasa lebih menguntungkan** dari monthly untuk komitmen pendek:
  - Monthly (Pro) = Rp 49.000
  - 1 bulan ≈ 4,33 minggu → "fair price" ≈ Rp 11.316/minggu
  - Dibulatkan **Rp 12.000/minggu** → 4 minggu = **Rp 48.000 < Rp 49.000**.
  - Pesan UI: *"Bayar 4 minggu weekly = Rp 48.000, hemat Rp 1.000 vs bulanan."*
- Break-even: mulai **minggu ke-5** monthly lebih murah. Weekly dioptimalkan
  untuk trial / kebutuhan 1–4 minggu, bukan untuk churn jangka panjang.

## Matriks harga (usulan)

| Tier | Mingguan (7 hari) | Bulanan (30 hari) | Tahunan (365 hari) | Setara /bulan (tahunan) |
|------|-------------------|-------------------|--------------------|-------------------------|
| **Pro** | Rp 12.000 *(baru)* | **Rp 49.000** *(sudah ada)* | **Rp 399.000** *(sudah ada)* | Rp 33.250 |
| **Ultimate** | Rp 25.000 *(baru)* | Rp 99.000 *(baru)* | Rp 799.000 *(baru)* | Rp 66.583 |

Catatan:
- `Pro Harian` Rp 5.000 sudah ada di DB tapi tidak terekspos di UI upgrade.
- `duration_type` di DB sudah mendukung `daily, monthly, quarterly, yearly, lifetime`
  (migrasi `00012`). **`weekly` belum ada** → butuh tambah nilai CHECK constraint
  bila paket mingguan benar-benar mau dijual.
- `tier` & `original_price_idr` sudah ada di DB + Prisma (migrasi `00012`, perbaikan
  Prisma schema). Admin `createPlan` sudah terbukti bisa membuat plan `ultimate`.

## Yang SUDAH jalan di produksi (7 paket)

| Paket | Tier | Durasi | Harga | Status |
|-------|------|--------|-------|--------|
| Pro Harian | pro | daily | Rp 5.000 | ✅ ada, tidak tampil di UI |
| Pro Mingguan | pro | weekly | Rp 12.000 | ✅ UI + DOKU (expiry 7 hari) |
| Pro Bulanan | pro | monthly | Rp 49.000 | ✅ end-to-end (DOKU) |
| Pro Tahunan | pro | yearly | Rp 399.000 | ✅ end-to-end (DOKU) |
| Ultimate Mingguan | ultimate | weekly | Rp 25.000 | ✅ UI + DOKU |
| Ultimate Bulanan | ultimate | monthly | Rp 99.000 | ✅ UI + DOKU |
| Ultimate Tahunan | ultimate | yearly | Rp 799.000 | ✅ UI + DOKU (coretan Rp 1.188.000 → hemat 33%) |

Alur `/api/subscription/plans` → `/api/payment/subscribe` → DOKU →
`/api/payment/confirm` / callback → `getUserTier()` sudah terverifikasi.
Toggle UI: **Mingguan / Bulanan / Tahunan** × **Pro / Ultimate**.
MRR admin dinormalisasi per duration (`weekly × 52/12`, `yearly / 12`, dll).

## Simulasi revenue: 1.000 user ambil paket Weekly Rp 12.000

| Periode | Per user | Total 1.000 user |
|---------|----------|------------------|
| Minggu pertama | Rp 12.000 | **Rp 12.000.000** |
| 1 bulan (4 minggu) | Rp 48.000 | **Rp 48.000.000** |
| 3 bulan (12 minggu) | Rp 144.000 | **Rp 144.000.000** |

Perbandingan 1.000 user, 3 bulan:

| Metrik | Weekly (Rp 12k) | Monthly (Rp 49k) | Selisih |
|--------|-----------------|------------------|---------|
| Revenue 3 bulan | Rp 144.000.000 | Rp 147.000.000 | Weekly − Rp 3.000.000 |
| Revenue / minggu | Rp 12.000.000 | Rp 11.075.000 | Weekly + Rp 925.000 |
| Biaya / user 3 bulan | Rp 144.000 | Rp 147.000 | Weekly hemat Rp 3.000 |

**Kesimpulan**: weekly sedikit lebih rendah LTV 3 bulan, tapi menurunkan
hambatan komitmen → konversi trial naik. Cocok sebagai *top-of-funnel*;
upsell ke monthly/tahunan setelah user terbiasa.

## Yang masih opsional

1. **Fase 3**: tampilkan `Pro Harian` (Rp 5.000) di UI upgrade bila diinginkan —
   sudah ada di DB, belum terekspos.
2. Pantau konversi weekly → monthly; bila drop-off tinggi sebelum bulan ke-2,
   naikkan weekly ke Rp 15.000.
3. Sesuaikan `original_price_idr` bila ingin menampilkan badge diskon di paket lain.
