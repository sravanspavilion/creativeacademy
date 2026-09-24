# Creative AI Academy — Batch Controller & Digital Schedule Display

A professional, responsive **live digital signage dashboard** for a creative academy
(Adobe editing tools + AI creative workflows) plus a **management REST API**.

- **Web** — Next.js 16 (App Router, TypeScript, Tailwind CSS 4), no WebGL: all
  effects are performant CSS + inline SVG.
- **API** — NestJS 12, REST, class-validator DTOs, repository-pattern data access.
- **Shared** — `@academy/shared`: pure schedule-evaluation + formatting logic and
  the sample data used by both apps (tested once, never duplicated).

```
apps/web        Next.js dashboard (live display)
apps/api        NestJS REST API (/api/*)
packages/shared Types, evaluateSchedule(), formatters, mock seed data
```

## What it does

- Large digital clock (12h/24h, configurable), updates every second, aligned to
  second boundaries and re-synced when the tab regains focus — no refresh needed.
- Detects the active shift from the **device's local time**:

  | Local time      | State                                    |
  | --------------- | ---------------------------------------- |
  | 00:00 – 08:59   | **Pre-opening** (countdown to 9:00 AM)   |
  | 09:00 – 11:59   | Morning Shift · Adobe Premiere Pro       |
  | 12:00 – 14:59   | Afternoon Shift · Adobe Photoshop        |
  | 15:00 – 17:59   | Evening Shift · AI Creative Tools        |
  | 18:00 – 23:59   | **Schedule ended** (countdown to tomorrow) |

- Live countdown, session progress bar, "NOW ACTIVE" shift card highlight,
  upcoming-shift teaser, instructor/room/batch details.
- Instagram-inspired animated gradient background, glassmorphism panels, and
  floating abstract 3D-style tool emblems (custom SVG monograms — no trademarked
  logos), hidden logically on small screens, disabled under `prefers-reduced-motion`.

## Quick start

```bash
npm install          # installs all workspaces + builds @academy/shared (postinstall)

# Frontend only (mock data — no API needed)
npm run dev:web      # http://localhost:3000

# Frontend + API
npm run dev:api      # http://localhost:3001/api/health
npm run dev:web      # http://localhost:3000
```

Create `apps/web/.env.local` to point the dashboard at the API:

```env
# apps/web/.env.local
NEXT_PUBLIC_ACADEMY_NAME=CREATIVE AI ACADEMY
NEXT_PUBLIC_TAGLINE=EDITING • DESIGN • AI
NEXT_PUBLIC_CLOCK_FORMAT=12                 # "12" or "24"
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

The dashboard falls back to bundled mock data automatically when the API is
unreachable (or the env var is unset) — the status chip in the top-right shows
**Live · API** vs **Local · Mock**.

### Preview every schedule state without waiting

Append `?at=HH:MM` (device-local 24h) to preview a frozen moment:
`http://localhost:3000/?at=10:30` → Morning Shift at 50% progress.
`?at=07:00` (pre-open) · `?at=12:00` (afternoon) · `?at=20:00` (ended).

## Configuration

| Variable | App | Default | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_ACADEMY_NAME` | web | `CREATIVE AI ACADEMY` | Academy name (top-left) |
| `NEXT_PUBLIC_TAGLINE` | web | `EDITING • DESIGN • AI` | Subtitle |
| `NEXT_PUBLIC_ACADEMY_HOURS` | web | `9:00 AM — 6:00 PM` | Footer hours label |
| `NEXT_PUBLIC_CLOCK_FORMAT` | web | `12` | `12` or `24` |
| `NEXT_PUBLIC_API_URL` | web | *(unset)* | API base, e.g. `http://localhost:3001/api` |
| `API_PORT` | api | `3001` | API port |
| `CORS_ORIGINS` | api | `http://localhost:3000` | Comma-separated allowed origins |

