"use client";

import { useEffect, useMemo, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";
import {
  GradeCourseRow,
  GradeItemRow,
  GradeRow,
  getContentItemsByIds,
  getCoursesByIds,
  getGradesForCourse,
  getGradesForStudent,
  upsertGrade,
} from "@/lib/grades";

type LoadState = "idle" | "loading" | "error";

type GradebookPanelProps = {
  mode: "student" | "instructor";
};

const parseNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function GradebookPanel({ mode }: GradebookPanelProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [courses, setCourses] = useState<GradeCourseRow[]>([]);
  const [items, setItems] = useState<GradeItemRow[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );
  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  const loadStudentGrades = async (currentUserId: string) => {
    const supabaseClient = getSupabaseClient();
    const gradeRows = await getGradesForStudent(supabaseClient, currentUserId);
    const courseIds = [...new Set(gradeRows.map((row) => row.course_id))];
    const itemIds = [...new Set(gradeRows.map((row) => row.content_item_id))];
    const [courseRows, itemRows] = await Promise.all([
      getCoursesByIds(supabaseClient, courseIds),
      getContentItemsByIds(supabaseClient, itemIds),
    ]);
    setGrades(gradeRows);
    setCourses(courseRows);
    setItems(itemRows);
  };

  const loadInstructorGrades = async (currentUserId: string) => {
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from("course_instructors")
      .select("course_id")
      .eq("user_id", currentUserId)
      .returns<{ course_id: string }[]>();

    if (error) {
      throw error;
    }

    const instructorCourseIds = [...new Set((data ?? []).map((row) => row.course_id))];
    const courseRows = await getCoursesByIds(supabaseClient, instructorCourseIds);
    setCourses(courseRows);

    const targetCourseId = selectedCourseId || courseRows[0]?.id || "";
    setSelectedCourseId(targetCourseId);

    if (!targetCourseId) {
      setGrades([]);
      setItems([]);
      return;
    }

    const gradeRows = await getGradesForCourse(supabaseClient, targetCourseId);
    const itemIds = [...new Set(gradeRows.map((row) => row.content_item_id))];
    const itemRows = await getContentItemsByIds(supabaseClient, itemIds);
    setGrades(gradeRows);
    setItems(itemRows);
  };

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

      if (mode === "student") {
        await loadStudentGrades(data.user.id);
      } else {
        await loadInstructorGrades(data.user.id);
      }

      setLoadState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load gradebook.";
      setErrorMessage(message);
      setLoadState("error");
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedCourseId]);

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(event.target.value);
  };

  const handleGradeUpdate = async (
    grade: GradeRow,
    field: "points_earned" | "points_possible" | "letter" | "feedback",
    value: string,
  ) => {
    if (!userId) return;
    try {
      const supabaseClient = getSupabaseClient();
      await upsertGrade(supabaseClient, {
        courseId: grade.course_id,
        contentItemId: grade.content_item_id,
        userId: grade.user_id,
        pointsPossible:
          field === "points_possible" ? parseNumber(value) : grade.points_possible,
        pointsEarned:
          field === "points_earned" ? parseNumber(value) : grade.points_earned,
        letter: field === "letter" ? value : grade.letter,
        feedback: field === "feedback" ? value : grade.feedback,
      });
      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save grade.";
      setErrorMessage(message);
    }
  };

  if (loadState === "loading") {
    return <p>Loading gradebook…</p>;
  }

  if (loadState === "error") {
    return <p style={{ color: "#b91c1c" }}>{errorMessage}</p>;
  }

  return (
    <section>
      <h2 style={{ fontSize: "1.25rem" }}>
        {mode === "student" ? "My Gradebook" : "Course Gradebook"}
      </h2>

      {mode === "instructor" && (
        <div style={{ marginTop: 12 }}>
          <label htmlFor="course-select">Course</label>
          <select
            id="course-select"
            value={selectedCourseId}
            onChange={handleCourseChange}
            style={{
              marginLeft: 8,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
            }}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {grades.length === 0 ? (
        <p style={{ marginTop: 16 }}>No grades recorded yet.</p>
      ) : (
        <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {mode === "instructor" && (
                <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                  Student
                </th>
              )}
              <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                Course
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                Item
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                Points
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                Letter
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                Feedback
              </th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => {
              const course = courseMap.get(grade.course_id);
              const item = itemMap.get(grade.content_item_id);
              return (
                <tr key={grade.id}>
                  {mode === "instructor" && (
                    <td style={{ padding: "8px 0" }}>{grade.user_id}</td>
                  )}
                  <td style={{ padding: "8px 0" }}>
                    {course ? `${course.code} — ${course.title}` : grade.course_id}
                  </td>
                  <td style={{ padding: "8px 0" }}>
                    {item ? item.title : grade.content_item_id}
                  </td>
                  <td style={{ padding: "8px 0" }}>
                    {mode === "instructor" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          type="number"
                          value={grade.points_earned ?? ""}
                          onChange={(event) =>
                            handleGradeUpdate(grade, "points_earned", event.target.value)
                          }
                          style={{ width: 80 }}
                        />
                        <span>/</span>
                        <input
                          type="number"
                          value={grade.points_possible ?? ""}
                          onChange={(event) =>
                            handleGradeUpdate(grade, "points_possible", event.target.value)
                          }
                          style={{ width: 80 }}
                        />
                      </div>
                    ) : (
                      `${grade.points_earned ?? "—"} / ${grade.points_possible ?? "—"}`
                    )}
                  </td>
                  <td style={{ padding: "8px 0" }}>
                    {mode === "instructor" ? (
                      <input
                        value={grade.letter ?? ""}
                        onChange={(event) =>
                          handleGradeUpdate(grade, "letter", event.target.value)
                        }
                        style={{ width: 60 }}
                      />
                    ) : (
                      grade.letter ?? "—"
                    )}
                  </td>
                  <td style={{ padding: "8px 0" }}>
                    {mode === "instructor" ? (
                      <input
                        value={grade.feedback ?? ""}
                        onChange={(event) =>
                          handleGradeUpdate(grade, "feedback", event.target.value)
                        }
                        style={{ width: "100%" }}
                      />
                    ) : (
                      grade.feedback ?? "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
