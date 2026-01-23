import type { SupabaseClient } from "@supabase/supabase-js";

export type SubmissionRow = {
  id: string;
  course_id: string;
  content_item_id: string;
  user_id: string;
  submission_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export const getSubmissionsForItem = async (
  supabaseClient: SupabaseClient,
  contentItemId: string,
): Promise<SubmissionRow[]> => {
  const { data, error } = await supabaseClient
    .from("submissions")
    .select(
      "id, course_id, content_item_id, user_id, submission_url, status, created_at, updated_at",
    )
    .eq("content_item_id", contentItemId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const upsertSubmission = async (
  supabaseClient: SupabaseClient,
  payload: {
    courseId: string;
    contentItemId: string;
    userId: string;
    submissionUrl: string;
  },
): Promise<void> => {
  const { error } = await supabaseClient.from("submissions").upsert(
    {
      course_id: payload.courseId,
      content_item_id: payload.contentItemId,
      user_id: payload.userId,
      submission_url: payload.submissionUrl,
      status: "submitted",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "content_item_id,user_id" },
  );

  if (error) {
    throw error;
  }
};
