import { BookOpen, Clock3, GitBranch, ListChecks } from "lucide-react";
import Link from "next/link";
import type { Course } from "@/data/courses";

interface CourseCardProps {
  course: Course;
  showActions?: boolean;
}

export function CourseCard({ course, showActions = true }: CourseCardProps) {
  return (
    <article className="card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(28,79,156,0.05)] via-transparent to-[rgba(12,46,109,0.06)]" />
      <div className="relative flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="pill">{course.level}</span>
          {course.language ? (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold border border-[rgba(20,34,64,0.1)]">
              {course.language.toUpperCase()}
            </span>
          ) : null}
          <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Clock3 className="h-4 w-4" />
            {course.duration}
          </span>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold">{course.title}</h3>
          <p className="text-[var(--muted)]">{course.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold text-[var(--accent-deep)]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="grid gap-2 text-sm text-[var(--muted)]">
          {course.lessons.slice(0, 3).map((lesson) => (
            <div key={lesson.title} className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--accent)]" />
              <span className="font-semibold text-[var(--ink)]">{lesson.title}</span>
              <span className="text-[var(--muted)]">• {lesson.duration}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-[var(--accent)]" />
            <span>{course.lessons.length} items • quizzes and labs included</span>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[rgba(20,34,64,0.08)] pt-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-[var(--accent-deep)]">
            <GitBranch className="h-4 w-4" />
            {course.repository}
          </span>
          {showActions ? (
            <div className="flex gap-3">
              <Link href={`/courses#${course.slug}`} className="button-secondary">
                Outline
              </Link>
              <Link href="/dashboard" className="button-primary">
                Start track
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
