"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const emailRedirectBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : null);
  const emailRedirectTo = `${
    emailRedirectBaseUrl?.replace(/\/$/, "") ??
    (typeof window === "undefined" ? "" : window.location.origin)
  }/dashboard`;

  useEffect(() => {
    const supabaseClient = getSupabaseClient();
    const { data: subscription } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          router.replace("/dashboard");
        }
      },
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setMessage(null);

    const supabaseClient = getSupabaseClient();
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for the login link.");
  };

  return (
    <main>
      <h1>Login</h1>
      <p>Enter your email to receive a magic link.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{
              padding: "10px 12px",
              width: "100%",
              maxWidth: 360,
              borderRadius: 8,
              border: "1px solid #d1d5db",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending" || email.length === 0}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {status === "sending" ? "Sending…" : "Send login link"}
        </button>
      </form>
      {message && (
        <p style={{ marginTop: 16, color: status === "error" ? "#b91c1c" : "#111827" }}>
          {message}
        </p>
      )}
    </main>
  );
}
