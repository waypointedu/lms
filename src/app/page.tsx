import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { BookOpenCheck, CalendarClock, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import { recordCheckIn } from "@/app/actions/lms";
import { CourseCard } from "@/components/cards/course-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";
import { checkInPrompts, courses, liveSessions } from "@/data/courses";
import { getMarkdown } from "@/lib/markdown";
import { getCourseDetail } from "@/lib/queries";
import type { Json } from "@/types/supabase";

const valueProps = [
  {
    title: "Role-aware dashboards",
    description: "Learners and staff each see the tools they need.",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  {
    title: "Weekly checkpoints",
    description: "Clear weekly steps to keep learning on track.",
    icon: <CalendarClock className="h-5 w-5" />,
  },
  {
    title: "Capstone conversation",
    description: "Simple scheduling for the final capstone.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

export default async function Home() {
  const courseSlug = "year-one-biblical-formation";
  const courseMarkdown = await getMarkdown(`courses/${courseSlug}`);
  const courseDetail = await getCourseDetail(courseSlug);
  const pathwayCourse = courses.find((c) => c.slug === courseSlug);
  const heroPrompt = checkInPrompts[0];

  async function handleCheckIn(formData: FormData) {
    "use server";
    if (!courseDetail?.id) return;
    const payload: Json = {
      prompt: heroPrompt.prompt,
      learner: formData.get("learner"),
      reflection: formData.get("reflection"),
      course: courseDetail.slug,
    } as unknown as Json;

    await recordCheckIn(courseDetail.id, payload);
  }

  return (
    <div>
      <SiteHeader />
      <main className="space-y-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(28,79,156,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(12,46,109,0.16),transparent_40%)]" />
          <div className="container relative grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center py-16">
            <div className="space-y-6">
              <div className="pill w-fit">Waypoint Learning Pathway</div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Formation with checkpoints and a capstone conversation
              </h1>
              <p className="text-lg text-[var(--muted)] max-w-2xl">
                Year One guides Scripture, doctrine, culture, and mission with a simple weekly rhythm.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard" className="button-primary">
                  Go to dashboard
                </Link>
                <Link href={`/courses/${courseSlug}`} className="button-secondary">
                  View pathway outline
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <span className="flex items-center gap-2 rounded-full bg-[var(--accent-light)] px-3 py-2 text-[var(--accent-deep)]">
                  <Sparkles className="h-4 w-4" />
                  Guided pathway
                </span>
                <span className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-[var(--accent-deep)]" />
                  Checkpoints + capstone
                </span>
              </div>
            </div>
            <div className="card glow-border relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(28,79,156,0.15),transparent_40%)]" />
              <div className="relative space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--accent-deep)]">Upcoming checkpoints</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold border border-[rgba(20,34,64,0.08)]">Student view</span>
                </div>
                <div className="grid gap-3 text-sm">
                  {pathwayCourse?.checkpoints.slice(0, 3).map((checkpoint) => (
                    <div key={checkpoint.week} className="flex items-start gap-3 rounded-2xl border border-[rgba(20,34,64,0.08)] bg-white/80 px-3 py-3">
                      <CalendarClock className="h-5 w-5 text-[var(--accent-deep)]" />
                      <div>
                        <p className="font-semibold text-[var(--ink)]">Week {checkpoint.week}: {checkpoint.title}</p>
                        <p className="text-[var(--muted)]">{checkpoint.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-[var(--accent-light)] px-4 py-3 text-[var(--accent-deep)] font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Capstone scheduled with faculty reviewers
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="container space-y-8">
              <SectionHeader
                eyebrow="Year One pathway"
                title="Stay focused on formation, not platform setup"
                description="One pathway with weekly checkpoints and a guided capstone."
              />
            <div className="grid gap-6 md:grid-cols-2">
              {pathwayCourse ? <CourseCard course={pathwayCourse} ctaLabel="My courses" /> : null}
              <div className="card p-6 space-y-3">
                <p className="text-sm font-semibold text-[var(--muted)]">Live support</p>
                <div className="space-y-3">
                  {liveSessions.map((session) => (
                    <div key={session.title} className="rounded-2xl border border-[rgba(20,34,64,0.08)] bg-white px-4 py-3">
                      <p className="font-semibold text-[var(--ink)]">{session.title}</p>
                      <p className="text-sm text-[var(--muted)]">{session.focus}</p>
                      <p className="text-xs text-[var(--muted)]">Cadence: {session.cadence}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-[rgba(20,34,64,0.04)] px-4 py-3 text-sm text-[var(--muted)]">
                  Staff tools stay separate from learner views.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/80 border-y border-[rgba(20,34,64,0.08)]">
          <div className="container grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-start py-14">
            <div className="space-y-4">
              <SectionHeader
                eyebrow="Course outline"
                title="Year One / Certificate in Biblical Formation"
                description="A clear weekly rhythm."
              />
              <div className="card p-6 space-y-4 text-[var(--muted)]">
                {courseMarkdown ? (
                  <ReactMarkdown
                    components={{
                      h2: (props) => (
                        <h3 className="text-2xl font-bold text-[var(--ink)]" {...props} />
                      ),
                      h3: (props) => (
                        <h4 className="text-xl font-semibold text-[var(--ink)]" {...props} />
                      ),
                      ul: (props) => (
                        <ul className="list-disc space-y-2 pl-5" {...props} />
                      ),
                      ol: (props) => (
                        <ol className="list-decimal space-y-2 pl-5" {...props} />
                      ),
                      li: (props) => <li className="leading-relaxed" {...props} />,
                      p: (props) => <p className="leading-relaxed" {...props} />,
                    }}
                  >
                    {courseMarkdown.content}
                  </ReactMarkdown>
                ) : (
                  <p>We’ll add this content soon.</p>
                )}
              </div>
            </div>
            <div className="card p-6 space-y-4" id="check-in">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--accent-deep)]">Weekly reflection</p>
                <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold text-[var(--accent-deep)]">
                  Student view
                </span>
              </div>
              <div className="rounded-2xl bg-[rgba(20,34,64,0.04)] p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">{heroPrompt.title}</p>
                <p className="text-sm text-[var(--muted)]">{heroPrompt.prompt}</p>
              </div>
              <form action={handleCheckIn} className="space-y-3">
                <input
                  type="hidden"
                  name="prompt"
                  defaultValue={heroPrompt.prompt}
                />
                <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="learner">
                  Learner name
                </label>
                <input
                  id="learner"
                  name="learner"
                  className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Name for this demo"
                />
                <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="reflection">
                  Reflection
                </label>
                <textarea
                  id="reflection"
                  name="reflection"
                  rows={4}
                  className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                  placeholder="What did you practice this week? Any blockers before the next checkpoint?"
                />
                <button type="submit" className="button-primary w-full text-center">
                  Record check-in
                </button>
              </form>
              <p className="text-xs text-[var(--muted)]">
                Check-ins stay private to each learner.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="container space-y-8">
            <SectionHeader
              eyebrow="Student-first"
              title="Clarity for learners, control for admins"
              description="Learners see what they need. Staff tools stay separate."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {valueProps.map((value) => (
                <div key={value.title} className="card p-5 space-y-2">
                  <div className="flex items-center gap-3 text-[var(--accent-deep)]">
                    <div className="rounded-2xl bg-[var(--accent-light)] p-2">{value.icon}</div>
                    <h3 className="text-lg font-semibold">{value.title}</h3>
                  </div>
                  <p className="text-[var(--muted)]">{value.description}</p>
                </div>
              ))}
              <div className="card p-5 space-y-3">
                <div className="flex items-center gap-3 text-[var(--accent-deep)]">
                  <div className="rounded-2xl bg-[var(--accent-light)] p-2">
                    <BookOpenCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Content stays in MDX</h3>
                </div>
                <p className="text-[var(--muted)]">
                  Course content lives in <code>src/content</code>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
