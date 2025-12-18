import { notFound, redirect } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const supabaseClient = await supabase;
  if (!supabaseClient) {
    return (
      <main className="container py-16 space-y-4">
        <h1 className="text-3xl font-bold">Certificates unavailable</h1>
        <p className="text-[var(--muted)]">Configure Supabase keys to view certificates.</p>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabaseClient
    .from("certificates")
    .select("id, issued_at, verification_code, course:course_id(title, slug), user_id")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data || data.user_id !== user.id) return notFound();

  return (
    <div>
      <SiteHeader />
      <main className="container py-16">
        <div className="card p-8 space-y-4 print:border print:shadow-none">
          <p className="pill w-fit">Waypoint LMS Certificate</p>
          <h1 className="text-4xl font-bold">Certificate of Completion</h1>
          <p className="text-lg text-[var(--muted)]">Awarded to</p>
          <p className="text-2xl font-semibold">{user.email}</p>
          <p className="text-lg text-[var(--muted)]">for completing</p>
          <p className="text-2xl font-semibold">{(data.course as { title?: string })?.title}</p>
          <p className="text-sm text-[var(--muted)]">Issued: {data.issued_at}</p>
          <p className="text-sm text-[var(--muted)]">Verification code: {data.verification_code}</p>
          <button className="button-secondary print:hidden" onClick={() => window.print()}>
            Print / Save PDF
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
