# LMS Phase 0 Scaffold

This repository is a minimal Next.js baseline for the LMS rebuild. It includes a
Supabase client wired to environment variables and a `/health` endpoint for
deploy smoke tests.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and `http://localhost:3000/health`.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```
NEXT_PUBLIC_SUPABASE_URL="https://icobjtlbfzllykypqxmz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon-key"
```

The Supabase client is configured in `src/lib/supabase/client.ts`.
