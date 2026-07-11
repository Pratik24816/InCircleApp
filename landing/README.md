# Hopiin Landing (frontend + backend)

Pre-launch marketing site for **Hopiin** — separate from the InCircle mobile app.

```
landing/
├── frontend/     React + Vite landing UI
└── backend/      Node + Express + MongoDB Atlas API
```

## What the backend stores

| Feature | API | MongoDB collection |
|---------|-----|-------------------|
| **Hopiin Circle** | `GET/POST /circle-feedback`, `POST /circle-feedback/:id/react` | `circlefeedbacks` |
| **Waitlist** | `POST /waitlist`, `GET /waitlist/count` | `waitlistentries` |

## Setup

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add a database user and allow your IP (or `0.0.0.0/0` for dev)
3. Copy the connection string

### 2. Backend env

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set MONGODB_URI and CORS_ORIGIN
```

### 3. Install & run

```bash
cd landing
npm run install:all
npm run dev
```

- Frontend: **http://localhost:5174**
- Backend API: **http://localhost:3000**
- Vite proxies `/api/*` → backend in dev

### Run separately

```bash
npm run dev:backend   # API only
npm run dev:frontend  # UI only (needs backend for live data)
```

## Production

**Frontend** — build and deploy `frontend/dist/` (Vercel, Netlify, etc.)

```bash
npm run build
```

**Backend** — deploy `backend/` to Railway, Render, Fly.io, etc.

```bash
cd backend
npm run build
npm start
```

Set env vars on your host:

- `MONGODB_URI` — Atlas connection string
- `CORS_ORIGIN` — your live site URL (e.g. `https://hopiin.app`)
- `PORT` — usually provided by the host

**Frontend prod env** — if API is on another domain:

```
VITE_API_URL=https://api.hopiin.app
```

## Brand assets

Place files in `frontend/assests/` — served from `frontend/public/assets/`.

| File | Use |
|------|-----|
| `img/hoppinprimarylogo.jpeg` | Nav, favicon, waitlist success |
| `img/hoppinsecondarylogo.jpeg` | Hero, footer |
| `img/hoppinfLogo-removebg-preview.png` | Nav logo |
