# 🚀 FastFood Bagat Telegram Bot - Production Deployment Plan

## Phase 1: Pre-Deployment Verification (Day 1)

### 1.1 Code Quality Check
```bash
# Run linter
npm run lint

# Format code
npm run format

# Run all tests
npm run test

# Check coverage
npm run test:cov

# Property-based tests
npm run test:pbt

# Integration tests
npm run test:integration
```

**Expected Results:**
- ✅ No linting errors
- ✅ All tests passing (178/178)
- ✅ Code coverage >80%
- ✅ No TypeScript errors

### 1.2 Build Verification
```bash
# Clean build
npm run build

# Verify dist folder
ls -la dist/

# Check file sizes
du -sh dist/
```

**Expected Results:**
- ✅ Build completes without errors
- ✅ dist/ folder created
- ✅ All source files compiled

### 1.3 Security Audit
```bash
# Check for vulnerabilities
npm audit

# Review dependencies
npm list

# Check for outdated packages
npm outdated
```

**Expected Results:**
- ✅ No critical vulnerabilities
- ✅ All dependencies up to date
- ✅ No deprecated packages

---

## Phase 2: Firebase Setup (Day 2)

### 2.1 Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Enter project name: "FastFood Bagat Production"
4. Enable Google Analytics
5. Click "Create project"

### 2.2 Setup Realtime Database

1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Choose region: **Asia (Singapore)** (closest to Uzbekistan)
4. Start in **Production mode** (not test mode)
5. Click "Enable"

### 2.3 Create Service Account

1. Go to Project Settings (gear icon)
2. Click "Service Accounts" tab
3. Click "Generate New Private Key"
4. Save JSON file securely
5. Copy to `.env`:
   ```
   FIREBASE_PROJECT_ID=<from JSON>
   FIREBASE_PRIVATE_KEY=<from JSON>
   FIREBASE_CLIENT_EMAIL=<from JSON>
   FIREBASE_DATABASE_URL=https://<project-id>.firebaseio.com
   ```

### 2.4 Configure Firebase Security Rules

```json
{
  "rules": {
    "foods": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()",
      ".indexOn": ["categoryId", "available"]
    },
    "categories": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()",
      ".indexOn": ["name"]
    },
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["telegramId", "status", "createdAt"],
      "$orderId": {
        ".read": "root.child('orders').child($orderId).child('telegramId').val() == auth.uid || root.child('admins').child(auth.uid).exists()",
        ".write": "root.child('admins').child(auth.uid).exists()"
      }
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["telegramId", "createdAt"],
      "$userId": {
        ".read": "$userId == auth.uid || root.child('admins').child(auth.uid).exists()",
        ".write": "$userId == auth.uid || root.child('admins').child(auth.uid).exists()"
      }
    },
    "admins": {
      ".read": false,
      ".write": false
    }
  }
}
```

### 2.5 Initialize Database

Create initial admin user in Firebase:
```json
{
  "admins": {
    "admin_1": {
      "email": "admin@fastfoodbagat.uz",
      "createdAt": 1704067200000
    }
  }
}
```

---

## Phase 3: Telegram Bot Setup (Day 2)

### 3.1 Create Bot with @BotFather

1. Open Telegram
2. Search for @BotFather
3. Send `/newbot`
4. Follow instructions:
   - Bot name: "FastFood Bagat Bot"
   - Bot username: "fastfood_bagat_bot" (must be unique)
5. Copy bot token
6. Set as `TELEGRAM_BOT_TOKEN` in `.env`

### 3.2 Configure Bot Commands

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

### 3.3 Set Bot Description

```bash
curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/setMyDescription \
  -H 'Content-Type: application/json' \
  -d '{
    "description": "FastFood Bagat - Tez va mazali taomlar buyurtmasi uchun bot"
  }'
```

### 3.4 Set Bot Short Description

```bash
curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/setMyShortDescription \
  -H 'Content-Type: application/json' \
  -d '{
    "short_description": "Taomlar buyurtmasi"
  }'
```

---

## Phase 4: Deployment Platform Setup (Day 3)

### Option A: DigitalOcean App Platform (Recommended)

