# 🚀 GitHub & Vercel Deployment

## مرحله 1: GitHub Repository Setup

### 1. GitHub Repository بساز:
1. برو به: https://github.com
2. کلیک روی "New Repository" 
3. Repository name: `analyzer-miniapp`
4. Description: `Analyzer Telegram Mini App - Web3 Mission Platform`
5. Public انتخاب کن
6. **مهم:** README.md و .gitignore اضافه نکن (چون داریم)
7. کلیک روی "Create Repository"

### 2. Local Git Setup:
```powershell
# توی پروژه ات این commands رو اجرا کن:

# Git repository initialize کن
git init

# همه فایل‌ها رو add کن
git add .

# اولین commit
git commit -m "Initial commit: Analyzer MiniApp with Vercel deployment ready"

# GitHub repository رو به عنوان origin اضافه کن
# توجه: YOUR_USERNAME رو عوض کن!
git remote add origin https://github.com/YOUR_USERNAME/analyzer-miniapp.git

# Push کن
git push -u origin main
```

## مرحله 2: Vercel Deployment

### 1. Vercel Account:
1. برو به: https://vercel.com
2. با GitHub login کن
3. Access به repositories بده

### 2. Import Project:
1. در Vercel dashboard روی "New Project" کلیک کن
2. GitHub repository `analyzer-miniapp` رو انتخاب کن
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm build --filter=@analyzer/web`
   - **Install Command**: `cd ../.. && pnpm install`
   - **Output Directory**: `.next` (default)

### 3. Environment Variables:
اینها رو در Vercel project settings اضافه کن:

```env
# Database (بعداً از Neon میگیریم)
DATABASE_URL=postgresql://user:pass@host/database

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_BOT_NAME=your_bot_username
PUBLIC_WEBAPP_URL=https://your-project.vercel.app

# API URL  
NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api

# Social Links
NEXT_PUBLIC_TWITTER_URL=https://x.com/AnalyzerFinance
NEXT_PUBLIC_DISCORD_URL=https://discord.com/invite/EshVc7Vm7p
NEXT_PUBLIC_WEBSITE_URL=https://analyzer.finance

# Features
HONOR_MODE_SOCIAL=true
```

### 4. Database Setup (Neon):
1. برو به: https://neon.tech
2. Sign up با GitHub
3. Create new project: `analyzer-production`
4. Database name: `analyzer`
5. Copy connection string
6. در Vercel settings، `DATABASE_URL` رو update کن

## مرحله 3: First Deployment Test

### 1. Deploy:
1. در Vercel، "Deploy" رو کلیک کن
2. منتظر build process بمون (~2-3 دقیقه)
3. اگر موفق بود، یه URL میگیری مثل: `https://analyzer-miniapp.vercel.app`

### 2. Database Migration:
```powershell
# روی لوکال با production DATABASE_URL:
# اول .env.production بساز:
echo "DATABASE_URL=your-neon-connection-string" > apps/web/.env.production

# Migration اجرا کن:
cd apps/web
npx prisma migrate deploy --schema=./prisma/schema.prisma
npx prisma db seed --schema=./prisma/schema.prisma
```

### 3. Telegram Webhook:
```powershell
# Bot webhook رو به Vercel point کن:
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-project.vercel.app/api/telegram"
```

## ✅ Check List:
- [ ] GitHub repository created
- [ ] Code pushed to GitHub  
- [ ] Vercel project imported
- [ ] Environment variables set
- [ ] Neon database created
- [ ] First deployment successful
- [ ] Database migrated
- [ ] Telegram webhook set

## بعد از موفقیت:
- 🎉 Mini App live میشه!
- 📱 Telegram bot کار می‌کنه
- 💾 Database connected هست  
- 🔄 Auto-deployment setup شده

**هر تغییر در GitHub = Automatic deploy!** 🚀