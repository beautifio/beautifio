#!/usr/bin/env bash
# Pushes the current working tree to the VPS and (re)builds + restarts the app.
# Run from your local machine. Requires: rsync, ssh access to the VPS.
#
#   VPS_HOST=ubuntu@1.2.3.4 VPS_PATH=/opt/beautifio ./deploy/deploy.sh
#
set -euo pipefail

VPS_HOST="${VPS_HOST:?set VPS_HOST, e.g. ubuntu@1.2.3.4}"
VPS_PATH="${VPS_PATH:-/opt/beautifio}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Syncing source to $VPS_HOST:$VPS_PATH"
ssh "$VPS_HOST" "mkdir -p '$VPS_PATH'"
rsync -az --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '**/node_modules' \
  --exclude '.next' \
  --exclude '**/.next' \
  --exclude '.turbo' \
  --exclude '.vercel' \
  --exclude 'outputs' \
  --exclude 'deploy/.env.production' \
  "$REPO_ROOT/" "$VPS_HOST:$VPS_PATH/"

echo "==> Building & starting container on VPS"
ssh "$VPS_HOST" bash -s <<EOF
set -euo pipefail
cd '$VPS_PATH/deploy'
if [[ ! -f .env.production ]]; then
  echo "ERROR: $VPS_PATH/deploy/.env.production missing on the VPS." >&2
  exit 1
fi
docker compose --env-file .env.production up -d --build
docker image prune -f >/dev/null 2>&1 || true
echo "==> Running containers:"
docker compose ps
EOF

echo "==> Done."
