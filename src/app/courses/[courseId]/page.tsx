"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { SessionGate } from "@/components/auth/session-gate";
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

  const courseId = params.courseId;

  useEffect(() => {
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

    loadCourse();
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

    const itemFromParam =
      itemParam &&
      courseState.items.find((item) => item.id === itemParam);

    const itemFromType =
      itemTypeParam &&
      courseState.items.find(
        (item) =>
          item.type === itemTypeParam &&
          (!weekFromParam || item.week_id === weekFromParam.id),
      );

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
              {activeItem.body && <p style={{ marginTop: 12 }}>{activeItem.body}</p>}
              {activeItem.link_url && (
                <p style={{ marginTop: 12 }}>
                  Link:{" "}
                  <a href={activeItem.link_url} target="_blank" rel="noreferrer">
                    {activeItem.link_url}
                  </a>
                </p>
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
