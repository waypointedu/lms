"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseClient } from "@/lib/supabase/client";

type SessionGateProps = {
  children: ReactNode;
};

type ProfileUpsert = {
  id: string;
  email?: string;
  full_name?: string;
};

export function SessionGate({ children }: SessionGateProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabaseClient = getSupabaseClient();

    const init = async () => {
      const { data, error } = await supabaseClient.auth.getSession();

      if (!isMounted) return;

      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      const user = data.session.user;
      const profileData: ProfileUpsert = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name,
      };

      await supabaseClient.from("profiles").upsert(profileData as never, {
        onConflict: "id",
      });

      setReady(true);
    };

    init();

    const { data: subscription } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace("/login");
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [router]);

  if (!ready) {
    return (
      <main>
        <h1>Checking session…</h1>
        <p>Please wait while we verify your login.</p>
      </main>
    );
  }

  return <>{children}</>;
}
