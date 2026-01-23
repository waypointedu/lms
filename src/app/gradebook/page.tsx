import { SessionGate } from "@/components/auth/session-gate";
import { GradebookPanel } from "@/components/gradebook/gradebook-panel";

export default function GradebookPage() {
  return (
    <SessionGate>
      <main>
        <h1>Gradebook</h1>
        <p>
          Students see their own grades. Instructors can select a course and
          edit grades for enrolled learners.
        </p>
        <GradebookPanel mode="student" />
        <div style={{ marginTop: 32 }}>
          <GradebookPanel mode="instructor" />
        </div>
      </main>
    </SessionGate>
  );
}
