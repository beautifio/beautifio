#!/usr/bin/env bash
# Check that the Google OAuth client actually accepts our redirect URI.
#
# A real Google login needs a human account, but Google validates client_id +
# redirect_uri *before* showing the sign-in form. An unregistered URI returns
# "Error 400: redirect_uri_mismatch" — so this is a genuine live check, not a
# config-file guess. No secrets are sent or printed.
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/deploy/.env.production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE tidak ada." >&2
  exit 2
fi

CID="$(grep -E '^NEXT_PUBLIC_GOOGLE_CLIENT_ID=' "$ENV_FILE" | cut -d= -f2-)"
APP_URL="$(grep -E '^NEXT_PUBLIC_APP_URL=' "$ENV_FILE" | cut -d= -f2-)"
APP_URL="${APP_URL:-https://beautifio.com}"
REDIRECT_URI="$APP_URL/auth/callback"

echo "Google OAuth readiness"
echo "  client_id     : ${CID:0:20}... (${#CID} char)"
echo "  redirect_uri  : $REDIRECT_URI"

if [[ -z "$CID" ]]; then
  echo "  HASIL: FAIL — NEXT_PUBLIC_GOOGLE_CLIENT_ID kosong"
  exit 1
fi

ENC="$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$REDIRECT_URI")"
URL="https://accounts.google.com/o/oauth2/v2/auth?client_id=$CID&redirect_uri=$ENC&response_type=code&scope=openid%20email%20profile"
BODY="$(curl -sL --max-time 30 "$URL")"

if echo "$BODY" | grep -qi 'redirect_uri_mismatch'; then
  echo "  HASIL: FAIL — redirect_uri_mismatch"
  echo
  echo "  Google menolak URI di atas. Tambahkan di Google Cloud Console:"
  echo "    APIs & Services -> Credentials -> OAuth 2.0 Client IDs"
  echo "    -> client ${CID:0:20}... -> Authorized redirect URIs"
  echo "    -> tambahkan tepat: $REDIRECT_URI"
  echo "  Lalu jalankan ulang script ini sampai PASS."
  echo "  Lihat docs/google-oauth.md."
  exit 1
elif echo "$BODY" | grep -qi 'invalid_client'; then
  echo "  HASIL: FAIL — invalid_client (client_id tidak dikenal Google)"
  exit 1
else
  echo "  HASIL: PASS — Google menerima client_id + redirect_uri"
  echo "  (login sungguhan tetap butuh akun Google & consent screen aktif)"
  exit 0
fi
