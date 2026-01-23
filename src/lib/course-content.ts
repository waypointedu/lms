import type { SupabaseClient } from "@supabase/supabase-js";

export type CourseRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
};

export type WeekRow = {
  id: string;
  course_id: string;
  week_number: number;
  title: string | null;
};

export type ContentItemRow = {
  id: string;
  course_id: string;
  week_id: string | null;
  type: string;
  title: string;
  body: string | null;
  link_url: string | null;
  sort_order: number;
};

export type MediaBlockRow = {
  id: string;
  content_item_id: string;
  type: string;
  embed_url: string;
  caption: string | null;
  sort_order: number;
};

export const getCourseById = async (
  supabaseClient: SupabaseClient,
  courseId: string,
): Promise<CourseRow | null> => {
  const { data, error } = await supabaseClient
    .from("courses")
    .select("id, code, title, description")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};

export const getWeeksForCourse = async (
  supabaseClient: SupabaseClient,
  courseId: string,
): Promise<WeekRow[]> => {
  const { data, error } = await supabaseClient
    .from("weeks")
    .select("id, course_id, week_number, title")
    .eq("course_id", courseId)
    .order("week_number", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getContentItemsForCourse = async (
  supabaseClient: SupabaseClient,
  courseId: string,
): Promise<ContentItemRow[]> => {
  const { data, error } = await supabaseClient
    .from("content_items")
    .select("id, course_id, week_id, type, title, body, link_url, sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getMediaBlocksForItems = async (
  supabaseClient: SupabaseClient,
  itemIds: string[],
): Promise<MediaBlockRow[]> => {
  if (itemIds.length === 0) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from("media_blocks")
    .select("id, content_item_id, type, embed_url, caption, sort_order")
    .in("content_item_id", itemIds)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).filter((block) => block);
};
