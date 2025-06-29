# 🐾 Smart IoT PetFeeder System

A fully cloud-connected, secure, production-grade **IoT PetFeeder** system built with:
- 🧠 Firebase (Realtime Database + Auth)
- 📲 Mobile App (Google Sign-In + device onboarding)
- 🧠 AES encryption for secure device provisioning
- 🧩 ESP32-WROOM modules for device control
- 🌐 Real-time streaming (no polling)
- 🛡️ Multi-user, multi-device secure architecture

---

## 📌 Project Overview

This system allows a **Google-authenticated user** to:
- Register multiple PetFeeder devices (each powered by ESP32)
- Control devices from anywhere via mobile/web
- Schedule automatic feeding using cron-like rules
- Monitor current feed levels and receive alerts
- Manually trigger feeding actions remotely
- Securely onboard ESP devices without exposing sensitive data

Once an ESP32 device is onboarded, it operates **independently**, triggered only by **Firebase database changes**.

---

## 🧩 Project Components

### 🔹 Mobile App (React Native or Flutter)
- Google Sign-In only
- Onboard new ESPs securely
- Show device list, feed stats
- Control feeding manually or via schedule
- Send encrypted configuration to ESP during setup

### 🔹 ESP32 Firmware
- Written in C++ using `Firebase_ESP_Client` and `WiFi.h`
- Starts in AP mode if no Wi-Fi saved
- Receives encrypted onboarding data from app
- Saves Firebase and Wi-Fi info securely
- Logs into Firebase and subscribes to DB paths
- Listens for real-time commands (LED/feed/etc.)
- Auto-recovers from power/network loss

### 🔹 Firebase Backend
- Authentication (Google + device login accounts)
- Realtime Database to store all device/user data
- Optional Cloud Functions for future FCM notifications
- Admin-only user provisioning system for ESP logins

---

## 🔁 Project Phases

### ✅ Phase 0 — Wi-Fi Setup (ESP)
- ESP checks if Wi-Fi credentials are stored
- If not → AP Mode starts (SSID: `PetFeeder`, Password: `setup123`)
- Endpoints:
  - `GET /scan` → returns nearby Wi-Fi
  - `POST /connect` → accepts Wi-Fi, API, DB info (AES encrypted)
- On success → saves to preferences and reboots to STA Mode

### ✅ Phase 1 — Firebase + LED Control (ESP)
- ESP connects to Firebase Realtime DB using email/password
- Subscribes to `/devices/{deviceId}/led` stream
- Turns on/off built-in LED based on DB value

### 🟦 Phase 2 — Mobile App Integration
- User logs in with Google Auth
- Backend creates a unique ESP account:
  - Email: `username_esp01@user.com`, `username_esp02@user.com`, etc.
  - Password: provided by user
- App sends onboarding info (Wi-Fi + Firebase creds) to ESP
- App dashboard shows connected devices and allows:
  - Manual feed
  - Scheduled feed
  - Notifications (FCM — in future phase)

### ⬜ Phase 3 — Feed Logic, Scheduling, Alerts
- Add support for:
  - HX711 weight sensor
  - Feeding motor control
  - Schedule parsing
  - Low-feed alerts (25%, 5% thresholds)

### ⬜ Phase 4 — Hardware Case Design
- 3D model for PetFeeder shell
- Cable routing + PCB tray

---

## 🔐 Security Architecture

| Concern | Solution |
|--------|----------|
| Wi-Fi + API Key snooping | AES-256 encryption before transfer |
| User privacy | Firebase Authentication with per-user UID |
| Device impersonation | Dedicated login for each ESP |
| Unauthorized access | Strict Firebase rules |
| Secrets at rest on ESP | Encrypted ESP Preferences |
| OTA tampering | Future support for signed firmware |

---

## 🧠 System Architecture

### 🔄 Cloud ↔ Device Communication

[Mobile App] --> [Firebase Realtime DB] --> [ESP32 Stream Listener]
↑
[Firebase Auth & Rules]


- App writes commands to DB (e.g., feed/LED)
- ESP gets real-time update via Firebase stream
- No polling
- No direct app-to-ESP interaction after setup

---

## 🔐 Firebase Realtime DB Rules (recommended)
```json
{
  "rules": {
    "users": {
      "$uid": {
        "devices": {
          "$deviceId": {
            ".read": "$uid === auth.uid",
            ".write": "$uid === auth.uid"
          }
        }
      }
    },
    "devices": {
      "$deviceUid": {
        ".read": "auth.uid === $deviceUid",
        ".write": "auth.uid === $deviceUid"
      }
    }
  }
}
```

## 🧾 Firebase Data Structure
```json
{
  "users": {
    "UID123": {
      "devices": {
        "esp001": {
          "meta": {
            "name": "Kitchen Feeder",
            "email": "hamza_esp01@user.com",
            "createdAt": "2025-06-29T10:00:00Z"
          },
          "config": {
            "FEED_AMOUNT": 20,
            "MAX_WEIGHT": 1000,
            "CRON": "9:00,13:00,18:00"
          },
          "status": {
            "currentWeight": 700,
            "online": true
          },
          "feed": {
            "manual": false
          }
        }
      }
    }
  }
}
```

## 🔒 Environment Variables
###These .env variables are used for app development (e.g., Vite/React or similar frameworks):

# PetFeeder Environment Variables

## AES Encryption Keys
-VITE_AES_ENCRYPTION_KEY=petfeeder-secure-32char-key-2024
-VITE_AES_DECRYPTION_KEY=petfeeder-secure-32char-key-2024

## ESP32 WiFi Configuration
-VITE_WIFI_SSID=PetFeeder
-VITE_WIFI_PASSWORD=setup123

## Firebase Configuration (user-provided)
-VITE_FIREBASE_API_KEY=
-VITE_FIREBASE_PROJECT_ID=
-VITE_FIREBASE_APP_ID=
-VITE_SENDER_ID=

-🔐 Keys must be 32 chars for AES-256
-⚠️ Never expose .env in public builds

## 🧪 Testing
### ESP:
    -Test AP setup → connect from browser/mobile
    -Test DB-controlled LED stream

## App:
    -Test login (Google only)
    -Test adding a device (backend required)
    -Test Wi-Fi + AES encryption transfer

### 📦 Dependencies
### ESP Libraries:
---
    WiFi.h
    Preferences.h
    Firebase_ESP_Client
    Optional: AESLib, Crypto.h
---

## App SDKs:
    -Firebase Auth SDK (Google)
    -Firebase Database SDK
    -AES crypto library
    -Axios (or Fetch)

## 🧠 Future Features
    - 🔔 FCM Notifications for refill alerts
    - 📊 Chart of feed history
    - 🔄 OTA updates for ESP
    - 👨‍👩‍👧‍👦 Shared control (family devices)
    - 🔐 Device-to-cloud certificate validation

## 🤝 Contributing
    - Fork the repo
    - Clone it
    - Create a new branch (git checkout -b feature-name)
    - Submit a pull request

📜 License
 -This project is licensed under MIT. Feel free to fork, contribute, or adapt!
