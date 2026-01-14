import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/profile", label: "Account" },
];

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-[rgba(20,34,64,0.08)] mt-20">
      <div className="container py-12 grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="pill w-fit">Waypoint Institute</p>
          <h3 className="text-3xl font-bold">Learning Pathway</h3>
          <p className="text-[var(--muted)] max-w-xl">
            A calm home for checkpoints, lessons, and the capstone schedule.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--accent-deep)]">
              {link.label}
            </Link>
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
