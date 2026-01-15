"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/queries";
import { getSupabaseServerClient } from "@/lib/supabase-server";
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
  if (!supabase) return;

  await supabase.auth.signOut();
  revalidatePath("/");
  revalidatePath("/dashboard");
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

type CourseBuilderState = { ok: boolean; message: string; courseId?: string; courseTitle?: string };

export async function createCourse(
  _prevState: CourseBuilderState,
  formData: FormData,
): Promise<CourseBuilderState> {
  "use server";
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const session = await getCurrentProfile();
  if (!session?.user) return { ok: false, message: "Sign in to create a course." };

  const isAdmin = session.roles.includes("admin") || session.profile.role === "admin";
  if (!isAdmin) return { ok: false, message: "Only admins can create courses." };

  const title = String(formData.get("courseTitle") || "").trim();
  const description = String(formData.get("courseDescription") || "").trim();
  const topic = String(formData.get("courseTopic") || "").trim();
  const prerequisites = formData.getAll("prerequisites").map((value) => String(value)).filter(Boolean);
  const pathways = formData.getAll("pathways").map((value) => String(value)).filter(Boolean);

  if (!title) return { ok: false, message: "Add a course title to continue." };

  const slug = `${slugify(title)}-${randomUUID().slice(0, 6)}`;
  const primaryPathway = pathways[0] || null;

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .insert({
      slug,
      title,
      description: description || null,
      topic: topic || null,
      pathway: primaryPathway,
      published: false,
    })
    .select("id, title")
    .single();

  if (courseError || !course) {
    console.error("Unable to create course", courseError?.message);
    return { ok: false, message: "Unable to create the course." };
  }

  if (prerequisites.length) {
    const { error: prerequisitesError } = await supabase.from("course_prerequisites").insert(
      prerequisites.map((courseId) => ({
        course_id: course.id,
        prerequisite_course_id: courseId,
      })),
    );
    if (prerequisitesError) {
      console.error("Unable to save prerequisites", prerequisitesError.message);
      return { ok: false, message: "Course created, but prerequisites could not be saved." };
    }
  }

  if (pathways.length) {
    const { error: pathwaysError } = await supabase.from("course_pathways").insert(
      pathways.map((pathway) => ({
        course_id: course.id,
        pathway,
      })),
    );
    if (pathwaysError) {
      console.error("Unable to save pathways", pathwaysError.message);
      return { ok: false, message: "Course created, but pathways could not be saved." };
    }
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: `Created "${course.title}".`,
    courseId: course.id,
    courseTitle: course.title,
  };
}

type InstructorProfileState = { ok: boolean; message: string };

export async function updateInstructorProfile(
  _prevState: InstructorProfileState,
  formData: FormData,
): Promise<InstructorProfileState> {
  "use server";
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  const session = await getCurrentProfile();
  if (!session?.user) return { ok: false, message: "Sign in to update instructors." };

  const isAdmin = session.roles.includes("admin") || session.profile.role === "admin";
  if (!isAdmin) return { ok: false, message: "Only admins can update instructors." };

  const instructorId = String(formData.get("instructorId") || "").trim();
  const academicBio = String(formData.get("academicBio") || "").trim();
  const credentials = String(formData.get("credentials") || "").trim();

  if (!instructorId) return { ok: false, message: "Select an instructor first." };

  const { error } = await supabase
    .from("profiles")
    .update({
      academic_bio: academicBio || null,
      credentials: credentials || null,
    })
    .eq("id", instructorId);

  if (error) {
    console.error("Unable to update instructor", error.message);
    return { ok: false, message: "Unable to save instructor profile." };
  }

  revalidatePath("/admin");
  return { ok: true, message: "Instructor profile updated." };
}

type CourseTemplateState = { ok: boolean; message: string };

export async function createCourseTemplate(
  _prevState: CourseTemplateState,
  formData: FormData,
): Promise<CourseTemplateState> {
  "use server";
  const title = String(formData.get("courseTitle") || "").trim();
  const components = formData.getAll("components").map((value) => String(value)).filter(Boolean);

  if (!title) return { ok: false, message: "Add a course title to continue." };
  if (!components.length) return { ok: false, message: "Select at least one component." };

  return {
    ok: false,
    message: "Course templates are not configured yet. Please create courses manually for now.",
  };
}
