# InCircle seed data

Run after migrations:

```bash
cd backend
npm run migration:run
npm run seed
```

Requires `ENABLE_DEV_AUTH=true` in `backend/.env` for mobile **Dev Login** (no Google OAuth).

---

## Demo users

| Email | Username | Profile | Interests | Use for |
|-------|----------|---------|-----------|---------|
| `you@incircle.app` | `you_ahm` | Complete | Walking, Coffee, Cycling | **Main demo** — full app flow |
| `priya@incircle.app` | `priya_walks` | Complete | Walking, Chai | Host of featured walk |
| `dev@incircle.app` | `dev_cricket` | Complete | Cricket | Sports host |
| `new@incircle.app` | — | **Incomplete** | — | Test onboarding (profile + interests) |

All users: city **Ahmedabad**.

---

## Activities (Ahmedabad)

| Title | Host | Category | Featured | Status |
|-------|------|----------|----------|--------|
| Morning Riverfront Walk | Priya | Fitness | Yes | open |
| Weekend Cricket Match | Dev | Sports | No | almost_full |
| Chai & Networking | You | Social | No | open |
| Sunday Cycling Loop | Priya | Outdoor | No | open |
| Library Study Session | Dev | Social | No | open |

**You** are joined/maybe on several; **Home feed** and **Events** tabs will show data immediately after logging in as `you@incircle.app`.

---

## Catalog (from migration)

**15 interests:** Walking, Cricket, Coffee, Chai, Study, Sightseeing, Pickleball, Cycling, Gym, Books, Music, Nature, Football, Photography, Coding

**5 categories:** Fitness, Sports, Social, Culture, Outdoor

---

## Reports

1 sample pending report (demo user → cricket activity).

---

## Mobile dev login

On the **Login** screen in dev builds, tap:

- **You (main demo)** → goes straight to Main tabs with feed data
- **New user (onboarding)** → Profile setup flow

## API dev login

```bash
curl -X POST http://localhost:3000/auth/dev \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@incircle.app"}'
```

Returns `{ tokens, user }` — same shape as Google login.

---

## Re-seed

Seed is idempotent (skips if `you@incircle.app` exists). To reset:

```sql
TRUNCATE reports, activity_participants, activities, user_interests, users CASCADE;
```

Then run `npm run seed` again.
