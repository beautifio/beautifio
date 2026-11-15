# DNS records agar email bisa kirim dari `@beautifio.com`

> Status **SELESAI (server + DNS + aplikasi), 2026-11-15**. Postfix `mydestination` sudah memuat
> `beautifio.com`, OpenDKIM sudah menandatangani `d=beautifio.com` (terbukti
> lewat uji kirim lokal: header `DKIM-Signature: ... d=beautifio.com`).
>
> SPF + DKIM sudah dipublish pemilik domain, `scripts/verify-mail-dns.sh`
> **PASS semua**, dan email sungguhan sudah terkirim dengan
> `from=<noreply@beautifio.com>` (auto-switch aktif, tanpa restart/rebuild).

## Zone yang sudah ada (dari hPanel, diverifikasi)

```
CNAME  hostingermail-a/b/c._domainkey -> *.dkim.mail.hostinger.com
CNAME  www            -> beautifio.com
CNAME  autodiscover   -> autodiscover.mail.hostinger.com
CNAME  autoconfig     -> autoconfig.mail.hostinger.com
A      @ / admin / api -> 31.97.49.146
TXT    _dmarc         -> "v=DMARC1; p=none"
TXT    @              -> "v=spf1 include:_spf.mail.hostinger.com ~all"
MX     @              -> mx1/mx2.hostinger.com (5 / 10)
```

**Kesimpulan penting:** domain ini **juga dipakai Hostinger Mail** (MX +
3 CNAME DKIM + SPF include). Artinya ada **dua pengirim sah** yang harus
hidup berdampingan: Hostinger Mail dan Postfix VPS kita.

- ✅ **Tidak ada konflik selector.** Hostinger pakai `hostingermail-a/b/c`,
  kita pakai selector `mail`. `mail._domainkey.beautifio.com` saat ini
  NXDOMAIN → aman ditambahkan sebagai TXT baru.
- ✅ `_spf.mail.hostinger.com` isinya
  `v=spf1 include:relay.mail.hostinger.com include:relay.mailchannels.net ~all`
  — **tidak** memuat IP VPS, jadi `ip4:31.97.49.146` wajib ditambahkan.
- ⚠️ **JANGAN pakai DMARC strict alignment** (`adkim=s; aspf=s`) dan jangan
  langsung `p=quarantine`/`p=reject`. Itu berisiko membuat email yang dikirim
  lewat Hostinger Mail masuk spam kalau `d=`/envelope-nya tidak persis sama.
  Pakai alignment **relaxed** (default) dan naikkan `p` bertahap.
- ✅ Bounce untuk `noreply@beautifio.com` tidak jadi masalah: `beautifio.com`
  sudah ada di Postfix `mydestination`, jadi NDR ditangani lokal di VPS,
  tidak dilempar ke MX Hostinger.

Mail keluar dari VPS `31.97.49.146` lewat Postfix, bukan lewat Hostinger.
Tanpa perubahan, SPF **softfail** dan DKIM **tak terverifikasi** → email
berisiko masuk spam. (`~all` + `p=none` tidak menolak, tapi deliverability turun.)

Domain lama `noreply@tukangjajan.com` aman karena SPF-nya sudah
`v=spf1 ip4:31.97.49.146 ~all` — itulah sebabnya aplikasi memakainya sebagai
fallback sampai record di bawah aktif.

## Record yang harus diset di hPanel → DNS Zone Editor (2 wajib + 1 opsional)

### 1. SPF (EDIT record TXT yang sudah ada, jangan buat duplikat)

| Field | Nilai |
|-------|-------|
| Type | TXT |
| Name | `@` (atau `beautifio.com`) |
| Value | `v=spf1 ip4:31.97.49.146 include:_spf.mail.hostinger.com ~all` |
| TTL | 3600 |

> **EDIT, jangan ADD.** Kalau Anda membuat record TXT `@` baru, akan ada dua
> record `v=spf1` → SPF `permerror` dan **semua** email (termasuk Hostinger)
> gagal. Cukup timpa nilai lama.
>
> Menambahkan `ip4:31.97.49.146` **tidak** mengganggu email Hostinger yang lama
> karena `include:_spf.mail.hostinger.com` tetap dipertahankan.

### 2. DKIM (record baru)

