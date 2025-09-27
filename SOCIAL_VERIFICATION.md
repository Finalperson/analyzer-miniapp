# 🔗 Social Media Verification Setup

This guide explains how to set up Twitter and Discord API integration for mission verification.

## 🐦 Twitter API Setup

### 1. Twitter Developer Account
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Apply for a Developer Account
3. Create a new App in the Developer Portal
4. Navigate to "Keys and Tokens"

### 2. Get Bearer Token
1. In your Twitter App dashboard
2. Go to "Keys and Tokens" tab
3. Generate "Bearer Token"
4. Copy the Bearer Token

### 3. Configure Environment
Add to `apps/api/.env`:
```env
TWITTER_BEARER_TOKEN=your_actual_bearer_token_here
```

### 4. Get Analyzer Finance Twitter ID
```bash
# Use Twitter API to get user ID (optional, for exact matching)
curl "https://api.twitter.com/2/users/by/username/AnalyzerFinance" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN"
```

### 5. Twitter API Permissions
Required permissions:
- ✅ **Read** (to check follows)
- ❌ Write (not needed)
- ❌ Direct Messages (not needed)

---

## 💬 Discord API Setup

### 1. Discord Developer Portal
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Analyzer Verification Bot")

### 2. Create Bot
1. Go to "Bot" section in left sidebar
2. Click "Add Bot"
3. Copy the "Token" (this is your Bot Token)
4. Enable "Message Content Intent" if needed

### 3. Get Guild ID (Server ID)
1. Enable Developer Mode in Discord:
   - User Settings → Advanced → Developer Mode
2. Right-click on your Discord server
3. Click "Copy ID"

### 4. Invite Bot to Server
1. Go to "OAuth2" → "URL Generator"
2. Select Scopes: `bot`
3. Select Bot Permissions:
   - ✅ **View Channels**
   - ✅ **Read Message History**
   - ✅ **Read Members** (if available)
4. Copy generated URL and open it
5. Select your server and authorize

### 5. Configure Environment
Add to `apps/api/.env`:
```env
DISCORD_BOT_TOKEN=your_actual_bot_token_here
DISCORD_GUILD_ID=your_server_id_here
```

---

## 🔧 Development vs Production

### Development Mode (Current)
- ✅ **Username validation only** (format checking)
- ✅ **No actual API calls** (faster testing)
- ✅ **Fallback verification** (just checks if username provided)

### Production Mode (With API Tokens)
- ✅ **Real Twitter follow verification**
- ✅ **Real Discord membership verification** 
- ✅ **Actual API integration**

---

## 🛠️ How It Works

### Twitter Verification Flow:
```
1. User clicks "Follow on Twitter" → Opens Twitter page
2. User follows @AnalyzerFinance
3. User enters their Twitter username
4. Backend calls Twitter API to verify follow
5. If verified: +30 AP awarded
```

### Discord Verification Flow:
```
1. User clicks "Join Discord" → Opens Discord invite
2. User joins the Analyzer Finance server
3. User enters their Discord username
4. Backend searches server members for username
5. If found: +30 AP awarded
```

---

## 📊 Error Handling

### Twitter Errors:
- **404**: User not found → "Please check your username"
- **429**: Rate limited → "Please try again later"
- **403**: Protected account → "Please make your account public"

### Discord Errors:
- **404**: User not in server → "Please join our Discord first"
- **403**: Bot lacks permissions → Check bot permissions
- **Invalid format**: Username validation failed

---

## 🔍 Testing

### Without API Keys (Development):
```bash
# These will work with just username validation
curl -X POST http://localhost:8071/missions/twitter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt" \
  -d '{"username": "testuser"}'

curl -X POST http://localhost:8071/missions/discord \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt" \
  -d '{"username": "testuser#1234"}'
```

### With API Keys (Production):
```bash
# These will do actual verification
# Make sure TWITTER_BEARER_TOKEN and DISCORD_BOT_TOKEN are set
```

---

## 🚀 Deployment Checklist

Before deploying to production:

### Twitter:
- [ ] Twitter Developer Account approved
- [ ] Bearer Token generated and tested
- [ ] `TWITTER_BEARER_TOKEN` in production environment
- [ ] Analyzer Finance Twitter account exists

### Discord:
- [ ] Discord Bot created and configured
- [ ] Bot invited to Analyzer Finance server
- [ ] `DISCORD_BOT_TOKEN` and `DISCORD_GUILD_ID` in production environment
- [ ] Bot has proper permissions

### Testing:
- [ ] Test both Twitter and Discord verification
- [ ] Verify error handling works
- [ ] Check rate limiting behavior
- [ ] Confirm points are awarded correctly

---

## 💡 Pro Tips

1. **Rate Limiting**: Twitter API has rate limits. Consider caching results.
2. **Fallback**: Always have a fallback verification method.
3. **Monitoring**: Monitor API calls and error rates.
4. **Security**: Never expose API tokens in frontend code.
5. **User Experience**: Provide clear instructions to users.

## 🆘 Troubleshooting

### "Twitter API not configured"
- Check `TWITTER_BEARER_TOKEN` in `.env`
- Verify token is valid (test with curl)

### "Discord API not configured"  
- Check `DISCORD_BOT_TOKEN` and `DISCORD_GUILD_ID` in `.env`
- Verify bot is in the server

### "User not found"
- For Twitter: Check username format (@username)
- For Discord: Check username#discriminator format

### API Rate Limits
- Twitter: 300 requests per 15 minutes
- Discord: 50 requests per second

---

## 📚 API Documentation

- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [Discord API](https://discord.com/developers/docs/intro)
- [Discord.js Guide](https://discordjs.guide/) (if using Discord.js)