"use client";

import { useEffect, useState } from "react";

import { SessionGate } from "@/components/auth/session-gate";
import { AdminGate } from "@/components/admin/admin-gate";
import { getSupabaseClient } from "@/lib/supabase/client";

type DebugCourseRow = {
  id: string;
  code: string;
  title: string;
};

type EnrollmentRow = {
  id: string;
  course_id: string;
  status: string;
};

type InstructorRow = {
  id: string;
  course_id: string;
  role: string;
};

type ProfileRow = {
  role_global: string | null;
};

export default function AdminDebugPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [courses, setCourses] = useState<DebugCourseRow[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [instructors, setInstructors] = useState<InstructorRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const pushError = (message: string) => {
    setErrors((prev) => [message, ...prev].slice(0, 20));
  };

  useEffect(() => {
    const loadDebugData = async () => {
      try {
        const supabaseClient = getSupabaseClient();
        const { data, error } = await supabaseClient.auth.getUser();

        if (error || !data.user) {
          pushError("Unable to load current user session.");
          return;
        }

        setUserId(data.user.id);

        const [{ data: profileData, error: profileError }, { data: courseData, error: courseError }] =
          await Promise.all([
            supabaseClient
              .from("profiles")
              .select("role_global")
              .eq("id", data.user.id)
              .maybeSingle()
              .returns<ProfileRow | null>(),
            supabaseClient
              .from("courses")
              .select("id, code, title")
              .order("code")
              .returns<DebugCourseRow[]>(),
          ]);

        if (profileError) {
          pushError(profileError.message);
        } else {
          setRole(profileData?.role_global ?? null);
        }

        if (courseError) {
          pushError(courseError.message);
        } else {
          setCourses(courseData ?? []);
        }

        const [
          { data: enrollmentData, error: enrollmentError },
          { data: instructorData, error: instructorError },
        ] = await Promise.all([
          supabaseClient
            .from("course_enrollments")
            .select("id, course_id, status")
            .eq("user_id", data.user.id)
            .returns<EnrollmentRow[]>(),
          supabaseClient
            .from("course_instructors")
            .select("id, course_id, role")
            .eq("user_id", data.user.id)
            .returns<InstructorRow[]>(),
        ]);

        if (enrollmentError) {
          pushError(enrollmentError.message);
        } else {
          setEnrollments(enrollmentData ?? []);
        }

        if (instructorError) {
          pushError(instructorError.message);
        } else {
          setInstructors(instructorData ?? []);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load debug data.";
        pushError(message);
      }
    };

    loadDebugData();
  }, []);

  return (
    <SessionGate>
      <AdminGate>
        <main>
          <h1>Admin Debug Panel</h1>
          <p>Use this page to validate role and access data.</p>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "1.1rem" }}>Current user</h2>
            <p>User ID: {userId ?? "Unknown"}</p>
            <p>Role: {role ?? "Unknown"}</p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "1.1rem" }}>Courses visible</h2>
            {courses.length === 0 ? (
              <p>No courses returned.</p>
            ) : (
              <ul>
                {courses.map((course) => (
                  <li key={course.id}>
                    {course.code} — {course.title}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "1.1rem" }}>Enrollments</h2>
            {enrollments.length === 0 ? (
              <p>No enrollments found.</p>
            ) : (
              <ul>
                {enrollments.map((row) => (
                  <li key={row.id}>
                    {row.course_id} — {row.status}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "1.1rem" }}>Instructor assignments</h2>
            {instructors.length === 0 ? (
              <p>No instructor assignments found.</p>
            ) : (
              <ul>
                {instructors.map((row) => (
                  <li key={row.id}>
                    {row.course_id} — {row.role}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "1.1rem" }}>Recent Supabase errors</h2>
            {errors.length === 0 ? (
              <p>No errors recorded.</p>
            ) : (
              <ul>
                {errors.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </AdminGate>
    </SessionGate>
  );
}