| Field | Nilai |
|-------|-------|
| Type | TXT |
| Name | `mail._domainkey` |
| Value | `v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3wgkvuxKBYss7TMSN5l0AdBGF6iZG7gfWjpJx2Thp6cq2Ne74P67klXSv2Ld2vNN65Zj8aktxxLkTyjXABORqtt+DMz7i+wdMaTOLRL5tOjpBdZn4zZ1CiVTzjsq5jFg4+ch7fSvPZJghZvFmiYIaUYzz7lD0qMkEmAVEZ6PafX0MhfKdVQrgXdlQwK0ue67sBqarsK/Ea7NRc7SeSvIM1UD5a/pf6h6bjEWqb4oXNiUxcrQ9I4LUy1NCh3NGiR0l8PVCStL+C/3fx1MjC2rsG9f18K/S9sHNBqaH2J+R/4MkkP3T5qb7WjC+HrKIBRow/Iv6cpsOLxNNZY/wfAoaQIDAQAB` |
| TTL | 3600 |

Kunci privatnya ada di VPS: `/etc/opendkim/keys/beautifio.com/mail.private`
(sudah terdaftar di `/etc/opendkim/KeyTable` + `SigningTable`).

### 3. DMARC (EDIT — **boleh dibiarkan apa adanya dulu**)

| Field | Nilai |
|-------|-------|
| Type | TXT |
| Name | `_dmarc` |
| Value (aman, default) | `v=DMARC1; p=none` |
| TTL | 3600 |

**Record DMARC yang sudah ada (`p=none`) sudah benar untuk tahap ini** —
tidak wajib diubah. Karena domain ini juga menerima/kirim email Hostinger,
jangan pakai `adkim=s; aspf=s` (strict alignment) dan jangan langsung
`p=quarantine`/`p=reject`: itu bisa bikin email Hostinger masuk spam.

Naikkan bertahap **setelah** SPF + DKIM terbukti PASS dan Anda memantau
laporan beberapa hari:

```
v=DMARC1; p=quarantine; pct=25
v=DMARC1; p=quarantine; pct=100
```

`rua=mailto:...` hanya berguna kalau mailbox/forward itu benar-benar ada di
Hostinger; kalau tidak, abaikan saja (laporan DMARC cuma hilang, tidak merusak
pengiriman). `p=reject` jangan dipakai sebelum semua pengirim sah ter-audit.

## Cara cek (dari mana saja)

```bash
bash scripts/verify-mail-dns.sh
```

Script memakai DNS-over-HTTPS (Google) dan mencetak PASS/FAIL untuk SPF, DKIM,
DMARC. Selama ada FAIL, aplikasi tetap kirim dari `noreply@tukangjajan.com`.
**Status saat ini: semua PASS.**

Bukti deliverability sungguhan (Gmail menerima `250 2.0.0 OK`, DKIM
terverifikasi `dkimpy verify: True`) dan rencana kenaikan DMARC bertahap ada di
`docs/monitoring.md`. Monitor harian berjalan otomatis lewat
`scripts/monitor-beautifio.sh`.

## Auto-switch (sudah aktif di kode)

`apps/web/src/lib/mail.ts` punya gate `resolveFromAddress()`:

- `MAIL_FROM_ADDRESS=noreply@beautifio.com` (keinginan)
- `MAIL_FROM_FALLBACK=noreply@tukangjajan.com` (SPF-pass, aman)
- Sebelum kirim, cek TXT domain: ada `ip4:31.97.49.146` di SPF **dan**
  `v=DKIM1` di `mail._domainkey.<domain>` → pakai `@beautifio.com`.
- Kalau belum/error/timeout → pakai fallback. Cache 1 jam, fail-safe.
- `MAIL_FROM_FORCE=1` bisa memaksa bypass bila DNS sudah benar tapi resolver
  container belum sinkron.

**Jadi tidak ada langkah aplikasi lagi**: cukup tambah record DNS, dan email
berikutnya otomatis memakai `noreply@beautifio.com` tanpa rebuild/restart.

## Verifikasi end-to-end setelah DNS aktif

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  https://beautifio.com/api/health/mail        # -> {"ok":true}
bash scripts/verify-mail-dns.sh                # -> semua PASS
# lalu cek /var/log/mail.log di VPS: from=<noreply@beautifio.com>
```
