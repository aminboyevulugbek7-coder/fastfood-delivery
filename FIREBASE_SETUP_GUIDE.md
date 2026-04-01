# 🔥 Firebase Project Setup Guide

## Step 1: Create Google Account (if needed)

1. Go to https://accounts.google.com
2. Click "Create account"
3. Fill in your details
4. Verify your email
5. Done! ✅

---

## Step 2: Create Firebase Project

### 2.1 Go to Firebase Console

1. Open https://console.firebase.google.com
2. Click "Create a project" button
3. You should see this screen:

```
┌─────────────────────────────────────────┐
│  Create a Firebase project              │
│                                         │
│  Project name: [________________]       │
│                                         │
│  [ ] Enable Google Analytics            │
│                                         │
│  [Cancel]  [Create project]             │
└─────────────────────────────────────────┘
```

### 2.2 Enter Project Details

1. **Project name**: `FastFood Bagat Production`
2. **Enable Google Analytics**: ✅ Check this box
3. Click "Create project"

### 2.3 Wait for Project Creation

- Firebase will create your project (takes 1-2 minutes)
- You'll see a loading screen
- Once done, you'll be redirected to the project dashboard

### 2.4 Verify Project Created

You should see:
- Project name: "FastFood Bagat Production"
- Project ID: Something like `fastfood-bagat-xxxxx`
- Project number: A 12-digit number

**Save these values!** You'll need them later.

---

## Step 3: Create Realtime Database

### 3.1 Go to Realtime Database

1. In Firebase Console, click on "Build" in left menu
2. Click "Realtime Database"
3. Click "Create Database" button

### 3.2 Configure Database

You'll see this dialog:

```
┌──────────────────────────────────────────┐
│  Create a Realtime Database              │
│                                          │
│  Database location:                      │
│  [Asia (Singapore)] ▼                    │
│                                          │
│  Security rules:                         │
│  ○ Start in test mode                    │
│  ● Start in production mode              │
│                                          │
│  [Cancel]  [Create Database]             │
└──────────────────────────────────────────┘
```

### 3.3 Select Settings

1. **Database location**: Select "Asia (Singapore)"
   - This is closest to Uzbekistan
   - Better latency for users

2. **Security rules**: Select "Start in production mode"
   - We'll configure proper rules later
   - This is more secure

3. Click "Create Database"

### 3.4 Wait for Database Creation

- Firebase will create your database (takes 1-2 minutes)
- You'll see a loading screen
- Once done, you'll see the database dashboard

### 3.5 Get Database URL

1. In the Realtime Database dashboard, look for the URL
2. It should look like: `https://fastfood-bagat-xxxxx.firebaseio.com`
3. **Save this URL!** You'll need it for `.env`

---

## Step 4: Create Service Account

### 4.1 Go to Project Settings

1. Click the gear icon (⚙️) in top-right corner
2. Click "Project settings"
3. You should see the "General" tab

### 4.2 Get Project Credentials

In the "General" tab, you'll see:
- **Project ID**: `fastfood-bagat-xxxxx`
- **Project number**: `123456789012`
- **Database URL**: `https://fastfood-bagat-xxxxx.firebaseio.com`

**Save all these values!**

### 4.3 Go to Service Accounts

1. Click "Service Accounts" tab
2. You should see this:

```
┌────────────────────────────────────────┐
│  Service Accounts                      │
│                                        │
│  Firebase Admin SDK                    │
│  [Node.js] [Python] [Java] [Go] [C#]  │
│                                        │
│  [Generate New Private Key]            │
└────────────────────────────────────────┘
```

### 4.4 Generate Private Key

1. Click "Generate New Private Key" button
2. A dialog will appear asking to confirm
3. Click "Generate Key"
4. A JSON file will be downloaded automatically
5. **Save this file securely!** This is your private key

### 4.5 Extract Credentials from JSON

Open the downloaded JSON file. It should look like:

```json
{
  "type": "service_account",
  "project_id": "fastfood-bagat-xxxxx",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@fastfood-bagat-xxxxx.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**Extract these values:**
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY`
- `client_email` → `FIREBASE_CLIENT_EMAIL`

---

## Step 5: Configure .env File

### 5.1 Open .env File

```bash
nano .env
```

