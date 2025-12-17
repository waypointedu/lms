import { NextResponse } from "next/server";

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return NextResponse.json({
    app: "Waypoint LMS",
    supabaseConfigured,
    repository: "waypointedu/lms",
    timestamp: new Date().toISOString(),
  });
}
