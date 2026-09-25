# Creative AI Academy — Batch Controller & Digital Schedule Display

A professional, responsive **live digital signage dashboard** for a creative
academy (Adobe editing tools + AI creative workflows) plus a **built-in
management API** — everything is a single Next.js application.

- **Web** — Next.js 16 (App Router, TypeScript, Tailwind CSS 4), no WebGL: all
  effects are performant CSS + inline SVG.
- **API** — Next.js route handlers under `/api/*` (no separate service to
  deploy): REST endpoints, ISO-8601 query validation, repository-pattern data
  access, CORS support for cross-origin clients.
- **Shared** — `@academy/shared` workspace package: pure schedule-evaluation +
  formatting logic and the sample data used by both the dashboard and the API
  (tested once, never duplicated).

```
src/app/           Next.js App Router (dashboard + /api route handlers)
src/components/    Dashboard UI components
src/lib/api/       Repository + services behind the API routes
packages/shared/   Types, evaluateSchedule(), formatters, mock seed data
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
npm install          # installs everything + builds @academy/shared (postinstall)
npm run dev          # http://localhost:3000 (dashboard + /api in one server)
```

The dashboard talks to the API on its own origin (`/api/*`) by default — no
second server, no CORS. It falls back to bundled mock data automatically when
the API is disabled or unreachable; the status chip in the top-right shows
**Live · API** vs **Local · Mock**.

Optional `.env.local` (see `.env.example`):

```env
NEXT_PUBLIC_ACADEMY_NAME=CREATIVE AI ACADEMY
NEXT_PUBLIC_TAGLINE=EDITING • DESIGN • AI
NEXT_PUBLIC_CLOCK_FORMAT=12            # "12" or "24"
NEXT_PUBLIC_API_URL=/api              # "" → mock only; a full URL → remote API
CORS_ORIGINS=*                        # cross-origin clients (default: allow all)
```

### Preview every schedule state without waiting

Append `?at=HH:MM` (device-local 24h) to preview a frozen moment:
`http://localhost:3000/?at=10:30` → Morning Shift at 50% progress.
`?at=07:00` (pre-open) · `?at=12:00` (afternoon) · `?at=20:00` (ended).

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ACADEMY_NAME` | `CREATIVE AI ACADEMY` | Academy name (top-left) |
| `NEXT_PUBLIC_TAGLINE` | `EDITING • DESIGN • AI` | Subtitle |
| `NEXT_PUBLIC_ACADEMY_HOURS` | `9:00 AM — 6:00 PM` | Footer hours label |
| `NEXT_PUBLIC_CLOCK_FORMAT` | `12` | `12` or `24` |
| `NEXT_PUBLIC_API_URL` | `/api` | API base (`""` = mock only) |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins for cross-origin API clients |

Sample schedule/course data lives in **one place**:
`packages/shared/src/data/mock.ts` (used by both the dashboard fallback and the
API's in-memory repository). Swap it for Prisma/PostgreSQL data by implementing
the `AcademyRepository` interface in `src/lib/api/repository.ts` — route
handlers and services are unchanged.

## API endpoints

Built into the app (route handlers) — no separate server to deploy.

| Endpoint | Description |
| --- | --- |
| `GET /api/health` | Liveness: status, timestamp, uptime |
| `GET /api/academy` | Academy branding + full daily schedule |
| `GET /api/schedules` | Today's shift list (enabled only) |
| `GET /api/schedules/active?at=<ISO-8601>` | Shift evaluation at an instant (default: now) — returns `{ state, activeShift, nextShift, remainingSec, progress, untilStartSec }` |
| `GET /api/courses` | Course catalogue |

`?at=` must be an ISO-8601 timestamp (rigorous validation, matching the strict
`class-validator` check the NestJS API used before) — invalid input → `400`.

Business logic lives in `src/lib/api/services.ts` classes, which remain
repository-driven and framework-agnostic (swap the repository for
Prisma/PostgreSQL later without touching routes).

## Testing & quality gates

```bash
npm test          # shared (26) + API services & route handlers (~13)
npm run lint      # eslint (app + route handlers)
npm run typecheck # tsc --noEmit
npm run build     # builds @academy/shared, then the Next.js production build
```

The shared suite verifies every `§15` boundary scenario (08:59:59, 09:00:00,
10:30:00, 11:59:59, 12:00:00, 14:59:59, 15:00:00, 17:59:59, 18:00:00, 20:00:00)
plus disabled-shift/gap and custom-schedule cases with an injected clock. The
API suite exercises the services and the route handlers (status codes, JSON
shapes, validation errors, CORS headers).

Headless browser QA (uses system Chrome — run `npm run dev` first):

```bash
node scripts/visual-check.mjs      # 35 state×viewport combos + live tick test
node scripts/structure-check.mjs   # layout metrics (rows, glow, emblem hiding)
```

## Deployment → Vercel

The repo root **is** the Next.js app, so Vercel auto-detects the framework and
finds the production build — no Root Directory, `rootDirectory`, or framework
pinning needed. `vercel.json` just makes the build explicit:

```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build"
}
```

`npm run build` compiles `@academy/shared` first (the postinstall also builds
it on fresh installs, so cached installs can't miss it), then runs `next build`.

1. Push the repo and import it in Vercel. The dashboard **and** the API deploy
   together — `/api/*` works on the same origin as the dashboard.
2. Optionally set env vars in the project: `NEXT_PUBLIC_ACADEMY_NAME`,
   `NEXT_PUBLIC_TAGLINE`, `NEXT_PUBLIC_CLOCK_FORMAT`, and `CORS_ORIGINS` (only
   needed when external origins consume the API).
3. Done — no second deployment for the API; the status chip will read
   "Live · API".

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
  modules + repository swap). Editing academy name, shift times and courses
  through a dashboard is the natural next milestone.
- No persistence — data is in-memory (mock). Prisma/PostgreSQL can replace
  `InMemoryAcademyRepository` without touching services or route handlers.
- The active-shift decision is made client-side from the device clock; the API's
  `/schedules/active` is equivalent logic for server-side checks (a future admin
  could push overrides).
- `?at=` preview is client state per page load; it does not persist across
  client-side navigations (intended).