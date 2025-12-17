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
- `/courses` – renders MDX/Markdown content from the repo
- `/dashboard` – learner progress and live session cards
- `/admin` – deployment checklist and Supabase status

## Environment variables

Copy `.env.example` to `.env.local` and set your Supabase project details:

```
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon-key"
SUPABASE_SERVICE_ROLE_KEY="service-role-key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="public-anon-key"
```

Server actions and API routes check these values before attempting Supabase writes.

## Supabase setup checklist

1. Create a Supabase project and enable email auth (magic links) with optional passwords.
2. Buckets: `course-media`, `submissions`, and (optional) `avatars`.
3. Tables to pair with the UI: `check_ins`, `course_progress`, `quiz_attempts`, and `live_sessions` with RLS policies.
4. Configure SMTP (SendGrid/Mailgun/etc.) in Supabase for production email delivery.
5. Add the environment variables above to Vercel and your local `.env.local`.

## GitHub-centered content

- Markdown/MDX lives under `src/content/courses`. Add more files and they will render on `/courses`.
- For a dedicated content repo, add it as a Git submodule or fetch files via the GitHub API at build time.
- Protect `main` with CI for linting, type-checks, and (optional) MDX validation.

## Tailwind & design tokens

Design tokens (ink/cloud/accent palette, gradients, pills, cards) live in `src/app/globals.css`. Components and pages rely on these CSS variables for consistency with the Waypoint brand.
