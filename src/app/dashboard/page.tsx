import { SessionGate } from "@/components/auth/session-gate";
import { DashboardContent } from "@/components/auth/dashboard-content";

export default function DashboardPage() {
  return (
    <SessionGate>
      <DashboardContent />
    </SessionGate>
  );
}
