"use client";

import { useEffect, useState } from "react";

import { SessionGate } from "@/components/auth/session-gate";
import { AdminGate } from "@/components/admin/admin-gate";
import { getSupabaseClient } from "@/lib/supabase/client";

type ProgramRow = {
  id: string;
  name: string;
};

type CourseRow = {
  id: string;
  code: string;
  title: string;
};

type LoadState = "idle" | "loading" | "error";

export default function AdminUsersPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [programAssignment, setProgramAssignment] = useState({
    userId: "",
    programId: "",
  });
  const [instructorAssignment, setInstructorAssignment] = useState({
    userId: "",
    courseId: "",
  });
  const [enrollmentRemoval, setEnrollmentRemoval] = useState({
    userId: "",
    courseId: "",
  });

  const reload = async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const supabaseClient = getSupabaseClient();
      const [{ data: programData, error: programError }, { data: courseData, error: courseError }] =
        await Promise.all([
          supabaseClient.from("programs").select("id, name").order("name"),
          supabaseClient.from("courses").select("id, code, title").order("code"),
        ]);

      if (programError || courseError) {
        throw programError || courseError;
      }

      setPrograms((programData ?? []) as ProgramRow[]);
      setCourses((courseData ?? []) as CourseRow[]);
      setLoadState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load user tools.";
      setErrorMessage(message);
      setLoadState("error");
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleAssignProgram = async () => {
    if (!programAssignment.userId || !programAssignment.programId) {
      setErrorMessage("User and program are required.");
      return;
    }

    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("program_memberships")
        .upsert({
          user_id: programAssignment.userId,
          program_id: programAssignment.programId,
          status: "active",
        });

      if (error) {
        throw error;
      }

      setProgramAssignment({ userId: "", programId: "" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to assign program.";
      setErrorMessage(message);
    }
  };

  const handleAssignInstructor = async () => {
    if (!instructorAssignment.userId || !instructorAssignment.courseId) {
      setErrorMessage("User and course are required.");
      return;
    }

    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient.from("course_instructors").insert({
        user_id: instructorAssignment.userId,
        course_id: instructorAssignment.courseId,
        role: "instructor",
      });

      if (error) {
        throw error;
      }

      setInstructorAssignment({ userId: "", courseId: "" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to assign instructor.";
      setErrorMessage(message);
    }
  };

  const handleRemoveEnrollment = async () => {
    if (!enrollmentRemoval.userId || !enrollmentRemoval.courseId) {
      setErrorMessage("User and course are required.");
      return;
    }

    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("course_enrollments")
        .update({ status: "removed" })
        .eq("user_id", enrollmentRemoval.userId)
        .eq("course_id", enrollmentRemoval.courseId);

      if (error) {
        throw error;
      }

      setEnrollmentRemoval({ userId: "", courseId: "" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to remove enrollment.";
      setErrorMessage(message);
    }
  };

  return (
    <SessionGate>
      <AdminGate>
        <main>
          <h1>User Assignments</h1>
          <p>Assign users to programs, courses, and instructor roles.</p>

          {loadState === "error" && (
            <p style={{ color: "#b91c1c" }}>{errorMessage}</p>
          )}

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "1.1rem" }}>Assign program</h2>
            <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
              <input
                placeholder="User ID"
                value={programAssignment.userId}
                onChange={(event) =>
                  setProgramAssignment((prev) => ({
                    ...prev,
                    userId: event.target.value,
                  }))
                }
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
              <select
                value={programAssignment.programId}
                onChange={(event) =>
                  setProgramAssignment((prev) => ({
                    ...prev,
                    programId: event.target.value,
                  }))
                }
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              >
                <option value="">Select program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAssignProgram}
              style={{
                marginTop: 12,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Assign program
            </button>
          </section>

          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: "1.1rem" }}>Assign instructor</h2>
            <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
              <input
                placeholder="User ID"
                value={instructorAssignment.userId}
                onChange={(event) =>
                  setInstructorAssignment((prev) => ({
                    ...prev,
                    userId: event.target.value,
                  }))
                }
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
              <select
                value={instructorAssignment.courseId}
                onChange={(event) =>
                  setInstructorAssignment((prev) => ({
                    ...prev,
                    courseId: event.target.value,
                  }))
                }
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} — {course.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAssignInstructor}
              style={{
                marginTop: 12,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Assign instructor
            </button>
          </section>

          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: "1.1rem" }}>Remove enrollment</h2>
            <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
              <input
                placeholder="User ID"
                value={enrollmentRemoval.userId}
                onChange={(event) =>
                  setEnrollmentRemoval((prev) => ({
                    ...prev,
                    userId: event.target.value,
                  }))
                }
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
              <select
                value={enrollmentRemoval.courseId}
                onChange={(event) =>
                  setEnrollmentRemoval((prev) => ({
                    ...prev,
                    courseId: event.target.value,
                  }))
                }
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} — {course.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleRemoveEnrollment}
              style={{
                marginTop: 12,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #b91c1c",
                background: "#fff",
                color: "#b91c1c",
                cursor: "pointer",
              }}
            >
              Remove enrollment
            </button>
          </section>

          {loadState === "loading" && <p>Loading admin data…</p>}
        </main>
      </AdminGate>
    </SessionGate>
  );
}
