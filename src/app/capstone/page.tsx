import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";

const steps = [
  {
    title: "Complete weekly checkpoints",
    description: "Work through the scheduled reflection prompts and lessons so your status shows as ready.",
  },
  {
    title: "Request a conversation time",
    description: "Share your availability so faculty can confirm the capstone slot.",
  },
  {
    title: "Submit your testimony outline",
    description: "Upload the outline ahead of time so reviewers can prepare for the conversation.",
  },
];

export default function CapstonePage() {
  return (
    <div>
      <SiteHeader />
      <main className="container py-16 space-y-12">
        <SectionHeader
          eyebrow="Capstone readiness"
          title="Prepare for your capstone conversation"
          description="Use this checklist to move from checkpoint completion to a scheduled capstone conversation."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="card p-6 space-y-3">
              <span className="text-xs font-semibold text-[var(--muted)]">Step {index + 1}</span>
              <h2 className="text-xl font-semibold">{step.title}</h2>
              <p className="text-sm text-[var(--muted)]">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="card p-6 flex flex-wrap gap-4 items-center justify-between">
          <p className="text-sm text-[var(--muted)]">Need to review your lesson sequence or check your progress?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="button-secondary">
              Back to dashboard
            </Link>
            <Link href="/courses" className="button-primary">
              View course outline
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
