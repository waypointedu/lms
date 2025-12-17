import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getServiceRoleClient } from "@/lib/supabase";

export default async function VerifyPage({ params }: { params: { code: string } }) {
  const service = getServiceRoleClient();

  if (!service) {
    return (
      <main className="container py-14 space-y-6">
        <h1 className="text-3xl font-bold">Verification unavailable</h1>
        <p className="text-[var(--muted)]">Add SUPABASE_SERVICE_ROLE_KEY to enable certificate verification.</p>
      </main>
    );
  }

  const { data, error } = await service
    .from("certificates")
    .select("verification_code, issued_at, course:course_id(title, slug), user:user_id")
    .eq("verification_code", params.code)
    .maybeSingle();

  if (error || !data) return notFound();

  return (
    <div>
      <SiteHeader />
      <main className="container py-16 space-y-6">
        <div className="pill">Certificate verification</div>
        <h1 className="text-4xl font-bold">Certificate is valid</h1>
        <div className="card p-6 space-y-3">
          <p className="text-sm text-[var(--muted)]">Verification code: {data.verification_code}</p>
          <p className="text-lg font-semibold">{(data.course as { title?: string })?.title || "Course"}</p>
          <p className="text-sm text-[var(--muted)]">Issued at: {data.issued_at}</p>
          <p className="text-sm text-[var(--muted)]">User: {(data.user as { id?: string })?.id || "(redacted)"}</p>
          <Link href="/" className="button-secondary w-fit">
            Back to home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
