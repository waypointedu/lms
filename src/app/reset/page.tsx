"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const missingSupabaseMessage =
    "Password reset is not ready yet. Please try again later.";
  const missingSessionMessage =
    "Open the reset link from your email to continue.";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setMessage(missingSupabaseMessage);
      return;
    }

    startTransition(async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage(missingSessionMessage);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Password updated. Please sign in.");
      window.location.href = "/login";
    });
  };

  return (
    <main className="container py-16 space-y-8">
      <div className="max-w-xl space-y-3">
        <p className="pill">Reset</p>
        <h1 className="text-4xl font-bold">Set a new password</h1>
        <p className="text-[var(--muted)]">
          Enter a new password to keep learning.
        </p>
      </div>

      <div className="card p-6 max-w-xl space-y-4">
        {supabase ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label
              className="block text-sm font-semibold text-[var(--ink)]"
              htmlFor="password"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
              placeholder="Enter a new password"
            />
            <button
              type="submit"
              className="button-primary w-full"
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Update password"}
            </button>
          </form>
        ) : null}

        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}
        {!message && !supabase ? (
          <p className="text-sm text-[var(--muted)]">{missingSupabaseMessage}</p>
        ) : null}
        <p className="text-sm text-[var(--muted)]">
          <Link
            href="/login"
            className="text-[var(--accent-deep)] font-semibold"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
