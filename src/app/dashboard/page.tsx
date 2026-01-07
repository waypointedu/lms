import { FileCheck, Gauge, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { SectionHeader } from "@/components/ui/section-header";
import { checkInPrompts } from "@/data/courses";
import { getCurrentProfile, getLiveSessions } from "@/lib/queries";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type EnrollmentRow = { course_id: string; courses?: { title?: string; slug?: string | null } | null };
type ModuleRow = { id: string; course_id: string; title?: string | null; position?: number | null };
type LessonRow = { id: string; module_id: string; title?: string | null; position?: number | null; slug?: string | null };
type ProgressRow = { lesson_id: string; completed_at: string | null };
type LiveSessionRow = { title: string; starts_at?: string | null; description?: string | null; cadence?: string; focus?: string };
type CheckpointRow = { id: string; course_id: string; title: string; week_number: number; due_on?: string | null };
type CheckpointProgressRow = { checkpoint_id: string; status: string; completed_at?: string | null };
type CapstoneRow = { id: string; status: string; completed_at?: string | null; course_id: string; enrollment_id: string };
type EnrollmentRosterRow = { id: string; status: string; cohort_label?: string | null; courses?: { title?: string | null; slug?: string | null } | null; profiles?: { display_name?: string | null } | null };

type CourseProgress = {
  course: string;
  courseId?: string;
  slug?: string | null;
  completed: number;
  total: number;
  status: "on-track" | "behind" | "ready";
  nextLesson?: string;
  nextLessonSlug?: string | null;
};

function StudentCourseCard({ course }: { course: CourseProgress }) {
  const completion = Math.round((course.completed / course.total) * 100);
  const hasNextLesson = Boolean(course.slug && course.nextLessonSlug);
  const continueHref = hasNextLesson
    ? `/courses/${course.slug}/lessons/${course.nextLessonSlug}`
    : course.slug
      ? `/courses/${course.slug}`
      : "/courses";

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--muted)]">Course</p>
          <h4 className="text-lg font-semibold text-[var(--ink)]">{course.course}</h4>
        </div>
        <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold text-[var(--accent-deep)]">
          {completion}% complete
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[var(--ink)]">Next lesson</p>
        <p className="text-sm text-[var(--muted)]">{course.nextLesson || "All lessons completed"}</p>
      </div>
      <div className="h-3 w-full rounded-full bg-[rgba(20,34,64,0.08)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-deep),var(--accent))] transition-all"
          style={{ width: `${completion}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-[var(--muted)]">
        <span>Progress</span>
        <span className="font-semibold text-[var(--accent-deep)]">{completion}%</span>
      </div>
      <Link href={continueHref} className="button-primary w-full text-center">
        Continue
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getCurrentProfile();
  const supabase = await getSupabaseServerClient();

  let progressCards: CourseProgress[] = [];
  let checkpointSummary: Array<{ title: string; week: number; due_on?: string | null; status: string }> = [];
  let capstoneStatus: { status: string; completed_at?: string | null } | null = null;
  let roster: EnrollmentRosterRow[] = [];
  let summaryStats = { active: 0, behind: 0, ready: 0 };
  const liveSessions = (await getLiveSessions()) as LiveSessionRow[];

  if (supabase && session?.user) {
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("course_id, courses(id, slug, title)")
      .eq("user_id", session.user.id);

    if (!enrollmentError && enrollments?.length) {
      const courseIds = (enrollments as EnrollmentRow[]).map((enrollment) => enrollment.course_id);

      const { data: modulesData } = courseIds.length
        ? await supabase.from("modules").select("id, course_id, title, position").in("course_id", courseIds)
        : { data: [] };

      const moduleIds = (modulesData as ModuleRow[] | null)?.map((module) => module.id) || [];

      const { data: lessons } = moduleIds.length
        ? await supabase.from("lessons").select("id, module_id, title, position, slug").in("module_id", moduleIds)
        : { data: [] };

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed_at")
        .eq("user_id", session.user.id);

      progressCards = (enrollments as EnrollmentRow[]).map((enrollment) => {
        const moduleIdsForCourse = (modulesData as ModuleRow[] | null)
          ?.filter((mod) => mod.course_id === enrollment.course_id)
          .map((mod) => mod.id) || [];

        const modulePositions = new Map<string, number>();
        (modulesData as ModuleRow[] | null)?.forEach((mod) => {
          modulePositions.set(mod.id, mod.position || 0);
        });

        const lessonsForCourse =
          (lessons as LessonRow[] | null)
            ?.filter((lesson) => moduleIdsForCourse.includes(lesson.module_id))
            .sort((a, b) => {
              const modulePositionDiff = (modulePositions.get(a.module_id) || 0) - (modulePositions.get(b.module_id) || 0);
              if (modulePositionDiff !== 0) return modulePositionDiff;
              return (a.position || 0) - (b.position || 0);
            }) || [];

        const completedLessonIds = new Set(
          (progress as ProgressRow[] | null)
            ?.filter((p) => p.completed_at)
            .map((p) => p.lesson_id),
        );
        const completedCount = lessonsForCourse.filter((lesson) => completedLessonIds.has(lesson.id)).length;
        const total = lessonsForCourse.length || 1;
        const completionPercent = (completedCount / total) * 100;
        const status: "on-track" | "behind" | "ready" =
          completionPercent >= 90 ? "ready" : completionPercent >= 50 ? "on-track" : "behind";
        const nextLesson = lessonsForCourse.find((lesson) => !completedLessonIds.has(lesson.id));

        return {
          course: enrollment.courses?.title || "Course",
          courseId: enrollment.course_id,
          completed: completedCount,
          total,
          status,
          slug: enrollment.courses?.slug,
          nextLesson: nextLesson?.title || (lessonsForCourse.length ? "All lessons completed" : "No lessons added yet"),
          nextLessonSlug: nextLesson?.slug || nextLesson?.id,
        };
      });
    }

    const courseIds = progressCards.map((card) => card.courseId).filter(Boolean) as string[];

    const { data: checkpoints } = courseIds.length
      ? await supabase
          .from("checkpoints")
          .select("id, course_id, title, week_number, due_on")
          .in("course_id", courseIds)
          .order("week_number", { ascending: true })
      : { data: [] as CheckpointRow[] };

    const { data: checkpointProgress } = session.user
      ? await supabase
          .from("checkpoint_progress")
          .select("checkpoint_id, status, completed_at")
          .eq("user_id", session.user.id)
      : { data: [] as CheckpointProgressRow[] };

    const checkpointStatus = new Map(
      (checkpointProgress || []).map((row) => [row.checkpoint_id, row.status || "not_started"]),
    );

    checkpointSummary = (checkpoints as CheckpointRow[] | null)?.map((checkpoint) => ({
      title: checkpoint.title,
      week: checkpoint.week_number,
      due_on: checkpoint.due_on,
      status: checkpointStatus.get(checkpoint.id) || "not_started",
    })) || [];

    const { data: capstones } = courseIds.length
      ? await supabase
          .from("capstones")
          .select("id, status, completed_at, course_id, enrollment_id")
          .in("course_id", courseIds)
          .eq("student_id", session.user.id)
      : { data: [] as CapstoneRow[] };

    capstoneStatus = (capstones as CapstoneRow[] | null)?.[0]
      ? { status: (capstones as CapstoneRow[])[0].status, completed_at: (capstones as CapstoneRow[])[0].completed_at }
      : null;

    const derivedRole = (session.roles?.[0] || session.profile.role || "").toLowerCase();
    if (derivedRole === "faculty" || derivedRole === "admin") {
      const { data: rosterData } = await supabase
        .from("enrollments")
        .select("id, status, cohort_label, courses(title, slug), profiles(display_name)")
        .order("enrolled_at", { ascending: false });
      roster = (rosterData as EnrollmentRosterRow[] | null) || [];
    }
  }

  if (!checkpointSummary.length) {
    checkpointSummary = [
      { title: "Week 4: Practicing Sabbath", week: 4, status: "not_started", due_on: undefined },
      { title: "Week 8: Culture listening lab", week: 8, status: "not_started", due_on: undefined },
    ];
  }

  if (!progressCards.length) {
    progressCards = [
      {
        course: "Year One / Certificate in Biblical Formation",
        completed: 3,
        total: 8,
        status: "on-track",
        nextLesson: "Prayer, Sabbath, and community rhythms",
        nextLessonSlug: "formation-rhythms",
      },
    ];
  }

  summaryStats = {
    active: roster.length || progressCards.length,
    behind: progressCards.filter((card) => card.status === "behind").length,
    ready: progressCards.filter((card) => card.status === "ready").length,
  };

  const derivedRole = (session?.roles?.[0] || session?.profile?.role || "student").toLowerCase();
  const isStaff = derivedRole === "faculty" || derivedRole === "admin";
  const isAdmin = derivedRole === "admin";

  return (
    <div>
      <SiteHeader />
      <main className="container space-y-14 py-12">
        {isStaff ? (
          <>
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="pill">{isAdmin ? "Admin dashboard" : "Faculty dashboard"}</p>
                  <h1 className="text-4xl font-bold mt-3">Waypoint Learning Pathway</h1>
                  <p className="text-[var(--muted)] max-w-2xl">
                    Manage enrollments, checkpoint progress, and capstone conversations. Students never see admin links or rosters.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/courses" className="button-secondary">
                    View pathway
                  </Link>
                  <Link href="/admin" className="button-primary">
                    Open admin tools
                  </Link>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="card p-5 space-y-2">
                  <div className="flex items-center gap-3 text-[var(--accent-deep)]">
                    <div className="rounded-2xl bg-[var(--accent-light)] p-2">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold">Active learners</p>
                  </div>
                  <h3 className="text-xl font-bold">{summaryStats.active}</h3>
                  <p className="text-[var(--muted)] text-sm">Enrolled across the pathway</p>
                </div>
                <div className="card p-5 space-y-2">
                  <div className="flex items-center gap-3 text-[var(--accent-deep)]">
                    <div className="rounded-2xl bg-[var(--accent-light)] p-2">
                      <Gauge className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold">Behind checkpoints</p>
                  </div>
                  <h3 className="text-xl font-bold">{summaryStats.behind}</h3>
                  <p className="text-[var(--muted)] text-sm">Need a faculty nudge</p>
                </div>
                <div className="card p-5 space-y-2">
                  <div className="flex items-center gap-3 text-[var(--accent-deep)]">
                    <div className="rounded-2xl bg-[var(--accent-light)] p-2">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold">Ready for capstone</p>
                  </div>
                  <h3 className="text-xl font-bold">{summaryStats.ready}</h3>
                  <p className="text-[var(--muted)] text-sm">Invite to schedule conversations</p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <SectionHeader
                eyebrow="Progress"
                title="Checkpoint and lesson completion"
                description="Progress pulls directly from Supabase enrollments, lessons, and checkpoint progress."
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

            <section className="space-y-4">
              <SectionHeader
                eyebrow="Rosters"
                title="Who is active this week"
                description="Filtered by your role. Students never see this list."
              />
              <div className="card p-6 space-y-3">
                {roster.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-[var(--muted)]">
                          <th className="py-2 pr-4">Learner</th>
                          <th className="py-2 pr-4">Course</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Cohort</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(20,34,64,0.08)]">
                        {roster.map((row) => (
                          <tr key={row.id}>
                            <td className="py-2 pr-4">{row.profiles?.display_name || "Student"}</td>
                            <td className="py-2 pr-4">{row.courses?.title || "Course"}</td>
                            <td className="py-2 pr-4 capitalize">{row.status}</td>
                            <td className="py-2 pr-4">{row.cohort_label || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[var(--muted)]">No enrollments found yet.</p>
                )}
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
          </>
        ) : (
          <>
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="pill">Learner dashboard</p>
                  <h1 className="text-4xl font-bold mt-3">Stay on track</h1>
                  <p className="text-[var(--muted)] max-w-2xl">
                    See your courses, checkpoints, and capstone status in one place. Admin and faculty tools stay hidden unless you have that role.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/courses" className="button-secondary">
                    Browse catalog
                  </Link>
                  <Link href="/#check-in" className="button-primary">
                    Check-in
                  </Link>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <SectionHeader
                eyebrow="Your courses"
                title="Continue where you left off"
                description="Course cards show the next lesson, progress, and a single continue action for each enrollment."
              />
              {session?.user ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {progressCards.length ? (
                    progressCards.map((item) => <StudentCourseCard key={item.course} course={item} />)
                  ) : (
                    <p className="text-[var(--muted)]">Enroll in a course to start tracking progress.</p>
                  )}
                </div>
              ) : (
                <p className="text-[var(--muted)]">Sign in to view your enrollments and progress.</p>
              )}
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div className="card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Checkpoint status</h3>
                  <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold text-[var(--accent-deep)]">
                    Weekly rhythm
                  </span>
                </div>
                <div className="space-y-3">
                  {checkpointSummary.map((checkpoint) => (
                    <div key={`${checkpoint.title}-${checkpoint.week}`} className="flex items-center justify-between rounded-2xl border border-[rgba(20,34,64,0.08)] bg-white px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          Week {checkpoint.week}: {checkpoint.title}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {checkpoint.due_on ? `Due ${new Date(checkpoint.due_on).toLocaleDateString()}` : "Scheduled"}
                        </p>
                      </div>
                      <span className="pill capitalize">{checkpoint.status.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[var(--muted)]">Capstone</p>
                    <h3 className="text-xl font-semibold">Conversation readiness</h3>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-[var(--accent-deep)]" />
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Schedule a capstone conversation once your checkpoints are complete. Faculty will confirm the slot and record the outcome.
                </p>
                <div className="flex items-center gap-2 rounded-2xl bg-[rgba(20,34,64,0.04)] px-4 py-3 text-sm">
                  <div className={`h-2 w-2 rounded-full ${capstoneStatus?.status === "passed" ? "bg-green-600" : "bg-[var(--accent-deep)]"}`} />
                  <span className="font-semibold text-[var(--ink)]">Status:</span>
                  <span className="text-[var(--muted)] capitalize">{capstoneStatus?.status || "not started"}</span>
                </div>
                <Link href="/capstone" className="button-secondary w-full text-center">
                  View capstone steps
                </Link>
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
              <div className="space-y-4">
                <div className="card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[var(--muted)]">Check-in</p>
                      <h3 className="text-xl font-semibold">Share today&apos;s update</h3>
                    </div>
                    <FileCheck className="h-5 w-5 text-[var(--accent-deep)]" />
                  </div>
                  <p className="text-sm text-[var(--muted)]">Use the single check-in to capture progress, blockers, or links to your latest submission.</p>
                  <Link href="/#check-in" className="button-primary w-full text-center">
                    Record check-in
                  </Link>
                </div>
                <div className="card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[var(--muted)]">Capstone</p>
                      <h3 className="text-xl font-semibold">Status: {capstoneStatus?.status || "not scheduled"}</h3>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-[var(--accent-deep)]" />
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    Schedule your capstone conversation once your checkpoints are marked complete. Faculty will confirm the slot and record the outcome.
                  </p>
                  <div className="flex items-center gap-2 rounded-2xl bg-[rgba(20,34,64,0.04)] px-4 py-3 text-sm">
                    <div className={`h-2 w-2 rounded-full ${capstoneStatus?.status === "passed" ? "bg-green-600" : "bg-[var(--accent-deep)]"}`} />
                    <span className="font-semibold text-[var(--ink)]">Next step:</span>
                    <span className="text-[var(--muted)]">Request a capstone time or upload your testimony outline.</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
