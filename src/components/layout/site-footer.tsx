import Link from "next/link";

const footerLinks = [
  {
    title: "Platform",
    links: [
      { href: "/dashboard", label: "Learner dashboard" },
      { href: "/courses", label: "Course catalog" },
      { href: "/admin", label: "Admin toolkit" },
    ],
  },
  {
    title: "Docs",
    links: [
      { href: "https://supabase.com/docs", label: "Supabase" },
      { href: "https://nextjs.org/docs", label: "Next.js" },
      { href: "https://vercel.com/docs", label: "Vercel" },
    ],
  },
  {
    title: "Source",
    links: [
      { href: "https://github.com/waypointedu/lms", label: "GitHub repo" },
      { href: "https://github.com/waypointedu/course-content", label: "Content repo" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-[rgba(20,34,64,0.08)] mt-20">
      <div className="container py-14 grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="pill w-fit">GitHub-centered deployments</p>
          <h3 className="text-3xl font-bold">Waypoint LMS</h3>
          <p className="text-[var(--muted)] max-w-xl">
            Supabase-powered auth, content, media, and analytics with a
            production-grade Waypoint UI. Deploy to Vercel, sync content from
            GitHub, and scale with RLS and storage buckets.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-[var(--accent-deep)]">
              Magic link auth
            </span>
            <span className="rounded-full bg-[rgba(20,34,64,0.06)] px-3 py-1 text-[var(--ink)]">
              Storage buckets ready
            </span>
            <span className="rounded-full bg-white px-3 py-1 border border-[rgba(20,34,64,0.08)]">
              MDX in GitHub
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide">
                {section.title}
              </p>
              <div className="space-y-2">
                {section.links.map((link) => (
                  <Link key={link.href} href={link.href} className="block hover:text-[var(--accent-deep)]">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-[rgba(20,34,64,0.08)]">
        <div className="container flex flex-col gap-3 py-5 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>Built with Next.js App Router, Supabase, Tailwind CSS 4.</p>
          <div className="flex gap-3">
            <Link href="https://github.com/waypointedu/lms" className="hover:text-[var(--accent-deep)]">
              GitHub
            </Link>
            <span className="text-[rgba(20,34,64,0.24)]">|</span>
            <Link href="/api/status" className="hover:text-[var(--accent-deep)]">
              API status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
