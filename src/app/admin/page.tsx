import Link from "next/link";

import { SessionGate } from "@/components/auth/session-gate";
import { AdminGate } from "@/components/admin/admin-gate";

export default function AdminPage() {
  return (
    <SessionGate>
      <AdminGate>
        <main>
          <h1>Admin Console</h1>
          <p>Manage programs, courses, and user assignments.</p>
          <ul style={{ marginTop: 16 }}>
            <li>
              <Link href="/admin/programs">Programs</Link>
            </li>
            <li>
              <Link href="/admin/courses">Courses</Link>
            </li>
            <li>
              <Link href="/admin/users">Users</Link>
            </li>
          </ul>
        </main>
      </AdminGate>
    </SessionGate>
  );
}
