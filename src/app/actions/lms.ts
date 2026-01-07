"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getServiceRoleClient } from "@/lib/supabase";
import { startOfWeek } from "@/lib/date-utils";
import type { Json } from "@/types/supabase";

export async function enrollInCourse(courseId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { ok: false, message: "Sign in to enroll." };

  const { error } = await supabase.from("enrollments").upsert({
    course_id: courseId,
    user_id: user.id,
    status: "active",
  });

  if (error) {
    console.error("Unable to enroll", error.message);
    return { ok: false, message: "Enrollment failed. Check RLS policies and roles." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/courses/${courseId}`);
  return { ok: true, message: "Enrolled" };
}

export async function recordCheckIn(courseId: string, payload: Json) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const week = startOfWeek();
  const weekStartDate = week.toISOString().slice(0, 10);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sign in to submit check-ins." };

  const { error } = await supabase.from("checkins").upsert({
    course_id: courseId,
    user_id: user.id,
    week_start_date: weekStartDate,
    payload,
  });

  if (error) {
    console.error("Unable to submit check-in", error.message);
    return { ok: false, message: "Check-in failed. Verify RLS policies." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Check-in recorded." };
}

export async function markLessonComplete(lessonId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sign in to track progress." };

  const { error } = await supabase.from("lesson_progress").upsert({
    lesson_id: lessonId,
    user_id: user.id,
    completed_at: new Date().toISOString(),
    last_viewed_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Unable to mark lesson complete", error.message);
    return { ok: false, message: "Could not save progress." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Lesson marked complete." };
}

export async function upsertProfile(displayName: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sign in first." };

  const service = getServiceRoleClient();
  const client = service || supabase;

  const { error } = await client.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
  });

  if (error) {
    console.error("Unable to update profile", error.message);
    return { ok: false, message: "Profile update failed." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Profile saved." };
}

async function logAudit(action: string, target: string | null, actor: string | null) {
  const service = getServiceRoleClient();
  if (!service) return;
  await service.from("audit_events").insert({ action, target, actor });
}

export async function issueCertificate(courseId: string, userId: string) {
  const service = getServiceRoleClient();
  if (!service) return { ok: false, message: "Service role not configured." };

  const verification_code = randomUUID();
  const { error } = await service.from("certificates").insert({
    course_id: courseId,
    user_id: userId,
    verification_code,
  });

  if (error) {
    console.error("Unable to issue certificate", error.message);
    return { ok: false, message: "Issuance failed. Check RLS and IDs." };
  }

  await logAudit("issue_certificate", courseId, userId);
  revalidatePath("/dashboard");
  return { ok: true, message: "Certificate issued." };
}