#### 4A.1 Create DigitalOcean Account
1. Go to https://www.digitalocean.com
2. Sign up or log in
3. Create new project: "FastFood Bagat"

#### 4A.2 Create App
1. Go to Apps (App Platform)
2. Click "Create App"
3. Connect GitHub repository
4. Select branch: `main`
5. Configure build settings:
   - Build command: `npm run build`
   - Run command: `npm run start:prod`

#### 4A.3 Set Environment Variables
1. In App settings, go to "Environment"
2. Add all variables from `.env`:
   ```
   NODE_ENV=production
   PORT=3000
   LOG_LEVEL=warn
   TELEGRAM_BOT_TOKEN=<your_token>
   FIREBASE_PROJECT_ID=<your_project_id>
   FIREBASE_PRIVATE_KEY=<your_private_key>
   FIREBASE_CLIENT_EMAIL=<your_email>
   FIREBASE_DATABASE_URL=<your_database_url>
   ADMIN_TOKEN=<strong_random_token>
   BOT_WEBHOOK_URL=https://<your-app>.ondigitalocean.app/bot/webhook
   ```

#### 4A.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Get app URL: `https://<your-app>.ondigitalocean.app`

### Option B: AWS Lambda + API Gateway

#### 4B.1 Create Lambda Function
1. Go to AWS Lambda console
2. Create new function:
   - Name: `fastfood-bagat-bot`
   - Runtime: Node.js 18.x
   - Architecture: x86_64

#### 4B.2 Upload Code
1. Build: `npm run build`
2. Create deployment package:
   ```bash
   cd dist
   zip -r ../lambda.zip .
   cd ..
   ```
3. Upload `lambda.zip` to Lambda

#### 4B.3 Configure Environment Variables
1. In Lambda settings, add environment variables
2. Set handler: `dist/main.handler`

#### 4B.4 Create API Gateway
1. Create new REST API
2. Create POST method for `/bot/webhook`
3. Connect to Lambda function
4. Deploy API
5. Get webhook URL

### Option C: Docker + VPS

#### 4C.1 Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

#### 4C.2 Build Docker Image
```bash
docker build -t fastfood-bagat-bot:1.0.0 .
```

#### 4C.3 Push to Registry
```bash
docker tag fastfood-bagat-bot:1.0.0 <registry>/fastfood-bagat-bot:1.0.0
docker push <registry>/fastfood-bagat-bot:1.0.0
```

#### 4C.4 Deploy to VPS
```bash
docker run -d \
  --name fastfood-bagat-bot \
  -p 3000:3000 \
  --env-file .env \
  <registry>/fastfood-bagat-bot:1.0.0
```

---

## Phase 5: Webhook Configuration (Day 3)

### 5.1 Configure Webhook

```bash
curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://<your-domain>/bot/webhook",
    "allowed_updates": ["message", "callback_query"],
    "drop_pending_updates": true
  }'
```

### 5.2 Verify Webhook

```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo
```

**Expected Response:**
```json
{
  "ok": true,
  "result": {
    "url": "https://<your-domain>/bot/webhook",
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

## Phase 6: Initial Data Setup (Day 4)

### 6.1 Create Categories

```bash
# Burgerlar
curl -X POST https://<your-domain>/api/categories \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Burgerlar",
    "emoji": "🍔",
    "description": "Mazali burgerlar"
  }'

# Pizzalar
curl -X POST https://<your-domain>/api/categories \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Pizzalar",
    "emoji": "🍕",
    "description": "Klassik pizzalar"
  }'

# Ichimliklar
curl -X POST https://<your-domain>/api/categories \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Ichimliklar",
    "emoji": "🥤",
    "description": "Sovuq va issiq ichimliklar"
  }'

# Qo'shimchalar
curl -X POST https://<your-domain>/api/categories \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Qo'\''shimchalar",
    "emoji": "🍟",
    "description": "Qo'\''shimcha taomlar"
  }'
```

### 6.2 Create Food Items

```bash
# Klassik Burger
curl -X POST https://<your-domain>/api/foods \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Klassik Burger",
    "categoryId": "cat_1",
    "price": 25000,
    "description": "Klassik burger - go'\''sht, pomidor, salat",
    "available": true,
    "stock": 100
  }'

