# Admin Panel Guide

## Subscription Verification

To verify a user's active subscription and award the 200 AP bonus:

### Manual Verification Endpoint

**Endpoint:** `POST /admin/verify-subscription`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "walletAddress": "0x742d35Cc6C8b6A4C8b19C23c10F...",
  "adminKey": "your_admin_secret_key"
}
```

**Example using curl:**
```bash
curl -X POST http://127.0.0.1:8071/admin/verify-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6C8b6A4C8b19C23c10F...",
    "adminKey": "your_admin_secret_key"
  }'
```

### Response Examples

**Success:**
```json
{
  "success": true,
  "points": 200,
  "message": "Subscription verified for 0x742d35Cc6C8b6A4C8b19C23c10F.... User awarded +200 AP and premium status.",
  "user": {
    "telegramId": "123456789",
    "username": "username",
    "newBalance": 330
  }
}
```

**Error - Already Verified:**
```json
{
  "error": "Subscription already verified for this user"
}
```

**Error - User Not Found:**
```json
{
  "error": "User with this wallet address not found"
}
```

### Setup Admin Secret

1. Add to `apps/api/.env`:
```env
ADMIN_SECRET=your_super_secure_admin_key_here
```

2. Restart the API server

### Verification Process

1. User submits their EVM wallet address via the app
2. Admin manually checks if that wallet has an active subscription
3. If subscription is active, use the API endpoint to award 200 AP
4. User is automatically marked as premium and gets the bonus

### Security Notes

- Keep the admin secret secure
- Consider implementing proper admin authentication for production
- This endpoint should only be accessible to trusted administrators
- Monitor usage and implement rate limiting if needed

## User Data Access

You can view user data and wallet addresses through Prisma Studio:

```bash
pnpm --filter @analyzer/api postinstall  # Generate Prisma client
cd apps/api && npx prisma studio
```

Open http://localhost:5555 to browse:
- **User table**: See telegramId, walletAddress, apBalance, isPremium
- **UserMission table**: See completed missions
- **MissionsLog table**: See mission completion history (if implemented)