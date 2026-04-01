# 🤖 Telegram Bot Setup Guide

## Step 1: Open Telegram

### 1.1 Download Telegram (if needed)

1. Go to https://telegram.org
2. Download Telegram for your device
3. Install and open Telegram

### 1.2 Create Account (if needed)

1. Open Telegram
2. Enter your phone number
3. Verify with code sent to your phone
4. Set up your profile

---

## Step 2: Create Bot with @BotFather

### 2.1 Search for @BotFather

1. Open Telegram
2. Click "Search" (magnifying glass icon)
3. Type: `@BotFather`
4. Click on "BotFather" (official Telegram bot)

### 2.2 Start BotFather

1. Click "Start" button
2. You should see a welcome message:

```
I can help you create and manage Telegram bots. 
If you're new to the Bot API, please see the manual.

You can control me by sending these commands:

/newbot - create a new bot
/mybots - edit your existing bots
/mygames - edit your games
...
```

### 2.3 Create New Bot

1. Send command: `/newbot`
2. BotFather will ask: "Alright, a new bot. How are we going to call it? Please choose a name for your bot."

### 2.4 Enter Bot Name

1. Type: `FastFood Bagat Bot`
2. Send the message
3. BotFather will ask: "Good. Now let's choose a username for your bot. It must end in `bot`. Ex., TetrisBot or tetris_bot."

### 2.5 Enter Bot Username

1. Type: `fastfood_bagat_bot`
   - Must be unique (not used by another bot)
   - Must end with `bot`
   - Can contain letters, numbers, and underscores

2. Send the message

### 2.6 Get Bot Token

BotFather will respond with:

```
Done! Congratulations on your new bot. You will find it at t.me/fastfood_bagat_bot. 
You can now add a description, about section and profile picture for your bot, see /help for a list of commands.

Use this token to access the HTTP API:
123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh

Keep your token secure and store it safely!
```

**Save the token!** It looks like: `123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh`

---

## Step 3: Add Bot Token to .env

### 3.1 Open .env File

```bash
nano .env
```

### 3.2 Add Bot Token

Find this line:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

Replace with your actual token:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh
```

### 3.3 Save File

```bash
# Press Ctrl+X, then Y, then Enter to save
```

---

## Step 4: Configure Bot Commands

### 4.1 Get Your Bot Token

From the `.env` file:
```
TELEGRAM_BOT_TOKEN=123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh
```

### 4.2 Set Bot Commands

Run this command in your terminal:

```bash
curl -X POST https://api.telegram.org/bot123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh/setMyCommands \
  -H 'Content-Type: application/json' \
  -d '{
    "commands": [
      {"command": "start", "description": "Botni ishga tushirish"},
      {"command": "menu", "description": "Menyu ko'\''rish"},
      {"command": "orders", "description": "Mening buyurtmalarim"},
      {"command": "help", "description": "Yordam"},
      {"command": "contact", "description": "Aloqa"},
      {"command": "admin", "description": "Admin panel"}
    ]
  }'
```

**Replace** `123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh` with your actual token.

### 4.3 Verify Commands Set

You should see response:
```json
{"ok":true,"result":true}
```

---

## Step 5: Set Bot Description

### 5.1 Set Description

```bash
curl -X POST https://api.telegram.org/bot123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh/setMyDescription \
  -H 'Content-Type: application/json' \
  -d '{
    "description": "FastFood Bagat - Tez va mazali taomlar buyurtmasi uchun bot"
  }'
```

### 5.2 Verify Description Set

You should see response:
```json
{"ok":true,"result":true}
```

---

## Step 6: Set Bot Short Description

### 6.1 Set Short Description

```bash
curl -X POST https://api.telegram.org/bot123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh/setMyShortDescription \
  -H 'Content-Type: application/json' \
  -d '{
    "short_description": "Taomlar buyurtmasi"
  }'
```

### 6.2 Verify Short Description Set

You should see response:
```json
{"ok":true,"result":true}
```

---

## Step 7: Test Bot Locally

### 7.1 Start Development Server

```bash
npm run start:dev
```

### 7.2 Open Bot in Telegram

1. Open Telegram
2. Search for `@fastfood_bagat_bot`
3. Click on your bot
4. Click "Start" button

### 7.3 Test Commands

Send these commands and verify bot responds:

1. `/start` - Should show welcome message
2. `/menu` - Should show categories
3. `/help` - Should show help text
4. `/contact` - Should show contact info
5. `/orders` - Should show order history (empty for new user)

### 7.4 Check Logs

In your terminal, you should see logs like:

```
[Bot] /start command received from user 123456789
[Bot] Welcome message sent
[Bot] User registered: 123456789
```

---

## Step 8: Get Bot Info

### 8.1 Get Bot Details

```bash
curl https://api.telegram.org/bot123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh/getMe
```

### 8.2 Response

You should see:

```json
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "FastFood Bagat Bot",
    "username": "fastfood_bagat_bot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": false
  }
}
```

---

## Step 9: Configure Webhook (for Production)

### 9.1 Get Your Domain

When you deploy to production, you'll get a domain like:
- DigitalOcean: `https://fastfood-bagat-xxxxx.ondigitalocean.app`
- AWS Lambda: `https://xxxxx.execute-api.us-east-1.amazonaws.com`
- Heroku: `https://fastfood-bagat-xxxxx.herokuapp.com`

