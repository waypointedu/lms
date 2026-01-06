import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { markLessonComplete } from "@/app/actions/lms";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getLessonBySlug, getCurrentProfile, getCourseDetail, getLessonProgress } from "@/lib/queries";
import { getMarkdownByPath } from "@/lib/markdown";
import { getSupabaseServerClient } from "@/lib/supabase-server";

async function ensureEnrollment(courseId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { isEnrolled: true, userId: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isEnrolled: false, userId: null };

  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .maybeSingle();

  return { isEnrolled: Boolean(data), userId: user.id };
}

export default async function LessonPage({ params }: { params: { slug: string; lesson: string } }) {
  const lesson = await getLessonBySlug(params.slug, params.lesson);
  if (!lesson) return notFound();

  const enrollment = await ensureEnrollment(lesson.course_id);

  if (!enrollment.isEnrolled) {
    redirect(`/courses/${params.slug}`);
  }

  const session = await getCurrentProfile();
  const markdown = lesson.content_path ? await getMarkdownByPath(lesson.content_path) : null;
  const lessonProgress = session?.user ? await getLessonProgress(session.user.id) : [];
  const isCompleted = lessonProgress.some((row) => row.lesson_id === (lesson.id || lesson.slug));

  const courseDetail = await getCourseDetail(params.slug);
  const courseLessons =
    courseDetail?.modules
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .flatMap((module) =>
        module.lessons
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .map((lessonItem) => ({ ...lessonItem, moduleTitle: module.title })),
      ) || [];
  const currentIndex = courseLessons.findIndex((item) => item.slug === params.lesson);
  const nextLesson = currentIndex >= 0 ? courseLessons[currentIndex + 1] : null;

  return (
    <div>
      <SiteHeader />
      <main className="container py-14 space-y-10">
        <div className="space-y-2">
          <p className="pill w-fit">Lesson</p>
          <h1 className="text-4xl font-bold">{lesson.title}</h1>
          <p className="text-[var(--muted)]">{lesson.estimated_minutes || 15} min • {lesson.course_title}</p>
        </div>

        <div className="card p-6 space-y-4">
          {markdown ? (
            <article className="prose prose-blue max-w-none">
              <ReactMarkdown>{markdown.content}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-[var(--muted)]">Content file not found. Confirm `content_path` exists in the repo.</p>
          )}
          {isCompleted ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--muted)]">Nice work! You marked this lesson as done.</p>
              <Link
                href={nextLesson ? `/courses/${params.slug}/lessons/${nextLesson.slug}` : `/courses/${params.slug}`}
                className="button-primary"
              >
                {nextLesson ? "Next lesson" : "Back to course"}
              </Link>
            </div>
          ) : (
            <form
              action={async () => {
                await markLessonComplete(lesson.id || lesson.slug, params.slug, params.lesson);
              }}
              className="flex items-center justify-between gap-3"
            >
              <p className="text-sm text-[var(--muted)]">Click to mark this lesson complete and unlock the next step.</p>
              <button type="submit" className="button-primary">Mark done</button>
            </form>
          )}
          <div className="rounded-xl border border-[rgba(20,34,64,0.08)] bg-[rgba(20,34,64,0.03)] p-4 space-y-1">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">What’s next</p>
            {nextLesson ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{nextLesson.title}</p>
                  <p className="text-sm text-[var(--muted)]">Up next in {nextLesson.moduleTitle}. Jump in when you’re ready.</p>
                </div>
                <Link href={`/courses/${params.slug}/lessons/${nextLesson.slug}`} className="button-secondary">
                  Open checkpoint
                </Link>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                You’ve reached the end of this track. Head back to the course page to review checkpoints or request your certificate.
              </p>
            )}
          </div>
          <p className="text-xs text-[var(--muted)]">
            Session: {session?.user ? "Signed in" : "Anonymous"}. Lesson gating uses Supabase RLS; ensure migrations are applied.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
