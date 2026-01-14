import { ClipboardList, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";
import { issueCertificate } from "@/app/actions/lms";

const adminTools = [
  {
    title: "Standard 16-week template",
    description: "Baseline 16-week course structure that can be customized per cohort.",
    badge: "Template",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "Core learning components",
    description: "Overview, lesson, discussion, quiz, assignment — ordered for a consistent learner flow.",
    badge: "Components",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    title: "Flexible editing",
    description: "Edit titles, reorder sections, or exclude any component without breaking the template.",
    badge: "Editing",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

export default function AdminPage() {
  return (
    <div>
      <SiteHeader />
      <main className="container space-y-14 py-12">
        <SectionHeader
          eyebrow="Admin toolkit"
          title="Course builder"
          description="Start with the standard 16-week course template and tailor every section for your learners."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {adminTools.map((tool) => (
            <div key={tool.title} className="card p-6 space-y-3">
              <div className="flex items-center gap-3 text-[var(--accent-deep)]">
                <div className="rounded-2xl bg-[var(--accent-light)] p-2">{tool.icon}</div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold border border-[rgba(20,34,64,0.08)]">
                  {tool.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold">{tool.title}</h3>
              <p className="text-[var(--muted)]">{tool.description}</p>
              {tool.badge === "Template" ? (
                <ol className="text-sm text-[var(--muted)] space-y-1 list-decimal pl-5">
                  <li>Overview</li>
                  <li>Lesson</li>
                  <li>Discussion</li>
                  <li>Quiz</li>
                  <li>Assignment</li>
                </ol>
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-3 text-[var(--accent-deep)]">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Course template checklist</h3>
            </div>
            <ul className="space-y-2 text-[var(--muted)]">
              <li>Confirm the 16-week timeline and update the cohort start date.</li>
              <li>Adjust the weekly overview copy and learning objectives.</li>
              <li>Review lesson content and reorder modules if needed.</li>
              <li>Enable or hide discussion, quiz, or assignment sections per week.</li>
              <li>Assign facilitators and update visibility for instructors.</li>
            </ul>
          </div>
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-3 text-[var(--accent-deep)]">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Issue certificate (manual)</h3>
            </div>
            <p className="text-[var(--muted)] text-sm">
              Provide a course ID and user ID to create a certificate with a verification code.
            </p>
            <form
              className="space-y-2"
              action={async (formData) => {
                "use server";
                const courseId = String(formData.get("courseId") || "").trim();
                const userId = String(formData.get("userId") || "").trim();
                await issueCertificate(courseId, userId);
              }}
            >
              <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="courseId">
                Course ID
              </label>
              <input
                id="courseId"
                name="courseId"
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="UUID"
                required
              />
              <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="userId">
                User ID
              </label>
              <input
                id="userId"
                name="userId"
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="UUID"
                required
              />
              <button type="submit" className="button-primary w-full">
                Issue certificate
              </button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
