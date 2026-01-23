"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { SessionGate } from "@/components/auth/session-gate";
import { DiscussionPanel } from "@/components/course/discussion-panel";
import { SubmissionPanel } from "@/components/course/submission-panel";
import { canEditCourse } from "@/lib/permissions";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  ContentItemRow,
  MediaBlockRow,
  WeekRow,
  getContentItemsForCourse,
  getCourseById,
  getMediaBlocksForItems,
  getWeeksForCourse,
} from "@/lib/course-content";

type LoadState = "idle" | "loading" | "error";

type CoursePageState = {
  courseTitle: string;
  courseCode: string;
  weeks: WeekRow[];
  items: ContentItemRow[];
  media: MediaBlockRow[];
};

const formatWeekLabel = (week: WeekRow) =>
  week.title ?? `Week ${week.week_number}`;

export default function CoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courseState, setCourseState] = useState<CoursePageState>({
    courseTitle: "",
    courseCode: "",
    weeks: [],
    items: [],
    media: [],
  });
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [newWeekNumber, setNewWeekNumber] = useState<number | "">("");
  const [newWeekTitle, setNewWeekTitle] = useState("");
  const [newItem, setNewItem] = useState({
    type: "lesson",
    title: "",
    body: "",
    linkUrl: "",
    sortOrder: 1,
    weekId: "",
  });

  const courseId = params.courseId;

  const loadCourse = async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const supabaseClient = getSupabaseClient();
      const course = await getCourseById(supabaseClient, courseId);

      if (!course) {
        setErrorMessage("Course not found.");
        setLoadState("error");
        return;
      }

      const [weeks, items] = await Promise.all([
        getWeeksForCourse(supabaseClient, courseId),
        getContentItemsForCourse(supabaseClient, courseId),
      ]);

      const media = await getMediaBlocksForItems(
        supabaseClient,
        items.map((item) => item.id),
      );

      setCourseState({
        courseTitle: course.title,
        courseCode: course.code,
        weeks,
        items,
        media,
      });

      setLoadState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load course.";
      setErrorMessage(message);
      setLoadState("error");
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    const checkEditAccess = async () => {
      setLoadState("loading");
      setErrorMessage(null);

      try {
        const supabaseClient = getSupabaseClient();
        const { data, error } = await supabaseClient.auth.getUser();

        if (error || !data.user) {
          setCanEdit(false);
          return;
        }

        const allowed = await canEditCourse(
          supabaseClient,
          data.user.id,
          courseId,
        );
        setCanEdit(allowed);
      } catch (error) {
        setCanEdit(false);
      }
    };

    checkEditAccess();
  }, [courseId]);

  useEffect(() => {
    if (!courseState.weeks.length || !courseState.items.length) {
      return;
    }

    const weekParam = searchParams.get("week");
    const itemParam = searchParams.get("itemId");
    const itemTypeParam = searchParams.get("item");

    const weekFromParam = weekParam
      ? courseState.weeks.find(
          (week) => week.week_number === Number(weekParam),
        )
      : null;

    const itemFromParam = itemParam
      ? courseState.items.find((item) => item.id === itemParam) ?? null
      : null;

    const itemFromType = itemTypeParam
      ? courseState.items.find(
          (item) =>
            item.type === itemTypeParam &&
            (!weekFromParam || item.week_id === weekFromParam.id),
        ) ?? null
      : null;

    const defaultWeek = weekFromParam ?? courseState.weeks[0] ?? null;
    const defaultItems = defaultWeek
      ? courseState.items.filter((item) => item.week_id === defaultWeek.id)
      : [];
    const defaultItem =
      itemFromParam ?? itemFromType ?? defaultItems[0] ?? null;

    setActiveWeekId(defaultWeek?.id ?? null);
    setActiveItemId(defaultItem?.id ?? null);
  }, [courseState.items, courseState.weeks, searchParams]);

  const itemsByWeek = useMemo(() => {
    const map = new Map<string, ContentItemRow[]>();
    courseState.items.forEach((item) => {
      if (!item.week_id) return;
      const existing = map.get(item.week_id) ?? [];
      existing.push(item);
      map.set(item.week_id, existing);
    });
    return map;
  }, [courseState.items]);

  const activeWeek = courseState.weeks.find((week) => week.id === activeWeekId);
  const activeItems = activeWeekId ? itemsByWeek.get(activeWeekId) ?? [] : [];
  const activeItem = courseState.items.find((item) => item.id === activeItemId);
  const activeMedia = courseState.media.filter(
    (block) => block.content_item_id === activeItem?.id,
  );

  const handleWeekSelect = (weekId: string, weekNumber: number) => {
    setActiveWeekId(weekId);
    const firstItem = itemsByWeek.get(weekId)?.[0] ?? null;
    setActiveItemId(firstItem?.id ?? null);
    router.replace(`/courses/${courseId}?week=${weekNumber}`);
  };

  const handleItemSelect = (item: ContentItemRow) => {
    setActiveItemId(item.id);
    router.replace(`/courses/${courseId}?week=${activeWeek?.week_number}&item=${item.type}`);
  };

  const handleCreateWeek = async () => {
    if (!canEdit) return;
    const weekNumber =
      typeof newWeekNumber === "number"
        ? newWeekNumber
        : Math.max(0, ...courseState.weeks.map((week) => week.week_number)) + 1;

    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient.from("weeks").insert({
        course_id: courseId,
        week_number: weekNumber,
        title: newWeekTitle.trim() || null,
      });

      if (error) {
        throw error;
      }

      setNewWeekNumber("");
      setNewWeekTitle("");
      await loadCourse();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create week.";
      setEditError(message);
    }
  };

  const handleUpdateWeek = async (week: WeekRow) => {
    if (!canEdit) return;
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("weeks")
        .update({ title: week.title })
        .eq("id", week.id);

      if (error) {
        throw error;
      }

      await loadCourse();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update week.";
      setEditError(message);
    }
  };

  const handleDeleteWeek = async (week: WeekRow) => {
    if (!canEdit) return;
    if ((itemsByWeek.get(week.id) ?? []).length > 0) {
      setEditError("Delete items in this week before removing it.");
      return;
    }
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient.from("weeks").delete().eq("id", week.id);

      if (error) {
        throw error;
      }

      await loadCourse();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete week.";
      setEditError(message);
    }
  };

  const handleCreateItem = async () => {
    if (!canEdit) return;
    if (!newItem.title.trim() || !newItem.weekId) {
      setEditError("Title and week are required to create an item.");
      return;
    }

    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient.from("content_items").insert({
        course_id: courseId,
        week_id: newItem.weekId,
        type: newItem.type,
        title: newItem.title.trim(),
        body: newItem.body.trim() || null,
        link_url: newItem.linkUrl.trim() || null,
        sort_order: Number(newItem.sortOrder) || 1,
      });

      if (error) {
        throw error;
      }

      setNewItem({
        type: "lesson",
        title: "",
        body: "",
        linkUrl: "",
        sortOrder: 1,
        weekId: newItem.weekId,
      });
      await loadCourse();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create item.";
      setEditError(message);
    }
  };

  const handleUpdateItem = async (item: ContentItemRow) => {
    if (!canEdit) return;
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("content_items")
        .update({
          title: item.title,
          body: item.body,
          link_url: item.link_url,
          type: item.type,
          sort_order: item.sort_order,
          week_id: item.week_id,
        })
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      await loadCourse();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update item.";
      setEditError(message);
    }
  };

  const handleDeleteItem = async (item: ContentItemRow) => {
    if (!canEdit) return;
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("content_items")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      await loadCourse();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete item.";
      setEditError(message);
    }
  };

  return (
    <SessionGate>
      <main style={{ display: "flex", gap: 24 }}>
        <aside
          style={{
            width: 280,
            borderRight: "1px solid #e5e7eb",
            paddingRight: 16,
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Course</p>
          <h1 style={{ fontSize: "1.5rem" }}>
            {courseState.courseCode || "Course"}
          </h1>
          <p style={{ marginTop: 4 }}>{courseState.courseTitle}</p>

          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "1rem" }}>Weeks</h2>
            {courseState.weeks.map((week) => (
              <div key={week.id} style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => handleWeekSelect(week.id, week.week_number)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: "transparent",
                    padding: "8px 0",
                    fontWeight: week.id === activeWeekId ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {formatWeekLabel(week)}
                </button>
                {week.id === activeWeekId && (
                  <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                    {(itemsByWeek.get(week.id) ?? []).map((item) => (
                      <li key={item.id} style={{ marginBottom: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleItemSelect(item)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color:
                              item.id === activeItemId ? "#111827" : "#4b5563",
                            fontWeight: item.id === activeItemId ? 600 : 400,
                            cursor: "pointer",
                          }}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "1rem" }}>Tools</h2>
            <ul style={{ marginTop: 8, paddingLeft: 16 }}>
              <li>Grades</li>
              <li>Announcements</li>
              <li>Resources</li>
              <li>Etc.</li>
            </ul>
          </div>
        </aside>

        <section style={{ flex: 1 }}>
          {loadState === "loading" && <p>Loading course content…</p>}
          {loadState === "error" && (
            <p style={{ color: "#b91c1c" }}>{errorMessage}</p>
          )}
          {loadState === "idle" && activeItem && (
            <div>
              <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                {activeWeek ? formatWeekLabel(activeWeek) : "Course Content"}
              </p>
              <h2 style={{ fontSize: "1.5rem", marginTop: 4 }}>
                {activeItem.title}
              </h2>
              {activeItem.type !== "discussion" && (
                <>
                  {activeItem.body && (
                    <p style={{ marginTop: 12 }}>{activeItem.body}</p>
                  )}
                  {activeItem.link_url && (
                    <p style={{ marginTop: 12 }}>
                      Link:{" "}
                      <a
                        href={activeItem.link_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {activeItem.link_url}
                      </a>
                    </p>
                  )}
                </>
              )}

              {activeItem.type === "discussion" && (
                <div style={{ marginTop: 16 }}>
                  <DiscussionPanel
                    courseId={activeItem.course_id}
                    weekId={activeItem.week_id}
                    contentItemId={activeItem.id}
                  />
                </div>
              )}

              {activeItem.type === "assignment" && (
                <div style={{ marginTop: 16 }}>
                  <SubmissionPanel
                    courseId={activeItem.course_id}
                    contentItemId={activeItem.id}
                  />
                </div>
              )}

              {activeMedia.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ fontSize: "1rem" }}>Media</h3>
                  <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                    {activeMedia.map((block) => (
                      <div
                        key={block.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 12,
                          padding: 12,
                        }}
                      >
                        <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          {block.type.toUpperCase()}
                        </p>
                        <a href={block.embed_url} target="_blank" rel="noreferrer">
                          {block.embed_url}
                        </a>
                        {block.caption && (
                          <p style={{ marginTop: 8 }}>{block.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canEdit && (
                <section style={{ marginTop: 32 }}>
                  <h3 style={{ fontSize: "1rem" }}>Edit mode</h3>
                  <button
                    type="button"
                    onClick={() => setEditMode((prev) => !prev)}
                    style={{
                      marginTop: 8,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #111827",
                      background: "#fff",
                    }}
                  >
                    {editMode ? "Exit edit mode" : "Enter edit mode"}
                  </button>
                  {editError && (
                    <p style={{ marginTop: 8, color: "#b91c1c" }}>{editError}</p>
                  )}

                  {editMode && (
                    <div style={{ marginTop: 16, display: "grid", gap: 24 }}>
                      <div>
                        <h4 style={{ fontSize: "1rem" }}>Create week</h4>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <input
                            type="number"
                            placeholder="Week #"
                            value={newWeekNumber}
                            onChange={(event) =>
                              setNewWeekNumber(
                                event.target.value ? Number(event.target.value) : "",
                              )
                            }
                            style={{ width: 120 }}
                          />
                          <input
                            placeholder="Title (optional)"
                            value={newWeekTitle}
                            onChange={(event) => setNewWeekTitle(event.target.value)}
                            style={{ flex: 1 }}
                          />
                          <button type="button" onClick={handleCreateWeek}>
                            Add week
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: "1rem" }}>Create content item</h4>
                        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                          <select
                            value={newItem.weekId || activeWeekId || ""}
                            onChange={(event) =>
                              setNewItem((prev) => ({
                                ...prev,
                                weekId: event.target.value,
                              }))
                            }
                          >
                            <option value="">Select week</option>
                            {courseState.weeks.map((week) => (
                              <option key={week.id} value={week.id}>
                                {formatWeekLabel(week)}
                              </option>
                            ))}
                          </select>
                          <select
                            value={newItem.type}
                            onChange={(event) =>
                              setNewItem((prev) => ({
                                ...prev,
                                type: event.target.value,
                              }))
                            }
                          >
                            {[
                              "overview",
                              "lesson",
                              "discussion",
                              "quiz",
                              "assignment",
                              "announcement",
                              "resource",
                              "capstone",
                            ].map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <input
                            placeholder="Title"
                            value={newItem.title}
                            onChange={(event) =>
                              setNewItem((prev) => ({
                                ...prev,
                                title: event.target.value,
                              }))
                            }
                          />
                          <textarea
                            placeholder="Body"
                            value={newItem.body}
                            onChange={(event) =>
                              setNewItem((prev) => ({
                                ...prev,
                                body: event.target.value,
                              }))
                            }
                            rows={3}
                          />
                          <input
                            placeholder="Link URL"
                            value={newItem.linkUrl}
                            onChange={(event) =>
                              setNewItem((prev) => ({
                                ...prev,
                                linkUrl: event.target.value,
                              }))
                            }
                          />
                          <input
                            type="number"
                            placeholder="Sort order"
                            value={newItem.sortOrder}
                            onChange={(event) =>
                              setNewItem((prev) => ({
                                ...prev,
                                sortOrder: Number(event.target.value) || 1,
                              }))
                            }
                          />
                          <button type="button" onClick={handleCreateItem}>
                            Add item
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: "1rem" }}>Edit weeks</h4>
                        <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
                          {courseState.weeks.map((week, index) => (
                            <div key={week.id} style={{ display: "flex", gap: 8 }}>
                              <input
                                value={week.title ?? ""}
                                onChange={(event) => {
                                  const updated = [...courseState.weeks];
                                  updated[index] = {
                                    ...week,
                                    title: event.target.value,
                                  };
                                  setCourseState((prev) => ({
                                    ...prev,
                                    weeks: updated,
                                  }));
                                }}
                                placeholder={formatWeekLabel(week)}
                                style={{ flex: 1 }}
                              />
                              <button type="button" onClick={() => handleUpdateWeek(week)}>
                                Save
                              </button>
                              <button type="button" onClick={() => handleDeleteWeek(week)}>
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: "1rem" }}>Edit items</h4>
                        <div style={{ display: "grid", gap: 16, marginTop: 8 }}>
                          {courseState.items.map((item, index) => (
                            <div
                              key={item.id}
                              style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 8,
                                padding: 12,
                              }}
                            >
                              <div style={{ display: "grid", gap: 8 }}>
                                <input
                                  value={item.title}
                                  onChange={(event) => {
                                    const updated = [...courseState.items];
                                    updated[index] = {
                                      ...item,
                                      title: event.target.value,
                                    };
                                    setCourseState((prev) => ({
                                      ...prev,
                                      items: updated,
                                    }));
                                  }}
                                />
                                <select
                                  value={item.type}
                                  onChange={(event) => {
                                    const updated = [...courseState.items];
                                    updated[index] = {
                                      ...item,
                                      type: event.target.value,
                                    };
                                    setCourseState((prev) => ({
                                      ...prev,
                                      items: updated,
                                    }));
                                  }}
                                >
                                  {[
                                    "overview",
                                    "lesson",
                                    "discussion",
                                    "quiz",
                                    "assignment",
                                    "announcement",
                                    "resource",
                                    "capstone",
                                  ].map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={item.week_id ?? ""}
                                  onChange={(event) => {
                                    const updated = [...courseState.items];
                                    updated[index] = {
                                      ...item,
                                      week_id: event.target.value || null,
                                    };
                                    setCourseState((prev) => ({
                                      ...prev,
                                      items: updated,
                                    }));
                                  }}
                                >
                                  <option value="">No week</option>
                                  {courseState.weeks.map((week) => (
                                    <option key={week.id} value={week.id}>
                                      {formatWeekLabel(week)}
                                    </option>
                                  ))}
                                </select>
                                <textarea
                                  value={item.body ?? ""}
                                  onChange={(event) => {
                                    const updated = [...courseState.items];
                                    updated[index] = {
                                      ...item,
                                      body: event.target.value,
                                    };
                                    setCourseState((prev) => ({
                                      ...prev,
                                      items: updated,
                                    }));
                                  }}
                                  rows={3}
                                />
                                <input
                                  value={item.link_url ?? ""}
                                  onChange={(event) => {
                                    const updated = [...courseState.items];
                                    updated[index] = {
                                      ...item,
                                      link_url: event.target.value || null,
                                    };
                                    setCourseState((prev) => ({
                                      ...prev,
                                      items: updated,
                                    }));
                                  }}
                                  placeholder="Link URL"
                                />
                                <input
                                  type="number"
                                  value={item.sort_order}
                                  onChange={(event) => {
                                    const updated = [...courseState.items];
                                    updated[index] = {
                                      ...item,
                                      sort_order: Number(event.target.value) || 1,
                                    };
                                    setCourseState((prev) => ({
                                      ...prev,
                                      items: updated,
                                    }));
                                  }}
                                />
                              </div>
                              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button type="button" onClick={() => handleUpdateItem(item)}>
                                  Save
                                </button>
                                <button type="button" onClick={() => handleDeleteItem(item)}>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {loadState === "idle" && !activeItem && (
            <p>Select a week and item to view content.</p>
          )}
        </section>
      </main>
    </SessionGate>
  );
}
