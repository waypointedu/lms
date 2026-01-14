import { redirect } from "next/navigation";

import { signOut, updateAccount } from "@/app/actions/lms";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCurrentProfile } from "@/lib/queries";

async function saveProfile(formData: FormData) {
  "use server";
  await updateAccount(formData);
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
        <div className="max-w-2xl space-y-3">
          <p className="pill">Account</p>
          <h1 className="text-4xl font-bold">Your profile</h1>
          <p className="text-[var(--muted)]">Keep your contact details up to date for enrollments and certificates.</p>
        </div>
        <form className="card p-6 max-w-2xl space-y-6" action={saveProfile}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                defaultValue={session?.profile?.first_name || ""}
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="Alex"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                defaultValue={session?.profile?.last_name || ""}
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="Rivera"
              />
            </div>
          </div>
          <div className="space-y-2">
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={session?.profile?.email || session?.user?.email || ""}
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="alex@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={session?.profile?.phone || ""}
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="(555) 555-5555"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="mailingAddressLine1">
              Mailing address
            </label>
            <input
              id="mailingAddressLine1"
              name="mailingAddressLine1"
              defaultValue={session?.profile?.mailing_address_line1 || ""}
              className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
              placeholder="123 Main St"
            />
            <input
              id="mailingAddressLine2"
              name="mailingAddressLine2"
              defaultValue={session?.profile?.mailing_address_line2 || ""}
              className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
              placeholder="Apt 4B"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="mailingCity">
                City
              </label>
              <input
                id="mailingCity"
                name="mailingCity"
                defaultValue={session?.profile?.mailing_city || ""}
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="Seattle"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="mailingState">
                State
              </label>
              <input
                id="mailingState"
                name="mailingState"
                defaultValue={session?.profile?.mailing_state || ""}
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="WA"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="mailingPostalCode">
                Postal code
              </label>
              <input
                id="mailingPostalCode"
                name="mailingPostalCode"
                defaultValue={session?.profile?.mailing_postal_code || ""}
                className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
                placeholder="98101"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="mailingCountry">
              Country
            </label>
            <input
              id="mailingCountry"
              name="mailingCountry"
              defaultValue={session?.profile?.mailing_country || ""}
              className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
              placeholder="United States"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="newPassword">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="button-primary">Save changes</button>
            <button type="submit" formAction={signOut} className="button-secondary">Sign out</button>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
