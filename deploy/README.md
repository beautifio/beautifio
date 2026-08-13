# Deploying Beautifio to a VPS

Moves the app off Vercel onto a self-managed Ubuntu VPS using Docker for the app
and host Nginx + Certbot for TLS. Vercel Cron is replaced by system cron.

## What runs where
- **App**: Next.js 15 (standalone) in a Docker container, listening on `127.0.0.1:3000`.
- **Nginx** (host): reverse proxy on 80/443, TLS via Let's Encrypt.
- **Cron** (host): 3 jobs that used to be Vercel Cron (`deploy/setup-cron.sh`).
- **Supabase / DOKU / OpenAI / Gemini**: unchanged cloud services — only env vars move.

## One-time VPS setup
1. Install Docker + Nginx + Certbot:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo apt-get update && sudo apt-get install -y nginx certbot python3-certbot-nginx rsync
   ```
2. Point the domain's **A record** at the VPS IP (already done per your setup).

## Configure env
1. Copy the template and fill in real values (pull them from Vercel → Settings →
   Environment Variables):
   ```bash
   cp deploy/.env.production.example deploy/.env.production
   ```
   `NEXT_PUBLIC_*` are baked in at **build** time; the rest are runtime secrets.

## Deploy
From your local machine:
```bash
VPS_HOST=ubuntu@YOUR_IP VPS_PATH=/opt/beautifio ./deploy/deploy.sh
```
Copy `deploy/.env.production` to `VPS:/opt/beautifio/deploy/` once (it is excluded
from rsync so it is never overwritten).

## Nginx + TLS (one-time, on the VPS)
```bash
sudo cp /opt/beautifio/deploy/nginx.conf /etc/nginx/sites-available/beautifio
sudo sed -i 's/__DOMAIN__/your-domain.com/' /etc/nginx/sites-available/beautifio
sudo ln -sf /etc/nginx/sites-available/beautifio /etc/nginx/sites-enabled/beautifio
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com   # adds HTTPS + auto-renew
```

## Cron (one-time, on the VPS)
```bash
cd /opt/beautifio/deploy && ./setup-cron.sh
```

## Update later
Just re-run `./deploy/deploy.sh` — it rsyncs and rebuilds.

## Rollback
`docker compose --env-file .env.production up -d` with a previously built image,
or `git checkout <sha>` locally and re-run the deploy.
