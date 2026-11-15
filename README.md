# MehrDana — Persian Event & Networking Platform

Persian (RTL) event and social-networking platform built with Next.js (App
Router), Tailwind CSS v4 and Supabase.

**Current phase: Module 1 — foundation only.** No authentication, event listing,
payments or chat is implemented yet; those arrive in later modules.

## Requirements

- Node.js 20+
- A Supabase project (optional at this stage — the app runs without it)

## Setup

```bash
npm install
copy .env.example .env   # then fill in the Supabase values when available
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable                        | Scope   | Purpose                                     |
| ------------------------------- | ------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | browser | Supabase project URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser | Public anon key (safe to ship)              |
| `SUPABASE_SERVICE_ROLE_KEY`     | server  | Trusted server code only — never expose     |
| `NEXT_PUBLIC_SITE_URL`          | browser | Canonical site URL used in metadata         |

Missing Supabase values do not break the build: the UI keeps working and the
backend-dependent features are simply not available yet.

### Database

Apply `supabase/migrations/*.sql` in numeric order in the Supabase SQL Editor,
then run `supabase/verify/verify_rls.sql`. See `supabase/README.md` for the
security model.

## Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Development server                 |
| `npm run build`     | Production build                   |
| `npm start`         | Serve the production build         |
| `npm run lint`      | ESLint                             |
| `npm run typecheck` | TypeScript check without emitting  |

## Project structure

```
src/app          Routes, layout, manifest, offline fallback
src/components   Layout shell and reusable UI primitives
src/lib          Supabase clients, env, formatting, site config
supabase         SQL migrations and RLS verification
public           Service worker and PWA icons
docs             Architecture and design system (source of truth)
```

## PWA notes

The service worker is hand-written (`public/sw.js`) and only caches the offline
page plus static assets. HTML and authenticated API responses are never cached,
so a shared device cannot leak another user's pages.
