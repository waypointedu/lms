import Link from "next/link";
import { notFound } from "next/navigation";

import { enrollInCourse } from "@/app/actions/lms";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";
import { getCourseDetail, getCurrentProfile } from "@/lib/queries";
import { getSupabaseServerClient } from "@/lib/supabase-server";

async function fetchEnrollment(courseId: string) {
  const supabase = getSupabaseServerClient();
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
  if (!course) return notFound();

  const session = await getCurrentProfile();
  const isEnrolled = course.id ? await fetchEnrollment(course.id) : false;

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
          <span className="pill">Slug: {course.slug}</span>
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
          <form action={async () => enrollInCourse(course.id!)} className="flex gap-3">
            <button type="submit" className="button-primary" disabled={isEnrolled}>
              {isEnrolled ? "Enrolled" : "Enroll"}
            </button>
            <Link href="/dashboard" className="button-secondary">
              Go to dashboard
            </Link>
          </form>
        ) : null}

        <div className="grid gap-4">
          {course.modules.map((module) => (
            <div key={module.title} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{module.title}</h3>
                <span className="text-sm text-[var(--muted)]">Module {module.position}</span>
              </div>
              <div className="space-y-2">
                {module.lessons.map((lesson) => (
                  <div key={lesson.slug} className="flex items-center justify-between rounded-xl border border-[rgba(20,34,64,0.08)] bg-white px-3 py-3">
                    <div>
                      <p className="font-semibold">{lesson.title}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {lesson.estimated_minutes ? `${lesson.estimated_minutes} min` : "Lesson"}
                      </p>
                    </div>
                    <Link
                      className="button-secondary"
                      href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                      aria-disabled={!isEnrolled && !!session?.user}
                    >
                      {isEnrolled || !session?.user ? "Open" : "Enroll to view"}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
