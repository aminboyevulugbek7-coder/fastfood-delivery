# Firebase Setup Instructions

## 1. Firebase Console ochish
👉 https://console.firebase.google.com

## 2. Yangi loyiha yaratish
- **"Add project"** tugmasini bosing
- Project name: **FastFood Bagat Production**
- Continue → Create Project

## 3. Realtime Database yaratish
1. Chap menuda **Build** → **Realtime Database**
2. **Create database** tugmasini bosing
3. Location tanlang: **Asia Singapore (asia-southeast1)**
4. **Next** → **Production mode** tanlang
5. **Enable** tugmasini bosing

## 4. Service Account yaratish
1. ⚙️ Settings (Project settings) → **Service accounts** tab
2. **Generate new private key** tugmasini bosing
3. **Generate key** bosing - JSON fayl yuklab olinadi
4. Bu faylni saqlang va keyinroq .env ga qo'shamiz

## 5. Security Rules sozlash
Realtime Database → **Rules** tabda quyidagi rulesni qo'ying:

```json
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true
    },
    "foods": {
      ".read": true,
      ".write": true
    },
    "categories": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 6. .env faylni yangilash

Yuklab olingan JSON fayldan ma'lumotlarni .env ga qo'shing:

```env
FIREBASE_PROJECT_ID=fastfood-bagat-production
FIREBASE_CLIENT_EMAIL=your-service-account@fastfood-bagat-production.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
DATABASE_URL=https://fastfood-bagat-production.asia-southeast1.firebasedatabase.app
```

## 7. Serverni qayta ishga tushirish
```bash
npm start
```

## ✅ Tayyor!
Firebase Realtime Database tayyor! Buyurtmalar endi Firebase'da saqlanadi.
