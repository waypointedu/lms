import Link from "next/link";
import { enrollInCourse } from "@/app/actions/lms";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";
import { getCourseDetail, getCurrentProfile, getLessonProgress } from "@/lib/queries";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { LessonSummary } from "@/lib/queries";

async function fetchEnrollment(courseId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(data);
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await getCourseDetail(params.slug);
  if (!course) {
    return (
      <div>
        <SiteHeader />
        <main className="container py-14 space-y-6">
          <SectionHeader
            eyebrow="Course"
            title="Course not available"
            description="This pathway outline is not ready yet. Check back soon."
          />
          <Link href="/courses" className="button-secondary w-fit">
            Back to courses
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const session = await getCurrentProfile();
  const isEnrolled = course.id ? await fetchEnrollment(course.id) : false;
  const lessonProgress = session?.user ? await getLessonProgress(session.user.id) : [];

  const lessonProgressIds = new Set(lessonProgress.map((progress) => progress.lesson_id));
  const linearLessons = course.modules
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .flatMap((module) =>
      module.lessons
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((lesson, idx) => ({
          ...lesson,
          moduleTitle: module.title,
          modulePosition: module.position ?? 0,
          order: `${module.position ?? 0}.${lesson.position ?? idx + 1}`,
        })),
    );

  const isLessonComplete = (lesson: LessonSummary) => lessonProgressIds.has(lesson.id || lesson.slug);
  const nextLesson = linearLessons.find((lesson) => !isLessonComplete(lesson)) || linearLessons.at(-1);

  return (
    <div>
      <SiteHeader />
      <main className="container py-14 space-y-12">
        <SectionHeader
          eyebrow="Course"
          title={course.title}
          description={course.description || "Published track"}
        />

        <div className="flex flex-wrap gap-3 items-center">
          <span className="pill">Course ID: {course.slug}</span>
          {course.language ? <span className="pill">Language: {course.language.toUpperCase()}</span> : null}
          {course.published ? (
            <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-[var(--accent-deep)] font-semibold">
              Published
            </span>
          ) : (
            <span className="rounded-full bg-[rgba(20,34,64,0.06)] px-3 py-1 text-[var(--muted)] font-semibold">
              Draft
            </span>
          )}
        </div>

        {course.id ? (
          <form
            action={async () => {
              await enrollInCourse(course.id!);
            }}
            className="flex gap-3"
          >
            <button type="submit" className="button-primary" disabled={isEnrolled}>
              {isEnrolled ? "Enrolled" : "Enroll"}
            </button>
            <Link href="/dashboard" className="button-secondary">
              Go to dashboard
            </Link>
          </form>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Lessons</h2>
            <p className="text-sm text-[var(--muted)]">Follow the sequence below to stay on track.</p>
          </div>
          {linearLessons.length === 0 ? (
            <div className="card p-5 text-[var(--muted)]">No modules yet. Add modules via Supabase or seed data.</div>
          ) : (
            <ol className="space-y-2">
              {linearLessons.map((lesson, index) => {
                const completed = isLessonComplete(lesson);
                const isNext = nextLesson?.slug === lesson.slug;
                const ctaLabel = completed ? "Review" : isNext ? "Start" : "Continue";

                return (
                  <li key={lesson.slug} className="card px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 flex items-center justify-center rounded-full bg-[rgba(20,34,64,0.06)] text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm text-[var(--muted)]">
                          Module {lesson.modulePosition || "—"} · {lesson.moduleTitle}
                        </p>
                        <p className="font-semibold">{lesson.title}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {lesson.estimated_minutes ? `${lesson.estimated_minutes} min` : "Lesson"} · {ctaLabel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {completed ? <span className="pill bg-[rgba(20,34,64,0.06)] text-[var(--muted)]">Completed</span> : null}
                      <Link
                        className={isNext ? "button-primary" : "button-secondary"}
                        href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                        aria-disabled={!isEnrolled && !!session?.user}
                      >
                        {isEnrolled || !session?.user ? ctaLabel : "Enroll to view"}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
