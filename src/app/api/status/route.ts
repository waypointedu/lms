import { NextResponse } from "next/server";

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const waypointSiteUrl = process.env.WAYPOINT_SITE_URL || process.env.NEXT_PUBLIC_WAYPOINT_SITE_URL;

  return NextResponse.json({
    app: "Waypoint LMS",
    supabaseConfigured,
    hasServiceRole,
    repository: "waypointedu/lms",
    waypointSiteUrl,
    timestamp: new Date().toISOString(),
  });
}
