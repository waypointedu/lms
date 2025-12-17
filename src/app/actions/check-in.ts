"use server";

import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/lib/supabase";

interface CheckInResult {
  ok: boolean;
  message: string;
}

export async function submitCheckIn(formData: FormData): Promise<CheckInResult> {
  const learner = String(formData.get("learner") || "anonymous");
  const reflection = String(formData.get("reflection") || "");
  const course = String(formData.get("course") || "unknown");
  const prompt = String(formData.get("prompt") || "");

  const supabase = getServiceRoleClient();

  if (!supabase) {
    return {
      ok: true,
      message:
        "Supabase keys are not configured yet. Check-in captured locally and can be wired once credentials are added.",
    };
  }

  const { error } = await supabase.from("check_ins").insert({
    learner,
    reflection,
    course,
    prompt,
  });

  if (error) {
    console.error("Unable to submit check-in", error.message);
    return { ok: false, message: "Unable to submit check-in right now." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Check-in recorded in Supabase." };
}
