# Mobile ↔ Backend integration — testing guide

This guide covers **full Phase 1 + core features**: Google auth, profile, interests, activities feed, create/join, my events, reports.

**Still mock on mobile:** chat, notifications, email login, profile photo upload UI.

---

## What is integrated

| Feature | Mobile screen | Backend endpoint |
|---------|---------------|------------------|
| Google login | `LoginScreen` | `POST /auth/google` |
| Session restore | `SplashScreen` / `AuthProvider` | `GET /users/me` |
| Save profile + city | `ProfileSetupScreen` | `PATCH /users/profile` |
| Interests | `InterestSelectionScreen` | `GET /interests`, `PUT /users/me/interests` |
| Home feed | `HomeFeedScreen` | `GET /activities`, `GET /activities/featured`, `GET /categories` |
| Activity details + join | `ActivityDetailsScreen` | `GET /activities/:id`, `POST /activities/:id/join`, `POST /activities/:id/maybe` |
| Create activity | `CreateActivityScreen` | `POST /activities` |
| My events | `MyEventsScreen` | `GET /users/me/activities?role=` |
| Profile stats | `ProfileScreen` | `GET /users/me`, activities APIs |
| Report | `ReportScreen` | `POST /reports` |
| Logout | `SettingsScreen` | `POST /auth/logout` |
| Token refresh | `api.client.ts` | `POST /auth/refresh` |

---

## One-time setup

### 1. PostgreSQL + backend

```bash
cd ~/InCircle/backend
npm install
npm run migration:run
npm run start:dev
```

Expected: `NestJS application is running on: http://localhost:3000`

Quick check:

```bash
curl http://localhost:3000/interests
# Should return JSON array of interests

curl http://localhost:3000/users/me
# Should return 401 (server is up, auth required)
```

**Database:** edit `backend/.env` with your Postgres host, user, password, database name.

**JWT:** `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` must be **different** long random strings.

### 2. Google Cloud OAuth (required for login)

1. Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials**.
2. Create OAuth 2.0 clients:
   - **Web application** → copy Client ID → use as **Web client ID**
   - **Android** → package `com.mobile` + SHA-1 from project debug keystore (below)
3. Set the **same Web Client ID** in both:
   - `backend/.env` → `GOOGLE_CLIENT_ID_WEB=....apps.googleusercontent.com`
   - `mobile/src/config/api.config.ts` → `GOOGLE_WEB_CLIENT_ID`
4. Set in `backend/.env`:
   - `GOOGLE_CLIENT_ID_ANDROID=....apps.googleusercontent.com` (Client ID, **not** SHA-1)

**Debug SHA-1** (add to Android OAuth client in Google Cloud):

```bash
keytool -list -v \
  -keystore ~/InCircle/mobile/android/app/debug.keystore \
  -alias androiddebugkey \
  -storepass android -keypass android | grep SHA1
```

Expected SHA-1 for this project keystore:

```text
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

### 3. Mobile API host

Default in `mobile/src/config/api.config.ts`: `DEV_API_HOST = '127.0.0.1'` (works with USB + `adb reverse`).

For **Wi‑Fi only** (no USB reverse), set your PC LAN IP:

```bash
hostname -I | awk '{print $1}'
```

Then edit `DEV_API_HOST` in `api.config.ts` (e.g. `192.168.1.42`).

### 4. Install mobile deps + rebuild (Google Sign-In is native)

```bash
cd ~/InCircle/mobile
npm install
npm run android:device -- --device YOUR_DEVICE_ID
```

---

## Test on physical Android (step by step)

### Step 1 — Start backend

```bash
cd ~/InCircle/backend
npm run start:dev
```

Leave this terminal running.

### Step 2 — Connect phone + port forward

```bash
adb kill-server && adb start-server
adb devices
# Must show: SERIAL    device

adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
```

### Step 3 — Start Metro

```bash
cd ~/InCircle/mobile
npm start
```

### Step 4 — Install app on device

```bash
cd ~/InCircle/mobile
npm run android:device -- --device YOUR_DEVICE_ID
```

### Step 5 — End-to-end test flow

1. **Splash** → tap **Get Started** → complete onboarding if shown.
2. **Login** → **Google** → pick account.
   - First time → **Profile setup**
   - Returning user with profile + interests → **Main**
3. **Profile setup** → full name, username, bio, city → **Continue**
   - Backend: `PATCH /users/profile`
4. **Interests** → pick ≥1 → **Finish**
   - Backend: `PUT /users/me/interests`
5. **Home tab** → should load categories; feed may be empty until you create an activity.
6. **Create (+ tab)** → fill title, description, category, datetime (`2026-06-15T07:00`), location → **Publish**
   - Backend: `POST /activities`
7. **Home** → your activity appears under Nearby.
8. **Tap activity** → **In** or **Maybe**
   - Backend: `POST /activities/:id/join`
9. **Events tab** → Joined / Created tabs show your activity.
10. **Activity details** → **Report** → fill reason → **Submit**
    - Backend: `POST /reports`
11. **Profile tab** → shows your name, city, interest chips, created/joined counts.
12. **Settings → Log out** → tokens cleared → back to login flow.
13. **Kill app, reopen** → Get Started → should restore session if tokens valid.

### Step 6 — Verify backend logs

Watch the backend terminal for successful requests:

- `POST /auth/google`
- `PATCH /users/profile`
- `PUT /users/me/interests`
- `POST /activities`
- `GET /activities`
- `POST /activities/.../join`
- `POST /reports`

Optional DB check:

```sql
SELECT email, username, city, "isProfileCompleted" FROM users;
SELECT title, city, "joinedCount" FROM activities;
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Cannot reach backend` | Backend not running; wrong `DEV_API_HOST`; run `adb reverse tcp:3000 tcp:3000` |
| `Network Error` | Cleartext HTTP enabled in AndroidManifest; firewall on port 3000 |
| `Google Sign-In not configured` | Set real `GOOGLE_WEB_CLIENT_ID` in `api.config.ts` |
| `DEVELOPER_ERROR` (Google) | Wrong package (`com.mobile`) or missing SHA-1 on Android OAuth client |
| `Google OAuth verification failed` | Web Client ID mismatch between mobile and backend `.env` |
| `401` after login | JWT secrets; clear app data and sign in again |
| Empty interests list | Run `npm run migration:run` in backend |
| Migration fails | Check Postgres credentials in `backend/.env` |

---

## Key files

**Mobile**

- `mobile/src/config/api.config.ts` — API host + Google Web Client ID
- `mobile/src/services/api.client.ts` — Axios + token refresh
- `mobile/src/services/auth.service.ts` — auth API
- `mobile/src/services/catalog.service.ts` — interests/categories
- `mobile/src/services/activities.service.ts` — feed, create, join
- `mobile/src/services/reports.service.ts` — reports
- `mobile/src/context/AuthContext.tsx` — auth state

**Backend**

- `backend/.env` — DB, JWT, Google IDs (never commit)
- `backend/src/catalog/` — interests, categories
- `backend/src/activities/` — activities CRUD + join
- `backend/src/reports/` — reports

---

## Not integrated yet

- Chat + realtime messaging
- Push notifications
- Admin console API
- Email/password auth
- Profile photo upload from mobile UI

See `BACKEND_REQUIREMENTS.md` for the full roadmap.
