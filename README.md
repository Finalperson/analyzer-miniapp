# Analyzer MiniApp Monorepo

This monorepo hosts the Analyzer Telegram Mini App: a Next.js WebApp, a Fastify + Prisma backend, and a Telegraf bot, plus shared types.

## Stack
- Frontend: Next.js 14 (App Router), Tailwind CSS, TanStack Query, Wagmi (Web3)
- Backend: Fastify (TS), Prisma (PostgreSQL), JWT auth, node-cron
- Bot: Telegraf
- Tooling: PNPM, Turbo, Prettier, TypeScript

## Features
- 🎯 **Mission System**: EVM wallet connection, Twitter/Discord verification
- 💎 **Point System**: Daily rewards, loyalty bonuses, mission rewards
- 👥 **Referral System**: Standard milestone rewards (e.g., 3 and 10 invites)
- 🔗 **Web3 Integration**: Multi-chain wallet support via Wagmi
- 📱 **Modern UI**: Glassmorphism design with animations

## Getting Started

### Prerequisites
- Node.js 18+
- PNPM
- Docker & Docker Compose
- ngrok account (for HTTPS tunneling)

### 1. Environment Setup
Copy environment files and configure:
```bash
# Root .env
cp .env.example .env

# API .env
cp apps/api/.env.example apps/api/.env

# Web .env  
cp apps/web/.env.example apps/web/.env

# Bot .env
cp apps/bot/.env.example apps/bot/.env
```

Fill in your values:
- `TELEGRAM_BOT_TOKEN`: Get from @BotFather
- `TELEGRAM_BOT_NAME`: Your bot username
- Database credentials
- Social media URLs

### 2. Database Setup
Start PostgreSQL and Redis:
```bash
pnpm db:up
```

Install dependencies:
```bash
pnpm install
```

Run database migrations and seed:
```bash
pnpm --filter @analyzer/api db:dev
pnpm --filter @analyzer/api db:seed
```

If you prefer a manual setup, create a local Postgres and set DATABASE_URL accordingly. Example:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/analyzer?schema=public
```

To initialize the schema and seed the initial missions:

```
pnpm --filter @analyzer/api db:dev
pnpm --filter @analyzer/api db:seed
```

### 3. ngrok Setup (Required for Telegram WebApp)
Telegram WebApps require HTTPS. Install and setup ngrok:

1. Install ngrok: https://ngrok.com/download
2. Start ngrok tunnel:
```bash
ngrok http 8070
```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
4. Update `apps/bot/.env`:
```env
PUBLIC_WEBAPP_URL=https://your-ngrok-url.ngrok-free.app
```

> **⚠️ Important**: ngrok URL changes every restart! See solutions:
> - **Option 1**: Get a static domain from ngrok dashboard (recommended)
> - **Option 2**: Use auto-update script: `pnpm ngrok:update`
> - **Option 3**: Manual update and restart bot each time
> 
> 📚 **See NGROK.md for detailed solutions**

### 4. Start Development Servers

**Terminal 1** - API Server:
```bash
pnpm --filter @analyzer/api dev
```

**Terminal 2** - Web App:
```bash
pnpm --filter @analyzer/web dev
```

**Terminal 3** - Telegram Bot:
```bash
pnpm --filter @analyzer/bot dev
```

**Terminal 4** - Keep ngrok running:
```bash
ngrok http 8070
```
**Terminal 5** - update ngrok url
```bash
scripts\update-ngrok.bat "https://1bbc03fdf8db.ngrok-free.app"
```

## Server Ports
- **Web App**: http://localhost:8070
- **API Server**: http://127.0.0.1:8071  
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **ngrok HTTPS**: https://e8bf8165e867.ngrok-free.app

## Project Structure
```
apps/
├── api/          # Fastify API server
│   ├── src/      # Source code
│   ├── prisma/   # Database schema & migrations
│   └── .env      # API environment variables
├── web/          # Next.js WebApp
│   ├── app/      # App Router pages
│   ├── components/ # React components
│   ├── lib/      # Utilities & API client
│   └── .env      # Web environment variables
├── bot/          # Telegram bot
│   ├── src/      # Bot source code
│   └── .env      # Bot environment variables
└── packages/
    └── shared/   # Shared TypeScript types
```

## Development Notes

### Telegram WebApp Testing
1. Start all services (API, Web, Bot, ngrok)
2. Message your bot on Telegram
3. Use `/start` command to get the WebApp button
4. Click "Launch WebApp" to test in Telegram

### Mission System
- **Wallet Connection**: Supports MetaMask, WalletConnect
- **Social Verification**: Twitter and Discord username collection
- **Point Rewards**: Automatic AP distribution on completion

### Database Management
```bash
# Create new migration
pnpm --filter @analyzer/api db:dev