# Chiz Burger
curl -X POST https://<your-domain>/api/foods \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Chiz Burger",
    "categoryId": "cat_1",
    "price": 30000,
    "description": "Burger - go'\''sht, chiz, pomidor",
    "available": true,
    "stock": 100
  }'

# Margarita Pizza
curl -X POST https://<your-domain>/api/foods \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Margarita Pizza",
    "categoryId": "cat_2",
    "price": 45000,
    "description": "Klassik Margarita pizza",
    "available": true,
    "stock": 50
  }'

# Pepperoni Pizza
curl -X POST https://<your-domain>/api/foods \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Pepperoni Pizza",
    "categoryId": "cat_2",
    "price": 50000,
    "description": "Pepperoni pizza",
    "available": true,
    "stock": 50
  }'

# Cola
curl -X POST https://<your-domain>/api/foods \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Cola",
    "categoryId": "cat_3",
    "price": 8000,
    "description": "Sovuq Cola",
    "available": true,
    "stock": 200
  }'

# Fries
curl -X POST https://<your-domain>/api/foods \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d '{
    "name": "Fries",
    "categoryId": "cat_4",
    "price": 12000,
    "description": "Qizdirilgan kartoshka",
    "available": true,
    "stock": 150
  }'
```

---

## Phase 7: Testing in Production (Day 4)

### 7.1 Health Check

```bash
curl https://<your-domain>/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### 7.2 Test Bot Commands

1. Open Telegram
2. Search for your bot
3. Send `/start` - Should see welcome message
4. Send `/menu` - Should see categories
5. Send `/help` - Should see help text
6. Send `/contact` - Should see contact info

### 7.3 Test Order Wizard

1. Send `/menu`
2. Click on category (e.g., "🍔 Burgerlar")
3. Click on product (e.g., "Klassik Burger")
4. Enter quantity: `2`
5. Enter address: `Tashkent, Mirabad District, Street 123`
6. Enter phone: `+998901234567`
7. Review order summary
8. Click "Tasdiqlash" (Confirm)
9. Should see confirmation message

### 7.4 Test API Endpoints

```bash
# Get categories
curl https://<your-domain>/api/categories

# Get foods
curl https://<your-domain>/api/foods

# Get foods by category
curl https://<your-domain>/api/foods/category/cat_1

# Get user orders (requires auth)
curl https://<your-domain>/api/orders/user/123456789 \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'
```

### 7.5 Check Logs

```bash
# View application logs
curl https://<your-domain>/logs

# Or check deployment platform logs
# DigitalOcean: App > Logs
# AWS Lambda: CloudWatch Logs
# VPS: docker logs fastfood-bagat-bot
```

---

## Phase 8: Monitoring Setup (Day 5)

### 8.1 Configure Error Tracking

1. Set up error tracking service (e.g., Sentry)
2. Add error tracking token to `.env`
3. Configure alerts for critical errors

### 8.2 Configure Performance Monitoring

1. Set up performance monitoring (e.g., New Relic)
2. Monitor response times
3. Monitor database queries
4. Set up alerts for slow requests

### 8.3 Configure Uptime Monitoring

1. Set up uptime monitoring (e.g., UptimeRobot)
2. Monitor webhook endpoint
3. Monitor API endpoints
4. Set up alerts for downtime

### 8.4 Configure Log Aggregation

1. Set up log aggregation (e.g., ELK Stack)
2. Aggregate logs from all instances
3. Set up log retention policy
4. Create dashboards for monitoring

---

## Phase 9: Backup & Recovery (Day 5)

### 9.1 Configure Database Backups

```bash
# Export Firebase data
firebase database:get / > backup-$(date +%Y%m%d).json

# Schedule daily backups
0 2 * * * firebase database:get / > backup-$(date +\%Y\%m\%d).json
```

### 9.2 Test Backup Restoration

1. Create test database
2. Restore from backup
3. Verify data integrity
4. Document restoration procedure

### 9.3 Configure Automated Backups

