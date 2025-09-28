# 🚀 GitHub & Vercel Deployment Guide

## Step 1: GitHub Repository Setup

### 1. Create GitHub Repository:
1. Go to: https://github.com
2. Click "New Repository" 
3. Repository name: `analyzer-miniapp`
4. Description: `Analyzer Telegram Mini App - Web3 Mission Platform`
5. Select Public
6. **Important:** Don't add README.md or .gitignore (we already have them)
7. Click "Create Repository"

### 2. Local Git Setup:
```powershell
# Run these commands in your project directory:

# Initialize Git repository
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Analyzer MiniApp with Vercel deployment ready"

# Add GitHub repository as origin
# Note: Replace YOUR_USERNAME with your GitHub username!
git remote add origin https://github.com/YOUR_USERNAME/analyzer-miniapp.git

# Push to GitHub
git push -u origin main
```

## Step 2: Vercel Deployment

### 1. Vercel Account:
1. Go to: https://vercel.com
2. Login with GitHub
3. Grant access to repositories

### 2. Import Project:
1. In Vercel dashboard, click "New Project"
2. Select GitHub repository `analyzer-miniapp`
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm build --filter=@analyzer/web`
   - **Install Command**: `cd ../.. && pnpm install`
   - **Output Directory**: `.next` (default)

### 3. Environment Variables:
Add these in Vercel project settings:

```env
# Database (will get from Neon later)
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
1. Go to: https://neon.tech
2. Sign up with GitHub
3. Create new project: `analyzer-production`
4. Database name: `analyzer`
5. Copy connection string
6. In Vercel settings, update `DATABASE_URL`

## Step 3: First Deployment Test

### 1. Deploy:
1. In Vercel, click "Deploy"
2. Wait for build process (~2-3 minutes)
3. If successful, you'll get a URL like: `https://analyzer-miniapp.vercel.app`

### 2. Database Migration:
```powershell
# On local with production DATABASE_URL:
# First create .env.production:
echo "DATABASE_URL=your-neon-connection-string" > apps/web/.env.production

# Run migration:
cd apps/web
npx prisma migrate deploy --schema=./prisma/schema.prisma
npx prisma db seed --schema=./prisma/schema.prisma
```

### 3. Telegram Webhook:
```powershell
# Point bot webhook to Vercel:
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<APP>.vercel.app/api/telegram"
```

## Alternative: Bot-only Deploy (no web)
If you only need the bot, deploy the standalone package at `apps/telegram-webhook` to a separate Vercel project.

Project settings:
- Framework preset: Other
- Root directory: apps/telegram-webhook
- Build command: (none)
- Output directory: (none)
- Functions: will auto-detect `api/telegram.ts`

Environment Variables:
- TELEGRAM_BOT_TOKEN
- PUBLIC_WEBAPP_URL (optional)
- DATABASE_URL (if you later add DB access to the function)

Then set the Telegram webhook to `https://<your-project>.vercel.app/api/telegram`.
```

## ✅ Checklist:
- [ ] GitHub repository created
- [ ] Code pushed to GitHub  
- [ ] Vercel project imported
- [ ] Environment variables set
- [ ] Neon database created
- [ ] First deployment successful
- [ ] Database migrated
- [ ] Telegram webhook set

## After Success:
- 🎉 Mini App goes live!
- 📱 Telegram bot works
- 💾 Database connected  
- 🔄 Auto-deployment setup

**Every GitHub change = Automatic deploy!** 🚀