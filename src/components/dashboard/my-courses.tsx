"use client";

import { useEffect, useMemo, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";
import {
  enrollInCourse,
  getAvailableCourses,
  getMyEnrollments,
  mergeCoursesWithEnrollments,
  updateEnrollmentStatus,
} from "@/lib/courses";

type LoadState = "idle" | "loading" | "error";

type MyCoursesProps = {
  title?: string;
  description?: string;
};

export function MyCourses({
  title = "My Courses",
  description = "Enroll in or drop available courses. This list powers the dashboard overview for Phase 3.",
}: MyCoursesProps) {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courses, setCourses] = useState<ReturnType<
    typeof mergeCoursesWithEnrollments
  >>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const reload = async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient.auth.getUser();

      if (error || !data.user) {
        throw new Error("Unable to load your session.");
      }

      setUserId(data.user.id);

      const [availableCourses, enrollments] = await Promise.all([
        getAvailableCourses(supabaseClient),
        getMyEnrollments(supabaseClient),
      ]);

      setCourses(mergeCoursesWithEnrollments(availableCourses, enrollments));
      setLoadState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load courses.";
      setErrorMessage(message);
      setLoadState("error");
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => a.code.localeCompare(b.code)),
    [courses],
  );

  const handleEnrollment = async (
    courseId: string,
    enrollmentStatus: string | null,
  ) => {
    if (!userId) {
      setErrorMessage("Unable to determine your user id.");
      return;
    }

    try {
      const supabaseClient = getSupabaseClient();

      if (enrollmentStatus === "enrolled") {
        await updateEnrollmentStatus(supabaseClient, courseId, "dropped");
      }

      if (enrollmentStatus === "dropped") {
        await updateEnrollmentStatus(supabaseClient, courseId, "enrolled");
      }

      if (!enrollmentStatus) {
        await enrollInCourse(supabaseClient, courseId, userId);
      }

      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Enrollment update failed.";
      setErrorMessage(message);
    }
  };

  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: "1.25rem" }}>{title}</h2>
      <p>{description}</p>

      {loadState === "loading" && <p>Loading courses…</p>}
      {loadState === "error" && (
        <p style={{ color: "#b91c1c" }}>{errorMessage}</p>
      )}

      <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
        {sortedCourses.map((course) => {
          const isEnrolled = course.enrollmentStatus === "enrolled";
          const isDropped = course.enrollmentStatus === "dropped";

          return (
            <article
              key={course.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    {course.code}
                  </p>
                  <h3 style={{ fontSize: "1.1rem", marginTop: 4 }}>
                    {course.title}
                  </h3>
                  {course.description && (
                    <p style={{ marginTop: 8 }}>{course.description}</p>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    Status: {course.enrollmentStatus ?? "not enrolled"}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      handleEnrollment(course.id, course.enrollmentStatus)
                    }
                    style={{
                      marginTop: 12,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #111827",
                      background: isEnrolled ? "#fff" : "#111827",
                      color: isEnrolled ? "#111827" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {isEnrolled
                      ? "Drop course"
                      : isDropped
                        ? "Re-enroll"
                        : "Enroll"}
                  </button>
                  {isDropped && (
                    <p style={{ marginTop: 8, fontSize: "0.85rem" }}>
                      Dropped. Re-enroll anytime.
                    </p>
                  )}
                </div>
              </div>
              {isEnrolled && (
                <ul style={{ marginTop: 12, paddingLeft: 18 }}>
                  <li>Grades</li>
                  <li>Lessons</li>
                  <li>Discussion</li>
                  <li>Current week</li>
                  <li>Course link (coming soon)</li>
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
