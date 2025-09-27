# 🔧 Troubleshooting Guide

## مشکلات رایج و راه حل‌ها

### 1. مشکل HTTPS و Telegram WebApp

**خطا**: "WebApp requires HTTPS" یا WebApp باز نمی‌شود

**راه حل‌ها**:
```bash
# مطمئن شوید ngrok در حال اجرا است
ngrok http 8070

# URL صحیح ngrok را در bot env قرار دهید
# apps/bot/.env
WEBAPP_URL=https://your-actual-ngrok-url.ngrok-free.app

# ربات را restart کنید
pnpm --filter @analyzer/bot dev
```

### 2. مشکلات پورت

**خطا**: `Error: listen EADDRINUSE`

**راه حل‌ها**:
```bash
# تغییر پورت API در apps/api/src/index.ts
const server = Fastify({ logger: true });
await server.listen({ port: 8072, host: '127.0.0.1' }); # تغییر به 8072

# تغییر پورت Web در apps/web/package.json
"dev": "next dev -p 8073", # تغییر به 8073

# update کردن API URL در apps/web/.env
NEXT_PUBLIC_API_URL="http://127.0.0.1:8072"
```

### 3. مشکلات دیتابیس

**خطا**: Database connection failed

**راه حل‌ها**:
```bash
# چک کردن وضعیت Docker
docker ps

# اگر container‌ها نیستند
pnpm db:up

# اگر مشکل ادامه دارد
pnpm db:down
docker system prune -f
pnpm db:up

# تست اتصال دیتابیس
pnpm --filter @analyzer/api db:studio
```

### 4. خطاهای TypeScript

**خطا**: Property does not exist on type

**راه حل‌ها**:
```bash
# regenerate کردن Prisma client
pnpm --filter @analyzer/api db:generate

# restart TypeScript server در VS Code
Ctrl+Shift+P > "TypeScript: Restart TS Server"

# clear کردن cache
pnpm --filter @analyzer/api build
```

### 5. مشکل Telegram Authentication

**خطا**: 401 Unauthorized در API

**علت**: این در development طبیعی است چون initData موجود نیست

**راه حل برای تست**:
- حتماً از طریق Telegram WebApp تست کنید
- در مرورگر معمولی کار نمی‌کند
- از Telegram Desktop یا Mobile استفاده کنید

### 6. مشکلات Wallet Connection

**خطا**: WalletConnect نمی‌تواند متصل شود

**راه حل‌ها**:
```bash
# چک کردن نصب wagmi
pnpm --filter @analyzer/web add wagmi viem @wagmi/core @wagmi/connectors

# مطمئن شوید WagmiProvider درست setup شده
# در apps/web/app/providers.tsx
```

### 7. مشکلات Build

**خطا**: Build failed

**راه حل‌ها**:
```bash
# clear کردن node_modules
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# build تک تک packages
pnpm --filter @analyzer/shared build
pnpm --filter @analyzer/api build  
pnpm --filter @analyzer/web build

# چک کردن lint errors
pnpm lint
```

### 8. مشکلات Performance

**مشکل**: App کند است

**راه حل‌ها**:
```bash
# optimization تصاویر در Web
# استفاده از Next.js Image component

# database indexing
# در prisma/schema.prisma indices اضافه کنید

# Redis caching
# مطمئن شوید Redis running است
docker ps | grep redis
```

---

## 📋 Checklist تست نهایی

قبل از deploy کردن، این موارد را چک کنید:

### Environment Variables
- [ ] همه `.env` فایل‌ها پر شده‌اند
- [ ] `TELEGRAM_BOT_TOKEN` صحیح است
- [ ] `WEBAPP_URL` با ngrok URL مطابقت دارد
- [ ] `DATABASE_URL` کار می‌کند

### Services
- [ ] PostgreSQL container running است
- [ ] Redis container running است  
- [ ] API server بدون error اجرا می‌شود
- [ ] Web app بدون error اجرا می‌شود
- [ ] Bot بدون error اجرا می‌شود
- [ ] ngrok tunnel فعال است

### Functionality
- [ ] `/start` در bot کار می‌کند
- [ ] WebApp button نمایش داده می‌شود
- [ ] WebApp در Telegram باز می‌شود
- [ ] Authentication کار می‌کند
- [ ] Mission system کار می‌کند
- [ ] Point rewards کار می‌کند

### Database
- [ ] Migration اجرا شده
- [ ] Seed data موجود است
- [ ] User creation کار می‌کند
- [ ] Mission completion save می‌شود

---

## 🆘 اگر همه چیز fail شد

### Reset کامل:
```bash
# stop همه services
Ctrl+C در همه ترمینال‌ها

# پاک کردن containers
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

# پاک کردن volumes (⚠️ دیتا پاک می‌شود)
docker volume prune -f

# شروع مجدد از ابتدا
pnpm db:up
pnpm --filter @analyzer/api db:dev
pnpm --filter @analyzer/api db:seed

# restart همه services
```

### پشتیبانی:
اگر مشکل حل نشد:
1. لاگ‌های error را check کنید
2. Browser DevTools Console را باز کنید
3. Terminal outputs را بررسی کنید
4. GitHub Issues را check کنید

**مهم**: همیشه از آخرین ورژن ngrok استفاده کنید و مطمئن شوید internet connection پایدار دارید.