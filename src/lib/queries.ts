import { getSupabaseServerClient } from "@/lib/supabase-server";
import { courses as fallbackCourses } from "@/data/courses";

export interface CourseSummary {
  id?: string;
  slug: string;
  title: string;
  description?: string | null;
  duration?: string;
  published?: boolean | null;
  tags?: string[];
}

export interface LessonSummary {
  id?: string;
  slug: string;
  title: string;
  position?: number | null;
  estimated_minutes?: number | null;
  content_path?: string | null;
}

export interface CourseDetail extends CourseSummary {
  modules: Array<{
    id?: string;
    title: string;
    position?: number | null;
    lessons: LessonSummary[];
  }>;
}

export async function getCurrentProfile() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return profile ? { user, profile } : { user, profile: null };
}

export async function getCatalogCourses(): Promise<CourseSummary[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return fallbackCourses.map((course) => ({
      slug: course.slug,
      title: course.title,
      description: course.description,
      duration: course.duration,
      published: true,
      tags: course.tags,
    }));
  }

  const { data, error } = await supabase
    .from("courses")
    .select("id, slug, title, description, published")
    .order("title", { ascending: true });

  if (error || !data) {
    console.warn("Unable to fetch courses", error?.message);
    return [];
  }

  return data;
}

export async function getCourseDetail(slug: string): Promise<CourseDetail | null> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const fallback = fallbackCourses.find((c) => c.slug === slug);
    if (!fallback) return null;

    return {
      slug: fallback.slug,
      title: fallback.title,
      description: fallback.description,
      duration: fallback.duration,
      tags: fallback.tags,
      modules: [
        {
          title: "Course outline",
          position: 1,
          lessons: fallback.lessons.map((lesson, idx) => ({
            slug: `lesson-${idx + 1}`,
            title: lesson.title,
            position: idx + 1,
            estimated_minutes: parseInt(lesson.duration, 10) || undefined,
          })),
        },
      ],
    };
  }

  const { data, error } = await supabase
    .from("courses")
    .select(
      `id, slug, title, description, published, modules(id, title, position, lessons(id, slug, title, position, estimated_minutes, content_path, published))`,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    console.warn("Unable to fetch course", error?.message);
    return null;
  }

  const modules = (data.modules || []).map((module) => ({
    id: module.id,
    title: module.title,
    position: module.position,
    lessons: (module.lessons || []).sort((a, b) => (a.position || 0) - (b.position || 0)),
  }));

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    published: data.published,
    modules: modules.sort((a, b) => (a.position || 0) - (b.position || 0)),
  };
}

export async function getLessonBySlug(courseSlug: string, lessonSlug: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("courses")
    .select("id, title, modules(id, title, lessons(id, slug, title, position, content_path, estimated_minutes, published))")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (error || !data) {
    console.warn("Unable to fetch lesson", error?.message);
    return null;
  }

  const lesson =
    data.modules?.flatMap((module) =>
      (module.lessons || []).map((l) => ({ ...l, module_id: module.id, course_id: data.id, course_title: data.title })),
    ).find((l) => l.slug === lessonSlug) || null;

  return lesson;
}

export async function getEnrollmentsForUser(userId: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select("id, course_id, status, enrolled_at, courses(id, slug, title, description, published)")
    .eq("user_id", userId);

  if (error || !data) {
    console.warn("Unable to fetch enrollments", error?.message);
    return [];
  }

  return data;
}

export async function getLessonProgress(userId: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed_at, last_viewed_at, user_id");

  if (error || !data) {
    console.warn("Unable to fetch lesson progress", error?.message);
    return [];
  }

  return data.filter((row) => row.user_id === userId);
}

export async function getLiveSessions(courseId?: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const query = supabase
    .from("live_sessions")
    .select("id, course_id, title, starts_at, join_url, description")
    .order("starts_at", { ascending: true });

  const { data, error } = await (courseId ? query.eq("course_id", courseId) : query);

  if (error || !data) {
    console.warn("Unable to fetch live sessions", error?.message);
    return [];
  }

  return data;
}
