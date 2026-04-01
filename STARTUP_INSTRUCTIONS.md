# FastFood Bagat Telegram Bot - Startup Instructions

## Quick Start (5 minutes)

### Step 1: Setup Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
```
TELEGRAM_BOT_TOKEN=your_bot_token
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email
ADMIN_TOKEN=your_admin_token
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Development Server

```bash
npm run start:dev
```

Expected output:
```
[Nest] 12345  - 01/01/2024, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/01/2024, 10:00:01 AM     LOG [InstanceLoader] ConfigModule dependencies initialized
[Nest] 12345  - 01/01/2024, 10:00:02 AM     LOG [InstanceLoader] LoggerModule dependencies initialized
[Nest] 12345  - 01/01/2024, 10:00:03 AM     LOG [InstanceLoader] FirebaseModule dependencies initialized
[Nest] 12345  - 01/01/2024, 10:00:04 AM     LOG [NestApplication] Nest application successfully started
```

### Step 4: Test the Bot

1. Open Telegram
2. Search for your bot (by username)
3. Send `/start` command
4. You should see the welcome message

## Detailed Setup

### 1. Firebase Setup

#### Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Enter project name: "FastFood Bagat"
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Create Realtime Database

1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Choose location (closest to your users)
4. Start in test mode (for development)
5. Click "Enable"

#### Create Service Account

1. Go to Project Settings (gear icon)
2. Click "Service Accounts" tab
3. Click "Generate New Private Key"
4. Save the JSON file
5. Copy values to `.env`:
   - `FIREBASE_PROJECT_ID`: from JSON
   - `FIREBASE_PRIVATE_KEY`: from JSON (replace `\n` with actual newlines)
   - `FIREBASE_CLIENT_EMAIL`: from JSON

#### Get Database URL

1. In Realtime Database, copy the URL
2. Set as `FIREBASE_DATABASE_URL` in `.env`

### 2. Telegram Bot Setup

#### Create Bot with @BotFather

1. Open Telegram
2. Search for @BotFather
3. Send `/newbot`
4. Follow instructions:
   - Enter bot name: "FastFood Bagat Bot"
   - Enter bot username: "fastfood_bagat_bot" (must be unique)
5. Copy the token
6. Set as `TELEGRAM_BOT_TOKEN` in `.env`

#### Set Bot Commands

```bash
curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/setMyCommands \
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

### 3. Local Development

#### Run with Hot Reload

```bash
npm run start:dev
```

#### Run Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

#### View Logs

```bash
# Real-time logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log
```

### 4. Database Initialization

#### Create Initial Data

```bash
# Create categories
curl -X POST http://localhost:3000/api/categories \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Burgerlar",
    "emoji": "🍔",
    "description": "Mazali burgerlar"
  }'

# Create food items
curl -X POST http://localhost:3000/api/foods \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Klassik Burger",
    "categoryId": "cat_1",
    "price": 25000,
    "description": "Klassik burger",
    "available": true,
    "stock": 100
  }'
```

## API Endpoints

### Public Endpoints

```bash
# Get all categories
GET /api/categories

# Get foods by category
GET /api/foods/category/:categoryId

# Get all foods
GET /api/foods
```

### Admin Endpoints (require ADMIN_TOKEN)

```bash
# Create category
POST /api/categories
Authorization: Bearer <ADMIN_TOKEN>

# Update category
PATCH /api/categories/:id
Authorization: Bearer <ADMIN_TOKEN>

# Delete category
DELETE /api/categories/:id
Authorization: Bearer <ADMIN_TOKEN>

# Create food
POST /api/foods
Authorization: Bearer <ADMIN_TOKEN>

# Update food
PATCH /api/foods/:id
Authorization: Bearer <ADMIN_TOKEN>

# Delete food
DELETE /api/foods/:id
Authorization: Bearer <ADMIN_TOKEN>

# Get all orders
GET /api/orders
Authorization: Bearer <ADMIN_TOKEN>

# Update order status
PATCH /api/orders/:id/status
Authorization: Bearer <ADMIN_TOKEN>
```

## Bot Commands

### User Commands

- `/start` - Botni ishga tushirish va asosiy menyu
- `/menu` - Kategoriyalarni ko'rish
- `/orders` - Mening buyurtmalarim
- `/help` - Yordam
- `/contact` - Aloqa ma'lumotlari
- `/admin` - Admin panel (token kerak)

### Order Wizard Flow

1. `/menu` - Kategoriyani tanlash
2. Kategoriyani tanlang - Mahsulotlarni ko'rish
3. Mahsulotni tanlang - Miqdorni kiritish
4. Miqdor kiritish - Manzilni kiritish
5. Manzil kiritish - Telefon raqamini kiritish
6. Telefon kiritish - Buyurtmani tasdiqlash
7. Tasdiqlash - Buyurtma yaratildi

## Troubleshooting

### Bot not responding

**Problem**: Bot commands not working

**Solution**:
1. Check bot token: `curl https://api.telegram.org/bot<TOKEN>/getMe`
2. Check webhook: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
3. Check logs: `tail -f logs/combined.log`

### Firebase connection error

**Problem**: "Firebase connection failed"

**Solution**:
1. Verify credentials in `.env`
2. Check Firebase database URL
3. Ensure service account has permissions
4. Check Firebase rules

### Admin token not working

**Problem**: "Unauthorized" when accessing admin endpoints

**Solution**:
1. Verify admin token in `.env`
2. Check token format (no spaces)
3. Ensure token is passed in Authorization header

### Port already in use

**Problem**: "EADDRINUSE: address already in use :::3000"

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run start:dev
```

## Performance Tips

1. **Enable Caching**: Cache is automatically enabled
2. **Database Indexing**: Indexes are configured in Firebase
3. **Connection Pooling**: Enabled by default
4. **Retry Logic**: Exponential backoff for failed requests

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Admin token is strong and random
- [ ] Firebase rules are properly configured
- [ ] Bot token is kept secret
- [ ] HTTPS is enabled in production
- [ ] Logs don't contain sensitive data

## Next Steps

1. **Customize Bot**: Edit bot commands and messages
2. **Add More Categories**: Create food categories
3. **Setup Admin Panel**: Configure admin dashboard
4. **Deploy**: Follow DEPLOYMENT_GUIDE.md
5. **Monitor**: Setup monitoring and alerts

## Support

For issues:
1. Check logs: `logs/combined.log`
2. Review error messages
3. Check Firebase console
4. Verify Telegram bot settings
