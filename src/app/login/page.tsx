"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setMessage("Supabase is not configured. Add env vars to enable login.");
      return;
    }

    startTransition(async () => {
      const redirectUrl = process.env.NEXT_PUBLIC_WAYPOINT_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${redirectUrl}/dashboard`,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Check your email for the magic link.");
    });
  };

  return (
    <main className="container py-16 space-y-8">
      <div className="max-w-xl space-y-3">
        <p className="pill">Supabase auth</p>
        <h1 className="text-4xl font-bold">Sign in to Waypoint LMS</h1>
        <p className="text-[var(--muted)]">
          Use email magic links (passwords optional). After signing in, you will be redirected to the dashboard and your
          profile will be provisioned.
        </p>
      </div>
      <div className="card p-6 max-w-xl space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-[var(--ink)]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
            placeholder="you@example.com"
          />
          <button type="submit" className="button-primary w-full" disabled={isPending}>
            {isPending ? "Sending magic link..." : "Send magic link"}
          </button>
        </form>
        {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
        <p className="text-sm text-[var(--muted)]">
          Need an account? <Link href="/courses" className="text-[var(--accent-deep)] font-semibold">Browse courses</Link>
        </p>
      </div>
    </main>
  );
}
