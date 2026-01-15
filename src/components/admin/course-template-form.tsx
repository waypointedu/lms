"use client";

import { useFormState } from "react-dom";

import { createCourseTemplate } from "@/app/actions/lms";

const componentOptions = [
  { value: "overview", label: "Overview" },
  { value: "lesson", label: "Lesson" },
  { value: "discussion", label: "Discussion" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
];

const initialState = { ok: false, message: "" };

export function CourseTemplateForm() {
  const [state, formAction] = useFormState(createCourseTemplate, initialState);

  return (
    <form className="space-y-4" action={formAction}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="courseTitle">
          Course title
        </label>
        <input
          id="courseTitle"
          name="courseTitle"
          className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
          placeholder="16-week foundational program"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="courseDescription">
          Description (optional)
        </label>
        <textarea
          id="courseDescription"
          name="courseDescription"
          rows={3}
          className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
          placeholder="Add a short summary for learners and staff."
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[var(--ink)]">Include components</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {componentOptions.map((component) => (
            <label key={component.value} className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                name="components"
                value={component.value}
                defaultChecked
                className="h-4 w-4 rounded border border-[rgba(20,34,64,0.25)]"
              />
              {component.label}
            </label>
          ))}
        </div>
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>{state.message}</p>
      ) : null}
      <button type="submit" className="button-primary w-full">
        Create 16-week template
      </button>
    </form>
  );
}
