"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/permissions";

type AdminGateProps = {
  children: ReactNode;
};

type GateState = "checking" | "allowed" | "denied";

export function AdminGate({ children }: AdminGateProps) {
  const [state, setState] = useState<GateState>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const supabaseClient = getSupabaseClient();
        const { data, error } = await supabaseClient.auth.getUser();

        if (error || !data.user) {
          setState("denied");
          setErrorMessage("Unable to load your session.");
          return;
        }

        const admin = await isAdmin(supabaseClient, data.user.id);
        setState(admin ? "allowed" : "denied");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to verify admin access.";
        setErrorMessage(message);
        setState("denied");
      }
    };

    checkAdmin();
  }, []);

  if (state === "checking") {
    return <p>Checking admin access…</p>;
  }

  if (state === "denied") {
    return (
      <div>
        <h2>Admin access required</h2>
        <p>{errorMessage ?? "You do not have access to this page."}</p>
      </div>
    );
  }

  return <>{children}</>;
}
