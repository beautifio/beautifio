#!/usr/bin/env bash
# Installs the three scheduled jobs that Vercel Cron used to run, as system cron
# entries hitting the local app with the CRON_SECRET bearer token.
# Schedules are UTC (crontab honors the system TZ — keep the VPS on UTC to match
# the original vercel.json, or adjust the times below).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.production"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Create it from .env.production.example first." >&2
  exit 1
fi

CRON_SECRET="$(grep -E '^CRON_SECRET=' "$ENV_FILE" | cut -d= -f2-)"
if [[ -z "$CRON_SECRET" ]]; then
  echo "ERROR: CRON_SECRET is empty in $ENV_FILE." >&2
  exit 1
fi

# Public URL, not 127.0.0.1:3000 — the app container deliberately publishes no
# host port (see deploy/docker-compose.yml), so cron goes in through Traefik.
BASE="https://beautifio.com"
CURL="curl -fsS -m 60 -H \"Authorization: Bearer $CRON_SECRET\""
MARKER="# beautifio-cron"

# Build the desired crontab block.
# The daily monitor is a local script (no HTTP): it reads Postfix logs and the
# database directly, and prints the DMARC-ramp readiness signal.
MONITOR="/opt/beautifio/scripts/monitor-beautifio.sh"
BLOCK="$(cat <<EOF
$MARKER (managed by deploy/setup-cron.sh — do not edit by hand)
0 6 * * *  $CURL $BASE/api/admin/konten/posts/publish-scheduled >/dev/null 2>&1 $MARKER
0 0 * * *  $CURL $BASE/api/cron/care-ai-daily-reset >/dev/null 2>&1 $MARKER
0 17 * * 0 $CURL $BASE/api/cron/bisik-weekly-reset >/dev/null 2>&1 $MARKER
5 0 * * *  $MONITOR >> /var/log/beautifio-monitor.log 2>&1 $MARKER
EOF
)"

# Replace any existing managed block, keep the user's other entries.
( crontab -l 2>/dev/null | grep -v "$MARKER" || true; echo "$BLOCK" ) | crontab -

echo "Installed cron jobs:"
crontab -l | grep "$MARKER"