# Reset database
pnpm --filter @analyzer/api db:reset

# View database
pnpm --filter @analyzer/api db:studio
```

## Available Scripts

```bash
# Development
pnpm dev:api          # Start API server
pnpm dev:web          # Start web app  
pnpm dev:bot          # Start Telegram bot

# Database
pnpm db:up            # Start PostgreSQL & Redis
pnpm db:down          # Stop database containers

# ngrok Management  
pnpm ngrok:update     # Auto-update bot with new ngrok URL
pnpm ngrok:update-ps  # PowerShell version
pnpm ngrok:set -- "https://new-url.ngrok-free.app"  # Set specific URL

# Build & Deploy
pnpm build            # Build all packages
pnpm lint             # Run linting
pnpm typecheck        # TypeScript check
```

### Environment flags

- HONOR_MODE_SOCIAL=true
    - When true (default), Twitter and Discord missions accept usernames on honor system (no API verification). Set to false to enable strict verification using Twitter/Discord APIs. With strict mode enabled, the app shows an inline cooldown timer when external APIs rate limit verification attempts.

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in respective `.env` files
2. **HTTPS required**: Ensure ngrok is running for Telegram WebApp
3. **Database connection**: Verify Docker containers are running
4. **TypeScript errors**: Run `pnpm --filter @analyzer/api db:generate`
5. **ngrok URL changes**: Use `pnpm ngrok:update` or get static domain

### Environment Variables
Ensure all `.env` files are properly configured:
- API needs database and JWT secrets
- Web needs API URL and social links  
- Bot needs token and WebApp URL (ngrok)

## Production Deployment
1. Set up production database (PostgreSQL)
2. Configure production environment variables
3. Use proper HTTPS domain (not ngrok)
4. Set up webhook for Telegram bot
5. Deploy with `pnpm build` and `pnpm start`

## Deploy on Vercel (No ngrok)

You can run the app in production without ngrok using Vercel. Notes and options:

- Web (Next.js): Fully supported on Vercel. Create a Vercel project pointing to the monorepo and set environment variables. If your web app lives in `apps/web`, configure the project root accordingly.
- API (Fastify): Two choices
    - A) Convert API to serverless functions and deploy on Vercel (Fastify can be adapted to serverless handlers). Ensure functions are stateless and complete within Vercel execution limits.
    - B) Keep API on a traditional host (Railway/Render/Fly/Cloud Run) and point the web app to it via `NEXT_PUBLIC_API_URL`.
- Telegram Bot (Telegraf): Vercel does not support long-running processes. Use webhook mode:
    - Expose a serverless HTTP endpoint (e.g., `/api/telegram/webhook`) that forwards to Telegraf’s `webhookCallback`.
    - Set the Telegram webhook to your Vercel URL.
    - Alternatively deploy the bot on a traditional host and keep webhook there. Polling mode is for local/dev only.

Important constraints on Vercel:
- No background/long-running processes; everything must be request-driven (serverless) or hosted elsewhere.
- Use separate Vercel projects for web and (if applicable) API functions.
- Database should be a managed Postgres (e.g., Neon, Supabase, Railway). Set `DATABASE_URL` on Vercel.

Production database rollout checklist:
1) Create a managed Postgres and copy its `DATABASE_URL`.
2) Locally, set `DATABASE_URL` to the production URL temporarily and run migrations:
     - `pnpm --filter @analyzer/api db:dev` (or `prisma migrate deploy` if you have CI)
3) Seed initial data once:
     - `pnpm --filter @analyzer/api db:seed`
4) In Vercel, add environment variables for web/api/bot (e.g., `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_NAME`, `PUBLIC_WEBAPP_URL`).
5) Deploy web to Vercel; deploy API/bot either as Vercel functions (webhook) or on an external host.

Tip: ngrok is only needed for local Telegram WebApp testing. In production with Vercel, you don’t need ngrok.

## Deploy on a VPS (fixed IP 46.249.99.168)

This is a practical, minimal guide to run all three services (web, api, bot) on a single VPS with a fixed IP. Replace values in angle brackets with yours. All commands assume Windows PowerShell on your local machine and a Linux-based VPS.

### 1) Prepare the VPS
- Update packages and install basics (on VPS):
    - sudo apt update && sudo apt upgrade -y
    - sudo apt install -y git curl ufw nginx
- Install Node.js 20 LTS and pnpm:
    - curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    - sudo apt-get install -y nodejs
    - corepack enable
    - corepack prepare pnpm@9 --activate
- Open firewall for SSH and HTTPS:
    - sudo ufw allow OpenSSH
    - sudo ufw allow 80
    - sudo ufw allow 443
    - sudo ufw enable

### 2) Database options
- Easiest: use a managed Postgres (Neon, Supabase, Railway). Get a DATABASE_URL and keep it private.
- Or install Postgres locally on VPS:
    - sudo apt install -y postgresql postgresql-contrib
    - sudo -u postgres psql -c "CREATE USER analyzer WITH PASSWORD '<strong-password>';"
    - sudo -u postgres psql -c "CREATE DATABASE analyzer OWNER analyzer;"
    - Your DATABASE_URL: postgresql://analyzer:<strong-password>@localhost:5432/analyzer

### 3) Clone and configure
- Clone repo on VPS:
    - git clone <your-repo-url>.git analyzer-miniapp && cd analyzer-miniapp
- Copy env templates and edit:
    - cp .env.example .env
    - cp apps/api/.env.example apps/api/.env
    - cp apps/web/.env.example apps/web/.env
    - cp apps/bot/.env.example apps/bot/.env
- Set variables:
    - apps/api/.env: DATABASE_URL, JWT_SECRET, TELEGRAM_BOT_TOKEN, CRON_SECRET
    - apps/web/.env: NEXT_PUBLIC_API_URL (e.g., https://your-domain.com/api or http://46.249.99.168:8071)
    - apps/bot/.env: TELEGRAM_BOT_TOKEN, PUBLIC_WEBAPP_URL (e.g., https://your-domain.com or https://46.249.99.168)

### 4) Build and migrate
- Install dependencies: pnpm install
- Run DB migrations: pnpm --filter @analyzer/api db:dev
- Seed once: pnpm --filter @analyzer/api db:seed
- Build all: pnpm build

### 5) Process manager
Use PM2 to keep services running:
- sudo npm i -g pm2
- pm2 start apps/api/dist/index.js --name analyzer-api
- pm2 start apps/bot/dist/index.js --name analyzer-bot
- For web (Next.js standalone):
    - After pnpm build, run: pm2 start "pnpm --filter @analyzer/web start" --name analyzer-web
- Save and enable startup:
    - pm2 save
    - pm2 startup | bash

### 6) Reverse proxy with Nginx
Map public HTTPS to your internal ports. Example for IP 46.249.99.168 without a domain (you can still use Let’s Encrypt with a domain later):

Create /etc/nginx/sites-available/analyzer and symlink it:
- sudo nano /etc/nginx/sites-available/analyzer

Paste:

server {
        listen 80;
        server_name 46.249.99.168;

        # Web app (Next.js) on port 8070
        location / {
                proxy_pass http://127.0.0.1:8070;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API on 8071
        location /api/ {
                proxy_pass http://127.0.0.1:8071/;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Telegram webhook endpoint (if exposing bot via webhook)
        location /bot {
                proxy_pass http://127.0.0.1:8072;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
        }
}

- sudo ln -s /etc/nginx/sites-available/analyzer /etc/nginx/sites-enabled/analyzer
- sudo nginx -t && sudo systemctl reload nginx

Notes:
- If you bind your services to 127.0.0.1:8070 (web), 127.0.0.1:8071 (api), 127.0.0.1:8072 (bot), they won’t be publicly reachable except via Nginx.
- Prefer a domain and Let’s Encrypt for HTTPS: use certbot to generate TLS and update server block to listen 443 ssl; Telegram requires HTTPS for webhooks.

### 7) Telegram webhook
For production, prefer webhook mode over long polling. After Nginx is up, set webhook from your local PowerShell:

curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://46.249.99.168/bot"

Adjust the path to match your bot’s exposed webhook route.

### 8) Environment wiring
- NEXT_PUBLIC_API_URL in web must point to https://46.249.99.168/api (or your domain)
- PUBLIC_WEBAPP_URL in bot must point to https://46.249.99.168 (or your domain)
- Ensure CRON_SECRET is set and used if you expose any cron endpoints; otherwise, rely on internal node-cron jobs.

### 9) Health checks
- Web: curl http://127.0.0.1:8070
- API: curl http://127.0.0.1:8071/health (create a health endpoint if missing)
- Bot: check PM2 logs and Telegram webhook getWebhookInfo

Troubleshooting tips:
- Check PM2 logs: pm2 logs
- Check Nginx: sudo journalctl -u nginx -e
- DB connectivity: psql or telnet localhost 5432
