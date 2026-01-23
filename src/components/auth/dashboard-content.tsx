"use client";

import { getSupabaseClient } from "@/lib/supabase/client";

export function DashboardContent() {
  const handleLogout = async () => {
    const supabaseClient = getSupabaseClient();
    await supabaseClient.auth.signOut();
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome back! You are signed in.</p>
      <button
        type="button"
        onClick={handleLogout}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Log out
      </button>
    </main>
  );
}
