import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";

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
    title: "Simple sign-in and uploads",
    description: "Log in quickly and share files without fuss.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: "Lessons live in one place",
    description: "Keep course notes, videos, and worksheets together.",
    icon: <BookOpenCheck className="h-5 w-5" />,
  },
  {
    title: "Live sessions and practice",
    description: "Join live calls, log check-ins, and review quick quizzes.",
    icon: <CalendarClock className="h-5 w-5" />,
  },
];

export default async function Home() {
  const courseMarkdown = await getMarkdown("courses/waypoint-foundations");
  const courseDetail = await getCourseDetail("waypoint-foundations");
  const heroPrompt = checkInPrompts[0];

  async function handleCheckIn(formData: FormData) {
    "use server";
    if (!courseDetail?.id) return;
    const payload: Json = {
      prompt: heroPrompt.prompt,
      learner: formData.get("learner"),
      reflection: formData.get("reflection"),
      course: formData.get("course"),
    } as unknown as Json;

    await recordCheckIn(courseDetail.id, payload);
  }

  return (
    <div>
      <SiteHeader />
      <main className="space-y-20">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(28,79,156,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(12,46,109,0.16),transparent_40%)]" />
          <div className="container relative grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center py-16">
            <div className="space-y-6">
              <div className="pill w-fit">Guided learning • Friendly setup</div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Waypoint helps your learners stay on track
              </h1>
              <p className="text-lg text-[var(--muted)] max-w-2xl">
                Run cohorts with clear lessons, quick sign-in, and easy uploads. Keep everyone focused without the technical clutter.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard" className="button-primary">
                  Open dashboard
                </Link>
                <Link href="/courses" className="button-secondary">
                  Browse courses
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <span className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                  <Sparkles className="h-4 w-4 text-[var(--accent-deep)]" />
                  Ready for live cohorts
                </span>
                <span className="flex items-center gap-2 rounded-full bg-[var(--accent-light)] px-3 py-2 text-[var(--accent-deep)]">
                  <CheckCircle2 className="h-4 w-4" />
                  Resources in one place
                </span>
              </div>
            </div>
            <div className="card glow-border relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(28,79,156,0.15),transparent_40%)]" />
              <div className="relative space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--accent-deep)]">Live cohort toolkit</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold border border-[rgba(20,34,64,0.08)]">All set up</span>
                </div>
                <div className="grid gap-3 text-sm">
                  {liveSessions.map((session) => (
                    <div key={session.title} className="flex items-start gap-3 rounded-2xl border border-[rgba(20,34,64,0.08)] bg-white/80 px-3 py-3">
                      <Video className="h-5 w-5 text-[var(--accent-deep)]" />
                      <div>
                        <p className="font-semibold text-[var(--ink)]">{session.title}</p>
                        <p className="text-[var(--muted)]">{session.cadence}</p>
                        <p className="text-sm text-[var(--muted)]">{session.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-[var(--accent-light)] px-4 py-3 text-[var(--accent-deep)] font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Safe sign-in and storage
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="container space-y-8">
            <SectionHeader
              eyebrow="Platform foundations"
              title="Built-in support for learners"
              description="Welcome your cohort with easy sign-in, clear progress, and shared materials that stay in sync."
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
            </div>
          </div>
        </section>

        <section className="bg-white/80 border-y border-[rgba(20,34,64,0.08)]">
          <div className="container space-y-10 py-14">
            <SectionHeader
              eyebrow="Courses"
              title="Tracks ready to start today"
              description="Jump into a ready-made course or add your own lessons. Everything stays organized for your group."
            />
            <div className="grid gap-6 md:grid-cols-2">
              {courses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="container grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-start">
            <div className="space-y-4">
              <SectionHeader
                eyebrow="Content library"
                title="Content that stays easy to read"
                description="Keep your syllabus in one place and share it with the class. Lessons render quickly and look great on any device."
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
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--accent-deep)]">Check-ins and quick quizzes</p>
                <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold text-[var(--accent-deep)]">
                  Quick setup
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
                  placeholder="Alex Rivera"
                />
                <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="course">
                  Course
                </label>
                <input
                  id="course"
                  name="course"
                  className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Waypoint Foundations"
                />
                <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="reflection">
                  Reflection
                </label>
                <textarea
                  id="reflection"
                  name="reflection"
                  rows={4}
                  className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Share a win, a blocker, or a question for the team."
                />
                <button type="submit" className="button-primary w-full text-center">
                  Record check-in
                </button>
              </form>
              <p className="text-xs text-[var(--muted)]">
                Saving check-ins needs a quick setup step. Until then, the form is a safe demo.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/90 border-y border-[rgba(20,34,64,0.08)]">
          <div className="container space-y-10 py-14">
            <SectionHeader
              eyebrow="Classroom tools"
              title="Run your cohort with ease"
              description="Track enrollments, share media, and watch progress at a glance. Everything you need to guide learners is already here."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {["Enrollments & entitlements", "Media & submissions", "Progress & analytics"].map((item) => (
                <div key={item} className="card p-5 space-y-2">
                  <h3 className="text-lg font-semibold">{item}</h3>
                  <p className="text-[var(--muted)]">
                    {item === "Enrollments & entitlements"
                      ? "Invite learners, manage seats, and keep track of who’s in the room."
                      : item === "Media & submissions"
                        ? "Collect videos, notes, and homework in one shared space."
                        : "View check-ins, quiz results, and attendance in one place."}
                  </p>
                  <Link href="/dashboard" className="text-[var(--accent-deep)] font-semibold">
                    View dashboard
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
