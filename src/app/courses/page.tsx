import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";
import { getMarkdown, listCourseMarkdown } from "@/lib/markdown";
import { getCatalogCourses } from "@/lib/queries";
import { slugify } from "@/lib/slug";

const languages = [
  { value: "", label: "All languages" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

export default async function CoursesPage({ searchParams }: { searchParams: { language?: string } }) {
  const normalizeLanguage = (value?: string | null) => {
    const normalized = value?.toLowerCase().trim();
    if (!normalized) return "";
    if (normalized.startsWith("en")) return "en";
    if (normalized.startsWith("es") || normalized.startsWith("spa") || normalized.startsWith("españ")) return "es";
    return normalized;
  };

  const selectedLanguage = normalizeLanguage(searchParams?.language);
  const catalog = (await getCatalogCourses()).filter((course) =>
    selectedLanguage ? normalizeLanguage(course.language) === selectedLanguage : true,
  );
  const markdownSlugs = await listCourseMarkdown();
  const markdownContent = await Promise.all(
    markdownSlugs.map(async (slug) => getMarkdown(`courses/${slug}`)),
  );

  return (
    <div>
      <SiteHeader />
      <main className="container space-y-14 py-12">
        <SectionHeader
          eyebrow="Learning pathways"
          title="Waypoint Institute • Year One"
          description="View the pathway outline, checkpoints, and capstone-ready lessons. Students only see what they are enrolled in."
        />

        <form className="flex flex-wrap items-center gap-3" action="/courses" method="get">
          <label className="text-sm font-semibold text-[var(--muted)]" htmlFor="language">
            Language
          </label>
          <select
            id="language"
            name="language"
            defaultValue={selectedLanguage}
            className="border border-[rgba(20,34,64,0.12)] rounded-xl px-3 py-2 text-sm"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <button className="button-secondary" type="submit">
            Apply
          </button>
          {selectedLanguage ? (
            <Link href="/courses" className="text-sm text-[var(--accent-deep)] font-semibold">
              Reset
            </Link>
          ) : null}
        </form>

        {catalog.length === 0 ? (
          <div className="card p-6 text-[var(--muted)]">
            No courses found for this language. Try another filter or check back soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {catalog.map((course) => {
              const courseKey = course.slug || course.title || "course";
              const courseSlug = slugify(course.slug || course.title || "");

              return (
                <div key={courseKey} id={courseSlug} className="card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="pill">{course.language ? course.language.toUpperCase() : "Course"}</span>
                    {course.published ? (
                      <span className="text-sm text-[var(--muted)]">Published</span>
                    ) : (
                      <span className="text-sm text-[var(--muted)]">Draft</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold">{course.title}</h2>
                  <p className="text-[var(--muted)]">{course.description}</p>
                  <p className="text-sm text-[var(--muted)]">
                    Duration: {course.duration_weeks ? `${course.duration_weeks} weeks` : course.duration || "Self-paced"}
                  </p>
                  <Link href={`/courses/${courseSlug}`} className="button-secondary w-fit">
                    View course
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 items-start">
          {markdownContent.map((markdown) => (
            <div key={markdown?.slug} className="card p-6 space-y-3">
              <p className="text-sm font-semibold text-[var(--muted)]">Course preview</p>
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
                  <p>Content not found. Add pathway details under src/content/courses.</p>
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
