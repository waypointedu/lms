"use client";

import { useEffect, useMemo, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";
import { canEditCourse } from "@/lib/permissions";
import { getSubmissionsForItem, upsertSubmission } from "@/lib/submissions";

type SubmissionPanelProps = {
  courseId: string;
  contentItemId: string;
};

type LoadState = "idle" | "loading" | "error";

export function SubmissionPanel({
  courseId,
  contentItemId,
}: SubmissionPanelProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissions, setSubmissions] = useState<
    Awaited<ReturnType<typeof getSubmissionsForItem>>
  >([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasEditAccess, setHasEditAccess] = useState(false);

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

      const [submissionRows, editAccess] = await Promise.all([
        getSubmissionsForItem(supabaseClient, contentItemId),
        canEditCourse(supabaseClient, data.user.id, courseId),
      ]);

      setSubmissions(submissionRows);
      setHasEditAccess(editAccess);
      setLoadState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load submissions.";
      setErrorMessage(message);
      setLoadState("error");
    }
  };

  useEffect(() => {
    if (!contentItemId) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentItemId]);

  const mySubmission = useMemo(
    () => submissions.find((row) => row.user_id === userId) ?? null,
    [submissions, userId],
  );

  const handleSubmit = async () => {
    if (!userId) {
      setErrorMessage("Unable to determine your user id.");
      return;
    }

    if (!submissionUrl.trim()) {
      setErrorMessage("Add a submission link before submitting.");
      return;
    }

    try {
      const supabaseClient = getSupabaseClient();
      await upsertSubmission(supabaseClient, {
        courseId,
        contentItemId,
        userId,
        submissionUrl: submissionUrl.trim(),
      });
      setSubmissionUrl("");
      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to submit assignment.";
      setErrorMessage(message);
    }
  };

  if (loadState === "loading") {
    return <p>Loading submissions…</p>;
  }

  if (loadState === "error") {
    return <p style={{ color: "#b91c1c" }}>{errorMessage}</p>;
  }

  return (
    <div>
      <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>
        Assignment submission
      </h3>
      <p>
        Paste a Google Drive link for your work. Your submission status will
        update automatically.
      </p>

      <div style={{ marginTop: 12 }}>
        <label htmlFor="submission-url">Submission link</label>
        <input
          id="submission-url"
          value={submissionUrl}
          onChange={(event) => setSubmissionUrl(event.target.value)}
          placeholder={mySubmission?.submission_url ?? "https://"}
          style={{
            marginTop: 8,
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #d1d5db",
          }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Submit link
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <p>
          Status:{" "}
          <strong>{mySubmission?.status ?? "not submitted"}</strong>
        </p>
        {mySubmission?.submission_url && (
          <p style={{ marginTop: 8 }}>
            Latest submission:{" "}
            <a href={mySubmission.submission_url} target="_blank" rel="noreferrer">
              {mySubmission.submission_url}
            </a>
          </p>
        )}
      </div>

      {hasEditAccess && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: "1rem" }}>Roster submissions</h4>
          {submissions.length === 0 ? (
            <p>No submissions yet.</p>
          ) : (
            <table style={{ width: "100%", marginTop: 8, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                    Student
                  </th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                    Status
                  </th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                    Link
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td style={{ padding: "8px 0" }}>{submission.user_id}</td>
                    <td>{submission.status}</td>
                    <td>
                      {submission.submission_url ? (
                        <a
                          href={submission.submission_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
