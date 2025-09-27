@echo off
echo 🔍 Updating ngrok URL...

if "%1"=="" (
    echo ❌ Please provide ngrok URL as parameter
    echo Usage: update-ngrok.bat "https://your-ngrok-url.ngrok-free.app"
    exit /b 1
)

set "NEW_URL=%~1"
echo 🌐 Setting URL to: %NEW_URL%

echo TELEGRAM_BOT_TOKEN=8499726989:AAF5_iQsTOt881-GZcGP0eB4GJ1bTH47t3M > apps\bot\.env
echo PUBLIC_WEBAPP_URL=%NEW_URL% >> apps\bot\.env

echo ✅ Updated bot .env file
echo 📄 Current content:
type apps\bot\.env

echo.
echo 🔄 Restart the bot with: pnpm dev:bot
echo 🎉 Done!