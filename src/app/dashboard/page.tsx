import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentProfile } from "@/lib/queries";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type EnrollmentRow = { course_id: string; courses?: { title?: string; slug?: string | null } | null };
type ModuleRow = { id: string; course_id: string; title?: string | null; position?: number | null };
type LessonRow = { id: string; module_id: string; title?: string | null; position?: number | null; slug?: string | null };
type ProgressRow = { lesson_id: string; completed_at: string | null };
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
  const hasNextLesson = Boolean(course.slug && course.nextLessonSlug);
  const continueHref = hasNextLesson
    ? `/courses/${course.slug}/lessons/${course.nextLessonSlug}`
    : course.slug
      ? `/courses/${course.slug}`
      : "/courses";

  return (
    <Link href={continueHref} className="button-secondary w-full text-center">
      Open course
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await getCurrentProfile();
  const supabase = await getSupabaseServerClient();

  let progressCards: CourseProgress[] = [];
  let roster: EnrollmentRosterRow[] = [];
  let summaryStats = { active: 0 };

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

    const hasAdminRole = (session.roles || []).includes("admin") || session.profile.role === "admin";
    const hasFacultyRole = (session.roles || []).includes("faculty") || session.profile.role === "faculty";
    if (hasAdminRole || hasFacultyRole) {
      const { data: rosterData } = await supabase
        .from("enrollments")
        .select("id, status, cohort_label, courses(title, slug), profiles(display_name)")
        .order("enrolled_at", { ascending: false });
      roster = (rosterData as EnrollmentRosterRow[] | null) || [];
    }
  }

  summaryStats = {
    active: roster.length || progressCards.length,
  };

  const roles = session?.roles || [];
  const profileRole = session?.profile?.role || "student";
  const hasAdmin = roles.includes("admin") || profileRole === "admin";
  const hasFaculty = roles.includes("faculty") || profileRole === "faculty";
  const isStaff = hasAdmin || hasFaculty;
  const isAdmin = hasAdmin;
  const completedLessons = progressCards.reduce((total, card) => total + card.completed, 0);
  const totalLessons = progressCards.reduce((total, card) => total + card.total, 0);
  const overallCompletion = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const currentCourse = progressCards.find((card) => card.completed < card.total) || progressCards[0];

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
                  <h1 className="text-4xl font-bold mt-3">Course management</h1>
                  <p className="text-[var(--muted)] max-w-2xl">
                    Organize courses and track learner progress.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/courses" className="button-secondary">
                    View pathway
                  </Link>
                  <Link href="/admin" className="button-primary">
                    Open course builder
                  </Link>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="card p-5 space-y-2">
                  <p className="text-sm font-semibold text-[var(--accent-deep)]">Active learners</p>
                  <h3 className="text-2xl font-bold">{summaryStats.active}</h3>
                  <p className="text-[var(--muted)] text-sm">Learners enrolled in the pathway.</p>
                </div>
                <div className="card p-5 space-y-2">
                  <p className="text-sm font-semibold text-[var(--accent-deep)]">Course setup</p>
                  <p className="text-[var(--muted)] text-sm">
                    Define weeks, lessons, and uploads.
                  </p>
                  <Link href="/admin" className="button-secondary w-fit">
                    Start a course
                  </Link>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeader
                eyebrow="Learners"
                title="Enrollment roster"
                description="Visible to admins and instructors only."
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
                  <p className="text-[var(--muted)]">No learners enrolled yet.</p>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="pill">Learner dashboard</p>
                  <h1 className="text-4xl font-bold mt-3">Your pathway</h1>
                  <p className="text-[var(--muted)] max-w-2xl">
                    Everything you need for your program in one place.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/courses" className="button-secondary">
                    View pathway
                  </Link>
                  <Link href="/courses" className="button-primary">
                    Open courses
                  </Link>
                </div>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              <div className="card p-6 space-y-2">
                <p className="text-xs font-semibold text-[var(--muted)]">Program progress</p>
                <p className="text-3xl font-bold">{overallCompletion}%</p>
                <p className="text-sm text-[var(--muted)]">Updates as lessons are completed.</p>
              </div>
              <div className="card p-6 space-y-2">
                <p className="text-xs font-semibold text-[var(--muted)]">Current course</p>
                <p className="text-lg font-semibold">{currentCourse?.course || "No course yet"}</p>
                <p className="text-sm text-[var(--muted)]">{currentCourse?.nextLesson || "No lessons assigned yet."}</p>
              </div>
              <div className="card p-6 space-y-2">
                <p className="text-xs font-semibold text-[var(--muted)]">Projected graduation</p>
                <p className="text-lg font-semibold">Not available yet</p>
                <p className="text-sm text-[var(--muted)]">Calculated when durations are set.</p>
              </div>
            </section>

            <section className="space-y-6">
              <SectionHeader
                eyebrow="Pathway"
                title="All courses in your program"
                description="Your pathway appears here when enrolled."
              />
              {session?.user ? (
                progressCards.length ? (
                  <div className="card p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-[var(--muted)]">
                            <th className="py-2 pr-4">Course</th>
                            <th className="py-2 pr-4">Progress</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4">Grade</th>
                            <th className="py-2 pr-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(20,34,64,0.08)]">
                          {progressCards.map((item) => {
                            const completion = Math.round((item.completed / item.total) * 100);
                            const isCurrent = currentCourse?.courseId && item.courseId === currentCourse.courseId;
                            return (
                              <tr key={item.course} className={isCurrent ? "bg-[rgba(20,34,64,0.03)]" : undefined}>
                                <td className="py-3 pr-4 font-semibold text-[var(--ink)]">{item.course}</td>
                                <td className="py-3 pr-4 text-[var(--muted)]">
                                  {item.completed} of {item.total} lessons ({completion}%)
                                </td>
                                <td className="py-3 pr-4 capitalize">{item.status.replace(/_/g, " ")}</td>
                                <td className="py-3 pr-4 text-[var(--muted)]">—</td>
                                <td className="py-3 pr-4">
                                  <StudentCourseCard course={item} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-[var(--muted)]">No courses yet. Your pathway will appear once you are enrolled.</p>
                )
              ) : (
                <p className="text-[var(--muted)]">Sign in to view your enrollments and progress.</p>
              )}
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
