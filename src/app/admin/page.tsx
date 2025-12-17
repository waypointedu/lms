import { CheckCircle2, CloudUpload, GitBranch, ShieldCheck, ShieldQuestion, Sparkles } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";

const adminTools = [
  {
    title: "Auth & enrollments",
    description: "Supabase auth (magic link + password) with RLS-ready Postgres tables for enrollments and roles.",
    badge: "Auth",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: "Storage & submissions",
    description: "Buckets for course-media and submissions with folder-per-learner structure and server action stubs.",
    badge: "Storage",
    icon: <CloudUpload className="h-5 w-5" />,
  },
  {
    title: "Content pipeline",
    description: "GitHub-first workflow for Markdown/MDX with space for CI, previews, and external content repos.",
    badge: "Content",
    icon: <GitBranch className="h-5 w-5" />,
  },
];

export default function AdminPage() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <div>
      <SiteHeader />
      <main className="container space-y-14 py-12">
        <SectionHeader
          eyebrow="Admin toolkit"
          title="Operate Waypoint LMS with GitHub + Supabase"
          description="Wire Supabase credentials, configure storage buckets, and keep content in GitHub. The UI below lists the core operational levers for an MVP deployment."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {adminTools.map((tool) => (
            <div key={tool.title} className="card p-6 space-y-3">
              <div className="flex items-center gap-3 text-[var(--accent-deep)]">
                <div className="rounded-2xl bg-[var(--accent-light)] p-2">{tool.icon}</div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold border border-[rgba(20,34,64,0.08)]">
                  {tool.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold">{tool.title}</h3>
              <p className="text-[var(--muted)]">{tool.description}</p>
              <Link href="/api/status" className="text-[var(--accent-deep)] font-semibold">
                View API status
              </Link>
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-3 text-[var(--accent-deep)]">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Deployment checklist</h3>
            </div>
            <ul className="space-y-2 text-[var(--muted)]">
              <li>Configure environment variables in Vercel for Supabase URL and keys.</li>
              <li>Create storage buckets: <strong>course-media</strong>, <strong>submissions</strong>, and optional <strong>avatars</strong>.</li>
              <li>Enable RLS and policies for check-ins, progress, and submissions tables.</li>
              <li>Connect a GitHub content repo or keep MDX locally for the MVP.</li>
              <li>Protect main with CI for linting, type-checks, and MDX validation.</li>
            </ul>
          </div>
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-3 text-[var(--accent-deep)]">
              {supabaseConfigured ? <CheckCircle2 className="h-5 w-5" /> : <ShieldQuestion className="h-5 w-5" />}
              <h3 className="text-lg font-semibold">Supabase status</h3>
            </div>
            <p className="text-[var(--muted)]">
              {supabaseConfigured
                ? "Supabase environment variables detected. Server actions and API routes will attempt to persist check-ins and course data."
                : "Supabase credentials are not set yet. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to enable persistence."}
            </p>
            <Link href="/api/status" className="button-secondary w-fit">
              Check API
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
