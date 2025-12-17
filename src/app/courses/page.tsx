import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";
import { getMarkdown, listCourseMarkdown } from "@/lib/markdown";
import { getCatalogCourses } from "@/lib/queries";

export default async function CoursesPage() {
  const catalog = await getCatalogCourses();
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
          {catalog.map((course) => (
            <div key={course.slug} id={course.slug} className="card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="pill">Course</span>
                {course.published ? (
                  <span className="text-sm text-[var(--muted)]">Published</span>
                ) : (
                  <span className="text-sm text-[var(--muted)]">Draft</span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{course.title}</h2>
              <p className="text-[var(--muted)]">{course.description}</p>
              <Link href={`/courses/${course.slug}`} className="button-secondary w-fit">
                View course
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