### 9.2 Set Webhook

```bash
curl -X POST https://api.telegram.org/bot123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://your-domain.com/bot/webhook",
    "allowed_updates": ["message", "callback_query"],
    "drop_pending_updates": true
  }'
```

**Replace** `https://your-domain.com` with your actual domain.

### 9.3 Verify Webhook

```bash
curl https://api.telegram.org/bot123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh/getWebhookInfo
```

You should see:

```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.com/bot/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "ip_address": "...",
    "last_error_date": null,
    "last_error_message": null,
    "last_synchronization_error_date": null,
    "max_connections": 40,
    "allowed_updates": ["message", "callback_query"]
  }
}
```

---

## Step 10: Troubleshooting

### Problem: Bot not responding to commands

**Solution:**
1. Check bot token in `.env` - correct?
2. Check bot is running: `npm run start:dev`
3. Check logs for errors
4. Try sending `/start` again
5. Check bot username - correct?

### Problem: "Invalid token"

**Solution:**
1. Copy token again from BotFather
2. Make sure no extra spaces
3. Make sure token format is correct: `123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh`
4. Update `.env` file
5. Restart application

### Problem: "Bot not found"

**Solution:**
1. Check bot username - correct?
2. Search for `@fastfood_bagat_bot` in Telegram
3. If not found, create new bot with BotFather
4. Update token in `.env`

### Problem: Commands not showing

**Solution:**
1. Run `setMyCommands` command again
2. Check response - should be `{"ok":true,"result":true}`
3. Restart Telegram app
4. Try `/` in chat - commands should appear

### Problem: Webhook not working

**Solution:**
1. Check domain is correct
2. Check HTTPS is enabled
3. Check webhook URL is correct: `/bot/webhook`
4. Check bot is running on production
5. Check logs for webhook errors

---

## Useful Commands

### Get Bot Info
```bash
curl https://api.telegram.org/bot<TOKEN>/getMe
```

### Get Webhook Info
```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

### Delete Webhook
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{"url": ""}'
```

### Get Updates (for polling)
```bash
curl https://api.telegram.org/bot<TOKEN>/getUpdates
```

### Send Test Message
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/sendMessage \
  -H 'Content-Type: application/json' \
  -d '{
    "chat_id": 123456789,
    "text": "Test message"
  }'
```

---

## Security Best Practices

### ✅ Do's

- ✅ Keep bot token secure
- ✅ Never share bot token
- ✅ Use HTTPS for webhook
- ✅ Validate all user inputs
- ✅ Use rate limiting
- ✅ Log all interactions
- ✅ Monitor bot activity

### ❌ Don'ts

- ❌ Don't commit token to git
- ❌ Don't share token in chat
- ❌ Don't use HTTP for webhook
- ❌ Don't trust user input
- ❌ Don't expose errors to users
- ❌ Don't log sensitive data

---

## Next Steps

1. ✅ Create bot with @BotFather
2. ✅ Add token to `.env`
3. ✅ Configure bot commands
4. ✅ Test bot locally
5. ✅ Configure webhook (for production)

**Next: Deploy to Production** 🚀

---

## Summary

| Step | Status | Notes |
|------|--------|-------|
| Create Bot | ✅ | With @BotFather |
| Get Token | ✅ | Save securely |
| Add to .env | ✅ | TELEGRAM_BOT_TOKEN |
| Set Commands | ✅ | 6 commands configured |
| Set Description | ✅ | Bot description set |
| Test Locally | ✅ | All commands working |
| Configure Webhook | ✅ | For production |

---

## Useful Links

- Telegram Bot API: https://core.telegram.org/bots/api
- BotFather: https://t.me/botfather
- Telegram Documentation: https://core.telegram.org/bots
- Telegraf.js: https://telegraf.js.org

---

**Telegram Bot Setup Complete! ✅**

**Next: Deploy to Production** 🚀
