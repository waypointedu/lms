import { SessionGate } from "@/components/auth/session-gate";
import { MyCourses } from "@/components/dashboard/my-courses";

export default function RegistrationPage() {
  return (
    <SessionGate>
      <main>
        <h1>Registration</h1>
        <p>
          Browse available courses and manage your enrollment status. Program
          scoping will be added in a later phase.
        </p>
        <MyCourses
          title="Available Courses"
          description="Enroll or drop courses here. Your dashboard will reflect enrolled courses."
        />
      </main>
    </SessionGate>
  );
}
