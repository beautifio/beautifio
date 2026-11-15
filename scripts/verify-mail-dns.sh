#!/usr/bin/env bash
# Verify that beautifio.com is ready to send mail from the VPS Postfix relay.
# Uses Google DNS-over-HTTPS so it works from any machine without `dig`.
set -u

DOMAIN="${MAIL_DOMAIN:-beautifio.com}"
VPS_IP="${MAIL_VPS_IP:-31.97.49.146}"
DKIM_NAME="mail._domainkey.${DOMAIN}"
DMARC_NAME="_dmarc.${DOMAIN}"

txt() {
  curl -s --max-time 15 "https://dns.google/resolve?name=$1&type=TXT" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(' '.join(a.get('data','') for a in d.get('Answer',[])))" 2>/dev/null
}

SPF="$(txt "$DOMAIN")"
DKIM="$(txt "$DKIM_NAME")"
DMARC="$(txt "$DMARC_NAME")"

echo "Domain   : $DOMAIN"
echo "VPS IP   : $VPS_IP"
echo
printf '%-8s %-6s %s\n' 'CHECK' 'STATUS' 'DETAIL'

if echo "$SPF" | grep -qF "$VPS_IP"; then
  printf '%-8s %-6s %s\n' 'SPF' 'PASS' "mengizinkan $VPS_IP"
else
  printf '%-8s %-6s %s\n' 'SPF' 'FAIL' "tambahkan 'ip4:$VPS_IP' ke record TXT (saat ini: ${SPF:-kosong})"
fi

if echo "$DKIM" | grep -qF 'v=DKIM1'; then
  printf '%-8s %-6s %s\n' 'DKIM' 'PASS' "kunci publik ditemukan di $DKIM_NAME"
else
  printf '%-8s %-6s %s\n' 'DKIM' 'FAIL' "tambahkan TXT $DKIM_NAME dari /etc/opendkim/keys/$DOMAIN/mail.txt"
fi

if echo "$DMARC" | grep -qF 'v=DMARC1'; then
  printf '%-8s %-6s %s\n' 'DMARC' 'PASS' "$DMARC"
else
  printf '%-8s %-6s %s\n' 'DMARC' 'FAIL' "tambahkan TXT $DMARC_NAME"
fi

echo
if echo "$SPF" | grep -qF "$VPS_IP" && echo "$DKIM" | grep -qF 'v=DKIM1'; then
  echo "SIAP: aplikasi otomatis kirim dari noreply@$DOMAIN (cek /api/health/mail)."
  exit 0
else
  echo "BELUM SIAP: aman — aplikasi tetap pakai MAIL_FROM_FALLBACK (SPF-pass)."
  echo "Lihat docs/mail-dns-beautifio.md untuk nilai record persisnya."
  exit 1
fi
