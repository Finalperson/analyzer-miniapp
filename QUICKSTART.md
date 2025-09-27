# 🚀 Quick Start Guide

## ترتیب اجرای پروژه (فارسی)

### مرحله 1: نصب و تنظیمات اولیه
```bash
# کلون پروژه
git clone <your-repo>
cd Analyzer-MiniAPP

# نصب dependencies
pnpm install

# کپی کردن فایل‌های environment
cp .env.example .env
cp apps/api/.env.example apps/api/.env  
cp apps/web/.env.example apps/web/.env
cp apps/bot/.env.example apps/bot/.env
```

### مرحله 2: تنظیم دیتابیس
```bash
# اجرای PostgreSQL و Redis
pnpm db:up

# اجرای migrations
pnpm --filter @analyzer/api db:dev

# seed کردن دیتا
pnpm --filter @analyzer/api db:seed
```

### مرحله 3: تنظیم ngrok (ضروری!)
```bash
# نصب ngrok از سایت: https://ngrok.com/download
# اجرای ngrok
ngrok http 8070
```
**مهم**: URL حاصل (مثل `https://abc123.ngrok-free.app`) را در `apps/bot/.env` در متغیر `WEBAPP_URL` قرار دهید.

### مرحله 4: اجرای سرورها (4 ترمینال)

**ترمینال 1 - API:**
```bash
pnpm --filter @analyzer/api dev
```

**ترمینال 2 - Web App:**
```bash
pnpm --filter @analyzer/web dev  
```

**ترمینال 3 - Bot:**
```bash
pnpm --filter @analyzer/bot dev
```

**ترمینال 4 - ngrok:**
```bash
ngrok http 8070
```

### مرحله 5: تست در تلگرام
1. به ربات تلگرام خود پیام دهید
2. دستور `/start` را ارسال کنید  
3. روی "Launch WebApp" کلیک کنید
4. از قابلیت‌های mini app استفاده کنید!

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

## 🐛 رفع مشکلات رایج

### خطای "WebApp requires HTTPS"
- مطمئن شوید ngrok در حال اجرا است
- URL ngrok را در `apps/bot/.env` قرار داده‌اید

### خطای اتصال به دیتابیس
```bash
# چک کردن وضعیت Docker
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