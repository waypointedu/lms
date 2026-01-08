import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function VerifyIndexPage() {
  return (
    <div>
      <SiteHeader />
      <main className="container py-16 space-y-8">
        <div className="space-y-3 max-w-2xl">
          <p className="pill">Email verification</p>
          <h1 className="text-4xl font-bold">Confirm your email address</h1>
          <p className="text-[var(--muted)]">
            Open the verification link sent to your inbox to finish setting up your account. If the link has expired,
            request a new magic link from the sign-in page.
          </p>
        </div>
        <div className="card p-6 max-w-xl space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--muted)]">
            <li>Check your email for a verification message from Waypoint.</li>
            <li>Open the verification link on this device to complete the flow.</li>
            <li>If you don&apos;t see it, check spam or request a new magic link.</li>
          </ol>
          <Link href="/login" className="button-primary w-fit">
            Go to sign in
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
