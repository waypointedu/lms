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
  description: string | null;
  program_id: string | null;
  published: boolean;
};

type LoadState = "idle" | "loading" | "error";

export default function AdminCoursesPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    description: "",
    programId: "",
  });

  const reload = async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const supabaseClient = getSupabaseClient();
      const [{ data: programData, error: programError }, { data: courseData, error: courseError }] =
        await Promise.all([
          supabaseClient.from("programs").select("id, name").order("name"),
          supabaseClient
            .from("courses")
            .select("id, code, title, description, program_id, published")
            .order("code"),
        ]);

      if (programError || courseError) {
        throw programError || courseError;
      }

      setPrograms((programData ?? []) as ProgramRow[]);
      setCourses((courseData ?? []) as CourseRow[]);
      setLoadState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load courses.";
      setErrorMessage(message);
      setLoadState("error");
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleCreate = async () => {
    if (!newCourse.code.trim() || !newCourse.title.trim()) {
      setErrorMessage("Course code and title are required.");
      return;
    }

    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient.from("courses").insert({
        code: newCourse.code.trim(),
        title: newCourse.title.trim(),
        description: newCourse.description.trim() || null,
        program_id: newCourse.programId || null,
        published: true,
      });

      if (error) {
        throw error;
      }

      setNewCourse({ code: "", title: "", description: "", programId: "" });
      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create course.";
      setErrorMessage(message);
    }
  };

  const handleUpdate = async (course: CourseRow) => {
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("courses")
        .update({
          code: course.code,
          title: course.title,
          description: course.description,
          program_id: course.program_id,
          published: course.published,
        })
        .eq("id", course.id);

      if (error) {
        throw error;
      }

      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update course.";
      setErrorMessage(message);
    }
  };

  return (
    <SessionGate>
      <AdminGate>
        <main>
          <h1>Courses</h1>
          <p>Create and manage courses, including program assignment.</p>

          {loadState === "error" && (
            <p style={{ color: "#b91c1c" }}>{errorMessage}</p>
          )}

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "1.1rem" }}>New course</h2>
            <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
              <input
                placeholder="Course code (e.g. PHIL-1401)"
                value={newCourse.code}
                onChange={(event) =>
                  setNewCourse((prev) => ({ ...prev, code: event.target.value }))
                }
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
              <input
                placeholder="Course title"
                value={newCourse.title}
                onChange={(event) =>
                  setNewCourse((prev) => ({ ...prev, title: event.target.value }))
                }
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
              <textarea
                placeholder="Description"
                value={newCourse.description}
                onChange={(event) =>
                  setNewCourse((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={3}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
              <select
                value={newCourse.programId}
                onChange={(event) =>
                  setNewCourse((prev) => ({
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
                <option value="">No program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleCreate}
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
              Create course
            </button>
          </section>

          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: "1.1rem" }}>Existing courses</h2>
            {loadState === "loading" && <p>Loading courses…</p>}
            {courses.length === 0 && loadState === "idle" ? (
              <p>No courses created yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                {courses.map((course, index) => (
                  <div
                    key={course.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: "grid", gap: 8 }}>
                      <input
                        value={course.code}
                        onChange={(event) => {
                          const updated = [...courses];
                          updated[index] = {
                            ...course,
                            code: event.target.value,
                          };
                          setCourses(updated);
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 6,
                          border: "1px solid #d1d5db",
                        }}
                      />
                      <input
                        value={course.title}
                        onChange={(event) => {
                          const updated = [...courses];
                          updated[index] = {
                            ...course,
                            title: event.target.value,
                          };
                          setCourses(updated);
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 6,
                          border: "1px solid #d1d5db",
                        }}
                      />
                      <textarea
                        value={course.description ?? ""}
                        onChange={(event) => {
                          const updated = [...courses];
                          updated[index] = {
                            ...course,
                            description: event.target.value || null,
                          };
                          setCourses(updated);
                        }}
                        rows={3}
                        style={{
                          padding: 8,
                          borderRadius: 6,
                          border: "1px solid #d1d5db",
                        }}
                      />
                      <select
                        value={course.program_id ?? ""}
                        onChange={(event) => {
                          const updated = [...courses];
                          updated[index] = {
                            ...course,
                            program_id: event.target.value || null,
                          };
                          setCourses(updated);
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 6,
                          border: "1px solid #d1d5db",
                        }}
                      >
                        <option value="">No program</option>
                        {programs.map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.name}
                          </option>
                        ))}
                      </select>
                      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={course.published}
                          onChange={(event) => {
                            const updated = [...courses];
                            updated[index] = {
                              ...course,
                              published: event.target.checked,
                            };
                            setCourses(updated);
                          }}
                        />
                        Published
                      </label>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => handleUpdate(course)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #111827",
                          background: "#fff",
                        }}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </AdminGate>
    </SessionGate>
  );
}