1. Set up Firebase automated backups
2. Configure backup retention policy
3. Test backup restoration

---

## Phase 10: Security Hardening (Day 6)

### 10.1 Enable HTTPS

1. Get SSL certificate (Let's Encrypt)
2. Configure HTTPS on deployment platform
3. Redirect HTTP to HTTPS
4. Test SSL certificate

### 10.2 Configure Firewall

1. Allow only necessary ports (80, 443)
2. Block all other ports
3. Configure rate limiting
4. Set up DDoS protection

### 10.3 Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### 10.4 API Security

1. Enable request signing
2. Implement rate limiting
3. Validate all inputs
4. Sanitize all outputs

---

## Phase 11: Documentation & Handover (Day 6)

### 11.1 Create Runbook

Document:
- How to deploy updates
- How to handle common issues
- How to scale the application
- How to perform backups
- How to restore from backups

### 11.2 Create Admin Guide

Document:
- How to manage categories
- How to manage food items
- How to manage orders
- How to view analytics
- How to handle customer issues

### 11.3 Create User Guide

Document:
- How to use the bot
- How to place an order
- How to track order status
- How to contact support

### 11.4 Team Training

1. Train admin team on bot management
2. Train support team on issue handling
3. Train development team on deployment
4. Create knowledge base

---

## Phase 12: Go-Live (Day 7)

### 12.1 Final Verification

- [ ] All tests passing
- [ ] All monitoring configured
- [ ] All backups working
- [ ] All documentation complete
- [ ] Team trained
- [ ] Webhook configured
- [ ] Database initialized
- [ ] Security hardened

### 12.2 Announcement

1. Announce bot on social media
2. Send announcement to users
3. Create marketing materials
4. Set up customer support

### 12.3 Monitor First 24 Hours

1. Monitor error rates
2. Monitor response times
3. Monitor user activity
4. Be ready for quick fixes

### 12.4 Post-Launch Review

1. Collect user feedback
2. Review performance metrics
3. Identify improvements
4. Plan next features

---

## Rollback Plan

If critical issues occur:

### Immediate Actions
1. Disable webhook: `setWebhook` with empty URL
2. Revert to previous version
3. Investigate issue
4. Fix and redeploy

### Rollback Command
```bash
# Disable webhook
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{"url": ""}'

# Revert deployment
# DigitalOcean: Click "Rollback" in deployment history
# AWS Lambda: Update function code to previous version
# VPS: docker pull <registry>/fastfood-bagat-bot:previous-version
```

---

## Success Metrics

### Technical Metrics
- ✅ Uptime: >99.9%
- ✅ Response time: <500ms
- ✅ Error rate: <0.1%
- ✅ Database latency: <100ms

### Business Metrics
- ✅ User growth: Track daily active users
- ✅ Order volume: Track orders per day
- ✅ Customer satisfaction: Track ratings
- ✅ Revenue: Track total sales

### Support Metrics
- ✅ Response time: <1 hour
- ✅ Resolution time: <24 hours
- ✅ Customer satisfaction: >4.5/5
- ✅ Issue resolution rate: >95%

---

## Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| Pre-Deployment Verification | 1 day | ⏳ |
| Firebase Setup | 1 day | ⏳ |
| Telegram Bot Setup | 1 day | ⏳ |
| Deployment Platform Setup | 1 day | ⏳ |
| Webhook Configuration | 1 day | ⏳ |
| Initial Data Setup | 1 day | ⏳ |
| Testing in Production | 1 day | ⏳ |
| Monitoring & Backup Setup | 1 day | ⏳ |
| Security Hardening | 1 day | ⏳ |
| Documentation & Handover | 1 day | ⏳ |
| Go-Live | 1 day | ⏳ |
| **Total** | **11 days** | **⏳** |

---

## Contact & Support

- **Technical Issues**: Check logs and error IDs
- **Firebase Issues**: https://firebase.google.com/support
- **Telegram Issues**: https://core.telegram.org/bots/api
- **Deployment Issues**: Contact deployment platform support

---

**Status**: 🚀 Ready for Production Deployment

**Version**: 1.0.0
**Last Updated**: 2024-01-01
