import { cookies } from "next/headers";
import { createServerClient, type SupabaseClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/supabase";

export function getSupabaseServerClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Ignore write failures (e.g., during static prerender)
          }
        });
      },
    },
  });
}
