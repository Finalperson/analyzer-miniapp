# 🔗 ngrok URL Management Guide

## Problem: ngrok URL Changes Every Time

Each time you restart ngrok, it gives a new URL that needs to be updated in bot configuration.

---

## Different Solutions:

### 1. 🎯 **Static ngrok Domain (Best Solution)**

If you have an ngrok account:

```bash
# Register static domain in ngrok dashboard
# Example: analyzer-miniapp.ngrok.io

# Run ngrok with static domain
ngrok http 8070 --domain=analyzer-miniapp.ngrok.io
```

Advantages:
- ✅ URL never changes
- ✅ No updates needed
- ✅ More professional

---

### 2. 🤖 **Automatic Script (Node.js)**

```bash
# اجرای اسکریپت خودکار
pnpm ngrok:update
```

این اسکریپت:
- 🔍 URL جدید ngrok را از API می‌خواند
- 📝 فایل `.env` bot را بروزرسانی می‌کند  
- 🔄 Bot را restart می‌کند

---

### 3. 🪟 **PowerShell Script (Windows)**

```powershell
# بروزرسانی خودکار
pnpm ngrok:update-ps

# یا با URL دستی
pnpm ngrok:set -- "https://your-new-url.ngrok-free.app"
```

---

### 4. 📋 **بروزرسانی دستی**

```bash
# 1. URL جدید ngrok را کپی کنید
# 2. فایل apps/bot/.env را باز کنید
# 3. خط PUBLIC_WEBAPP_URL را بروزرسانی کنید

PUBLIC_WEBAPP_URL=https://your-new-ngrok-url.ngrok-free.app

# 4. Bot را restart کنید
pnpm dev:bot
```

---

## 🚀 Workflow توصیه شده:

### روش 1: با Domain ثابت
```bash
# Terminal 1
ngrok http 8070 --domain=your-domain.ngrok.io

# Terminal 2
pnpm dev:api

# Terminal 3  
pnpm dev:web

# Terminal 4
pnpm dev:bot
```

### روش 2: با اسکریپت خودکار
```bash
# Terminal 1
ngrok http 8070

# Terminal 2
pnpm dev:api

# Terminal 3
pnpm dev:web

# Terminal 4 - هر بار که ngrok restart شد
pnpm ngrok:update
```

---

## 🔧 تنظیمات ngrok

### نصب ngrok:
```bash
# Download از: https://ngrok.com/download
# یا با package manager:
winget install ngrok
```

### ثبت اکانت و authtoken:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### دریافت domain ثابت:
1. به ngrok dashboard بروید
2. روی "Domains" کلیک کنید  
3. "Create Domain" را انتخاب کنید
4. نام دلخواه وارد کنید

---

## ⚡ Quick Fix برای URL جدید شما:

```bash
# فعلاً URL جدید رو manual بروزرسانی کنید:
# apps/bot/.env
PUBLIC_WEBAPP_URL=https://e8bf8165e867.ngrok-free.app

# Bot رو restart کنید
pnpm dev:bot
```

---

## 💡 Tips & Tricks:

1. **همیشه از HTTPS استفاده کنید** (Telegram requirement)
2. **authtoken ngrok را تنظیم کنید** برای limits بیشتر
3. **domain ثابت بگیرید** برای production
4. **اسکریپت خودکار استفاده کنید** برای development
5. **URL را در multiple جا check کنید**:
   - `apps/bot/.env`
   - `apps/web/.env` (اگر لازم باشد)

با این راه حل‌ها دیگر مشکل تغییر URL ngrok نخواهید داشت! 🎉