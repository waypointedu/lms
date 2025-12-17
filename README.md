# Waypoint LMS (GitHub-centered, Supabase-native)

Waypoint LMS is a production-grade learning platform built with Next.js App Router, Tailwind CSS (v4), and Supabase. Content lives in GitHub as Markdown/MDX, while auth, data, and storage run through Supabase.

## Tech stack

- **Framework:** Next.js App Router + TypeScript
- **Styling:** Tailwind CSS 4 with Waypoint design tokens (ink/cloud/accent palette)
- **Auth & data:** Supabase (email magic link + password optional), Postgres + RLS, Storage buckets
- **Content:** Markdown/MDX stored in `src/content/courses` (can be swapped for a dedicated content repo)
- **Deployment:** Vercel-ready; API routes and server actions ship with the repo

## Running locally

```bash
npm install
npm run dev
# visit http://localhost:3000
```

The primary pages are:

- `/` – marketing hero, course cards, live session highlights, check-in form (server action ready)
- `/courses` – renders MDX/Markdown content from the repo with language filtering (EN/ES)
- `/dashboard` – learner progress and live session cards
- `/admin` – deployment checklist and Supabase status
- `/login` – Supabase magic-link auth
- `/verify/[code]` – public certificate verification page

## Environment variables

Copy `.env.example` to `.env.local` and set your Supabase + site details:

```
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon-key"
SUPABASE_SERVICE_ROLE_KEY="service-role-key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="public-anon-key"
WAYPOINT_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WAYPOINT_SITE_URL="http://localhost:3000"
```

`WAYPOINT_SITE_URL` is used for Supabase magic-link redirects. Server actions and API routes check these values before attempting Supabase writes.

## Supabase setup checklist

1. Create a Supabase project and enable email auth (magic links) with optional passwords.
2. Buckets: `course-media`, `submissions`, and (optional) `avatars`.
3. Apply SQL migrations in `supabase/migrations` (profiles, courses, modules, lessons, enrollments, progress, check-ins, quizzes, live sessions, attendance). RLS is included.
4. Seed with `supabase/seed.sql` to create the Waypoint Foundations course, modules, lessons, and sample live sessions.
5. Configure SMTP (SendGrid/Mailgun/etc.) in Supabase for production email delivery.
6. Add the environment variables above to Vercel and your local `.env.local`.

## Search & bilingual support

- Global search (header) queries courses/lessons via `/api/search` using Supabase when configured, otherwise falls back to in-repo content.
- Course catalog supports language filter (EN/ES). MDX frontmatter includes `language` to keep listings consistent.

## GitHub-centered content

- Markdown/MDX lives under `src/content/courses` (overviews) and `src/content/lessons` (lesson bodies). Lessons are referenced via `content_path` in the Supabase `lessons` table.
- For a dedicated content repo, add it as a Git submodule or fetch files via the GitHub API at build time.
- Protect `main` with CI for linting, type-checks, and (optional) MDX validation.

## Data model

- SQL migrations live under `supabase/migrations` and include RLS policies for roles: `admin`, `instructor`, `student`, and `applicant`.
- Seed data is in `supabase/seed.sql` (Waypoint Foundations course, modules, lessons, live sessions).
- Type definitions for Supabase are in `src/types/supabase.ts` and used across server/client helpers.
- Additional schema: certificates (verification codes), audit_events, and lesson_index scaffolding for search.

## Certificates & verification

- Manual issuance from the Admin page (requires `SUPABASE_SERVICE_ROLE_KEY`).
- Public verification at `/verify/[code]` using the service role.
- Learners can view/print their certificate at `/certificates/[id]` when authenticated.

## QA and tooling

- Formatting: `npm run format` (`prettier.config.mjs`).
- Lint: `npm run lint` (ESLint + Prettier config).
- Type-check: `npm run typecheck`.
- Unit tests: `npm run test` (Vitest).
- Playwright smoke tests: `npm run test:e2e` (uses dev server; baseURL http://127.0.0.1:3000).
- CI: `.github/workflows/ci.yml` runs lint, typecheck, build, unit tests, and Playwright smoke tests.

## Tailwind & design tokens

Design tokens (ink/cloud/accent palette, gradients, pills, cards) live in `src/app/globals.css`. Components and pages rely on these CSS variables for consistency with the Waypoint brand.
