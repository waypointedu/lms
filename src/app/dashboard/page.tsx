import { CalendarClock, FileCheck, Gauge, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { SectionHeader } from "@/components/ui/section-header";
import { checkInPrompts, dashboardProgress, liveSessions } from "@/data/courses";

const signals = [
  {
    label: "Check-ins captured",
    value: "Daily",
    icon: <FileCheck className="h-5 w-5" />,
    description: "Server actions post to Supabase with RLS-aware policies.",
  },
  {
    label: "Storage buckets",
    value: "course-media, submissions",
    icon: <ShieldCheck className="h-5 w-5" />,
    description: "Media and submissions live in Supabase Storage for safe uploads.",
  },
  {
    label: "Live cadence",
    value: "Weekly",
    icon: <CalendarClock className="h-5 w-5" />,
    description: "Office hours, standups, and launch reviews are pre-built.",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <SiteHeader />
      <main className="container space-y-14 py-12">
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="pill">Learner dashboard</p>
              <h1 className="text-4xl font-bold mt-3">Progress and live sessions</h1>
              <p className="text-[var(--muted)] max-w-2xl">
                Track course progress, record check-ins, and get ready for the next live session. This dashboard is wired for Supabase tables and storage buckets.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/courses" className="button-secondary">
                Browse catalog
              </Link>
              <Link href="/admin" className="button-primary">
                Open admin tools
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {signals.map((signal) => (
              <div key={signal.label} className="card p-5 space-y-2">
                <div className="flex items-center gap-3 text-[var(--accent-deep)]">
                  <div className="rounded-2xl bg-[var(--accent-light)] p-2">{signal.icon}</div>
                  <p className="text-sm font-semibold">{signal.label}</p>
                </div>
                <h3 className="text-xl font-bold">{signal.value}</h3>
                <p className="text-[var(--muted)] text-sm">{signal.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            eyebrow="Progress"
            title="On-track, at-risk, and off-track cohorts"
            description="Progress cards mirror Supabase course tables. Wire them to your Postgres views or analytics tables to keep teams aligned."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {dashboardProgress.map((item) => (
              <ProgressCard key={item.course} progress={item} />
            ))}
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Live session queue</h3>
              <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold text-[var(--accent-deep)]">
                Cohort-ready
              </span>
            </div>
            <div className="space-y-3">
              {liveSessions.map((session) => (
                <div key={session.title} className="flex items-start gap-3 rounded-2xl border border-[rgba(20,34,64,0.08)] bg-[rgba(20,34,64,0.02)] px-3 py-3">
                  <Gauge className="h-5 w-5 text-[var(--accent-deep)]" />
                  <div>
                    <p className="font-semibold">{session.title}</p>
                    <p className="text-sm text-[var(--muted)]">{session.cadence}</p>
                    <p className="text-sm text-[var(--muted)]">{session.focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6 space-y-4">
            <h3 className="text-xl font-semibold">Check-in prompts</h3>
            <div className="space-y-3">
              {checkInPrompts.map((prompt) => (
                <div key={prompt.title} className="rounded-2xl border border-[rgba(20,34,64,0.08)] bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">{prompt.title}</p>
                  <p className="text-sm text-[var(--muted)]">{prompt.prompt}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)]">
              Connect the form on the home page or your own client component to Supabase with server actions to log attendance.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
