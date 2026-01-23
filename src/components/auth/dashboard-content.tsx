"use client";

import { useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";
import { canEditCourse } from "@/lib/permissions";
import { MyCourses } from "@/components/dashboard/my-courses";

type PermissionState = "idle" | "checking" | "allowed" | "denied";

export function DashboardContent() {
  const [courseId, setCourseId] = useState("");
  const [permission, setPermission] = useState<PermissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    const supabaseClient = getSupabaseClient();
    await supabaseClient.auth.signOut();
  };

  const handlePermissionCheck = async () => {
    setPermission("checking");
    setErrorMessage(null);

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
      setPermission("denied");
      setErrorMessage("Unable to load your session.");
      return;
    }

    if (!courseId.trim()) {
      setPermission("denied");
      setErrorMessage("Enter a course ID to check permissions.");
      return;
    }

    const allowed = await canEditCourse(
      supabaseClient,
      data.user.id,
      courseId.trim(),
    );

    setPermission(allowed ? "allowed" : "denied");
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome back! You are signed in.</p>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1.25rem" }}>Course edit access</h2>
        <p>
          Use this check to preview the Phase 2 permission helpers. If you are
          an admin or instructor for the course, the edit placeholder will show.
        </p>
        <div style={{ marginTop: 12, marginBottom: 12, maxWidth: 420 }}>
          <label htmlFor="course-id">Course ID</label>
          <input
            id="course-id"
            name="course-id"
            type="text"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            placeholder="UUID from course_instructors"
            style={{
              marginTop: 6,
              padding: "10px 12px",
              width: "100%",
              borderRadius: 8,
              border: "1px solid #d1d5db",
            }}
          />
        </div>
        <button
          type="button"
          onClick={handlePermissionCheck}
          disabled={permission === "checking"}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {permission === "checking" ? "Checking…" : "Check edit permission"}
        </button>
        {permission === "allowed" && (
          <div style={{ marginTop: 16 }}>
            <strong>✅ Edit tools enabled</strong>
            <div
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 8,
                border: "1px dashed #9ca3af",
              }}
            >
              Edit controls placeholder
            </div>
          </div>
        )}
        {permission === "denied" && (
          <p style={{ marginTop: 16, color: "#b91c1c" }}>
            {errorMessage ?? "You do not have edit access to this course."}
          </p>
        )}
      </section>

      <MyCourses />

      <button
        type="button"
        onClick={handleLogout}
        style={{
          marginTop: 32,
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Log out
      </button>
    </main>
  );
}
