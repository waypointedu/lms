"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";

import { createCourse, updateInstructorProfile } from "@/app/actions/lms";

type CourseOption = {
  id: string;
  title: string;
};

type InstructorOption = {
  id: string;
  displayName: string;
  email: string | null;
  role: string | null;
  academicBio: string | null;
  credentials: string | null;
};

type CourseBuilderProps = {
  courses: CourseOption[];
  pathways: string[];
  instructors: InstructorOption[];
};

type CourseFormState = { ok: boolean; message: string; courseId?: string; courseTitle?: string };

const initialState: CourseFormState = { ok: false, message: "", courseId: undefined, courseTitle: undefined };

const defaultWeekSections = [
  "Overview",
  "Introduction",
  "Lesson",
  "Discussion",
  "Quiz",
  "Assignment",
];

export function CourseBuilder({ courses, pathways, instructors }: CourseBuilderProps) {
  const [state, formAction] = useFormState<CourseFormState>(createCourse, initialState);
  const [profileState, profileAction] = useFormState(updateInstructorProfile, initialState);
  const [selectedInstructor, setSelectedInstructor] = useState<string>("");
  const [weekSections, setWeekSections] = useState<Record<number, string[]>>(() => ({
    1: [...defaultWeekSections],
    2: [...defaultWeekSections],
    3: [...defaultWeekSections],
  }));
  const instructorMap = useMemo(
    () => new Map(instructors.map((instructor) => [instructor.id, instructor])),
    [instructors],
  );
  const activeInstructor = selectedInstructor ? instructorMap.get(selectedInstructor) : null;

  const toggleWeekSection = (week: number, section: string) => {
    setWeekSections((prev) => {
      const current = prev[week] || [];
      const next = current.includes(section)
        ? current.filter((item) => item !== section)
        : [...current, section];
      return { ...prev, [week]: next };
    });
  };

  return (
    <div className="space-y-10">
      <form className="card p-6 space-y-4" action={formAction}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="courseTitle">
            Title
          </label>
          <input
            id="courseTitle"
            name="courseTitle"
            className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
            placeholder="Foundations of Leadership"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="courseDescription">
            Description
          </label>
          <textarea
            id="courseDescription"
            name="courseDescription"
            rows={3}
            className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
            placeholder="Share a short overview for learners."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="prerequisites">
            Prerequisites (multi-select)
          </label>
          <select
            id="prerequisites"
            name="prerequisites"
            multiple
            className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none h-32"
          >
            {courses.length ? (
              courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))
            ) : (
              <option disabled>No courses available yet</option>
            )}
          </select>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="courseTopic">
              Topic
            </label>
            <input
              id="courseTopic"
              name="courseTopic"
              className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
              placeholder="Leadership, theology, counseling, etc."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="pathways">
              Pathway (multi-select)
            </label>
            <select
              id="pathways"
              name="pathways"
              multiple
              className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none h-32"
            >
              {pathways.length ? (
                pathways.map((pathway) => (
                  <option key={pathway} value={pathway}>
                    {pathway}
                  </option>
                ))
              ) : (
                <option disabled>No pathways configured yet</option>
              )}
            </select>
          </div>
        </div>
        {state.message ? (
          <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>{state.message}</p>
        ) : null}
        <button type="submit" className="button-primary w-full">
          Create
        </button>
      </form>

      {state.ok ? (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="card p-4 space-y-3">
            <p className="text-sm font-semibold text-[var(--ink)]">Course builder</p>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--ink)]">{state.courseTitle}</p>
              <p>Overview</p>
              <p>Syllabus</p>
              <p>Announcements</p>
              <div className="space-y-1">
                <p className="text-[var(--ink)] font-semibold">Weeks</p>
                {[...Array(4)].map((_, index) => (
                  <p key={`week-${index + 1}`} className="pl-3">
                    Week {index + 1}
                  </p>
                ))}
                <p className="pl-3 text-[var(--muted)]">…more weeks</p>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Instructor</h3>
              <select
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                value={selectedInstructor}
                onChange={(event) => setSelectedInstructor(event.target.value)}
              >
                <option value="">Select an instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.displayName} ({instructor.role || "Instructor"})
                  </option>
                ))}
              </select>
              {activeInstructor ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[rgba(20,34,64,0.08)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
                    <p className="font-semibold text-[var(--ink)]">{activeInstructor.displayName}</p>
                    <p>{activeInstructor.email || "No email on file"}</p>
                  </div>
                  <form key={activeInstructor.id} className="space-y-3" action={profileAction}>
                    <input type="hidden" name="instructorId" value={activeInstructor.id} />
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="academicBio">
                        Academic bio
                      </label>
                      <textarea
                        id="academicBio"
                        name="academicBio"
                        rows={4}
                        defaultValue={activeInstructor.academicBio || ""}
                        className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                        placeholder="Add academic bio details."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="credentials">
                        Credentials
                      </label>
                      <input
                        id="credentials"
                        name="credentials"
                        defaultValue={activeInstructor.credentials || ""}
                        className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                        placeholder="PhD, M.Div, LCSW, etc."
                      />
                    </div>
                    {profileState.message ? (
                      <p className={`text-sm ${profileState.ok ? "text-emerald-600" : "text-rose-600"}`}>
                        {profileState.message}
                      </p>
                    ) : null}
                    <button type="submit" className="button-secondary w-fit">
                      Save instructor profile
                    </button>
                  </form>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Select an instructor to view or update their profile details.
                </p>
              )}
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Syllabus</h3>
              <textarea
                rows={6}
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="Paste your syllabus here."
              />
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Announcements</h3>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="Draft an announcement for enrolled learners."
              />
              <button type="button" className="button-secondary w-fit">
                Post announcement
              </button>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Weeks</h3>
              {[1, 2, 3].map((week) => (
                <div key={`week-card-${week}`} className="rounded-xl border border-[rgba(20,34,64,0.08)] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[var(--ink)]">Week {week}</h4>
                    <span className="text-xs text-[var(--muted)]">Optional sections</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                    {defaultWeekSections.map((section) => (
                      <label key={`${week}-${section}`} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(weekSections[week] || []).includes(section)}
                          onChange={() => toggleWeekSection(week, section)}
                          className="h-4 w-4 rounded border border-[rgba(20,34,64,0.25)]"
                        />
                        {section}
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                    {(weekSections[week] || []).length ? (
                      (weekSections[week] || []).map((section) => (
                        <span
                          key={`${week}-${section}-active`}
                          className="rounded-full border border-[rgba(20,34,64,0.12)] px-3 py-1 bg-white"
                        >
                          {section}
                        </span>
                      ))
                    ) : (
                      <span className="text-[var(--muted)]">No sections selected.</span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                    placeholder="Add week notes or content."
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
