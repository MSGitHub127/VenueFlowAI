# VenueFlowAI

Smart venue companion with real-time crowd intelligence, live queue monitoring,
animated floor maps, a Gemini-powered AI assistant, Firebase Google auth, and a
live global chat — all in a sleek violet/cyan dark UI.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Fill in your keys (see below)
```

### 3. Run
```bash
npm run dev
# → http://localhost:3000
```

---

## Environment Keys

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project Settings → Web App |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud Console → APIs & Services (enable Maps JS API) |

> **Demo mode**: The app works without any keys set. Google login falls back to a
> demo user, the AI panel shows a mock tip, and the map overlay still renders.

---

## Admin Login (no Firebase needed)
- Username: `admin`
- Password: `1234`

---

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Google Gemini 2.5 Flash** — AI assistant
- **Firebase Auth** — Google OAuth login
- **@react-google-maps/api** — Maps routing overlay
- **Framer Motion** — animations
- **react-zoom-pan-pinch** — map pan/zoom
- **Tailwind CSS 3** — utility styles
- **zod + xss** — validation & security

## Project Structure
```
src/
├── app/
│   ├── login/page.tsx              ← Login (Google + Admin)
│   ├── page.tsx                    ← Dashboard (auth-guarded)
│   ├── globals.css                 ← Design system
│   ├── layout.tsx
│   └── api/
│       ├── chat/route.ts           ← Gemini AI endpoint
│       ├── queue-times/route.ts    ← Live queue data
│       └── crowd-data/route.ts     ← Room capacity data
├── components/
│   ├── Sidebar.tsx                 ← Desktop nav
│   ├── QueueCard.tsx               ← Queue display card
│   ├── CrowdMap.tsx                ← SVG heatmap + Google Maps
│   ├── AIPanel.tsx                 ← Gemini chat + live feed
│   └── GlobalChat.tsx              ← Attendee global chat
└── lib/
    └── firebase.ts                 ← Firebase initialisation
```
