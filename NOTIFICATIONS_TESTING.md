# Notifications — testing guide

**External push** (Android notification shade / lock screen, Zomato-style) + in-app bell list.

---

## What is external vs internal?

| Type | Where it shows |
|------|----------------|
| **External** | System notification tray, lock screen, heads-up banner |
| **Internal** | In-app **🔔** list only |

This project implements **both**. External uses **Notifee** (display) + **FCM** (server delivery when app is background/killed).

---

## Prerequisites

```bash
# Backend
cd backend && npm run migration:run && npm run start:dev

# Mobile (USB Android)
cd mobile && npm run connect:device && npm start
# Rebuild native app after adding Firebase:
npm run android:device -- --device YOUR_DEVICE_ID
```

`ENABLE_DEV_AUTH=true` in `backend/.env`.

---

## Step 1 — Test external push immediately (no Firebase)

Works today with **Notifee** — real system tray notification.

1. Log in as `you@incircle.app`
2. **Profile → Settings**
3. Allow **notification permission** when Android asks
4. Tap **Send test lock-screen notification**
5. **Pull down notification shade** — you should see an **InCircle** card (like Zomato), not an in-app popup
6. Minimize app → send again → tray card still appears

Copy follows your **Notification vibe** (Cheesy / Cute / Flirty / Normal).

---

## Step 2 — Firebase for background/killed-state push

When the app is **closed**, only **FCM** can deliver server push.

### A. Firebase Console (Android)

1. [Firebase Console](https://console.firebase.google.com) → Create project **InCircle**
2. Add Android app — package name: **`com.mobile`**
3. Download **`google-services.json`**
4. Copy to:

   `mobile/android/app/google-services.json`

   (Template: `mobile/android/app/google-services.json.example`)

5. Rebuild:

```bash
cd mobile
npm run android:device -- --device YOUR_DEVICE_ID
```

### B. Backend service account

1. Firebase → Project settings → **Service accounts** → Generate new private key
2. Add to `backend/.env`:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/incircle-firebase-adminsdk.json
```

Or one line:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

3. Restart backend → check:

```bash
curl -s http://localhost:3000/notifications/push-status \
  -H "Authorization: Bearer $TOKEN" | jq
# { "enabled": true }
```

### C. Register device token

Happens automatically on login. Open **Settings** — status should mention FCM token / server push.

### D. Background test

1. Log in, allow notifications
2. **Force-close** the app (swipe away from recents)
3. Trigger event from another account (join your plan) **or** curl:

```bash
curl -s -X POST http://localhost:3000/notifications/test \
  -H "Authorization: Bearer $TOKEN"
```

4. Lock screen / shade → Zomato-style push with cheesy copy

---

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/notifications/preferences` | Tone + push prefs |
| `PATCH` | `/notifications/preferences` | Update tone |
| `POST` | `/notifications/test` | Trigger test event |
| `POST` | `/notifications/devices` | Register FCM token |
| `GET` | `/notifications/push-status` | Firebase enabled on server |

---

## Real-world triggers (external + in-app)

| Action | External (with FCM) | Copy example (cheesy) |
|--------|---------------------|------------------------|
| Publish plan | ✅ | Main character moment 🍿 |
| Someone joins | ✅ | Plot twist 🍿 |
| You're In | ✅ | Certified legend 🔥 |
| Almost full | ✅ | Last call energy 🚨 |
| Report | In-app only | Report received |

---

## Tone testing

1. Settings → pick **Flirty** / **Cute** / etc.
2. Send test lock-screen notification
3. Shade shows new copy — old notifications keep old text

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Only in-app bell, no tray | Allow notification permission; rebuild after `google-services.json` |
| In-app popup instead of tray | Use **Send test lock-screen** in Settings (not old alert flow) |
| No push when app killed | Need Firebase on device **and** server (`push-status: true`) |
| `getToken` fails | Add real `google-services.json`, rebuild native app |
| Tray works, killed state doesn't | Backend missing `FIREBASE_SERVICE_ACCOUNT_*` |
| Same copy after tone change | Only **new** events use new tone |

---

## Files

| Area | Path |
|------|------|
| External push (mobile) | `mobile/src/services/externalPush.service.ts` |
| FCM background handler | `mobile/index.js` |
| Android channel | `incircle_plans` |
| Server FCM send | `backend/src/notifications/push.service.ts` |
| Zomato copy | `backend/src/notifications/notification-copy.ts` |
