# InCircle (frontend MVP)

UI-only prototype: **no backend**, mock data, and clear **TODO** hooks for later API work.

## Mobile (`mobile/`)

React Native app (Android / iOS).

```bash
cd mobile
npm install
npm start
# other terminal
npx react-native run-android
# or
npx react-native run-ios
```

- Typecheck: `npx tsc --noEmit`
- Lint: `npm run lint`
- Tests: `npm test` (uses a small Jest mock for Reanimated; run outside restricted sandboxes if workers fail)

## Web admin (`admin/`)

Vite + React + Ant Design. Routes are served under the **`/admin`** basename (see `vite.config.ts`).

```bash
cd admin
npm install
npm run dev
```

Open **http://localhost:5173/admin/** (trailing path matters with the configured base).

- Production build: `npm run build` (output is rooted for `/admin/` deployment)
- Demo login: any email/password; session is a `sessionStorage` flag only.

## Layout

| Package | Role |
|--------|------|
| `mobile/` | Member app: onboarding, auth placeholders, feed, activities, chats, profile |
| `admin/` | Internal console: dashboard, users, activities, reports, categories, settings stubs |
