import { CalendarClock, FileCheck, Gauge, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { SectionHeader } from "@/components/ui/section-header";
import { checkInPrompts } from "@/data/courses";
import { getCurrentProfile, getLiveSessions } from "@/lib/queries";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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

type EnrollmentRow = { course_id: string; courses?: { title?: string } | null };
type ModuleRow = { id: string; course_id: string };
type LessonRow = { id: string; module_id: string };
type ProgressRow = { lesson_id: string; completed_at: string | null };
type LiveSessionRow = { title: string; starts_at?: string | null; description?: string | null; cadence?: string; focus?: string };

export default async function DashboardPage() {
  const session = await getCurrentProfile();
  const supabase = await getSupabaseServerClient();

  let progressCards: Array<{ course: string; completed: number; total: number; status: "on-track" | "at-risk" | "off-track" }> = [];
  const liveSessions = (await getLiveSessions()) as LiveSessionRow[];

  if (supabase && session?.user) {
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("course_id, courses(id, slug, title)")
      .eq("user_id", session.user.id);

    if (!enrollmentError && enrollments?.length) {
      const courseIds = (enrollments as EnrollmentRow[]).map((enrollment) => enrollment.course_id);

      const { data: modulesData } = courseIds.length
        ? await supabase.from("modules").select("id, course_id").in("course_id", courseIds)
        : { data: [] };

      const moduleIds = (modulesData as ModuleRow[] | null)?.map((module) => module.id) || [];

      const { data: lessons } = moduleIds.length
        ? await supabase.from("lessons").select("id, module_id").in("module_id", moduleIds)
        : { data: [] };

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed_at")
        .eq("user_id", session.user.id);

      progressCards = (enrollments as EnrollmentRow[]).map((enrollment) => {
        const moduleIdsForCourse = (modulesData as ModuleRow[] | null)
          ?.filter((mod) => mod.course_id === enrollment.course_id)
          .map((mod) => mod.id) || [];
        const lessonsForCourse = (lessons as LessonRow[] | null)?.filter((lesson) => moduleIdsForCourse.includes(lesson.module_id)) || [];
        const completedCount = (progress as ProgressRow[] | null)?.filter((p) =>
          lessonsForCourse.some((lesson) => lesson.id === p.lesson_id && p.completed_at),
        ).length || 0;
        const total = lessonsForCourse.length || 1;
        const completionPercent = (completedCount / total) * 100;
        const status: "on-track" | "at-risk" | "off-track" =
          completionPercent >= 66 ? "on-track" : completionPercent >= 33 ? "at-risk" : "off-track";

        return {
          course: enrollment.courses?.title || "Course",
          completed: completedCount,
          total,
          status,
        };
      });
    }
  }

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
          {session?.user ? (
            <div className="grid gap-4 md:grid-cols-3">
              {progressCards.length ? (
                progressCards.map((item) => <ProgressCard key={item.course} progress={item} />)
              ) : (
                <p className="text-[var(--muted)]">Enroll in a course to start tracking progress.</p>
              )}
            </div>
          ) : (
            <p className="text-[var(--muted)]">Sign in to view your enrollments and progress.</p>
          )}
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
              {liveSessions.length === 0 ? (
                <p className="text-[var(--muted)] text-sm">No live sessions yet. Add them in Supabase or seed data.</p>
              ) : (
                liveSessions.map((session: LiveSessionRow) => (
                  <div key={session.title} className="flex items-start gap-3 rounded-2xl border border-[rgba(20,34,64,0.08)] bg-[rgba(20,34,64,0.02)] px-3 py-3">
                    <Gauge className="h-5 w-5 text-[var(--accent-deep)]" />
                    <div>
                      <p className="font-semibold">{session.title}</p>
                      <p className="text-sm text-[var(--muted)]">{(session as { starts_at?: string }).starts_at || session.cadence}</p>
                      <p className="text-sm text-[var(--muted)]">{session.description || (session as { focus?: string }).focus}</p>
                    </div>
                  </div>
                ))
              )}
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
