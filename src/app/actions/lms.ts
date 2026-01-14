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

export async function markLessonComplete(lessonId: string, courseSlug?: string, lessonSlug?: string) {
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
  if (courseSlug) {
    revalidatePath(`/courses/${courseSlug}`);
  }
  if (courseSlug && lessonSlug) {
    revalidatePath(`/courses/${courseSlug}/lessons/${lessonSlug}`);
  }
  return { ok: true, message: "Lesson marked complete." };
}

type ProfileUpdatePayload = {
  displayName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mailingAddressLine1?: string;
  mailingAddressLine2?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingPostalCode?: string;
  mailingCountry?: string;
};

export async function upsertProfile(payload: ProfileUpdatePayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sign in first." };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: payload.displayName,
    first_name: payload.firstName || null,
    last_name: payload.lastName || null,
    email: payload.email || user.email || null,
    phone: payload.phone || null,
    mailing_address_line1: payload.mailingAddressLine1 || null,
    mailing_address_line2: payload.mailingAddressLine2 || null,
    mailing_city: payload.mailingCity || null,
    mailing_state: payload.mailingState || null,
    mailing_postal_code: payload.mailingPostalCode || null,
    mailing_country: payload.mailingCountry || null,
  });

  if (error) {
    console.error("Unable to update profile", error.message);
    return { ok: false, message: "Profile update failed." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true, message: "Profile saved." };
}

export async function updateAccount(formData: FormData) {
  "use server";
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sign in first." };

  const displayName = String(formData.get("displayName") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const mailingAddressLine1 = String(formData.get("mailingAddressLine1") || "").trim();
  const mailingAddressLine2 = String(formData.get("mailingAddressLine2") || "").trim();
  const mailingCity = String(formData.get("mailingCity") || "").trim();
  const mailingState = String(formData.get("mailingState") || "").trim();
  const mailingPostalCode = String(formData.get("mailingPostalCode") || "").trim();
  const mailingCountry = String(formData.get("mailingCountry") || "").trim();
  const newPassword = String(formData.get("newPassword") || "").trim();

  const authUpdates: { email?: string; password?: string } = {};
  if (email && email !== user.email) {
    authUpdates.email = email;
  }
  if (newPassword) {
    authUpdates.password = newPassword;
  }

  if (Object.keys(authUpdates).length) {
    const { error: authError } = await supabase.auth.updateUser(authUpdates);
    if (authError) {
      console.error("Unable to update auth profile", authError.message);
      return { ok: false, message: "Account update failed." };
    }
  }

  const profileResult = await upsertProfile({
    displayName,
    firstName,
    lastName,
    email: email || user.email || "",
    phone,
    mailingAddressLine1,
    mailingAddressLine2,
    mailingCity,
    mailingState,
    mailingPostalCode,
    mailingCountry,
  });

  return profileResult;
}

export async function signOut() {
  "use server";
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  await supabase.auth.signOut();
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { ok: true, message: "Signed out." };
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
