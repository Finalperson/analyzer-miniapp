# Analyzer Telegram Webhook (Standalone)

This package deploys only the Telegram bot webhook as a Vercel serverless function, decoupled from the Next.js web app. Useful when you only want the bot live.

## Endpoint
- POST /api/telegram (Vercel)

## Environment Variables
- TELEGRAM_BOT_TOKEN (required)
- PUBLIC_WEBAPP_URL (optional; used for the WebApp button)
- DATABASE_URL (optional; only needed if you add DB access here)

## Prisma
A copy of the Prisma schema is included to allow generating the client if needed. Currently, the function does not instantiate Prisma by default.

## Notes
- Telegraf is dynamically imported per request to comply with serverless constraints and avoid bundling issues (e.g., pino-pretty).
- Telegram requires HTTPS for webhooks; set the webhook to your Vercel URL.