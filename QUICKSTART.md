# 🚀 Quick Start Guide

## Project Setup Order (English)

### Step 1: Installation & Initial Setup
```bash
# Clone project
git clone <your-repo>
cd Analyzer-MiniAPP

# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env  
cp apps/web/.env.example apps/web/.env
cp apps/bot/.env.example apps/bot/.env
```

### Step 2: Database Setup
```bash
# Run PostgreSQL and Redis
pnpm db:up

# Run migrations
pnpm --filter @analyzer/api db:dev

# Seed data
pnpm --filter @analyzer/api db:seed
```

### Step 3: ngrok Setup (Essential!)
```bash
# Install ngrok from: https://ngrok.com/download
# Run ngrok
ngrok http 8070
```
**Important**: Copy the resulting URL (like `https://abc123.ngrok-free.app`) and put it in `apps/bot/.env` in the `WEBAPP_URL` variable.

### Step 4: Run Servers (4 terminals)

**Terminal 1 - API:**
```bash
pnpm --filter @analyzer/api dev
```

**Terminal 2 - Web App:**
```bash
pnpm --filter @analyzer/web dev  
```

**Terminal 3 - Bot:**
```bash
pnpm --filter @analyzer/bot dev
```

**Terminal 4 - ngrok:**
```bash
ngrok http 8070
```

### Step 5: Test in Telegram
1. Message your Telegram bot
2. Send the `/start` command  
3. Click "Launch WebApp"
4. Use the mini app features!

---

## Environment Variables Checklist

### `.env` (Root)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/analyzer"
REDIS_URL="redis://localhost:6379"
```

### `apps/api/.env`
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/analyzer"
JWT_SECRET="your-secret"
TELEGRAM_BOT_TOKEN="your-bot-token"
```

### `apps/web/.env`
```env
NEXT_PUBLIC_API_URL="http://127.0.0.1:8071"
NEXT_PUBLIC_TELEGRAM_BOT_NAME="your_bot_name"
NEXT_PUBLIC_TWITTER_URL="https://twitter.com/yourpage"
NEXT_PUBLIC_DISCORD_URL="https://discord.gg/yourinvite"
```

### `apps/bot/.env`
```env
TELEGRAM_BOT_TOKEN="your-bot-token"
WEBAPP_URL="https://your-ngrok-url.ngrok-free.app"
```

---

## 🐛 Common Troubleshooting

### "WebApp requires HTTPS" Error
- Make sure ngrok is running
- Put ngrok URL in `apps/bot/.env`

### Database Connection Error
```bash
# Check Docker status
docker ps

# راه‌اندازی مجدد
pnpm db:down
pnpm db:up
```

### خطاهای TypeScript
```bash
# regenerate کردن Prisma client
pnpm --filter @analyzer/api db:generate

# restart کردن TypeScript server در VS Code
Ctrl+Shift+P > TypeScript: Restart TS Server
```

### پورت‌ها قبلاً در حال استفاده
- Web: تغییر پورت در `apps/web/package.json` (خط `dev` script)
- API: تغییر پورت در `apps/api/src/index.ts`

---

## 📱 تست Mission System

پس از راه‌اندازی، می‌توانید:

1. **Wallet Connection**: والت EVM خود را متصل کنید (+100 AP)
2. **Twitter Verification**: نام کاربری Twitter وارد کنید (+30 AP)  
3. **Discord Verification**: نام کاربری Discord وارد کنید (+30 AP)
4. **Daily Rewards**: هر روز امتیاز روزانه دریافت کنید
5. **Referral System**: دوستان خود را دعوت کنید

همه این قابلیت‌ها در real-time کار می‌کنند و امتیاز شما به‌روزرسانی می‌شود! 🎉