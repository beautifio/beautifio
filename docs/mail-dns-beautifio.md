# DNS records agar email bisa kirim dari `@beautifio.com`

> Status **server-side: SELESAI**. Postfix `mydestination` sudah memuat
> `beautifio.com`, OpenDKIM sudah menandatangani `d=beautifio.com` (terbukti
> lewat uji kirim lokal: header `DKIM-Signature: ... d=beautifio.com`).
>
> Yang tersisa: **3 record DNS** di Hostinger hPanel (NS domain ini =
> `hyperion.dns-parking.com` / `atlas.dns-parking.com`). Saya tidak punya
> kredensial hPanel/API, jadi record ini harus ditambahkan oleh pemilik domain.
> Aplikasi **sudah otomatis** beralih begitu record aktif — lihat bagian bawah.

## Kenapa perlu

Saat ini `beautifio.com` punya:

```
TXT  beautifio.com           = "v=spf1 include:_spf.mail.hostinger.com ~all"
TXT  _dmarc.beautifio.com    = "v=DMARC1; p=none"
MX   beautifio.com           -> mx1/mx2.hostinger.com
```

Mail keluar dari VPS `31.97.49.146` lewat Postfix, bukan lewat Hostinger.
Tanpa perubahan, SPF **softfail** dan DKIM **tak terverifikasi** → email
berisiko masuk spam. (`~all` + `p=none` tidak menolak, tapi deliverability turun.)

Domain lama `noreply@tukangjajan.com` aman karena SPF-nya sudah
`v=spf1 ip4:31.97.49.146 ~all` — itulah sebabnya aplikasi memakainya sebagai
fallback sampai record di bawah aktif.

## 3 record yang harus ditambahkan di hPanel → DNS Zone Editor

### 1. SPF (EDIT record TXT yang sudah ada, jangan buat duplikat)

| Field | Nilai |
|-------|-------|
| Type | TXT |
| Name | `@` (atau `beautifio.com`) |
| Value | `v=spf1 ip4:31.97.49.146 include:_spf.mail.hostinger.com ~all` |
| TTL | 3600 |

> Menambahkan `ip4:31.97.49.146` **tidak** mengganggu email Hostinger yang lama.

### 2. DKIM (record baru)

| Field | Nilai |
|-------|-------|
| Type | TXT |
| Name | `mail._domainkey` |
| Value | `v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3wgkvuxKBYss7TMSN5l0AdBGF6iZG7gfWjpJx2Thp6cq2Ne74P67klXSv2Ld2vNN65Zj8aktxxLkTyjXABORqtt+DMz7i+wdMaTOLRL5tOjpBdZn4zZ1CiVTzjsq5jFg4+ch7fSvPZJghZvFmiYIaUYzz7lD0qMkEmAVEZ6PafX0MhfKdVQrgXdlQwK0ue67sBqarsK/Ea7NRc7SeSvIM1UD5a/pf6h6bjEWqb4oXNiUxcrQ9I4LUy1NCh3NGiR0l8PVCStL+C/3fx1MjC2rsG9f18K/S9sHNBqaH2J+R/4MkkP3T5qb7WjC+HrKIBRow/Iv6cpsOLxNNZY/wfAoaQIDAQAB` |
| TTL | 3600 |

Kunci privatnya ada di VPS: `/etc/opendkim/keys/beautifio.com/mail.private`
(sudah terdaftar di `/etc/opendkim/KeyTable` + `SigningTable`).

### 3. DMARC (EDIT, opsional tapi disarankan setelah 1 & 2 terverifikasi)

| Field | Nilai |
|-------|-------|
| Type | TXT |
| Name | `_dmarc` |
| Value | `v=DMARC1; p=quarantine; pct=100; adkim=s; aspf=s; rua=mailto:postmaster@beautifio.com` |
| TTL | 3600 |

Mulai dengan `p=none` dulu seminggu untuk memantau laporan, baru naikkan ke
`p=quarantine`. **Jangan** lompat ke `p=reject` sebelum SPF+DKIM terbukti pass.

## Cara cek (dari mana saja)

```bash
bash scripts/verify-mail-dns.sh
```

Script memakai DNS-over-HTTPS (Google) dan mencetak PASS/FAIL untuk SPF, DKIM,
DMARC. Selama ada FAIL, aplikasi tetap kirim dari `noreply@tukangjajan.com`.

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
