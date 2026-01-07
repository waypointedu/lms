import type { JSX } from "react";

import { Activity, CheckCircle2, Clock3 } from "lucide-react";
import type { DashboardProgress } from "@/data/courses";

const statusCopy: Record<DashboardProgress["status"], { label: string; icon: JSX.Element; tone: string }> = {
  "on-track": {
    label: "On track",
    icon: <CheckCircle2 className="h-4 w-4" />,
    tone: "text-green-700 bg-green-50 border-green-100",
  },
  behind: {
    label: "Catch up",
    icon: <Activity className="h-4 w-4" />,
    tone: "text-amber-700 bg-amber-50 border-amber-100",
  },
  ready: {
    label: "Ready",
    icon: <Clock3 className="h-4 w-4" />,
    tone: "text-blue-700 bg-blue-50 border-blue-100",
  },
};

interface ProgressCardProps {
  progress: DashboardProgress;
}

export function ProgressCard({ progress }: ProgressCardProps) {
  const status = statusCopy[progress.status];
  const completion = Math.round((progress.completed / progress.total) * 100);

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">{progress.course}</h4>
        <span className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
          {status.icon}
          {status.label}
        </span>
      </div>
      <p className="text-sm text-[var(--muted)]">
        {progress.completed} of {progress.total} items complete
      </p>
      <div className="h-3 w-full rounded-full bg-[rgba(20,34,64,0.08)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-deep),var(--accent))] transition-all"
          style={{ width: `${completion}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-[var(--muted)]">
        <span>Progress</span>
        <span className="font-semibold text-[var(--accent-deep)]">{completion}%</span>
      </div>
    </div>
  );
}
