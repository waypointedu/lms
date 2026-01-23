import type { SupabaseClient } from "@supabase/supabase-js";

export type DiscussionThread = {
  id: string;
  course_id: string;
  week_id: string | null;
  content_item_id: string;
  title: string;
  created_by: string;
  created_at: string;
};

export type DiscussionPost = {
  id: string;
  thread_id: string;
  parent_post_id: string | null;
  body: string;
  created_by: string;
  created_at: string;
};

export const getThreadsForItem = async (
  supabaseClient: SupabaseClient,
  contentItemId: string,
): Promise<DiscussionThread[]> => {
  const { data, error } = await supabaseClient
    .from("discussion_threads")
    .select(
      "id, course_id, week_id, content_item_id, title, created_by, created_at",
    )
    .eq("content_item_id", contentItemId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getPostsForThread = async (
  supabaseClient: SupabaseClient,
  threadId: string,
): Promise<DiscussionPost[]> => {
  const { data, error } = await supabaseClient
    .from("discussion_posts")
    .select("id, thread_id, parent_post_id, body, created_by, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const createThread = async (
  supabaseClient: SupabaseClient,
  payload: {
    courseId: string;
    weekId: string | null;
    contentItemId: string;
    title: string;
    createdBy: string;
  },
): Promise<void> => {
  const { error } = await supabaseClient.from("discussion_threads").insert({
    course_id: payload.courseId,
    week_id: payload.weekId,
    content_item_id: payload.contentItemId,
    title: payload.title,
    created_by: payload.createdBy,
  });

  if (error) {
    throw error;
  }
};

export const createPost = async (
  supabaseClient: SupabaseClient,
  payload: {
    threadId: string;
    body: string;
    createdBy: string;
    parentPostId?: string | null;
  },
): Promise<void> => {
  const { error } = await supabaseClient.from("discussion_posts").insert({
    thread_id: payload.threadId,
    body: payload.body,
    created_by: payload.createdBy,
    parent_post_id: payload.parentPostId ?? null,
  });

  if (error) {
    throw error;
  }
};
