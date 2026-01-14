import Link from "next/link";
import { Sparkles } from "lucide-react";

import { signOut } from "@/app/actions/lms";
import { getCurrentProfile } from "@/lib/queries";

export async function SiteHeader() {
  const session = await getCurrentProfile();
  const roles = session?.roles || [];
  const profileRole = session?.profile?.role;
  const isAdmin = roles.includes("admin") || profileRole === "admin";
  const navLinks = [
    { href: "/", label: "Home", visible: true },
    { href: "/courses", label: "Courses", visible: true },
    { href: "/dashboard", label: "My dashboard", visible: Boolean(session?.user) },
    { href: "/admin", label: "Admin", visible: isAdmin },
  ].filter((link) => link.visible);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-white/85 via-white/92 to-white/70 backdrop-blur-lg border-b border-[rgba(20,34,64,0.08)]">
      <div className="container flex flex-col gap-3 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(28,79,156,0.28),rgba(12,46,109,0.06))] border border-[rgba(20,34,64,0.08)] shadow-sm flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[var(--accent-deep)]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Waypoint</p>
              <p className="text-xl font-bold text-[var(--ink)]">Learning Pathway</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {session?.profile?.display_name ? (
              <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-sm font-semibold text-[var(--accent-deep)]">
                {session.profile.display_name}
              </span>
            ) : null}
            {session?.user ? (
              <>
                <Link href="/profile" className="button-secondary">
                  Account
                </Link>
                <form action={signOut}>
                  <button type="submit" className="button-secondary">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="button-secondary">
                Login
              </Link>
            )}
          </div>
        </div>

        <nav className="glass-panel flex items-center px-4 py-3">
          <div className="flex items-center gap-8 text-[var(--muted)] font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative pb-1 transition-colors hover:text-[var(--accent-deep)]"
              >
                {link.label}
                <span className="absolute left-0 -bottom-1 h-[2px] w-full scale-x-0 transform bg-[var(--accent)] transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