Sample schedule/course data lives in **one place**:
`packages/shared/src/data/mock.ts` (used by both the dashboard fallback and the
API's in-memory repository). Swap it for Prisma/PostgreSQL data by implementing
the `AcademyRepository` interface in `apps/api/src/data/in-memory-repository.ts`
— controllers/services are unchanged.

## API endpoints

| Endpoint | Description |
| --- | --- |
| `GET /api/health` | Liveness: status, timestamp, uptime |
| `GET /api/academy` | Academy branding + full daily schedule |
| `GET /api/schedules` | Today's shift list (enabled only) |
| `GET /api/schedules/active?at=<ISO-8601>` | Shift evaluation at an instant (default: now) — returns `{ state, activeShift, nextShift, remainingSec, progress, untilStartSec }` |
| `GET /api/courses` | Course catalogue |

Business logic lives in services; DTOs are validated with `class-validator`
(invalid `?at` → `400`).

## Testing & quality gates

```bash
npm test          # shared (26) + api (6)  → boundary matrix + formatters + services
npm run lint      # eslint (web + api)
npm run typecheck # tsc --noEmit (web + api)
npm run build     # shared → web → api production builds
```

The shared suite verifies every `§15` boundary scenario (08:59:59, 09:00:00,
10:30:00, 11:59:59, 12:00:00, 14:59:59, 15:00:00, 17:59:59, 18:00:00, 20:00:00)
plus disabled-shift/gap and custom-schedule cases with an injected clock.

Headless browser QA (uses system Chrome — run the dev server first):

```bash
node apps/web/scripts/visual-check.mjs      # 35 state×viewport combos + live tick test
node apps/web/scripts/structure-check.mjs   # layout metrics (rows, glow, emblem hiding)
```

## Deployment

### Frontend → Vercel

1. Push the repo to GitHub and import it in Vercel. The repo-root
   `vercel.json` already configures the framework (`nextjs`), the build
   command (`npm --prefix ../../ run build:shared && next build` — the shared
   package is built before the web app) and the install command (`npm
   install`, workspaces install at repo root).
2. Project settings → General: **Root Directory:** `apps/web` (this one is a
   dashboard setting — it is *not* a `vercel.json` key; Vercel auto-detects
   it for the common `apps/*` layout).
3. Add env vars: `NEXT_PUBLIC_ACADEMY_NAME`, `NEXT_PUBLIC_TAGLINE`, and
   `NEXT_PUBLIC_API_URL` **only if** you also host the API. Without an API the
   dashboard runs fully on bundled mock data (status chip shows "Local · Mock").

### API → Railway / Render / VPS

```bash
cd apps/api
npm ci
npm run build           # dist/ via nest build
node dist/main.js       # set PORT/API_PORT + CORS_ORIGINS in the platform UI
```

A future option: `nest start` serverless via Vercel Functions, but a small
Node service (Railway/Render/Fly) is the recommended fit.

## Notes & design decisions

- **Time semantics:** shifts are half-open intervals `[start, end)` evaluated
  against **device-local** calendar components. `evaluateSchedule()` recomputes
  everything from `new Date()` each tick — nothing is decremented, so throttled
  tabs resync the moment they become visible.
- **Logos:** all floating emblems are original abstract SVG monograms in
  brand-inspired colors — no unlicensed trademark assets (spec §6).
- **No Three.js:** CSS transforms/`perspective` power the 3D emboss + float,
  with `prefers-reduced-motion` support — cheaper and smoother than WebGL for
  silhouettes behind a dashboard.
- **Accessibility:** `role="timer"` on clock/countdown, text+icon badge ("NOW
  ACTIVE") never color-only, semantic landmarks, 16:9-first layout that degrades
  to stacked cards on mobile.

## Limitations / next steps

- No admin UI yet — the architecture is prepared for it (schedule/course/academy
  API modules + repository swap). Editing academy name, shift times and courses
  through a dashboard is the natural next milestone.
- No persistence — data is in-memory (mock). Prisma/PostgreSQL can replace
  `InMemoryAcademyRepository` without touching services or controllers.
- The active-shift decision is made client-side from the device clock; the API's
  `/schedules/active` is equivalent logic for server-side checks (a future admin
  could push overrides).
- `?at=` preview is client state per page load; it does not persist across
  client-side navigations (intended).