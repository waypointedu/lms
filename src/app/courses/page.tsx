import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";
import { courses } from "@/data/courses";
import { getMarkdown, listCourseMarkdown } from "@/lib/markdown";

export default async function CoursesPage() {
  const markdownSlugs = await listCourseMarkdown();
  const markdownContent = await Promise.all(
    markdownSlugs.map(async (slug) => getMarkdown(`courses/${slug}`)),
  );

  return (
    <div>
      <SiteHeader />
      <main className="container space-y-14 py-12">
        <SectionHeader
          eyebrow="Course catalog"
          title="Author in Markdown, publish with Next.js"
          description="These tracks are stored in the repository as MDX. Fork the repo, add your own courses, and load external content with a Git submodule or GitHub API."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course.slug} id={course.slug} className="card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="pill">{course.level}</span>
                <span className="text-sm text-[var(--muted)]">{course.duration}</span>
              </div>
              <h2 className="text-2xl font-bold">{course.title}</h2>
              <p className="text-[var(--muted)]">{course.description}</p>
              <div className="grid gap-2 text-sm">
                {course.lessons.slice(0, 3).map((lesson) => (
                  <div key={lesson.title} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                    <span className="font-semibold text-[var(--ink)]">{lesson.title}</span>
                    <span className="text-[var(--muted)]">• {lesson.duration}</span>
                  </div>
                ))}
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
              <Link href="/dashboard" className="button-secondary w-fit">
                Start course
              </Link>
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 items-start">
          {markdownContent.map((markdown) => (
            <div key={markdown?.slug} className="card p-6 space-y-3">
              <p className="text-sm font-semibold text-[var(--muted)]">GitHub MDX</p>
              <h3 className="text-xl font-bold">{markdown?.data.title as string}</h3>
              <p className="text-sm text-[var(--muted)]">
                Audience: {markdown?.data.audience as string} • Duration: {markdown?.data.duration as string}
              </p>
              <div className="space-y-2 text-[var(--muted)]">
                {markdown ? (
                  <ReactMarkdown
                    components={{
                      h2: (props) => (
                        <h4 className="text-lg font-semibold text-[var(--ink)]" {...props} />
                      ),
                      ul: (props) => (
                        <ul className="list-disc space-y-2 pl-5" {...props} />
                      ),
                      li: (props) => <li className="leading-relaxed" {...props} />,
                      p: (props) => <p className="leading-relaxed" {...props} />,
                    }}
                  >
                    {markdown.content}
                  </ReactMarkdown>
                ) : (
                  <p>Content not found. Add MDX files under src/content/courses.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
