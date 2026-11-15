# Monitoring harian & rencana DMARC

## Otomatis (sudah aktif)

`scripts/monitor-beautifio.sh` jalan tiap **00:05 UTC / 07:05 WIB** lewat cron
VPS (dipasang oleh `deploy/setup-cron.sh`), hasilnya ditambahkan ke
`/var/log/beautifio-monitor.log`.

Jalankan manual kapan saja:

```bash
ssh root@31.97.49.146 'bash -s' < scripts/monitor-beautifio.sh
# atau lihat riwayat
ssh root@31.97.49.146 'tail -80 /var/log/beautifio-monitor.log'
```

Isi laporan:

1. **DNS email** — status SPF / DKIM / DMARC dari DNS-over-HTTPS.
2. **Mail log 24 jam** — terkirim, bounced (dipisah: bounce uji `example.com` /
   `stadione.pro` vs bounce nyata), deferred, jumlah `from=<noreply@beautifio.com>`,
   penerimaan Gmail, dan sisa pemakaian fallback lama.
3. **Metrik langganan** — aktif, baru 7/30 hari, kedaluwarsa ≤7 hari,
   **MRR ternormalisasi** (daily ×365/12, weekly ×52/12, monthly ×1, yearly ÷12),
   user weekly, dan konversi **weekly → bulanan/tahunan**, plus matriks
   tier × durasi (7 paket).
4. **Kesehatan aplikasi** — HTTP `/` dan jumlah baris error di log container
   24 jam terakhir.

Tidak ada query yang mengubah data; aman dijalankan kapan saja.

## Deliverability: sudah terverifikasi (2026-11-15)

| Cek | Hasil |
|---|---|
| `scripts/verify-mail-dns.sh` | SPF **PASS**, DKIM **PASS**, DMARC **PASS** |
| Kunci publik DNS vs privat VPS | 420 char identik; `opendkim-testmsg` → `key OK` |
| Kirim ke Gmail sungguhan | `status=sent (250 2.0.0 OK ... gsmtp)` ke `gmail-smtp-in.l.google.com` |
| Verifikasi kriptografis DKIM | `dkimpy verify: True`, `d=beautifio.com` |
| SPF alignment | `31.97.49.146` ada di `v=spf1`, domain `From` = `beautifio.com` |
| DMARC alignment | `From` domain = `d=` DKIM domain → aligned, `p=none` → pass |
| Auto-switch aplikasi | `from=<noreply@beautifio.com>`, tanpa warning gate |

Cek header `Authentication-Results` di inbox Gmail bila ingin bukti sisi
penerima; hasilnya harus `spf=pass dkim=pass dmarc=pass`. Email uji bersubjek
`[Beautifio] Uji deliverability SPF/DKIM/DMARC` sudah dikirim ke
`taradfworkspace@gmail.com`.

## Rencana naik DMARC (#4)

**Status: sengaja ditunda, bukan terlewat.** Domain ini masih dipakai
**Hostinger Mail** (MX `mx1/mx2.hostinger.com`, 3 CNAME DKIM
`hostingermail-a/b/c`, SPF include Hostinger). Mengetatkan DMARC terlalu cepat
bisa membuat email yang dikirim lewat Hostinger masuk spam.

Urutan aman:

| Tahap | Kapan | Nilai `_dmarc` |
|-------|-------|----------------|
| 0 (sekarang) | ✅ aktif | `v=DMARC1; p=none` |
| 1 | Setelah **3–7 hari** monitor menunjukkan 0 bounce nyata & `from=<noreply@beautifio.com>` 100% | `v=DMARC1; p=quarantine; pct=25` |
| 2 | 1–2 minggu setelah tahap 1 stabil | `v=DMARC1; p=quarantine; pct=100` |
| 3 | Hanya setelah semua pengirim sah ter-audit | `p=reject` (tidak disarankan selama Hostinger Mail aktif) |

**Larangan:** jangan pernah pakai `adkim=s` / `aspf=s` (strict alignment) di
domain ini, dan jangan menambahkan `rua=mailto:postmaster@beautifio.com`
kecuali mailbox itu benar-benar ada & dibaca.

Nilai tahap 1 siap ditempel (edit record `_dmarc` yang ada, jangan add baru):

```
v=DMARC1; p=quarantine; pct=25
```

Setelah diubah, `scripts/verify-mail-dns.sh` dan monitor harian akan langsung
mencerminkan `p=quarantine`. Tidak ada perubahan kode/aplikasi yang diperlukan.

## Catatan data uji

Bounce `example.com` (nullMX) dan `info@stadione.pro` (mail loop) di log berasal
dari pengujian kita sendiri, bukan masalah deliverability. Monitor memisahkannya
agar angka "bounced" tidak menyesatkan.
