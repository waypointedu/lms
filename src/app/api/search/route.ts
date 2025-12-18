import { NextResponse } from "next/server";

import { courses as fallbackCourses } from "@/data/courses";
import { listCourseMarkdown } from "@/lib/markdown";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const language = searchParams.get("language") || undefined;

  if (!q) {
    return NextResponse.json({ courses: [], lessons: [] });
  }

  const supabase = await getSupabaseServerClient();

  if (supabase) {
    const courseQuery = supabase
      .from("courses")
      .select("id, slug, title, description, language")
      .ilike("title", `%${q}%`)
      .order("title");

    if (language) courseQuery.eq("language", language);

    const { data: courseRows, error: courseError } = await courseQuery;

    const lessonQuery = supabase
      .from("lessons")
      .select("id, slug, title, content_path, modules(course_id, courses(slug, title, language))")
      .or(`title.ilike.%${q}%,content_path.ilike.%${q}%`)
      .limit(25);

    const { data: lessonRows, error: lessonError } = await lessonQuery;

    if (!courseError && !lessonError) {
      const courses = (courseRows || []).filter((course: { language: string | null }) =>
        language ? course.language === language : true,
      );

      const lessons = (lessonRows || []).filter((lesson: { modules?: { courses?: { language: string | null } | null } | null }) => {
        const courseLanguage = lesson.modules?.courses?.language ?? undefined;
        return language ? courseLanguage === language : true;
      });

      return NextResponse.json({ courses, lessons });
    }
  }

  // Fallback: in-repo content
  const mdxSlugs = await listCourseMarkdown();
  const mdxSet = new Set(mdxSlugs);

  const courses = fallbackCourses
    .filter((course) => (language ? course.language === language : true))
    .filter((course) => {
      const haystack = `${course.title} ${course.description}`.toLowerCase();
      return haystack.includes(q.toLowerCase());
    });

  const lessons = fallbackCourses
    .filter((course) => (language ? course.language === language : true))
    .flatMap((course) =>
      course.lessons
        .filter((lesson) => lesson.title.toLowerCase().includes(q.toLowerCase()))
        .map((lesson) => ({
          title: lesson.title,
          slug: lesson.slug || lesson.title.toLowerCase().replace(/\s+/g, "-"),
          courseSlug: mdxSet.has(course.slug) ? course.slug : undefined,
          courseTitle: course.title,
          language: course.language,
        })),
    );

  return NextResponse.json({ courses, lessons });
}
