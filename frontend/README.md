# Harmony Dining & Event Center — Frontend

Marketing and bookings website for Harmony Dining & Event Center, built with
the Next.js App Router.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **MUI 9** with a custom multi-preset theme (`src/theme/`)
- **react-hook-form** + **yup** for form validation
- **react-leaflet** / **Leaflet** for the location map
- **motion** for scroll animation

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev
```

The app runs at http://localhost:3000.

## Environment variables

| Variable               | Required | Description                                                        |
| ---------------------- | -------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Prod     | Public origin, used for canonical URLs, Open Graph, sitemap/robots |
| `NEXT_PUBLIC_API_URL`  | No       | Base URL of the Harmony backend API (bookings). Blank until ready. |

Access them through `src/lib/env.ts`, never `process.env` directly.

## Scripts

| Command          | Description                        |
| ---------------- | --------------------------------- |
| `pnpm dev`       | Start the dev server              |
| `pnpm build`     | Production build                  |
| `pnpm start`     | Serve the production build        |
| `pnpm lint`      | ESLint                            |
| `pnpm lint:fix`  | ESLint with autofix              |
| `pnpm typecheck` | `tsc --noEmit`                    |

## Project layout

```
src/
  app/                 Routes, layout, metadata, error/not-found, sitemap, robots
  components/           Feature components grouped by area (home, menu, events, …)
  data/                Static content (menu data)
  lib/                 Framework-agnostic helpers (env, date)
  theme/               MUI theme tokens, factory, provider, pre-hydration script
  validation/          yup schemas shared by forms
```

## Notes

- **Bookings are frontend-only for now.** The reservation and event-enquiry
  forms validate and show a local confirmation state; they do not post
  anywhere until `NEXT_PUBLIC_API_URL` and the backend are connected.
- **`/privacy` and `/terms`** contain starter copy and must be reviewed by
  legal counsel before launch.
- **`/contact`** has empty `phone`/`email` fields in `CONTACT_DETAILS` — fill
  them in and those cards appear automatically.
- The `/api/route` handler proxies the public OSRM demo server for driving
  directions; swap it for a hosted routing provider before heavy production use.
