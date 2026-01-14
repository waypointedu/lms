import { ClipboardList } from "lucide-react";
import { CourseBuilder } from "@/components/admin/course-builder";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();
  const { data: courses } = supabase
    ? await supabase.from("courses").select("id, title").order("title", { ascending: true })
    : { data: [] };
  const { data: pathwaysData } = supabase
    ? await supabase.from("courses").select("pathway").not("pathway", "is", null)
    : { data: [] };
  const basePathways =
    (pathwaysData || [])
      .map((row: { pathway: string | null }) => row.pathway)
      .filter((pathway): pathway is string => Boolean(pathway)) || [];
  const pathways = Array.from(new Set(basePathways)).sort((a, b) => a.localeCompare(b));

  let instructors: Array<{ id: string; display_name: string | null; email: string | null; role: string | null }> = [];
  if (supabase) {
    const { data: profileInstructors } = await supabase
      .from("profiles")
      .select("id, display_name, email, role")
      .in("role", ["admin", "instructor"]);

    const { data: roleAssignments } = await supabase
      .from("profile_roles")
      .select("profile_id, roles!inner(slug)")
      .in("roles.slug", ["admin", "instructor"]);
    const roleProfileIds =
      roleAssignments
        ?.map((row: { profile_id: string }) => row.profile_id)
        .filter(Boolean) || [];
    const { data: roleProfiles } = roleProfileIds.length
      ? await supabase.from("profiles").select("id, display_name, email, role").in("id", roleProfileIds)
      : { data: [] };

    const merged = new Map<string, { id: string; display_name: string | null; email: string | null; role: string | null }>();
    (profileInstructors || []).forEach((profile) => merged.set(profile.id, profile));
    (roleProfiles || []).forEach((profile) => merged.set(profile.id, profile));
    instructors = Array.from(merged.values()).sort((a, b) =>
      (a.display_name || a.email || "").localeCompare(b.display_name || b.email || ""),
    );
  }

  const courseOptions = (courses || []).map((course) => ({ id: course.id, title: course.title }));

  return (
    <div>
      <SiteHeader />
      <main className="container space-y-14 py-12">
        <SectionHeader
          eyebrow="Admin toolkit"
          title="Course builder"
          description="Create a course and begin building the learner-facing experience."
        />

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[var(--accent-deep)]">
            <ClipboardList className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Create a course</h3>
          </div>
          <CourseBuilder
            courses={courseOptions}
            pathways={pathways}
            instructors={instructors.map((instructor) => ({
              id: instructor.id,
              displayName: instructor.display_name || instructor.email || "Instructor",
              email: instructor.email,
              role: instructor.role,
            }))}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
