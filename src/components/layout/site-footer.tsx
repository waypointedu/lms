import Link from "next/link";

const footerLinks = [
  {
    title: "Pathway",
    links: [
      { href: "/dashboard", label: "My dashboard" },
      { href: "/courses/year-one-biblical-formation", label: "Year One outline" },
      { href: "/courses", label: "Courses" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/profile", label: "Profile" },
      { href: "/verify", label: "Verify email" },
    ],
  },
  {
    title: "Waypoint",
    links: [
      { href: "https://github.com/waypointedu/lms", label: "Source" },
      { href: "https://supabase.com", label: "Supabase" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-[rgba(20,34,64,0.08)] mt-20">
      <div className="container py-14 grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="pill w-fit">Waypoint Institute</p>
          <h3 className="text-3xl font-bold">Learning Pathway</h3>
          <p className="text-[var(--muted)] max-w-xl">
            A tuition-free pathway with checkpoints, capstone conversations, and role-aware dashboards.
            Lessons live in MDX; progress, reflections, and schedules stay secure in Supabase.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-[var(--accent-deep)]">
              Magic link auth
            </span>
            <span className="rounded-full bg-[rgba(20,34,64,0.06)] px-3 py-1 text-[var(--ink)]">
              Checkpoints + capstones
            </span>
            <span className="rounded-full bg-white px-3 py-1 border border-[rgba(20,34,64,0.08)]">
              MDX content
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
          <p>Waypoint Institute • Learning Pathway</p>
          <div className="flex gap-3">
            <Link href="https://github.com/waypointedu/lms" className="hover:text-[var(--accent-deep)]">
              GitHub
            </Link>
            <span className="text-[rgba(20,34,64,0.24)]">|</span>
            <Link href="/dashboard" className="hover:text-[var(--accent-deep)]">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
