"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState(
    process.env.NEXT_PUBLIC_WAYPOINT_SITE_URL || "",
  );
  const [isPending, startTransition] = useTransition();

  const missingSupabaseMessage =
    "Sign-in is not ready yet. Please try again later.";

  useEffect(() => {
    setRedirectUrl(
      process.env.NEXT_PUBLIC_WAYPOINT_SITE_URL || window.location.origin,
    );
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setMessage(missingSupabaseMessage);
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      const destination = redirectUrl ? `${redirectUrl}/dashboard` : "/dashboard";
      window.location.href = destination;
    });
  };

  const handleResetPassword = () => {
    if (!supabase) {
      setMessage(missingSupabaseMessage);
      return;
    }

    startTransition(async () => {
      if (!email) {
        setMessage("Enter your email first.");
        return;
      }

      const destination = redirectUrl ? `${redirectUrl}/reset` : "/reset";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        options: {
          redirectTo: destination,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Check your email for a reset link.");
    });
  };

  return (
    <main className="container py-16 space-y-8">
      <div className="max-w-xl space-y-3">
        <p className="pill">Welcome</p>
        <h1 className="text-4xl font-bold">Sign in</h1>
        <p className="text-[var(--muted)]">
          Enter your email and password to start learning.
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
          <label
            className="block text-sm font-semibold text-[var(--ink)]"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[rgba(20,34,64,0.12)] bg-white px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
            placeholder="Enter your password"
          />
          <button
            type="submit"
            className="button-primary w-full"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <button
          type="button"
          className="button-secondary w-full"
          onClick={handleResetPassword}
          disabled={isPending}
        >
          {isPending ? "Sending email..." : "Reset password"}
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
