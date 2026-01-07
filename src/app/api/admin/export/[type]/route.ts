import { NextResponse } from "next/server";

import { getServiceRoleClient } from "@/lib/supabase";

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => JSON.stringify(row[header] ?? "")).join(","));
  }
  return lines.join("\n");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
): Promise<Response> {
  const { type } = await params;

  const supabase = getServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 501 });
  }

  let data: Record<string, unknown>[] = [];

  if (type === "enrollments") {
    const { data: rows, error } = await supabase
      .from("enrollments")
      .select("id, user_id, course_id, status, enrolled_at");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    data = rows ?? [];
  } else if (type === "checkins") {
    const { data: rows, error } = await supabase
      .from("checkins")
      .select("id, user_id, course_id, week_start_date, submitted_at, payload");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    data = rows ?? [];
  } else if (type === "attendance") {
    const { data: rows, error } = await supabase
      .from("attendance")
      .select("id, session_id, user_id, status, marked_by, marked_at");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    data = rows ?? [];
  } else {
    return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
  }

  const csv = toCsv(data);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${type}.csv`,
    },
  });
}