### 5.2 Add Firebase Credentials

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=fastfood-bagat-xxxxx
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@fastfood-bagat-xxxxx.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://fastfood-bagat-xxxxx.firebaseio.com
```

### 5.3 Important Notes

⚠️ **IMPORTANT**:
- Replace `xxxxx` with your actual values
- The `FIREBASE_PRIVATE_KEY` should have `\n` for newlines
- Never commit `.env` file to git
- Keep this file secure!

### 5.4 Save File

```bash
# Press Ctrl+X, then Y, then Enter to save
```

---

## Step 6: Configure Firebase Security Rules

### 6.1 Go to Realtime Database Rules

1. In Firebase Console, go to "Realtime Database"
2. Click "Rules" tab
3. You should see the current rules (probably empty or test mode)

### 6.2 Copy Security Rules

Copy the rules from `firebase-rules.json` in your project:

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

### 6.3 Paste Rules in Firebase Console

1. In the Rules tab, select all text (Ctrl+A)
2. Delete it
3. Paste the new rules
4. Click "Publish" button
5. Confirm the changes

### 6.4 Verify Rules Published

You should see a green checkmark and message: "Rules published successfully"

---

## Step 7: Initialize Database with Admin User

### 7.1 Go to Data Tab

1. In Realtime Database, click "Data" tab
2. You should see an empty database

### 7.2 Create Admin User

1. Click the "+" button next to the database name
2. Create a new key: `admins`
3. Click the "+" button next to `admins`
4. Create a new key: `admin_1`
5. Click the "+" button next to `admin_1`
6. Add these fields:
   - Key: `email`, Value: `admin@fastfoodbagat.uz`
   - Key: `createdAt`, Value: `1704067200000`

Your database should now look like:

```
fastfood-bagat-xxxxx
├── admins
│   └── admin_1
│       ├── email: "admin@fastfoodbagat.uz"
│       └── createdAt: 1704067200000
```

---

## Step 8: Test Firebase Connection

### 8.1 Install Firebase CLI (Optional)

```bash
npm install -g firebase-tools
```

### 8.2 Login to Firebase

```bash
firebase login
```

### 8.3 Test Connection

```bash
firebase database:get / --project fastfood-bagat-xxxxx
```

You should see your database structure printed.

---

## Step 9: Verify Everything Works

### 9.1 Run Application

```bash
npm run start:dev
```

### 9.2 Check Logs

Look for these messages in the logs:

```
[Firebase] Connecting to database...
[Firebase] Connected successfully
[Firebase] Database URL: https://fastfood-bagat-xxxxx.firebaseio.com
```

### 9.3 Test Bot

1. Open Telegram
2. Search for your bot
3. Send `/start` command
4. Bot should respond

### 9.4 Check Firebase

1. Go to Firebase Console
2. Go to Realtime Database
3. You should see new data being created:
   - `users` - New user created
   - `orders` - If you place an order

---

## Troubleshooting

### Problem: "Firebase connection failed"

**Solution:**
1. Check `.env` file - all values correct?
2. Check `FIREBASE_PRIVATE_KEY` - has `\n` for newlines?
3. Check `FIREBASE_DATABASE_URL` - correct format?
4. Check Firebase Console - database exists?
5. Check security rules - allow read/write?

### Problem: "Permission denied"

**Solution:**
1. Check security rules in Firebase Console
2. Make sure rules are published
3. Check admin user exists in database
4. Verify user authentication

### Problem: "Database not found"

**Solution:**
1. Check `FIREBASE_PROJECT_ID` - correct?
2. Check `FIREBASE_DATABASE_URL` - correct?
3. Go to Firebase Console - database exists?
4. Try creating database again

### Problem: "Invalid private key"

**Solution:**
1. Check `FIREBASE_PRIVATE_KEY` in `.env`
2. Make sure it starts with `-----BEGIN PRIVATE KEY-----`
3. Make sure it ends with `-----END PRIVATE KEY-----`
4. Make sure `\n` is used for newlines (not actual line breaks)
5. Download private key again from Firebase Console

---

## Security Best Practices

### ✅ Do's

- ✅ Keep `.env` file secure
- ✅ Never commit `.env` to git
- ✅ Use strong admin token
- ✅ Rotate private keys regularly
- ✅ Use production mode for database
- ✅ Configure proper security rules
- ✅ Enable backups
- ✅ Monitor database usage

### ❌ Don'ts

- ❌ Don't share private key
- ❌ Don't commit `.env` to git
- ❌ Don't use test mode in production
- ❌ Don't use weak security rules
- ❌ Don't expose credentials in logs
- ❌ Don't use same credentials for multiple projects
- ❌ Don't disable backups

---

## Next Steps

1. ✅ Firebase project created
2. ✅ Realtime database created
3. ✅ Service account created
4. ✅ Security rules configured
5. ✅ `.env` file updated

**Next: Create Telegram Bot** 🤖

---

## Summary

| Step | Status | Notes |
|------|--------|-------|
| Create Google Account | ✅ | If needed |
| Create Firebase Project | ✅ | "FastFood Bagat Production" |
| Create Realtime Database | ✅ | Asia (Singapore), Production mode |
| Create Service Account | ✅ | Download private key |
| Configure .env | ✅ | Add all credentials |
| Configure Security Rules | ✅ | Copy from firebase-rules.json |
| Initialize Database | ✅ | Create admin user |
| Test Connection | ✅ | Run application |

---

## Useful Links

- Firebase Console: https://console.firebase.google.com
- Firebase Documentation: https://firebase.google.com/docs
- Realtime Database Guide: https://firebase.google.com/docs/database
- Security Rules Guide: https://firebase.google.com/docs/database/security

---

**Firebase Setup Complete! ✅**

**Next: Create Telegram Bot** 🤖
