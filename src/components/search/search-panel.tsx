"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, BookOpen, FileText } from "lucide-react";

type SearchResult = {
  id?: string;
  slug: string;
  title: string;
  description?: string | null;
  language?: string | null;
};

type LessonResult = {
  id?: string;
  slug: string;
  title: string;
  content_path?: string | null;
  modules?: { courses?: { slug: string; title: string; language?: string } | null } | null;
  courseSlug?: string;
  courseTitle?: string;
  language?: string | null;
};

interface SearchResponse {
  courses: SearchResult[];
  lessons: LessonResult[];
}

export function SearchPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string>("");
  const [results, setResults] = useState<SearchResponse>({ courses: [], lessons: [] });
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error">("idle");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setStatus("loading");
      try {
        const params = new URLSearchParams({ q: query.trim() });
        if (language) params.set("language", language);
        const response = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal });
        const data = (await response.json()) as SearchResponse;
        const empty = (!data.courses || data.courses.length === 0) && (!data.lessons || data.lessons.length === 0);
        setResults(data);
        setStatus(empty ? "empty" : "idle");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("Search failed", error);
        setStatus("error");
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, language, open]);

  const languages = useMemo(() => [
    { value: "", label: "All" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
  ], []);

  return (
    <div className="relative">
      <button
        className="button-secondary"
        onClick={() => {
          setOpen(true);
          setQuery("");
          setResults({ courses: [], lessons: [] });
          setStatus("idle");
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Search className="h-4 w-4" />
        Search
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm flex items-start justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-[rgba(20,34,64,0.08)] p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Search className="h-5 w-5 text-[var(--accent-deep)]" />
                <input
                  ref={inputRef}
                  className="w-full border border-[rgba(20,34,64,0.12)] rounded-xl px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Search courses or lessons"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-[var(--muted)]" htmlFor="language-filter">
                  Language
                </label>
                <select
                  id="language-filter"
                  className="border border-[rgba(20,34,64,0.12)] rounded-xl px-2 py-1 text-sm"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="button-secondary"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  setResults({ courses: [], lessons: [] });
                  setStatus("idle");
                }}
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-3">
              {(!query.trim() || status === "idle") && results.courses.length === 0 && results.lessons.length === 0 ? (
                <p className="text-[var(--muted)]">Type to search courses and lessons.</p>
              ) : null}

              {status === "loading" ? <p className="text-[var(--muted)]">Searching…</p> : null}
              {status === "error" ? <p className="text-red-700">Search failed. Try again.</p> : null}
              {status === "empty" ? <p className="text-[var(--muted)]">No results found.</p> : null}

              {results.courses.length ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[var(--muted)]">Courses</h3>
                  <div className="grid gap-2">
                    {results.courses.map((course) => (
                      <Link
                        key={course.slug}
                        href={`/courses/${course.slug}`}
                        className="flex items-start gap-3 rounded-xl border border-[rgba(20,34,64,0.08)] p-3 hover:border-[var(--accent)]"
                        onClick={() => setOpen(false)}
                      >
                        <BookOpen className="h-4 w-4 text-[var(--accent-deep)] mt-1" />
                        <div>
                          <p className="font-semibold">{course.title}</p>
                          <p className="text-sm text-[var(--muted)]">{course.description}</p>
                          {course.language ? (
                            <span className="text-xs text-[var(--muted)]">Language: {course.language.toUpperCase()}</span>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {results.lessons.length ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[var(--muted)]">Lessons</h3>
                  <div className="grid gap-2">
                    {results.lessons.map((lesson) => {
                      const courseSlug = lesson.courseSlug || (lesson.modules?.courses as { slug?: string } | null)?.slug;
                      const courseTitle = lesson.courseTitle || (lesson.modules?.courses as { title?: string } | null)?.title;
                      const href = courseSlug ? `/courses/${courseSlug}/lessons/${lesson.slug}` : undefined;
                      return (
                        <div
                          key={`${courseSlug}-${lesson.slug}`}
                          className="flex items-start gap-3 rounded-xl border border-[rgba(20,34,64,0.08)] p-3"
                        >
                          <FileText className="h-4 w-4 text-[var(--accent-deep)] mt-1" />
                          <div className="flex-1">
                            <p className="font-semibold">{lesson.title}</p>
                            <p className="text-sm text-[var(--muted)]">{courseTitle || "Lesson"}</p>
                            {lesson.language ? (
                              <span className="text-xs text-[var(--muted)]">Language: {lesson.language.toUpperCase()}</span>
                            ) : null}
                          </div>
                          {href ? (
                            <Link className="button-secondary" href={href} onClick={() => setOpen(false)}>
                              Open
                            </Link>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">Add content_path to open</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
