# Simple PowerShell script to update ngrok URL
param(
    [string]$NewUrl = ""
)

Write-Host "🔍 Updating ngrok URL..." -ForegroundColor Cyan

# Get the URL
if ($NewUrl) {
    $ngrokUrl = $NewUrl
    Write-Host "🌐 Using provided URL: $ngrokUrl" -ForegroundColor Cyan
} else {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -Method Get
        $httpsTunnel = $response.tunnels | Where-Object { $_.proto -eq "https" -and $_.config.addr -eq "localhost:8070" }
        
        if ($httpsTunnel) {
            $ngrokUrl = $httpsTunnel.public_url
            Write-Host "🌐 Found ngrok URL: $ngrokUrl" -ForegroundColor Cyan
        } else {
            Write-Host "❌ No HTTPS tunnel found for localhost:8070" -ForegroundColor Red
            Write-Host "Make sure ngrok is running: ngrok http 8070" -ForegroundColor Yellow
            exit 1
        }
    }
    catch {
        Write-Host "❌ Could not fetch ngrok URL from API" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Make sure ngrok is running on port 4040" -ForegroundColor Yellow
        exit 1
    }
}

# Update bot .env file
$botEnvPath = Join-Path $PSScriptRoot ".." "apps" "bot" ".env"

try {
    if (Test-Path $botEnvPath) {
        $envContent = Get-Content $botEnvPath -Raw
        
        # Update PUBLIC_WEBAPP_URL line
        if ($envContent -match "PUBLIC_WEBAPP_URL=") {
            $envContent = $envContent -replace "PUBLIC_WEBAPP_URL=.*", "PUBLIC_WEBAPP_URL=$ngrokUrl"
        } else {
            $envContent += "`nPUBLIC_WEBAPP_URL=$ngrokUrl"
        }
        
        # Write back to file
        $envContent | Set-Content -Path $botEnvPath -NoNewline
        Write-Host "✅ Updated bot .env with URL: $ngrokUrl" -ForegroundColor Green
        
        # Show current content
        Write-Host "`n📄 Current bot .env content:" -ForegroundColor Yellow
        Get-Content $botEnvPath | Write-Host
        
        Write-Host "`n🔄 Please restart the bot manually:" -ForegroundColor Yellow
        Write-Host "pnpm dev:bot" -ForegroundColor White
        
    } else {
        Write-Host "❌ Bot .env file not found at: $botEnvPath" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Error updating bot .env: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "� ngrok URL updated successfully!" -ForegroundColor Green