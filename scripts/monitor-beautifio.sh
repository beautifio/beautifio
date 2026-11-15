#!/usr/bin/env bash
# Laporan harian Beautifio: deliverability email + metrik langganan.
#
# Dijalankan otomatis tiap 00:05 UTC (07:05 WIB) dari cron VPS, hasilnya
# ditambahkan ke /var/log/beautifio-monitor.log. Bisa juga dipanggil manual:
#
#   ssh root@31.97.49.146 '/opt/beautifio/scripts/monitor-beautifio.sh'
#   # atau dari laptop:
#   ssh root@31.97.49.146 'bash -s' < scripts/monitor-beautifio.sh
#
# Tidak mengubah data apa pun — hanya SELECT + grep log.
set -uo pipefail

DB="${DB_CONTAINER:-supabase-db-zurmq2lrm9hj510fmnj1seqr}"
MAIL_DOMAIN="${MAIL_DOMAIN:-beautifio.com}"
VPS_IP="${MAIL_VPS_IP:-31.97.49.146}"
TODAY="$(date -u +%Y-%m-%d)"
YESTERDAY="$(date -u -d 'yesterday' +%Y-%m-%d)"

echo "================================================================"
echo " BEAUTIFIO DAILY MONITOR — $(date -u '+%Y-%m-%d %H:%M UTC')"
echo "================================================================"

# ── 1. DNS / email authentication ─────────────────────────────────────────
echo
echo "── 1. DNS email ($MAIL_DOMAIN) ──"
txt() {
  curl -s --max-time 15 "https://dns.google/resolve?name=$1&type=TXT" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(' '.join(a.get('data','') for a in d.get('Answer',[])))" 2>/dev/null
}
SPF="$(txt "$MAIL_DOMAIN")"
DKIM="$(txt "mail._domainkey.$MAIL_DOMAIN")"
DMARC="$(txt "_dmarc.$MAIL_DOMAIN")"
if echo "$SPF" | grep -qF "$VPS_IP"; then echo "  SPF   : PASS ($VPS_IP diizinkan)"; else echo "  SPF   : FAIL ($SPF)"; fi
if echo "$DKIM" | grep -qF 'v=DKIM1'; then echo "  DKIM  : PASS (kunci publik ada)"; else echo "  DKIM  : FAIL"; fi
echo "  DMARC : ${DMARC:-<tidak ada>}"
if echo "$DMARC" | grep -q 'p=none'; then
  echo "  -> Masih p=none. Naikkan ke p=quarantine;pct=25 SETELAH 3-7 hari"
  echo "     log di bawah bersih (0 bounced/deferred, branded=100%)."
  echo "     Nilai: v=DMARC1; p=quarantine; pct=25"
  echo "     JANGAN pakai adkim=s/aspf=s (Hostinger Mail masih kirim dari domain ini)."
fi

# ── 2. Mail log 24 jam terakhir ───────────────────────────────────────────
echo
echo "── 2. Kirim email 24 jam terakhir ──"
LOGLINES="$(grep -hE "^($YESTERDAY|$TODAY)" /var/log/mail.log /var/log/mail.log.1 2>/dev/null || true)"
count() { printf '%s' "$LOGLINES" | grep -c "$1" 2>/dev/null || true; }
BOUNCES="$(printf '%s' "$LOGLINES" | grep 'status=bounced' || true)"
BT="$(printf '%s' "$BOUNCES" | grep -cE 'example\.com|stadione\.pro' || true)"
printf "  terkirim (status=sent) : %s\n" "$(count 'status=sent')"
printf "  bounced (uji/example)  : %s\n" "$BT"
printf "  bounced (lainnya)      : %s\n" "$(( $(printf '%s' "$BOUNCES" | grep -c . || true) - BT ))"
printf "  deferred               : %s\n" "$(count 'status=deferred')"
printf "  dari noreply@beautifio : %s\n" "$(count 'from=<noreply@beautifio.com>')"
printf "  diterima Gmail         : %s\n" "$(count 'relay=gmail-smtp-in')"
printf "  masih fallback lama    : %s\n" "$(count 'from=<noreply@tukangjajan.com>')"
LAST="$(printf '%s' "$LOGLINES" | grep 'status=bounced' | tail -2)"
if [ -n "$LAST" ]; then echo "  bounce terakhir:"; printf '%s\n' "$LAST" | sed 's/^/    /'; fi

# ── 3. Metrik langganan ───────────────────────────────────────────────────
echo
echo "── 3. Metrik langganan ──"
cat > /tmp/bf-monitor.sql <<'SQL'
\pset pager off
\pset format aligned
select 'langganan aktif' metrik, count(*)::text nilai
  from public.user_subscriptions
 where status='active' and expires_at > now()
union all
select 'langganan baru 7 hari', count(*)::text
  from public.user_subscriptions where started_at > now() - interval '7 days'
union all
select 'langganan baru 30 hari', count(*)::text
  from public.user_subscriptions where started_at > now() - interval '30 days'
union all
select 'kedaluwarsa <= 7 hari', count(*)::text
  from public.user_subscriptions
 where status='active' and expires_at between now() and now() + interval '7 days'
union all
select 'MRR normalisasi (Rp)', coalesce(round(sum(
    case p.duration_type
      when 'daily'   then p.price_idr * 365.0 / 12
      when 'weekly'  then p.price_idr * 52.0 / 12
      when 'monthly' then p.price_idr
      when 'yearly'  then p.price_idr / 12.0
      else p.price_idr end))::text,'0')
  from public.user_subscriptions s join public.subscription_plans p on p.id=s.plan_id
 where s.status='active' and s.expires_at > now()
union all
select 'user weekly', count(distinct s.user_id)::text
  from public.user_subscriptions s join public.subscription_plans p on p.id=s.plan_id
 where p.duration_type='weekly'
union all
select 'naik weekly -> bulanan/tahunan', count(distinct m.user_id)::text
  from public.user_subscriptions m join public.subscription_plans pm on pm.id=m.plan_id
 where pm.duration_type in ('monthly','yearly')
   and exists (select 1 from public.user_subscriptions w
               join public.subscription_plans pw on pw.id=w.plan_id
               where w.user_id=m.user_id and pw.duration_type='weekly'
                 and w.started_at < m.started_at);

select coalesce(p.tier,'?') tier, p.duration_type, count(s.id) aktif
  from public.subscription_plans p
  left join public.user_subscriptions s
    on s.plan_id=p.id and s.status='active' and s.expires_at > now()
 group by p.tier,p.duration_type,p.display_order
 order by p.display_order;
SQL
docker exec -i "$DB" psql -U postgres -d postgres -q < /tmp/bf-monitor.sql 2>&1 | sed 's/^/  /'
rm -f /tmp/bf-monitor.sql

echo
echo "── 4. Kesehatan aplikasi ──"
CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://beautifio.com/ || true)"
printf "  https://beautifio.com/  : %s\n" "$CODE"
ERR="$(docker logs --since 24h beautifio-web 2>&1 | grep -icE '⨯|unhandled|error:' || true)"
printf "  error log container     : %s\n" "$ERR"
# Google OAuth: cek redirect URI langsung ke endpoint Google (lihat docs/google-oauth.md)
OAUTH_SCRIPT="$(dirname "$0")/verify-google-oauth.sh"
if [ -f "$OAUTH_SCRIPT" ]; then
  bash "$OAUTH_SCRIPT" 2>&1 | grep 'HASIL:' | sed 's/^/  Google OAuth            : /'
fi
echo
echo "================================================================"
