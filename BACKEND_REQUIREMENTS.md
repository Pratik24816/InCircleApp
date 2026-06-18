# InCircle — Backend Requirements Specification

**Document purpose:** Handoff for the backend developer. Describes what must be built, how it maps to the existing **UI-only frontend** (`mobile/` + `admin/`), and suggested API contracts aligned with current mock data and inline TODOs.

**Frontend status (today):** No live API integration. All screens use mock data. Planned base URL: `https://api.incircle.app` (see `mobile/src/services/api.ts`). Admin auth is a `sessionStorage` demo flag.

**Last updated:** 2026-06-05  
**Frontend packages:** `mobile/` (React Native member app), `admin/` (Vite + React + Ant Design internal console)

---

## Table of contents

1. [Product summary](#1-product-summary)
2. [Recommended architecture](#2-recommended-architecture)
3. [Domain model & database schema](#3-domain-model--database-schema)
4. [Authentication & authorization](#4-authentication--authorization)
5. [Member API (mobile app)](#5-member-api-mobile-app)
6. [Admin API (web console)](#6-admin-api-web-console)
7. [Real-time, notifications & media](#7-real-time-notifications--media)
8. [Frontend → backend mapping matrix](#8-frontend--backend-mapping-matrix)
9. [Enum alignment (admin vs mobile)](#9-enum-alignment-admin-vs-mobile)
10. [Suggested delivery phases](#10-suggested-delivery-phases)
11. [Non-functional requirements](#11-non-functional-requirements)
12. [Open questions for backend team](#12-open-questions-for-backend-team)

---

## 1. Product summary

**InCircle** is a local social-activities platform: users discover nearby events, join activities, chat with participants, create their own plans, and report unsafe content. An internal **admin console** moderates users, activities, reports, and categories.

### User roles

| Role | Where used | Capabilities |
|------|------------|--------------|
| `user` | Mobile app | CRUD own profile, create/join activities, chat, report |
| `moderator` | Admin console | Review reports, moderate activities, suspend users |
| `admin` | Admin console | Above + category CMS, broader user management |
| `super_admin` | Admin console | Full access, settings, audit export (planned) |

### Core entities

Users, interests, categories, activities, participants, chats, messages, notifications, reports, (future) user preferences, audit logs.

---

## 2. Recommended architecture

The frontend comments and admin settings checklist point to this split:

| Layer | Technology (suggested) | Responsibility |
|-------|------------------------|----------------|
| **Auth** | Supabase Auth (or equivalent) | Sign up, login, phone OTP, OAuth (Google/Apple), JWT/session |
| **REST API** | NestJS @ `https://api.incircle.app` | Business logic, admin APIs, activity feed, moderation |
| **Database** | PostgreSQL (Supabase or primary DB) | Persistent storage |
| **Realtime** | Supabase Realtime (or WebSockets) | Chat messages, optional live activity updates |
| **Object storage** | Supabase Storage / S3 | Avatars, activity cover images |
| **Push** | FCM (Android) + APNs (iOS) | Notification delivery |

```
┌─────────────┐     ┌─────────────┐
│  mobile/    │     │   admin/    │
│  (RN app)   │     │  (Vite web) │
└──────┬──────┘     └──────┬──────┘
       │ JWT               │ Admin JWT
       ▼                   ▼
┌──────────────────────────────────┐
│         NestJS API               │
│  /api/v1/*  (member)             │
│  /admin/api/v1/*  (console)      │
└──────────┬───────────────────────┘
           │
    ┌──────┴──────┬────────────┬─────────────┐
    ▼             ▼            ▼             ▼
 PostgreSQL   Realtime    Object storage   Push service
```

**API versioning:** Use `/api/v1` prefix for all endpoints. Admin routes may be namespaced under `/admin/api/v1` with stricter RBAC.

**CORS:** Admin dev server runs on `http://localhost:5173` with basename `/admin/`. Production admin is deployed under `/admin/` path.

---

## 3. Domain model & database schema

Types below are derived from `mobile/src/types/models.ts` and `admin/src/data/mock.ts`. Admin views are **denormalized summaries** of the same underlying tables.

### 3.1 `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `email` | string | unique, nullable if phone-only |
| `phone` | string | E.164, nullable |
| `role` | enum | `user`, `admin`, `moderator`, `super_admin` |
| `status` | enum | `active`, `suspended`, `deleted`, `pending` |
| `full_name` | string | |
| `username` | string | unique, indexed |
| `bio` | text | optional |
| `city` | string | default city for feed |
| `avatar_url` | string | optional, from storage |
| `latitude` / `longitude` | float | optional, for nearby feed |
| `onboarding_complete` | boolean | optional server-side flag |
| `profile_complete` | boolean | |
| `interests_complete` | boolean | |
| `joined_at` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | |

**Join table `user_interests`:** `user_id`, `interest_id` (many-to-many).

### 3.2 `interests`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `name` | string | e.g. "Walking" |
| `slug` | string | unique, e.g. `walking` |

Seed data matches 15 interests in `mobile/src/data/mock.ts` (`MOCK_INTERESTS`).

### 3.3 `categories`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `name` | string | e.g. "Fitness" |
| `slug` | string | unique |
| `icon` | string | emoji or icon key (mobile uses emoji) |
| `color` | string | hex, e.g. `#8CFF4F` |
| `sort_order` | int | optional |
| `is_active` | boolean | soft hide from feed |

`activity_count` in admin is a **computed aggregate**, not stored.

### 3.4 `activities`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `creator_id` | UUID | FK → users |
| `category_id` | UUID | FK → categories |
| `title` | string | |
| `description` | text | |
| `cover_url` | string | optional |
| `start_datetime` | timestamptz | |
| `end_datetime` | timestamptz | optional |
| `location_name` | string | |
| `city` | string | |
| `latitude` / `longitude` | float | for distance sorting |
| `group_type` | enum | `need_one_person`, `fixed_group`, `open_join` |
| `group_size` | int | nullable (open join) |
| `joined_count` | int | denormalized counter, maintained by triggers/jobs |
| `status` | enum | see §9 — mobile lifecycle |
| `approval_status` | enum | `pending`, `approved`, `rejected` |
| `featured` | boolean | for home feed hero |
| `tags` | string[] or JSON | e.g. `["walk","morning"]` |
| `flagged` | boolean | moderation flag (maps to admin `flagged` status) |
| `created_at` / `updated_at` | timestamptz | |

### 3.5 `activity_participants`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `activity_id` | UUID | FK |
| `user_id` | UUID | FK |
| `status` | enum | `joined`, `maybe`, `left`, `removed` |
| `joined_at` | timestamptz | |

Unique constraint on (`activity_id`, `user_id`).

### 3.6 `chats`

One chat per activity (activity-scoped group chat).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `activity_id` | UUID | FK, unique |
| `created_at` | timestamptz | |

List view fields `last_message`, `last_at`, `unread` are **computed** per requesting user.

### 3.7 `messages`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `chat_id` | UUID | FK |
| `sender_id` | UUID | FK → users, null for system messages |
| `message_type` | enum | `text`, `image`, `system` |
| `message` | text | body for text/image caption |
| `image_url` | string | optional |
| `system_event_type` | string | e.g. `user_joined` |
| `created_at` | timestamptz | |

### 3.8 `notifications`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK recipient |
| `type` | string | `activity_almost_full`, `chat_message`, `nearby_activity`, … |
| `title` | string | |
| `body` | string | |
| `read` | boolean | default false |
| `activity_id` | UUID | optional FK |
| `chat_id` | UUID | optional FK |
| `created_at` | timestamptz | |

### 3.9 `reports`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `reporter_id` | UUID | FK → users |
| `report_type` | enum | `user`, `activity`, `message`, `spam`, `harassment`, `unsafe`, `other` |
| `reason` | string | short reason |
| `description` | text | optional detail |
| `status` | enum | `pending`, `reviewing`, `resolved`, `dismissed` |
| `activity_id` | UUID | optional |
| `reported_user_id` | UUID | optional |
| `message_id` | UUID | optional |
| `assignee_id` | UUID | optional, admin moderator |
| `resolution_notes` | text | optional |
| `created_at` / `updated_at` / `resolved_at` | timestamptz | |

Admin `target_type` + `target_label` are **derived** for display.

### 3.10 `audit_logs` (admin — planned)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | |
| `actor_id` | UUID | admin user |
| `action` | string | e.g. `user.suspend`, `report.resolve` |
| `entity_type` / `entity_id` | string / UUID | |
| `metadata` | JSON | |
| `created_at` | timestamptz | |

### 3.11 `user_preferences` (settings stubs — future)

Notification toggles, location sharing, privacy flags. Not detailed in UI yet; reserve table or JSON column on `users`.

---

## 4. Authentication & authorization

### 4.1 Mobile member auth

**Frontend screens:** `SplashScreen`, `LoginScreen`, `SignupScreen`, `OtpScreen`, `SettingsScreen` (logout)

| Flow | Frontend today | Backend required |
|------|----------------|------------------|
| Email + password login | Mock — any input works | `POST /api/v1/auth/login` or Supabase `signInWithPassword` |
| Sign up | Navigates to OTP | `POST /api/v1/auth/signup` or Supabase `signUp` |
| Phone OTP | Mock verify | Supabase phone OTP: send + verify |
| Google / Apple | Buttons call mock login | OAuth via Supabase or custom OAuth bridge |
| Session restore | Not implemented | JWT access + refresh; `GET /api/v1/users/me` on app launch |
| Logout | Clears local Zustand store | `POST /api/v1/auth/logout` + revoke refresh token |

**Response shape (suggested):**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "...",
  "expiresIn": 3600,
  "user": { "id": "...", "email": "...", "role": "user", "profileComplete": false }
}
```

**Headers for authenticated requests:** `Authorization: Bearer <accessToken>`

### 4.2 Admin console auth

**Frontend files:** `admin/src/auth/AuthProvider.tsx`, `LoginPage.tsx`, `RequireAuth.tsx`

| Flow | Frontend today | Backend required |
|------|----------------|------------------|
| Login | Any email/password → `sessionStorage` flag | `POST /admin/api/v1/auth/login` — validate admin credentials |
| Logout | Clears session flag | `POST /admin/api/v1/auth/logout` + client discards JWT |
| Route guard | `RequireAuth` checks boolean | Validate JWT + role on every admin API call |

**Admin JWT claims (suggested):** `sub`, `email`, `role` (`moderator` | `admin` | `super_admin`), `exp`.

Only users with `role` in (`admin`, `moderator`, `super_admin`) may access `/admin/api/v1/*`.

### 4.3 RBAC matrix (admin)

| Action | moderator | admin | super_admin |
|--------|-----------|-------|-------------|
| View dashboard | ✓ | ✓ | ✓ |
| List/search users | ✓ | ✓ | ✓ |
| Suspend user | ✓ | ✓ | ✓ |
| Moderate activities | ✓ | ✓ | ✓ |
| Manage reports | ✓ | ✓ | ✓ |
| Category CRUD | — | ✓ | ✓ |
| Audit log export | — | — | ✓ |
| Email template config | — | — | ✓ |

---

## 5. Member API (mobile app)

Base path: `/api/v1`  
Placeholder client: `mobile/src/services/api.ts`

### 5.1 Users & profile

| Method | Endpoint | Used by (screen) | Request / notes | Response |
|--------|----------|------------------|-----------------|----------|
| `GET` | `/users/me` | `ProfileScreen`, app bootstrap | — | Full user + interests[] |
| `PATCH` | `/users/me` | `ProfileSetupScreen`, `ProfileScreen` (edit) | `{ fullName, username, bio, city, avatarUrl? }` | Updated user |
| `PUT` | `/users/me/interests` | `InterestSelectionScreen` | `{ interestIds: string[] }` | Updated interests |
| `GET` | `/users/:id` | `ActivityDetailsScreen` (host card) | Public profile only | `{ id, fullName, username, avatarUrl, city }` |
| `GET` | `/users/me/activities` | `MyEventsScreen` | Query: `role=joined\|created\|completed` | `Activity[]` |

**Profile setup fields (from UI):** full name, username, bio, city, avatar upload.

**Interest selection:** multi-select from catalog; powers future recommendations.

### 5.2 Catalog (read-only for members)

| Method | Endpoint | Used by | Response |
|--------|----------|---------|----------|
| `GET` | `/interests` | `InterestSelectionScreen` | `Interest[]` |
| `GET` | `/categories` | `HomeFeedScreen`, `CreateActivityScreen` | `Category[]` with icon, color |

### 5.3 Activities & feed

| Method | Endpoint | Used by | Query params | Notes |
|--------|----------|---------|--------------|-------|
| `GET` | `/activities` | `HomeFeedScreen` (nearby list) | `city`, `categoryId`, `q`, `page`, `limit` | Paginated; only `approval_status=approved` |
| `GET` | `/activities/featured` | `HomeFeedScreen` (hero card) | `city` | Single featured activity |
| `GET` | `/activities/nearby` | `HomeFeedScreen` (future) | `lat`, `lng`, `radiusKm`, `city` | Sort by distance; include `distanceKm` in response |
| `GET` | `/activities/recommended` | `HomeFeedScreen` (placeholder section) | — | Based on `user_interests` + city |
| `GET` | `/activities/:id` | `ActivityDetailsScreen` | — | Include creator summary, category, participant count |
| `POST` | `/activities` | `CreateActivityScreen` | See body below | Sets `approval_status=pending` or `approved` per policy |
| `PATCH` | `/activities/:id` | *(UI not built)* | Creator-only edit | |
| `DELETE` | `/activities/:id` | *(UI not built)* | Creator or admin | Soft-delete / cancel |
| `POST` | `/activities/:id/join` | `ActivityDetailsScreen` — "In" button | `{ status: "joined" }` | Enforce `group_size`, update `joined_count`, create chat membership |
| `POST` | `/activities/:id/maybe` | `ActivityDetailsScreen` — "Maybe" button | — | Participant status `maybe` |
| `POST` | `/activities/:id/leave` | *(implied)* | — | Set participant `left` |

**`POST /activities` body (from create form):**

```json
{
  "title": "Morning Walk",
  "description": "Easy pace along the riverfront.",
  "categoryId": "c1",
  "startDatetime": "2026-06-15T06:30:00Z",
  "endDatetime": null,
  "locationName": "Sabarmati Riverfront",
  "city": "Ahmedabad",
  "latitude": 23.0225,
  "longitude": 72.5714,
  "groupType": "open_join",
  "groupSize": null,
  "tags": ["walk", "morning"],
  "coverUrl": "https://..."
}
```

**Activity status automation (backend logic):**

- `joined_count >= group_size` (when set) → `status = full`
- `joined_count >= group_size - 1` → `almost_full` (triggers notification)
- Past `end_datetime` → `done`
- Creator cancel → `cancelled`

### 5.4 Chats & messaging

| Method | Endpoint | Used by | Notes |
|--------|----------|---------|-------|
| `GET` | `/chats` | `ChatListScreen` | Per-user list with `lastMessage`, `lastAt`, `unread` |
| `GET` | `/chats/:id/messages` | `ChatDetailScreen` | Paginated, oldest-first or cursor-based |
| `POST` | `/chats/:id/messages` | `ChatDetailScreen` — Send | `{ message, messageType: "text" }` |
| *Realtime* | Supabase channel / WS | `ChatDetailScreen` | Subscribe to `messages` for `chat_id`; TODO in UI |

**Access control:** Only users with `joined` status on the activity's chat may read/write.

**System messages:** On join/leave, insert `message_type=system`, `system_event_type=user_joined`.

### 5.5 Notifications

| Method | Endpoint | Used by | Notes |
|--------|----------|---------|-------|
| `GET` | `/notifications` | `NotificationsScreen` | Paginated, newest first |
| `GET` | `/notifications/unread-count` | `HomeFeedScreen` (bell badge — future) | Integer |
| `PATCH` | `/notifications/:id/read` | `NotificationsScreen` (tap — future) | Mark single read |
| `PATCH` | `/notifications/read-all` | *(optional)* | |

**Push triggers (server-side):** new chat message, activity almost full, nearby activity matching interests.

### 5.6 Reports (member-submitted)

| Method | Endpoint | Used by | Body |
|--------|----------|---------|------|
| `POST` | `/reports` | `ReportScreen` | See below |

```json
{
  "reportType": "activity",
  "reason": "unsafe",
  "description": "What happened?",
  "activityId": "a8",
  "reportedUserId": null,
  "messageId": null
}
```

Report types in UI: `user`, `activity`, `message`, `spam`, `harassment`, `unsafe`, `other`.

### 5.7 Media uploads

| Method | Endpoint | Used by | Notes |
|--------|----------|---------|-------|
| `POST` | `/uploads/avatar` | `ProfileSetupScreen` | Multipart → returns `url` |
| `POST` | `/uploads/activity-cover` | `CreateActivityScreen` | Multipart → returns `url` |

Alternative: presigned URL flow (`POST /uploads/presign` → client PUT to storage).

### 5.8 User preferences (future)

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/users/me/preferences` | `SettingsScreen` rows |
| `PATCH` | `/users/me/preferences` | Notification/location/privacy toggles |

Settings rows today: Account, Notifications, Location, Privacy, Help — navigation only.

---

## 6. Admin API (web console)

Base path: `/admin/api/v1`  
Mock types: `admin/src/data/mock.ts`  
Deployed under `/admin/` basename.

### 6.1 Dashboard

**Page:** `admin/src/pages/DashboardPage.tsx`

| Method | Endpoint | Metrics returned |
|--------|----------|------------------|
| `GET` | `/admin/dashboard/stats` | `totalUsers`, `activeUsers7d`, `publishedActivities`, `openReports`, `newSignups24h` |

**Definitions (suggested):**

- `activeUsers7d` — users with any login or activity join in last 7 days
- `publishedActivities` — `approval_status=approved` AND `status` not in (`cancelled`, `closed`)
- `openReports` — `status` in (`pending`, `reviewing`)
- `newSignups24h` — `users.created_at` in last 24h

### 6.2 Users

**Page:** `admin/src/pages/UsersPage.tsx`  
**TODO on page:** pagination, search, suspend user API

| Method | Endpoint | Query | Response fields (table columns) |
|--------|----------|-------|-----------------------------------|
| `GET` | `/admin/users` | `page`, `limit`, `search`, `status` | `id`, `fullName`, `email`, `city`, `status`, `joinedAt` |
| `GET` | `/admin/users/:id` | — | Full user detail (future detail drawer) |
| `PATCH` | `/admin/users/:id/suspend` | `{ reason? }` | Sets `status=suspended`; audit log |
| `PATCH` | `/admin/users/:id/activate` | — | Sets `status=active` |
| `DELETE` | `/admin/users/:id` | — | Soft-delete `status=deleted` |

### 6.3 Activities (moderation)

**Page:** `admin/src/pages/ActivitiesPage.tsx`  
**TODO:** moderation queue, feature flag, host tools

| Method | Endpoint | Query | Response fields |
|--------|----------|-------|-----------------|
| `GET` | `/admin/activities` | `page`, `status`, `approvalStatus`, `flagged` | `id`, `title`, `hostName`, `category`, `startsAt`, `status` |
| `PATCH` | `/admin/activities/:id/approve` | — | `approval_status=approved` |
| `PATCH` | `/admin/activities/:id/reject` | `{ reason }` | `approval_status=rejected` |
| `PATCH` | `/admin/activities/:id/flag` | — | `flagged=true`; surface in moderation queue |
| `PATCH` | `/admin/activities/:id/feature` | `{ featured: boolean }` | Toggle featured for home feed |
| `PATCH` | `/admin/activities/:id/close` | — | Admin force-close |

**Admin `status` display mapping:** derive from mobile fields — e.g. `published` = approved + open; `draft` = pending approval; `flagged` = `flagged=true`.

### 6.4 Reports (moderation workflow)

**Page:** `admin/src/pages/ReportsPage.tsx`  
**TODO:** assignee, audit log, resolution workflow; enable "Open" action button

| Method | Endpoint | Query | Response fields |
|--------|----------|-------|-----------------|
| `GET` | `/admin/reports` | `page`, `status`, `targetType` | `id`, `targetType`, `targetLabel`, `reason`, `createdAt`, `status` |
| `GET` | `/admin/reports/:id` | — | Full report + reporter + linked entities |
| `PATCH` | `/admin/reports/:id` | `{ status, assigneeId?, resolutionNotes? }` | Workflow transitions |
| `POST` | `/admin/reports/:id/assign` | `{ assigneeId }` | Sets `reviewing` |

**Status transitions:** `pending` → `reviewing` → `resolved` | `dismissed`  
Admin UI labels: `open` ≈ `pending`, `reviewing`, `closed` ≈ `resolved` | `dismissed`.

### 6.5 Categories (CMS)

**Page:** `admin/src/pages/CategoriesPage.tsx`  
**TODO:** CRUD + icon/color

| Method | Endpoint | Body / notes |
|--------|----------|--------------|
| `GET` | `/admin/categories` | List with `activityCount` aggregate |
| `POST` | `/admin/categories` | `{ name, slug, icon, color, sortOrder? }` |
| `PATCH` | `/admin/categories/:id` | Partial update |
| `DELETE` | `/admin/categories/:id` | Fail if activities exist, or reassign |

### 6.6 Settings & platform (planned)

**Page:** `admin/src/pages/SettingsPage.tsx` — checklist only, no forms yet

| Capability | Endpoint / implementation |
|------------|---------------------------|
| JWT admin auth | §4.2 |
| RBAC | Middleware on all `/admin/*` routes |
| Audit log export | `GET /admin/audit-logs/export?from=&to=` (CSV) |
| Email templates | `GET/PATCH /admin/email-templates/:key` for ban/warning emails |
| DB health | `GET /admin/health` |

---

## 7. Real-time, notifications & media

### 7.1 Chat realtime

**Frontend TODO:** `ChatDetailScreen` — "Supabase Realtime + POST message"

**Suggested approach:**

1. Client `POST /chats/:id/messages` persists message.
2. Server broadcasts to Realtime channel `chat:{chatId}`.
3. Subscribers update UI; increment unread for other participants.
4. Trigger `notifications` row + optional push.

### 7.2 Push notifications

- Store device tokens: `user_devices(user_id, platform, token)`.
- On events (chat, almost_full, nearby), enqueue push via FCM/APNs.
- Mobile does not register tokens yet — backend should expose `POST /users/me/devices`.

### 7.3 Geolocation & recommendations

- **Nearby feed:** Haversine or PostGIS query on `activities.latitude/longitude`.
- **Recommended:** Match activity `tags` / `category_id` to `user_interests` slugs; fallback to popular in city.
- **City picker** on home (`useAppStore.selectedCity`) — persist via `PATCH /users/me`.

---

## 8. Frontend → backend mapping matrix

### 8.1 Mobile app (`mobile/src/screens/`)

| Screen | File | Backend endpoints / services needed |
|--------|------|-------------------------------------|
| Splash | `SplashScreen.tsx` | Session check: `GET /users/me` |
| Onboarding | `OnboardingScreen.tsx` | Optional: flag onboarding complete |
| Login | `LoginScreen.tsx` | Supabase Auth / `POST /auth/login`; OAuth |
| Signup | `SignupScreen.tsx` | `POST /auth/signup` |
| OTP | `OtpScreen.tsx` | Phone OTP verify |
| Profile setup | `ProfileSetupScreen.tsx` | `PATCH /users/me`, `POST /uploads/avatar` |
| Interest selection | `InterestSelectionScreen.tsx` | `GET /interests`, `PUT /users/me/interests` |
| Home feed | `HomeFeedScreen.tsx` | `GET /activities`, `/featured`, `/categories`; search/filter queries; `GET /notifications/unread-count` |
| Activity details | `ActivityDetailsScreen.tsx` | `GET /activities/:id`, `POST .../join`, `POST .../maybe` |
| Create activity | `CreateActivityScreen.tsx` | `POST /activities`, `POST /uploads/activity-cover` |
| My events | `MyEventsScreen.tsx` | `GET /users/me/activities?role=` |
| Chat list | `ChatListScreen.tsx` | `GET /chats` |
| Chat detail | `ChatDetailScreen.tsx` | `GET /chats/:id/messages`, `POST .../messages`, Realtime |
| Profile | `ProfileScreen.tsx` | `GET /users/me` |
| Settings | `SettingsScreen.tsx` | `GET/PATCH /users/me/preferences`, `POST /auth/logout` |
| Notifications | `NotificationsScreen.tsx` | `GET /notifications`, `PATCH .../read` |
| Report | `ReportScreen.tsx` | `POST /reports` |

### 8.2 Admin console (`admin/src/pages/`)

| Page | File | Backend endpoints needed |
|------|------|--------------------------|
| Login | `LoginPage.tsx` | `POST /admin/auth/login` |
| Dashboard | `DashboardPage.tsx` | `GET /admin/dashboard/stats` |
| Users | `UsersPage.tsx` | `GET /admin/users`, `PATCH .../suspend` |
| Activities | `ActivitiesPage.tsx` | `GET /admin/activities`, moderation PATCH routes |
| Reports | `ReportsPage.tsx` | `GET /admin/reports`, `PATCH /admin/reports/:id` |
| Categories | `CategoriesPage.tsx` | Full CRUD `/admin/categories` |
| Settings | `SettingsPage.tsx` | Audit, email templates, health (future) |
| Layout sign out | `AdminLayout.tsx` | `POST /admin/auth/logout` |

---

## 9. Enum alignment (admin vs mobile)

Backend should use **mobile enums as source of truth** in the database; admin API **maps** to simpler display labels.

| Concept | Mobile (`models.ts`) | Admin (`mock.ts`) | Mapping notes |
|---------|----------------------|-------------------|---------------|
| User status | `active`, `suspended`, `deleted`, `pending` | `active`, `suspended` | Admin hides `deleted`/`pending` or shows separately |
| Activity lifecycle | `open`, `almost_full`, `full`, `done`, `cancelled`, `closed` | `published`, `draft`, `flagged` | `published` = approved + active; `draft` = pending approval; `flagged` = moderation flag |
| Report status | `pending`, `reviewing`, `resolved`, `dismissed` | `open`, `reviewing`, `closed` | `open` → `pending`; `closed` → `resolved` \| `dismissed` |
| Participant | `joined`, `maybe`, `left`, `removed` | — | Mobile only |
| Group type | `need_one_person`, `fixed_group`, `open_join` | — | Create form + activity detail |

---

## 10. Suggested delivery phases

### Phase 1 — MVP (unblock mobile + admin read paths)

- [ ] PostgreSQL schema + migrations
- [ ] Supabase Auth (email/password) + JWT validation in NestJS
- [ ] `GET/POST/PATCH` users, interests, categories
- [ ] Activities CRUD + join/maybe
- [ ] `GET` feeds with city/category/search
- [ ] Admin login + dashboard stats + read-only list endpoints
- [ ] `POST /reports`

### Phase 2 — Engagement

- [ ] Chats + messages + Realtime
- [ ] Notifications (in-app + push)
- [ ] Image uploads (avatar, cover)
- [ ] Phone OTP + OAuth
- [ ] Nearby + recommended feeds
- [ ] Admin write: suspend user, report workflow, activity moderation

### Phase 3 — Platform

- [ ] Category CMS (full CRUD)
- [ ] Audit logs + export
- [ ] Email templates (ban/warning)
- [ ] User preferences API
- [ ] Featured flag, analytics refinements

---

## 11. Non-functional requirements

| Area | Requirement |
|------|-------------|
| **Pagination** | Default `limit=20`, max `100`; return `{ data, meta: { page, limit, total } }` |
| **Errors** | Consistent JSON: `{ error: { code, message, details? } }`; HTTP status codes |
| **Validation** | Request DTO validation (class-validator / Zod) |
| **Security** | Rate limit auth endpoints; sanitize user content; RBAC on admin routes |
| **Timestamps** | ISO 8601 UTC in API responses |
| **IDs** | UUIDs in API; frontend mock uses strings like `u1`, `a1` — migration/seed can map |
| **CORS** | Allow admin origin + mobile dev; restrict in production |
| **Logging** | Structured logs; correlation ID per request |
| **Testing** | Contract tests for endpoints listed in §5–6; seed script matching mock data |

### Standard list response shape

```json
{
  "data": [ /* items */ ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1284,
    "totalPages": 65
  }
}
```

### Standard error shape

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {}
  }
}
```

---

## 12. Open questions for backend team

1. **Auto-approve activities** or require moderator approval for all new posts?
2. **Single city launch** (Ahmedabad) — hardcode city list or geocode API?
3. **Supabase vs custom auth** — confirm final choice; frontend TODOs mention Supabase.
4. **Chat media** — images in v1 or text-only?
5. **Admin user provisioning** — separate admin table or `role` on `users`?
6. **Report SLA** — any auto-escalation for `unsafe` reports?
7. **Data retention** — deleted users, message history, GDPR export?

---

## Appendix A — Seed data reference

Align initial DB seed with mock files for easier frontend integration testing:

- `mobile/src/data/mock.ts` — users, interests, categories, activities, participants, chats, messages, notifications
- `admin/src/data/mock.ts` — admin list views + dashboard stats

## Appendix B — Key frontend files for integration

| Area | Path |
|------|------|
| Mobile API stub | `mobile/src/services/api.ts` |
| Mobile types | `mobile/src/types/models.ts` |
| Mobile mock data | `mobile/src/data/mock.ts` |
| Mobile global state | `mobile/src/store/useAppStore.ts` |
| Admin mock + types | `admin/src/data/mock.ts` |
| Admin auth | `admin/src/auth/AuthProvider.tsx` |
| Admin routes | `admin/src/App.tsx` |

## Appendix C — Explicit frontend TODOs (implementation order hints)

| Location | TODO text |
|----------|-----------|
| `mobile/src/services/api.ts` | Replace with real API client (Supabase + NestJS) |
| `mobile/src/screens/LoginScreen.tsx` | Wire Supabase Auth |
| `mobile/src/screens/InterestSelectionScreen.tsx` | `PUT /users/me/interests` |
| `mobile/src/screens/CreateActivityScreen.tsx` | `POST /activities`; cover upload |
| `mobile/src/screens/ActivityDetailsScreen.tsx` | `POST /activities/:id/join` |
| `mobile/src/screens/ReportScreen.tsx` | `POST /reports` |
| `mobile/src/screens/ChatDetailScreen.tsx` | Supabase Realtime + POST message |
| `mobile/src/screens/SettingsScreen.tsx` | deep links & preferences API |
| `admin/src/auth/AuthProvider.tsx` | Replace with NestJS / OIDC |
| `admin/src/pages/UsersPage.tsx` | pagination, search, suspend user API |
| `admin/src/pages/ActivitiesPage.tsx` | moderation queue, feature flag, host tools |
| `admin/src/pages/ReportsPage.tsx` | assignee, audit log, resolution workflow |
| `admin/src/pages/CategoriesPage.tsx` | CRUD + icon/color from CMS |
| `admin/src/pages/SettingsPage.tsx` | NestJS + JWT, RBAC, audit, email, DB link |

---

*This document should be updated as frontend screens gain real API wiring or as product decisions in §12 are resolved.*
