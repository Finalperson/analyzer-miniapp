# 🚀 Vercel Deployment Guide

## قدم‌های Deploy روی Vercel

### 1. GitHub Setup
```bash
# اول پروژه رو روی GitHub push کن
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/analyzer-miniapp.git
git push -u origin main
```

### 2. Database Setup (Neon)
1. برو به: https://neon.tech
2. اکانت بساز
3. یک database جدید بساز: `analyzer-production`
4. connection string رو کپی کن: 
   ```
   postgresql://username:password@host/analyzer-production?sslmode=require
   ```

### 3. Vercel Setup
1. برو به: https://vercel.com
2. GitHub connect کن
3. "Import Project" کلیک کن
4. Repository رو انتخاب کن: `analyzer-miniapp`

### 4. Vercel Configuration
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && pnpm build --filter=@analyzer/web`
- **Install Command**: `cd ../.. && pnpm install`

### 5. Environment Variables
در Vercel Dashboard این متغیرها رو اضافه کن:

```env
# Database
DATABASE_URL=postgresql://user:pass@neon-host/analyzer-production?sslmode=require

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-32-chars-minimum

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_BOT_NAME=your_bot_username
PUBLIC_WEBAPP_URL=https://your-vercel-app.vercel.app

# API URL (same as your Vercel domain)
NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app/api

# Social Links
NEXT_PUBLIC_TWITTER_URL=https://x.com/AnalyzerFinance
NEXT_PUBLIC_DISCORD_URL=https://discord.com/invite/EshVc7Vm7p
NEXT_PUBLIC_WEBSITE_URL=https://analyzer.finance

# Honor Mode
HONOR_MODE_SOCIAL=true

# Optional (if you want Discord verification)
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_GUILD_ID=your-discord-server-id
```

### 6. Database Migration
بعد از deploy، یکبار migration اجرا کن:

```bash
# روی لوکال با production DATABASE_URL
npx prisma migrate deploy
npx prisma db seed
```

### 7. Telegram Webhook Setup
بعد از deploy، webhook رو تنظیم کن:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-vercel-app.vercel.app/api/telegram"
```

## ✅ مزایای این Setup:

### Performance و Scale:
- ⚡ **Auto-scaling**: تا میلیون کاربر بدون مشکل
- 🌍 **Global CDN**: سریع در همه دنیا  
- 🔄 **Zero downtime**: هیچوقت آفلاین نمیشه
- 📊 **Real-time analytics**: آمار دقیق کاربران

### Database (Neon):
- 💾 **Auto-backup**: خودکار backup میگیره
- 🔒 **Secure**: SSL encryption
- ⚡ **Fast**: Connection pooling
- 💰 **Free tier**: تا 500MB رایگان

### Bot و API:
- 🤖 **Webhook mode**: سریعتر از polling
- 🔐 **Serverless**: امنیت بالا
- 💸 **Cost-effective**: فقط وقتی استفاده میشه پول میگیره

## 🚨 نکات مهم:

1. **ngrok دیگه لازم نیست**: فقط برای development
2. **Auto-deployment**: هر push به GitHub، خودکار deploy میشه  
3. **Environment variables**: همیشه در Vercel تنظیم کن، نه در کد
4. **Database**: حتماً از managed database استفاده کن (Neon)
5. **Monitoring**: Vercel dashboard رو چک کن برای errors

## 📈 بعد از Launch:

- **Analytics**: Vercel analytics رو فعال کن
- **Domain**: Custom domain اضافه کن  
- **Monitoring**: Vercel logs رو بررسی کن
- **Backup**: Database backup schedule کن

این setup به راحتی میلیون کاربر handle می‌کنه! 🎉