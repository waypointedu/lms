import type { SupabaseClient } from "@supabase/supabase-js";

type CourseRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  published: boolean;
};

type CourseEnrollmentRow = {
  course_id: string;
  status: string | null;
};

export type CourseSummary = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  published: boolean;
  enrollmentStatus: string | null;
};

export const getAvailableCourses = async (
  supabaseClient: SupabaseClient,
): Promise<CourseRow[]> => {
  const { data, error } = await supabaseClient
    .from("courses")
    .select("id, code, title, description, published")
    .order("code", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getMyEnrollments = async (
  supabaseClient: SupabaseClient,
): Promise<CourseEnrollmentRow[]> => {
  const { data, error } = await supabaseClient
    .from("course_enrollments")
    .select("course_id, status");

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const enrollInCourse = async (
  supabaseClient: SupabaseClient,
  courseId: string,
  userId: string,
): Promise<void> => {
  const { error } = await supabaseClient.from("course_enrollments").upsert(
    {
      course_id: courseId,
      user_id: userId,
      status: "enrolled",
    },
    { onConflict: "course_id,user_id" },
  );

  if (error) {
    throw error;
  }
};

export const updateEnrollmentStatus = async (
  supabaseClient: SupabaseClient,
  courseId: string,
  status: string,
): Promise<void> => {
  const { error } = await supabaseClient
    .from("course_enrollments")
    .update({ status })
    .eq("course_id", courseId);

  if (error) {
    throw error;
  }
};

export const mergeCoursesWithEnrollments = (
  courses: CourseRow[],
  enrollments: CourseEnrollmentRow[],
): CourseSummary[] => {
  const enrollmentMap = new Map(
    enrollments.map((row) => [row.course_id, row.status ?? null]),
  );

  return courses.map((course) => ({
    ...course,
    enrollmentStatus: enrollmentMap.get(course.id) ?? null,
  }));
};
