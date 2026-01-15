import { getSupabaseServerClient } from "@/lib/supabase-server";
import { courses as fallbackCourses } from "@/data/courses";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const slugify = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

export interface CourseSummary {
  id?: string;
  slug: string;
  title: string;
  description?: string | null;
  duration?: string;
  duration_weeks?: number | null;
  published?: boolean | null;
  language?: string | null;
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

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export interface ProfileSession {
  user: User;
  profile: ProfileRow;
  roles: string[];
}

const allowedRoles = ["admin", "instructor", "faculty", "student", "applicant"] as const;

const normalizeRole = (role?: string | null) => {
  if (!role) return null;
  const normalized = role.toLowerCase();
  return allowedRoles.includes(normalized as (typeof allowedRoles)[number])
    ? (normalized as ProfileRow["role"])
    : null;
};

export async function getCurrentProfile(): Promise<ProfileSession | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const profileSelect =
    "id, display_name, role, first_name, last_name, email, phone, mailing_address_line1, mailing_address_line2, mailing_city, mailing_state, mailing_postal_code, mailing_country, academic_bio, credentials, created_at" as const;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", user.id)
    .maybeSingle();

  const userbaseQuery = supabase.from("userbase").select("id, email, role").limit(1);
  const { data: userbase } =
    user.email
      ? await userbaseQuery.or(`id.eq.${user.id},email.eq.${user.email}`).maybeSingle()
      : await userbaseQuery.eq("id", user.id).maybeSingle();
  const userbaseRole = normalizeRole(userbase?.role);
  const profileRole = normalizeRole(profile?.role);

  const { data: roleRows } = await supabase
    .from("profile_roles")
    .select("roles!inner(slug)")
    .eq("profile_id", user.id);

  const roles =
    roleRows
      ?.map((row: { roles?: { slug?: string | null } | null }) => row.roles?.slug)
      .filter((slug): slug is string => Boolean(slug)) || [];
  if (userbaseRole && !roles.includes(userbaseRole)) {
    roles.push(userbaseRole);
  }
  const effectiveRole = userbaseRole || profileRole || "student";

  const profileData =
    profile ||
    ({
      id: user.id,
      display_name: null,
      role: effectiveRole,
      first_name: null,
      last_name: null,
      email: userbase?.email || user.email || null,
      phone: null,
      mailing_address_line1: null,
      mailing_address_line2: null,
      mailing_city: null,
      mailing_state: null,
      mailing_postal_code: null,
      mailing_country: null,
      academic_bio: null,
      credentials: null,
      created_at: null,
    } satisfies ProfileRow);

  return {
    user,
    profile: {
      ...profileData,
      role: effectiveRole,
      email: profileData.email || userbase?.email || user.email || null,
      academic_bio: profileData.academic_bio ?? null,
      credentials: profileData.credentials ?? null,
    },
    roles,
  };
}

export async function getCatalogCourses(): Promise<CourseSummary[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return fallbackCourses.map((course) => ({
      slug: course.slug,
      title: course.title,
      description: course.description,
      duration: course.duration,
      duration_weeks: undefined,
      published: true,
      language: course.language,
    }));
  }

  const { data, error } = await supabase
    .from("courses")
    .select("id, slug, title, description, published, language, duration_weeks")
    .order("title", { ascending: true });

  if (error || !data) {
    console.warn("Unable to fetch courses", error?.message);
    return fallbackCourses;
  }

  return data;
}

export async function getCourseDetail(slug: string): Promise<CourseDetail | null> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    const fallback = fallbackCourses.find((c) => c.slug === slug);
    if (!fallback) return null;

    return {
      slug: fallback.slug,
      title: fallback.title,
      description: fallback.description,
      duration: fallback.duration,
      duration_weeks: undefined,
      language: fallback.language,
      published: true,
      modules: [
        {
          title: "Course outline",
          position: 1,
          lessons: fallback.lessons.map((lesson, idx) => ({
            slug: lesson.slug || lesson.title.toLowerCase().replace(/\s+/g, "-"),
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
      `id, slug, title, description, language, published, modules(id, title, position, lessons(id, slug, title, position, estimated_minutes, content_path, published))`,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    console.warn("Unable to fetch course", error?.message);
    const fallback = fallbackCourses.find((c) => c.slug === slug);
    if (fallback) {
      return {
        slug: fallback.slug,
        title: fallback.title,
        description: fallback.description,
        language: fallback.language,
        duration: fallback.duration,
        duration_weeks: undefined,
        published: true,
        modules: [
          {
            title: "Course outline",
            position: 1,
            lessons: fallback.lessons.map((lesson, idx) => ({
              slug: lesson.slug || lesson.title.toLowerCase().replace(/\s+/g, "-"),
              title: lesson.title,
              position: idx + 1,
              estimated_minutes: parseInt(lesson.duration, 10) || undefined,
            })),
          },
        ],
      };
    }
    return null;
  }

  const modules = (data.modules || []).map((module: { id?: string; title: string; position?: number | null; lessons?: LessonSummary[] }) => ({
    id: module.id,
    title: module.title,
    position: module.position,
    lessons: (module.lessons || []).sort((a: LessonSummary, b: LessonSummary) => (a.position || 0) - (b.position || 0)),
  }));

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    published: data.published,
    language: data.language,
    duration_weeks: (data as CourseSummary).duration_weeks,
    modules: modules.sort((a, b) => (a.position || 0) - (b.position || 0)),
  };
}

export async function getLessonBySlug(courseSlug: string, lessonSlug: string) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    const course = fallbackCourses.find((c) => c.slug === courseSlug);
    const lesson = course?.lessons.find((l) => (l.slug || slugify(l.title)) === lessonSlug);
    if (!course || !lesson) return null;
    return {
      id: lesson.slug,
      slug: lesson.slug || slugify(lesson.title),
      title: lesson.title,
      estimated_minutes: parseInt(lesson.duration, 10) || undefined,
      course_id: courseSlug,
      course_title: course.title,
      content_path: `lessons/${course.slug}/${lesson.slug || slugify(lesson.title)}.mdx`,
    };
  }

  const { data, error } = await supabase
    .from("courses")
    .select("id, title, modules(id, title, lessons(id, slug, title, position, content_path, estimated_minutes, published))")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (error || !data) {
    console.warn("Unable to fetch lesson", error?.message);
    const course = fallbackCourses.find((c) => c.slug === courseSlug);
    const lesson = course?.lessons.find((l) => (l.slug || slugify(l.title)) === lessonSlug);
    if (!course || !lesson) return null;
    return {
      id: lesson.slug,
      slug: lesson.slug || slugify(lesson.title),
      title: lesson.title,
      estimated_minutes: parseInt(lesson.duration, 10) || undefined,
      course_id: courseSlug,
      course_title: course.title,
      content_path: `lessons/${course.slug}/${lesson.slug || slugify(lesson.title)}.mdx`,
    };
  }

  const lesson =
    data.modules?.flatMap((module: { id: string; lessons?: LessonSummary[] }) =>
      (module.lessons || []).map((l) => ({ ...l, module_id: module.id, course_id: data.id, course_title: data.title })),
    ).find((l) => l.slug === lessonSlug) || null;

  return lesson;
}

export async function getEnrollmentsForUser(userId: string) {
  const supabase = await getSupabaseServerClient();
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
  const supabase = await getSupabaseServerClient();
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
  const supabase = await getSupabaseServerClient();
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
