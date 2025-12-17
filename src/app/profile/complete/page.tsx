import { redirect } from "next/navigation";

import { upsertProfile } from "@/app/actions/lms";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCurrentProfile } from "@/lib/queries";

async function saveProfile(formData: FormData) {
  "use server";
  const displayName = String(formData.get("displayName") || "").trim();
  await upsertProfile(displayName);
  redirect("/dashboard");
}

export default async function CompleteProfilePage() {
  const session = await getCurrentProfile();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <SiteHeader />
      <main className="container py-16 space-y-8">
        <div className="max-w-xl space-y-3">
          <p className="pill">Profile</p>
          <h1 className="text-4xl font-bold">Complete your profile</h1>
          <p className="text-[var(--muted)]">We use your display name for check-ins, attendance, and admin views.</p>
        </div>
        <form className="card p-6 max-w-xl space-y-4" action={saveProfile}>
          <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="displayName">
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={session?.profile?.display_name || ""}
            required
            className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
            placeholder="Alex Rivera"
          />
          <button type="submit" className="button-primary w-full">Save and continue</button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
