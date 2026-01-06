import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { markLessonComplete } from "@/app/actions/lms";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getLessonBySlug, getCurrentProfile } from "@/lib/queries";
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

  const markdown = lesson.content_path ? await getMarkdownByPath(lesson.content_path) : null;
  const session = await getCurrentProfile();

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
            <p className="text-[var(--muted)]">Content not found yet. We’ll have this lesson ready soon.</p>
          )}
          <form
            action={async () => {
              await markLessonComplete(lesson.id || lesson.slug);
            }}
            className="flex gap-3"
          >
            <button type="submit" className="button-primary">Mark complete</button>
            <Link href={`/courses/${params.slug}`} className="button-secondary">
              Back to course
            </Link>
          </form>
          <p className="text-xs text-[var(--muted)]">
            Session: {session?.user ? "Signed in" : "Anonymous"}. Lessons unlock when you’re enrolled and signed in.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
