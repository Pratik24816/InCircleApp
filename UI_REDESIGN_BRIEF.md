# InCircle — Application & UI Design Brief

**Purpose:** Complete product and screen-level reference for redesigning the mobile app with a more attractive, distinctive aesthetic. Use this document when planning new visual direction, component systems, motion, or layout changes.

**Last updated:** 2026-06-05  
**Primary app:** `mobile/` (React Native 0.85)  
**Backend:** `backend/` (NestJS + PostgreSQL)  
**Demo city:** Ahmedabad, India

---

## Table of contents

1. [What InCircle is](#1-what-incircle-is)
2. [Product goals & target user](#2-product-goals--target-user)
3. [Core concepts & vocabulary](#3-core-concepts--vocabulary)
4. [User journeys & navigation](#4-user-journeys--navigation)
5. [Current design system](#5-current-design-system)
6. [Data model (what the UI displays)](#6-data-model-what-the-ui-displays)
7. [Screen-by-screen reference](#7-screen-by-screen-reference)
8. [Reusable components catalog](#8-reusable-components-catalog)
9. [Live vs mock features](#9-live-vs-mock-features)
10. [Redesign opportunities](#10-redesign-opportunities)

---

## 1. What InCircle is

**InCircle** is a mobile social discovery app for **real-world plans** — walks, cricket, coffee meetups, study sessions, cycling, etc. Users browse nearby activities, RSVP with one tap (“I'm In”), host their own plans, and (eventually) chat with people in the same plan.

### One-line pitch
> Find people. Make plans. **Go In.**

### Brand personality (today)
- **Dark, neon, Gen-Z energy** — night-out / city app, not corporate
- **IRL-first** — faces, locations, countdowns, “people going” social proof
- **Low friction** — join from feed without opening details; quick presets for Tonight / Tomorrow / Weekend when hosting

### Tech stack (mobile)
| Layer | Stack |
|-------|-------|
| Framework | React Native 0.85, React 19 |
| Navigation | React Navigation 7 (stack + bottom tabs) |
| State | Zustand (`useAppStore`) + React Context (`AuthContext`) |
| API | Axios → NestJS backend (`/auth`, `/activities`, `/users`, etc.) |
| Styling | StyleSheet + design tokens in `theme/tokens.ts` |
| Motion | Reanimated 4 (onboarding), LinearGradient backgrounds |

### Architecture overview

```
RootNavigator (auth flow)
├── Splash → Onboarding → Login → ProfileSetup → InterestSelection
└── Main (MainNavigator)
    ├── Bottom tabs: Home | My Events | Create | Chats | Profile
    └── Modal stacks: ActivityDetails | Report | Notifications
```

Each tab has its own nested stack (e.g. Profile → Settings, Chats → ChatDetail).

---

## 2. Product goals & target user

### Primary user
Young adults (18–30) in Indian cities who want **spontaneous, low-commitment social plans** — morning walks, pickup sports, chai hangs — without the formality of event platforms.

### Jobs to be done
| Job | How the app helps |
|-----|-------------------|
| “I'm bored tonight — what's happening?” | **Tonight** horizontal stories + featured card |
| “Find something near me” | Location line (`📍 Riverfront • 0.8km`), **Nearby** area filters |
| “Join fast” | **I'm In 🔥** on feed cards; no detail screen required |
| “Host something casual” | Create tab with live preview + sticky **Preview / Publish** footer |
| “See my commitments” | My Events tabs: Joined / Created / Completed |
| “Trust who I'm meeting” | Host avatar, participant stack, profile, report flow |

### Emotional targets for redesign
- **Exciting** — plans feel alive (countdowns, urgency, faces)
- **Local** — neighborhood names, not just “Ahmedabad”
- **Social** — you're joining *people*, not just an event listing
- **Effortless** — fewer form fields, more smart defaults

---

## 3. Core concepts & vocabulary

| Term | Meaning |
|------|---------|
| **Plan / Activity** | A hosted real-world meetup with title, time, place, category |
| **Go In / I'm In** | Primary RSVP action — join a plan |
| **Host** | User who created the activity |
| **Tonight** | Activities starting same evening (5 PM–midnight) |
| **Featured** | Highlighted plan on home feed (“Don't miss tonight”) |
| **Vibe tags** | Short mood labels on cards: `chill`, `cricket`, `walk` |
| **Group type** | `open_join` · `need_one_person` · `fixed_group` |
| **Nearby area** | Parsed neighborhood from location string (Riverfront, CG Road, etc.) |
| **Live preview** | Real-time feed card preview while creating a plan |

### Activity statuses (UI-relevant)
- `open` — spots available
- `full` — join disabled, button shows “Full”
- `done` / `cancelled` — completed tab, hidden from feed

### RSVP statuses
- `joined` — confirmed “In”
- `maybe` — tentative (detail screen only today)

---

## 4. User journeys & navigation

### First-time user flow
```
Splash (brand + Get Started)
  → Onboarding (3 steps, skippable)
  → Login (Google or Dev login)
  → Profile Setup (name, username, bio, city)
  → Interest Selection (pick ≥1 interest)
  → Main app (Home tab)
```

### Returning user
```
Splash → restores JWT session → Main (skips onboarding/login if complete)
```

### Core loop (logged in)
```
Home feed → tap card OR "I'm In"
  → Activity Details (optional) → Join / Maybe
  → My Events (track joined/created)
  → Chats (per-activity threads — mock today)
```

### Host flow
```
Create tab → fill plan / time / crew
  → Live preview updates at top
  → Sticky footer: Preview (scroll up) | Publish 🔥
  → Returns to previous tab; new plan appears in feed
```

### Navigation map

| Route | Access | Type |
|-------|--------|------|
| `Splash` | App launch | Root stack |
| `Onboarding` | First launch | Root stack |
| `Login` | After onboarding | Root stack |
| `ProfileSetup` | New / incomplete profile | Root stack |
| `InterestSelection` | After profile | Root stack |
| `Main` | Authenticated hub | Root stack |
| `HomeFeed` | Home tab | Tab |
| `MyEvents` | My Events tab | Tab |
| `CreateActivity` | Create tab | Tab |
| `ChatList` / `ChatDetail` | Chats tab | Tab + stack |
| `ProfileMain` / `Settings` | Profile tab | Tab + stack |
| `ActivityDetails` | Tap any activity card | Main modal stack |
| `Notifications` | Bell on Home / Profile | Main modal stack |
| `Report` | Link on Activity Details | Main modal stack |

### Bottom tab bar (always visible in Main)
| Tab | Icon (current) | Role |
|-----|----------------|------|
| Home | 🏠 | Discovery feed |
| My Events | 📅 | Personal activity history |
| Create | ➕ | Host a plan |
| Chats | 💬 | Activity group chats |
| Profile | 👤 | Identity + settings entry |

Tab bar style today: dark `#0B1224`, active tint neon green `#8CFF4F`, emoji icons (placeholder — good redesign target).

---

## 5. Current design system

**File:** `mobile/src/theme/tokens.ts`

### Colors
| Token | Hex / value | Usage |
|-------|-------------|-------|
| `background` | `#020617` | App base (deep navy-black) |
| `surface` | `rgba(255,255,255,0.05)` | Cards, inputs |
| `primary` | `#8CFF4F` | CTAs, active states, brand accent |
| `secondary` | `#4DB5FF` | Links, location, secondary accent |
| `text` | `#FFFFFF` | Headlines |
| `textSecondary` | `#D0D8E3` | Body copy |
| `muted` | `#8A94A7` | Labels, hints |
| `danger` | `#FF5A5F` | Logout, errors |
| `warning` | `#FFB020` | Urgency, live countdown |
| `border` | `rgba(255,255,255,0.08)` | Hairline dividers |

### Typography scale
| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `display` | 28px | 700 | Screen titles, hero |
| `title` | 20px | 600 | Card titles, section leads |
| `subtitle` | 16px | 600 | Buttons, names |
| `body` | 15px | 400 | Descriptions |
| `caption` | 12px | 500 | Labels, meta, section eyebrows |

### Spacing & radii
- Spacing: `xs:6` · `sm:10` · `md:16` · `lg:24` · `xl:32`
- Radii: `sm:8` · `md:14` · `lg:20` · `xl:28` · `pill:999`

### Recurring UI patterns
- **ScreenBg** — vertical gradient wrapper on most screens
- **ScreenHeader** — centered title, optional back chevron `‹`, safe area aware
- **AppCard** — frosted surface container
- **AppButton** — primary (green gradient pill), secondary (blue border), ghost, danger
- **AppInput** — uppercase label + dark surface field
- **Section eyebrows** — uppercase caption, letter-spaced (`TONIGHT`, `NEARBY`)
- **Chips** — pill selectors with green/blue active border glow

### Current aesthetic limitations (redesign hooks)
- Emoji used as tab icons and many placeholders
- Generic dark + neon gradient (common in RN demos)
- Flat tab bar, no floating Create button
- Form-heavy create flow despite live preview
- Mixed typography hierarchy (some screens feel “admin form”)

---

## 6. Data model (what the UI displays)

### User (`AuthUser`)
```
fullName, username, email, bio, city, profilePhoto
isProfileCompleted, interestIds[]
```

### Activity (primary UI entity)
```
title, description, coverUrl (auto-resolved photo)
startDatetime (ISO), locationName, city, lat/lng
category { name, icon, slug }
creator { fullName, username, profilePhoto }
participants[] (up to 4 on cards)
joinedCount, groupType, groupSize, status
tags[], vibeTags[]
featured?, distanceKm?
```

### Categories (5 seeded)
Fitness · Sports · Social · Culture · Outdoor — each has emoji icon + color.

### Interests (15 seeded)
Walking, Cricket, Coffee, Chai, Study, Sightseeing, Pickleball, Cycling, Gym, Books, Music, Nature, Football, Photography, Coding.

### Cover photos
Auto-selected from title/tags via keyword rules (Pexels/Unsplash URLs). Shown on `ActivityCover` with gradient overlay + label (“Riverfront”, “Cricket ground”, etc.).

### Location display logic
- Parses neighborhood from `locationName` (Riverfront, CG Road, Satellite, …)
- Shows `📍 {neighborhood} • {distance}km` using demo user position (Sabarmati Riverfront center until GPS wired)
- **Nearby** section aggregates unique areas from visible activities

### Countdown display (`ActivityCountdown`)
| Condition | Display example |
|-----------|-----------------|
| Starts within 24h | `⏳ Starts in 08:42:17` (live timer) |
| Tomorrow | `⏰ Tomorrow Morning` |
| This week | `⏰ Friday Evening` |
| 7+ days | `⏰ Starts in 12 days` |

---

## 7. Screen-by-screen reference

---

### 7.1 Splash Screen
**File:** `SplashScreen.tsx`  
**When shown:** Every cold start; routes user based on auth/onboarding state.

#### Layout (top → bottom)
1. **Logo block** — circular logo image + wordmark “**In**Circle” (In = green, Circle = white)
2. **Tagline** — “Find people. Make plans. **Go In.**”
3. **Hero card** — full-width rounded image (`splashbg.png`) with gradient overlay
   - Copy: “Real people. Real plans.” / “Real memories.” (second line green)
   - Carousel dots (3, first active) — decorative, not interactive yet
4. **CTA** — “Get Started” gradient button (green → blue)
5. **Footer** — “Join the circle. Be part of something real.”

#### Behavior
- Waits for `authReady` (session restore from AsyncStorage + `/users/me`)
- Button disabled while loading spinner shows
- **Get Started** → routes to Onboarding / Login / ProfileSetup / InterestSelection / Main

#### Redesign notes
- First brand impression — hero photography, motion, and typography set the entire app tone
- Carousel dots suggest multi-slide onboarding but only one hero image today
- Dev API hint shown in `__DEV__` only

---

### 7.2 Onboarding Screen
**File:** `OnboardingScreen.tsx`  
**Steps:** 3 (swipeable via Next button, Skip exits early)

#### Global chrome
- Dimmed full-screen background image
- **Skip** top-right (jumps to Login)
- Step badge (numbered circle with green glow)
- Progress dots + progress bar + **Next / Get started** button

#### Step 1 — “Create a plan”
- Hero: circular photo ring with green glow
- **Popular plans** list (glass rows): Morning Walk, Cricket Match, City Sightseeing, Pickleball Game
- Rows are visual only (no navigation)

#### Step 2 — “Choose group size”
- Emoji hero ring (👥)
- Selectable glass rows: Just me · Small group · Medium group · Large group
- Selected row gets green border + checkmark

#### Step 3 — “People join with In”
- Phone mockup with avatar bubbles
- **Join with In** gradient pill (brand action preview)
- Summary card: “Sunday Morning Walk” + avatar stack + “+12 joined”

#### Behavior
- Sets `onboardingComplete = true` in Zustand store
- Navigates to Login

#### Redesign notes
- Strongest motion/animation in app (Reanimated `FadeInRight`)
- Glass morphism rows are a distinct visual language worth extending or replacing cohesively
- Group size selection is onboarding-only — not persisted to profile today

---

### 7.3 Login Screen
**File:** `LoginScreen.tsx`

#### Layout
- Header: “Welcome back” / “Sign in to continue”
- Centered **InCircle** wordmark (green display type)
- **Dev login block** (`__DEV__` only): 4 one-tap demo accounts
- Disabled email/password fields (placeholder UI)
- **Google** + **Apple** buttons (Apple disabled)
- Loading spinner during auth

#### Demo accounts
| Button label | Email | Use case |
|--------------|-------|----------|
| You (main demo) | `you@incircle.app` | Full app, seeded data |
| Priya (host) | `priya@incircle.app` | Featured walk host |
| Dev (sports) | `dev@incircle.app` | Cricket host |
| New user | `new@incircle.app` | Forces profile + interest onboarding |

#### Behavior
- Google → `POST /auth/google` (needs client ID config)
- Dev → `POST /auth/dev-login`
- After login → ProfileSetup if incomplete, else InterestSelection if no interests, else Main

#### Redesign notes
- Production login is mostly Google; email/password are visual placeholders
- Dev buttons dominate in development — hide elegantly in prod builds
- Opportunity: single hero sign-in, social proof, city selector upfront

---

### 7.4 Signup & OTP Screens
**Files:** `SignupScreen.tsx`, `OtpScreen.tsx`  
**Status:** Placeholder UI only — no backend integration.

#### Signup
- Full name, email, password fields
- Continue → navigates to OTP with phone hint
- Note: “Social signup placeholders — TODO backend”

#### OTP
- 6-digit code input (visual)
- Verify → sets local auth flags, routes like login

#### Redesign notes
- Low priority until backend exists; can stay minimal or be removed from nav in MVP

---

### 7.5 Profile Setup Screen
**File:** `ProfileSetupScreen.tsx`  
**Subtitle:** “Step 1 of 2”

#### Fields
| Field | Required | Notes |
|-------|----------|-------|
| Avatar area | No | Shows Google photo or “+” placeholder |
| Full name | Yes | |
| Username | Yes | 3–20 chars |
| Bio | No | Multiline |
| City | Yes | Default “Ahmedabad” |

#### Behavior
- `PATCH /users/profile` on Continue
- Updates Zustand `selectedCity`
- → InterestSelection

#### Redesign notes
- Avatar upload not implemented — important for trust/redesign
- Could merge with interest step for faster onboarding

---

### 7.6 Interest Selection Screen
**File:** `InterestSelectionScreen.tsx`  
**Subtitle:** “Step 2 of 2”

#### Layout
- Lead: “Pick what moves you. This powers recommendations later.”
- Wrap grid of **InterestChip** toggles (15 interests from API)
- **Finish** button

#### Behavior
- Requires ≥1 selection
- `PUT /users/me/interests`
- Sets `interestsComplete = true` → Main

#### Redesign notes
- Grid of chips is a strong visual pattern — could become illustrated tiles or category groupings
- Powers future “For you” section (placeholder card on home today)

---

### 7.7 Home Feed Screen ⭐ (core screen)
**File:** `HomeFeedScreen.tsx`  
**Tab:** Home

#### Header zone
```
Hey there 👋
📍 Riverfront • 0.8km  ▾          🔔
[ Search plans...                    ]
[ All ] [ 🏃 Fitness ] [ ⚽ Sports ] ...  ← horizontal category chips
```

#### Content sections (vertical scroll, pull-to-refresh)

**A. Tonight** (`TonightSection`)  
- Horizontal Instagram-style story rings
- Each tile: gradient ring → emoji → time → short title
- Tap → Activity Details
- Hidden if no tonight activities

**B. Don't miss tonight** (featured)  
- Single large `ActivityCard` with `featured` styling (stronger green border/gradient)
- Full card: host row, cover photo, title, vibe tags, location, weather line, avatars, countdown
- **I'm In 🔥** button attached below card

**C. Nearby** (`NearbyAreasSection`)  
- Horizontal chips: `All areas` · `📍 Riverfront • 0.8km` · `📍 CG Road • 1.2km` …
- Filters “Plans around you” list below

**D. Plans around you**  
- List of `ActivityCard` components sorted by distance
- Empty → `FeedEmptyState`: “Ahmedabad looks quiet today 👀” + **Host a Plan** CTA

**E. For you** (placeholder)  
- Static recommendation card: “Based on your vibe”

#### Interactions
| Action | Result |
|--------|--------|
| Search input | Debounced API filter by title/tags |
| Category chip | Filters feed by category |
| Area chip | Filters by parsed neighborhood |
| I'm In on card | `POST join` without leaving feed |
| Tap card body | Activity Details |
| Bell | Notifications (mock list) |
| Host a Plan (empty state) | Switches to Create tab |
| Pull down | Refresh all feed sections |

#### API calls on load
- `GET /categories`
- `GET /activities/featured?city=`
- `GET /activities/tonight?city=`
- `GET /activities?city=&categoryId=&q=&excludeFeatured=true`

#### Redesign notes
- Most information-dense screen — hierarchy is critical
- Tonight stories + featured + list can compete visually
- Search bar is functional but plain
- Location dropdown chevron is decorative (no picker yet)
- Strong opportunities: hero header, map peek, animated join, skeleton loaders

---

### 7.8 Activity Details Screen
**File:** `ActivityDetailsScreen.tsx`  
**Access:** Tap any activity card

#### Layout
```
[ ← back ]                    [ Report ]
[ Large cover photo — 220px height ]
[ status badge ]     [ neighborhood • distance ]
{ Title — display size }
[ vibe tag chips ]
[ ⏳ Countdown pill — large ]
{ full datetime string }
📍 { location line }
{ venue name }
{ description paragraph }

┌ Host card ─────────────────┐
│ avatar  Name               │
│         @username          │
└────────────────────────────┘

┌ Group card ────────────────┐
│ group type · max size      │
│ N people In                │
│ [ avatar stack + names ]   │
└────────────────────────────┘

[ In ]  [ Maybe ]   ← side-by-side buttons
```

#### Behavior
- Loads `GET /activities/:id`
- **In** → join with status `joined`
- **Maybe** → join with status `maybe`
- **Report** → Report screen with activityId prefilled

#### Redesign notes
- Cover + countdown should be the emotional hero
- Host trust section is important for safety aesthetic
- Sticky bottom CTA bar would match Create screen pattern
- Map embed / directions link not present — high value add

---

### 7.9 Create Activity Screen ⭐ (host flow)
**File:** `CreateActivityScreen.tsx`  
**Tab:** Create

#### Structure
Single long scroll form with **three sections** + **sticky footer**.

**Live preview (top, always visible)**
- `CreateActivityPreview` wraps a real `ActivityCard` (non-interactive)
- Updates as user types — shows exactly how plan appears on feed

**Section 1 — The plan**
| Field | Type |
|-------|------|
| Title | Text |
| Description | Multiline |
| Category | Wrap chips with emoji |
| Vibe tags | Comma-separated text |
| Cover hint | Auto label (“Riverfront — auto-selected”) |

**Section 2 — Time & place**
| Field | Type |
|-------|------|
| When | `ActivityDatePicker` — friendly “Tomorrow / 6:30 AM” + Tonight/Tomorrow/Weekend chips + expandable day/time controls |
| Location | Text |
| City | Text (default from profile city) |

**Section 3 — The crew**
| Field | Type |
|-------|------|
| Group type | 3 selectable cards: Open join 🌍 · Need one person 🙋 · Fixed group 👥 |
| Group size | Optional number |

#### Sticky footer (always visible)
```
[ Preview ]  [ Publish 🔥 ]
```
- **Preview** — scrolls to top preview card
- **Publish** — validates + `POST /activities` + navigates back

#### Validation rules
- Title, description, category, future datetime, location required
- Cover URL resolved server-side from keywords

#### Redesign notes
- Live preview is a killer feature — make it visually dominant (split screen, floating mini-card)
- Sticky footer pattern should stay
- Date picker is custom JS (no native module) — redesign the expand panel
- No map pin / “use my location” yet
- No success celebration screen after publish

---

### 7.10 My Events Screen
**File:** `MyEventsScreen.tsx`  
**Tab:** My Events

#### Layout
```
[ Joined ] [ Created ] [ Completed ]   ← segment tabs
```
- List of `ActivityCard` (no join button on list — tap opens details)
- Empty → “Nothing here yet / Join or host something IRL.”

#### Behavior
- `GET /activities/my?role=joined|created|completed`
- Refreshes on tab focus

#### Redesign notes
- Could differentiate created vs joined visually (host badge, edit actions)
- Calendar/timeline view would differentiate from home feed

---

### 7.11 Chat List Screen
**File:** `ChatListScreen.tsx`  
**Tab:** Chats  
**Status:** **Mock data** (`MOCK_CHATS`)

#### Row layout
```
[ 💬 avatar ]  Activity title          3:42 PM
               Last message preview...   [2]
```

#### Behavior
- Tap row → ChatDetail with `chatId`

#### Redesign notes
- Real chat will need activity thumbnail, participant avatars, read receipts
- Empty state needed when no chats

---

### 7.12 Chat Detail Screen
**File:** `ChatDetailScreen.tsx`  
**Status:** Mock messages + non-functional send

#### Layout
- Back + activity title header
- Message bubbles (`ChatBubble`: user vs system styling)
- Text input + Send button
- TODO note visible: “Supabase Realtime + POST message”

#### Redesign notes
- Standard chat UI — focus on activity context header (time, location, headcount)

---

### 7.13 Profile Screen
**File:** `ProfileScreen.tsx`  
**Tab:** Profile

#### Layout
```
Profile                    🔔  ⚙️

        [ large avatar ]
        Full Name
        @username
        bio text
        📍 Ahmedabad

   ┌ Created ┐  ┌ Joined ┐
   │    3    │  │   12   │
   └─────────┘  └────────┘

Interests
[ Walking ] [ Coffee ] [ Cycling ]

[ Refresh profile ]
```

#### Behavior
- Loads user via `refreshUser()`, counts from `fetchMyActivities`
- Settings gear → Settings stack
- Bell → Notifications

#### Redesign notes
- Stats cards are minimal — could show upcoming plans, streaks, host rating
- No edit profile inline — must go through onboarding screens or settings (not wired)

---

### 7.14 Settings Screen
**File:** `SettingsScreen.tsx`

#### Rows (non-functional except logout)
Account · Notifications · Location · Privacy · Help

#### Logout
- Clears auth → resets nav to Splash

#### Redesign notes
- Standard settings list pattern — opportunity for theme toggle if redesign supports light mode

---

### 7.15 Notifications Screen
**File:** `NotificationsScreen.tsx`  
**Status:** Mock list (`MOCK_NOTIFICATIONS`)

#### Row (`NotificationItem`)
- Icon/type, title, body, timestamp
- Tap handler empty

#### Redesign notes
- Group by Today / Earlier
- Deep link to activity or chat on tap

---

### 7.16 Report Screen
**File:** `ReportScreen.tsx`  
**Access:** Activity Details → Report

#### Fields
- Report type chips: user, activity, message, spam, harassment, unsafe, other
- Reason (required)
- Description (optional)
- Shows activity context ID

#### Behavior
- `POST /reports` → success alert → go back

#### Redesign notes
- Sensitive flow — calm, trustworthy UI; avoid gamified styling

---

## 8. Reusable components catalog

| Component | Role | Key props / behavior |
|-----------|------|----------------------|
| `ActivityCard` | Primary feed unit | `activity`, `onPress`, `onJoin`, `featured`, `compact`, `showJoinButton` |
| `ActivityCover` | Photo header with gradient + label | Resolves URL, fallback chain, loading spinner |
| `ActivityCountdown` | Live/friendly time pill | Updates every second when <24h |
| `Avatar` | Face emoji fallback or photo | `name`, `uri`, `size` |
| `AvatarStack` | Overlapping participant faces | `people`, `total`, `max`, `showNames` |
| `VibeTagRow` | Horizontal mood chips | `tags`, `compact`, `max` |
| `TonightStoryTile` | Circular story ring | Gradient ring, emoji, time, title |
| `TonightSection` | Horizontal scroller wrapper | Hides when empty |
| `NearbyAreasSection` | Area filter chips | Parses neighborhoods from activities |
| `FeedEmptyState` | Quiet city CTA | City/area aware headline |
| `CategoryChip` | Filter pill | `label`, `selected` |
| `InterestChip` | Onboarding toggle | |
| `CreateActivityPreview` | Live host preview shell | Wraps ActivityCard |
| `ActivityDatePicker` | Friendly datetime UX | Presets + expandable picker |
| `AppButton` | Primary actions | Variants: primary, secondary, ghost, danger |
| `AppInput` | Form field | Label, error state |
| `AppCard` | Surface container | |
| `ScreenBg` | Gradient background | |
| `ScreenHeader` | Nav header | back, title, subtitle, right slot |
| `StatusBadge` | open / full / etc. | |
| `EmptyState` | Generic empty | title + subtitle |
| `ChatBubble` | Message row | user vs system |
| `NotificationItem` | Alert row | |

---

## 9. Live vs mock features

| Feature | Status | Notes |
|---------|--------|-------|
| Google / Dev login | ✅ Live | |
| Profile save | ✅ Live | |
| Interests | ✅ Live | |
| Home feed | ✅ Live | Featured, tonight, nearby, search, filter |
| Join activity | ✅ Live | From feed + details |
| Create activity | ✅ Live | With cover auto-resolution |
| My events | ✅ Live | |
| Activity details | ✅ Live | |
| Reports | ✅ Live | |
| Notifications | ❌ Mock | `MOCK_NOTIFICATIONS` |
| Chats | ❌ Mock | `MOCK_CHATS`, send disabled |
| Signup / OTP / Email login | ❌ Placeholder | |
| Settings preferences | ❌ Placeholder rows | |
| Avatar upload | ❌ Not built | Google photo only |
| GPS location | ❌ Demo coordinates | Riverfront center hardcoded |
| For you recommendations | ❌ Static card | |

---

## 10. Redesign opportunities

### Visual direction questions to decide
1. **Keep dark neon** or move to light/warm/paper aesthetic?
2. **Photography-first** (covers, faces) vs **illustration-first**?
3. **Editorial** (magazine layouts) vs **social** (stories, bubbles)?
4. **City identity** — should Ahmedabad/local culture show in UI motifs?

### High-impact screens (prioritize these)
1. **Home Feed** — first impression, most complex layout
2. **Activity Card** — reused everywhere; single component redesign propagates
3. **Create flow** — sticky footer + live preview is unique; polish it
4. **Onboarding + Splash** — sets brand before user sees feed
5. **Tab bar** — replace emoji with custom icons; consider elevated Create tab

### UX patterns worth preserving
- One-tap **I'm In** from feed
- **Tonight** stories row
- **Neighborhood + distance** on cards
- **Live countdown** timers
- **Live create preview**
- **Sticky Preview / Publish** footer on Create
- **Tonight / Tomorrow / Weekend** date presets

### Known gaps to design for (even if not built yet)
- Post-publish success screen
- Map / pin picker on create
- Push notification permission moment
- Chat with real-time messages
- Profile editing
- Light mode / accessibility
- Skeleton loading states
- Host edit / cancel plan

### Demo content reference
When designing with realistic data, use seeded activities:
- **Morning Riverfront Walk** (featured, Priya, Fitness)
- **Weekend Cricket Match** (Dev, Sports, almost full)
- **Chai & Networking** (Social)
- **Sunday Cycling Loop** (Outdoor)
- **Tonight row:** Football Pickup, Open Mic, Coffee Meetup, Board Games

Login as `you@incircle.app` via Dev login for populated feed.

---

## Appendix: File map for designers ↔ developers

| Screen | Source file |
|--------|-------------|
| Splash | `mobile/src/screens/SplashScreen.tsx` |
| Onboarding | `mobile/src/screens/OnboardingScreen.tsx` |
| Login | `mobile/src/screens/LoginScreen.tsx` |
| Profile setup | `mobile/src/screens/ProfileSetupScreen.tsx` |
| Interests | `mobile/src/screens/InterestSelectionScreen.tsx` |
| Home | `mobile/src/screens/HomeFeedScreen.tsx` |
| Activity details | `mobile/src/screens/ActivityDetailsScreen.tsx` |
| Create | `mobile/src/screens/CreateActivityScreen.tsx` |
| My events | `mobile/src/screens/MyEventsScreen.tsx` |
| Chats | `mobile/src/screens/ChatListScreen.tsx` |
| Chat detail | `mobile/src/screens/ChatDetailScreen.tsx` |
| Profile | `mobile/src/screens/ProfileScreen.tsx` |
| Settings | `mobile/src/screens/SettingsScreen.tsx` |
| Notifications | `mobile/src/screens/NotificationsScreen.tsx` |
| Report | `mobile/src/screens/ReportScreen.tsx` |
| Design tokens | `mobile/src/theme/tokens.ts` |
| Navigation | `mobile/src/navigation/RootNavigator.tsx`, `MainNavigator.tsx` |

---

*Use this brief as the single source of truth when briefing designers, AI UI tools, or planning a visual refresh. Update it when screens or flows change.*
