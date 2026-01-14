import Link from "next/link";

const footerLinks = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/courses", label: "Courses" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/profile", label: "Profile" },
      { href: "/login", label: "Sign in" },
      { href: "/verify", label: "Verify email" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-[rgba(20,34,64,0.08)] mt-20">
      <div className="container py-12 grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="pill w-fit">Waypoint Institute</p>
          <h3 className="text-3xl font-bold">Learning Pathway</h3>
          <p className="text-[var(--muted)] max-w-xl">
            A calm home for checkpoints, lessons, and the capstone schedule.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{section.title}</p>
              <div className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-[var(--accent-deep)]">
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
        </div>
      </div>
    </footer>
  );
}
