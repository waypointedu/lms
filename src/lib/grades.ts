import type { SupabaseClient } from "@supabase/supabase-js";

export type GradeRow = {
  id: string;
  course_id: string;
  content_item_id: string;
  user_id: string;
  points_possible: number | null;
  points_earned: number | null;
  letter: string | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
};

export type GradeCourseRow = {
  id: string;
  code: string;
  title: string;
};

export type GradeItemRow = {
  id: string;
  title: string;
  type: string;
};

export const getGradesForStudent = async (
  supabaseClient: SupabaseClient,
  userId: string,
): Promise<GradeRow[]> => {
  const { data, error } = await supabaseClient
    .from("grades")
    .select(
      "id, course_id, content_item_id, user_id, points_possible, points_earned, letter, feedback, created_at, updated_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getGradesForCourse = async (
  supabaseClient: SupabaseClient,
  courseId: string,
): Promise<GradeRow[]> => {
  const { data, error } = await supabaseClient
    .from("grades")
    .select(
      "id, course_id, content_item_id, user_id, points_possible, points_earned, letter, feedback, created_at, updated_at",
    )
    .eq("course_id", courseId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getCoursesByIds = async (
  supabaseClient: SupabaseClient,
  courseIds: string[],
): Promise<GradeCourseRow[]> => {
  if (courseIds.length === 0) return [];

  const { data, error } = await supabaseClient
    .from("courses")
    .select("id, code, title")
    .in("id", courseIds);

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getContentItemsByIds = async (
  supabaseClient: SupabaseClient,
  itemIds: string[],
): Promise<GradeItemRow[]> => {
  if (itemIds.length === 0) return [];

  const { data, error } = await supabaseClient
    .from("content_items")
    .select("id, title, type")
    .in("id", itemIds);

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const upsertGrade = async (
  supabaseClient: SupabaseClient,
  payload: {
    courseId: string;
    contentItemId: string;
    userId: string;
    pointsPossible: number | null;
    pointsEarned: number | null;
    letter: string | null;
    feedback: string | null;
  },
): Promise<void> => {
  const { error } = await supabaseClient.from("grades").upsert(
    {
      course_id: payload.courseId,
      content_item_id: payload.contentItemId,
      user_id: payload.userId,
      points_possible: payload.pointsPossible,
      points_earned: payload.pointsEarned,
      letter: payload.letter,
      feedback: payload.feedback,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "content_item_id,user_id" },
  );

  if (error) {
    throw error;
  }
};
