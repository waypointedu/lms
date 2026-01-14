"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getServiceRoleClient } from "@/lib/supabase";

const allowedRoles = ["student", "faculty", "admin"] as const;
type AssignableRole = (typeof allowedRoles)[number];

export async function assignRole(userId: string, role: AssignableRole) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };

  if (!allowedRoles.includes(role)) {
    return { ok: false, message: "Invalid role requested." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sign in to assign roles." };

  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const { data: adminRoles } = await supabase
    .from("profile_roles")
    .select("roles!inner(slug)")
    .eq("profile_id", user.id);
  const roleSlugs =
    adminRoles
      ?.map((row: { roles?: { slug?: string | null } | null }) => row.roles?.slug)
      .filter((slug): slug is string => Boolean(slug)) || [];
  if (adminProfile?.role !== "admin" && !roleSlugs.includes("admin")) {
    return { ok: false, message: "Only admins can change roles." };
  }

  const client = getServiceRoleClient() || supabase;

  const { data: roleRow, error: roleError } = await client.from("roles").select("id").eq("slug", role).maybeSingle();
  if (roleError || !roleRow) {
    return { ok: false, message: "Role not found in database." };
  }

  const { error: profileError } = await client.from("profiles").update({ role }).eq("id", userId);
  if (profileError) {
    return { ok: false, message: "Unable to update primary profile role." };
  }

  await client
    .from("profile_roles")
    .upsert({ profile_id: userId, role_id: roleRow.id, assigned_by: user.id });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { ok: true, message: "Role updated." };
}
