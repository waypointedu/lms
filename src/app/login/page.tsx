"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Github } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const missingSupabaseMessage =
    "Supabase is not configured. Add env vars to enable login.";
  const redirectUrl =
    process.env.NEXT_PUBLIC_WAYPOINT_SITE_URL || window.location.origin;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setMessage(missingSupabaseMessage);
      return;
    }

    startTransition(async () => {
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

  const handleGithubLogin = () => {
    if (!supabase) {
      setMessage(missingSupabaseMessage);
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${redirectUrl}/dashboard`,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        setMessage("Redirecting to GitHub...");
      }
    });
  };

  return (
    <main className="container py-16 space-y-8">
      <div className="max-w-xl space-y-3">
        <p className="pill">Supabase auth</p>
        <h1 className="text-4xl font-bold">Sign in to Waypoint LMS</h1>
        <p className="text-[var(--muted)]">
          Use email magic links or GitHub SSO. After signing in, you will be
          redirected to the dashboard and your profile will be provisioned.
        </p>
      </div>
      <div className="card max-w-xl space-y-3 p-6">
        <h2 className="text-xl font-semibold text-[var(--ink)]">How to get started</h2>
        <p className="text-[var(--muted)]">Follow these quick steps to begin:</p>
        <ol className="list-decimal space-y-2 pl-5 text-[var(--ink)]">
          <li>Sign in with your email.</li>
          <li>Open your course.</li>
          <li>Press Continue.</li>
          <li>Mark lessons done.</li>
        </ol>
      </div>
      <div className="card p-6 max-w-xl space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label
            className="block text-sm font-semibold text-[var(--ink)]"
            htmlFor="email"
          >
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
          <button
            type="submit"
            className="button-primary w-full"
            disabled={isPending}
          >
            {isPending ? "Sending magic link..." : "Send magic link"}
          </button>
        </form>
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <div className="h-px flex-1 bg-[rgba(20,34,64,0.12)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            or
          </span>
          <div className="h-px flex-1 bg-[rgba(20,34,64,0.12)]" />
        </div>

        <button
          type="button"
          className="button-secondary w-full flex items-center justify-center gap-2"
          onClick={handleGithubLogin}
          disabled={isPending}
        >
          <Github className="h-4 w-4" />
          {isPending ? "Connecting to GitHub..." : "Continue with GitHub"}
        </button>

        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}
        <p className="text-sm text-[var(--muted)]">
          Need an account?{" "}
          <Link
            href="/courses"
            className="text-[var(--accent-deep)] font-semibold"
          >
            Browse courses
          </Link>
        </p>
      </div>
    </main>
  );
}
