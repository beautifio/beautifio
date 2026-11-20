# Google OAuth — status & perbaikan

## Status (2026-11-20): DIPERBAIKI ✅

Login Google sekarang **aktif**. Penyebab asli: client ID di aplikasi tidak sama
dengan client yang punya redirect URI di console (mismatch), sehingga Google
menolak dengan `redirect_uri_mismatch`.

Perbaikan:
- Client ID di `deploy/.env.production` diganti ke
  `749634304606-q0gidgf7drsdvd1dnnu1hped3nauvjfv.apps.googleusercontent.com`
  (client yang redirect URI-nya sudah terdaftar).
- Client secret baru dibuat (lama `****t622` tidak bisa dilihat lagi → dibuat
  secret baru (disimpan di env VPS, tidak di git); secret lama masih aktif
  sampai dihapus manual untuk keamanan).
- `scripts/verify-google-oauth.sh` sekarang **PASS**.

Bukti (langsung ke endpoint Google, tanpa akun):
- `client_id` + `redirect_uri=https://beautifio.com/auth/callback` → **diterima**
  (tidak ada `redirect_uri_mismatch` / `invalid_client`).

Bukti langsung ke endpoint Google (bukan tebakan dari env):

| Yang diuji | Respons Google |
|---|---|
| `client_id` produksi + `https://beautifio.com/auth/callback` | `Error 400: redirect_uri_mismatch` |
| `https://www.beautifio.com/auth/callback` | `redirect_uri_mismatch` |
| `https://beautifio-web.vercel.app/auth/callback` (URL lama) | `redirect_uri_mismatch` |
| URL Vercel deployment lama | `redirect_uri_mismatch` |
| `client_id` sengaja palsu | `invalid_client` |

Karena client ID palsu menghasilkan `invalid_client` sementara client ID kita
menghasilkan `redirect_uri_mismatch`, **client ID kita valid** — yang kurang
murni daftar redirect URI-nya.

Yang sudah benar di sisi aplikasi:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `GOOGLE_CLIENT_ID` (sama), keduanya terisi.
- `GOOGLE_CLIENT_SECRET` terisi.
- `NEXT_PUBLIC_APP_URL = NEXT_PUBLIC_SITE_URL = https://beautifio.com`.
- `/auth/callback` menolak dengan aman: tanpa `code` → `307 /login?error=auth_failed`,
  `code` palsu → `307 /login?error=google_token_exchange_failed`. **Tidak ada 5xx.**
- `/login` dan `AuthModal` membangun URL OAuth yang identik.

## Yang harus dilakukan (butuh akses Google Cloud Console) — SELESAI ✅

1. Buka <https://console.cloud.google.com/apis/credentials>.
2. Pilih project yang memiliki OAuth client
   `1062602661099-muhl0hfgbe2monpjfr5m9gu7rnr183f0.apps.googleusercontent.com`.
3. Klik client tersebut → **Authorized redirect URIs** → **ADD URI**.
4. Isi **tepat** (tanpa trailing slash, tanpa spasi):

   ```
   https://beautifio.com/auth/callback
   ```

5. Simpan. Perubahan biasanya langsung aktif (kadang butuh beberapa menit).
6. Verifikasi tanpa akun Google:

   ```bash
   bash scripts/verify-google-oauth.sh
   # target: HASIL: PASS — Google menerima client_id + redirect_uri
   ```

7. Uji login sungguhan dengan akun Google: buka `/login` →
   "Lanjutkan dengan Google". Pastikan OAuth consent screen berstatus
   **Production**, atau akun uji terdaftar sebagai **Test user** kalau masih
   `Testing`.

> Catatan: jangan tambahkan `https://www.beautifio.com/auth/callback` kecuali
> memang dipakai — aplikasi memakai `NEXT_PUBLIC_APP_URL` tanpa `www`.

## Setelah PASS

Tidak ada perubahan kode/deploy: callback sudah menukar `code` → token Google
→ profil → find-or-create `users` → `bf_session` JWT. Cek `/api/auth/me`
setelah login untuk memastikan role & email tersimpan.

Script diagnostik ini juga bisa dipanggil dari `scripts/monitor-beautifio.sh`
agar statusnya ikut terpantau harian.
