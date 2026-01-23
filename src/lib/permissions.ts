import type { SupabaseClient } from "@supabase/supabase-js";

type RoleResult = {
  role_global: string | null;
} | null;

type InstructorResult = {
  id: string;
} | null;

export async function isAdmin(
  supabaseClient: SupabaseClient,
  userId: string,
) {
  const { data } = await supabaseClient
    .from("profiles")
    .select("role_global")
    .eq("id", userId)
    .maybeSingle();

  return (data as RoleResult)?.role_global === "admin";
}

export async function isInstructorForCourse(
  supabaseClient: SupabaseClient,
  userId: string,
  courseId: string,
) {
  const { data } = await supabaseClient
    .from("course_instructors")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  return Boolean((data as InstructorResult)?.id);
}

export async function canEditCourse(
  supabaseClient: SupabaseClient,
  userId: string,
  courseId: string,
) {
  const [admin, instructor] = await Promise.all([
    isAdmin(supabaseClient, userId),
    isInstructorForCourse(supabaseClient, userId, courseId),
  ]);

  return admin || instructor;
}
