# FastFood Bagat Telegram Bot - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project created
- Telegram Bot Token (from @BotFather)
- Admin token for admin panel access

## Environment Setup

### 1. Create `.env` file

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/bot/webhook

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Admin Configuration
ADMIN_TOKEN=your_secure_admin_token

# Application Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

### 2. Install Dependencies

```bash
npm install
```

## Building the Application

### Development Mode

```bash
npm run start:dev
```

The application will start on `http://localhost:3000`

### Production Build

```bash
npm run build
```

### Production Mode

```bash
npm run start:prod
```

## Running Tests

### Unit Tests

```bash
npm run test
```

### Property-Based Tests

```bash
npm run test:pbt
```

### Integration Tests

```bash
npm run test:integration
```

### All Tests with Coverage

```bash
npm run test:cov
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Realtime Database
4. Create a service account and download JSON key

### 2. Configure Firebase Rules

Update Firebase Realtime Database rules with the content from `firebase-rules.json`:

```json
{
  "rules": {
    "foods": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "categories": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$orderId": {
        ".read": "root.child('orders').child($orderId).child('telegramId').val() == auth.uid || root.child('admins').child(auth.uid).exists()"
      }
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$userId": {
        ".read": "$userId == auth.uid || root.child('admins').child(auth.uid).exists()"
      }
    }
  }
}
```

## Telegram Bot Setup

### 1. Create Bot with @BotFather

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow the instructions to create a new bot
4. Copy the bot token

### 2. Configure Webhook

```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://your-domain.com/bot/webhook",
    "allowed_updates": ["message", "callback_query"]
  }'
```

### 3. Verify Webhook

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

## Deployment Options

### Option 1: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

Build and run:

```bash
docker build -t fastfood-bagat-bot .
docker run -p 3000:3000 --env-file .env fastfood-bagat-bot
```

### Option 2: Heroku Deployment

```bash
heroku create your-app-name
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set FIREBASE_PROJECT_ID=your_project_id
# ... set other env variables

git push heroku main
```

### Option 3: AWS Lambda + API Gateway

1. Build the application: `npm run build`
2. Create Lambda function with Node.js 18 runtime
3. Upload dist folder
4. Configure API Gateway for webhook endpoint
5. Set environment variables in Lambda configuration

### Option 4: DigitalOcean App Platform

1. Connect your GitHub repository
2. Create new app from repository
3. Set environment variables
4. Deploy

## Health Check

```bash
curl http://localhost:3000/health
```

## Monitoring

### Logs

Logs are stored in:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

### Log Rotation

Logs are automatically rotated daily with 30-day retention.

## Troubleshooting

### Bot not responding

1. Check webhook configuration: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Verify bot token in `.env`
3. Check application logs: `tail -f logs/combined.log`

### Firebase connection issues

1. Verify Firebase credentials in `.env`
2. Check Firebase rules configuration
3. Ensure database URL is correct

### Admin panel not accessible

1. Verify admin token in `.env`
2. Check admin guard implementation
3. Review authentication logs

## Performance Optimization

### Caching

The application uses Redis-like caching for:
- Food catalog
- Categories
- User preferences

Cache is invalidated on data updates.

### Database Optimization

- Indexes on frequently queried fields
- Connection pooling enabled
- Retry mechanism with exponential backoff

## Security Considerations

1. **Environment Variables**: Never commit `.env` file
2. **Admin Token**: Use strong, random token
3. **Firebase Rules**: Implement proper access control
4. **Input Validation**: All inputs are validated and sanitized
5. **Error Messages**: Sensitive information is never exposed

## Backup and Recovery

### Database Backup

```bash
# Export Firebase data
firebase database:get / > backup.json
```

### Restore from Backup

```bash
firebase database:set / < backup.json
```

## Scaling

For high-traffic scenarios:

1. Use Firebase Realtime Database with proper indexing
2. Implement caching layer (Redis)
3. Use load balancer (Nginx, HAProxy)
4. Deploy multiple instances
5. Use CDN for static assets

## Support

For issues or questions:
- Check logs: `logs/combined.log`
- Review error IDs in error responses
- Contact support with error ID and timestamp
