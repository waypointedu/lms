export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      attendance: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          status: "present" | "absent" | "excused";
          marked_by: string | null;
          marked_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          status?: "present" | "absent" | "excused";
          marked_by?: string | null;
          marked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["attendance"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "attendance_marked_by_fkey"; columns: ["marked_by"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "attendance_session_id_fkey"; columns: ["session_id"]; referencedRelation: "live_sessions"; referencedColumns: ["id"] },
          { foreignKeyName: "attendance_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      capstones: {
        Row: {
          id: string;
          enrollment_id: string;
          course_id: string;
          student_id: string;
          status: "not_started" | "scheduled" | "passed" | "needs_remediation";
          outcome_notes: string | null;
          reviewed_by: string | null;
          completed_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          course_id: string;
          student_id: string;
          status?: "not_started" | "scheduled" | "passed" | "needs_remediation";
          outcome_notes?: string | null;
          reviewed_by?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["capstones"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "capstones_course_id_fkey"; columns: ["course_id"]; referencedRelation: "courses"; referencedColumns: ["id"] },
          { foreignKeyName: "capstones_enrollment_id_fkey"; columns: ["enrollment_id"]; referencedRelation: "enrollments"; referencedColumns: ["id"] },
          { foreignKeyName: "capstones_reviewed_by_fkey"; columns: ["reviewed_by"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "capstones_student_id_fkey"; columns: ["student_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      capstone_schedules: {
        Row: {
          id: string;
          capstone_id: string;
          scheduled_at: string;
          faculty_id: string | null;
          requested_by: string | null;
          status: "proposed" | "accepted" | "rescheduled" | "completed" | "cancelled";
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          capstone_id: string;
          scheduled_at: string;
          faculty_id?: string | null;
          requested_by?: string | null;
          status?: "proposed" | "accepted" | "rescheduled" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["capstone_schedules"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "capstone_schedules_capstone_id_fkey"; columns: ["capstone_id"]; referencedRelation: "capstones"; referencedColumns: ["id"] },
          { foreignKeyName: "capstone_schedules_faculty_id_fkey"; columns: ["faculty_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "capstone_schedules_requested_by_fkey"; columns: ["requested_by"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      audit_events: {
        Row: {
          id: string;
          actor: string | null;
          action: string;
          target: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          actor?: string | null;
          action: string;
          target?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["audit_events"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "audit_events_actor_fkey"; columns: ["actor"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          issued_at: string | null;
          verification_code: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          issued_at?: string | null;
          verification_code: string;
        };
        Update: Partial<Database["public"]["Tables"]["certificates"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "certificates_course_id_fkey"; columns: ["course_id"]; referencedRelation: "courses"; referencedColumns: ["id"] },
          { foreignKeyName: "certificates_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          week_start_date: string;
          payload: Json;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          week_start_date: string;
          payload?: Json;
          submitted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["checkins"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "checkins_course_id_fkey"; columns: ["course_id"]; referencedRelation: "courses"; referencedColumns: ["id"] },
          { foreignKeyName: "checkins_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      checkpoints: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          title_es: string | null;
          week_number: number;
          due_on: string | null;
          requirements: Json | null;
          status: "planned" | "published" | "archived";
          created_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          title_es?: string | null;
          week_number: number;
          due_on?: string | null;
          requirements?: Json | null;
          status?: "planned" | "published" | "archived";
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["checkpoints"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "checkpoints_course_id_fkey"; columns: ["course_id"]; referencedRelation: "courses"; referencedColumns: ["id"] },
        ];
      };
      checkpoint_progress: {
        Row: {
          id: string;
          checkpoint_id: string;
          user_id: string;
          status: "not_started" | "in_progress" | "completed" | "behind";
          completed_at: string | null;
          updated_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          checkpoint_id: string;
          user_id: string;
          status?: "not_started" | "in_progress" | "completed" | "behind";
          completed_at?: string | null;
          updated_at?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["checkpoint_progress"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "checkpoint_progress_checkpoint_id_fkey"; columns: ["checkpoint_id"]; referencedRelation: "checkpoints"; referencedColumns: ["id"] },
          { foreignKeyName: "checkpoint_progress_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          description_es: string | null;
          duration_weeks: number | null;
          language: string | null;
          published: boolean | null;
          pathway: string | null;
          title_es: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          description_es?: string | null;
          duration_weeks?: number | null;
          language?: string | null;
          published?: boolean | null;
          pathway?: string | null;
          title_es?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          is_default: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          is_default?: boolean | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: [];
      };
      profile_roles: {
        Row: {
          profile_id: string;
          role_id: string;
          assigned_by: string | null;
          assigned_at: string | null;
        };
        Insert: {
          profile_id: string;
          role_id: string;
          assigned_by?: string | null;
          assigned_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profile_roles"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "profile_roles_assigned_by_fkey"; columns: ["assigned_by"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "profile_roles_profile_id_fkey"; columns: ["profile_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "profile_roles_role_id_fkey"; columns: ["role_id"]; referencedRelation: "roles"; referencedColumns: ["id"] },
        ];
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          status: "active" | "completed" | "paused";
          enrolled_at: string | null;
          cohort_label: string | null;
          starts_on: string | null;
          target_end_on: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          status?: "active" | "completed" | "paused";
          enrolled_at?: string | null;
          cohort_label?: string | null;
          starts_on?: string | null;
          target_end_on?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["enrollments"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "enrollments_course_id_fkey"; columns: ["course_id"]; referencedRelation: "courses"; referencedColumns: ["id"] },
          { foreignKeyName: "enrollments_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed_at: string | null;
          last_viewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed_at?: string | null;
          last_viewed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "lesson_progress_lesson_id_fkey"; columns: ["lesson_id"]; referencedRelation: "lessons"; referencedColumns: ["id"] },
          { foreignKeyName: "lesson_progress_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          slug: string;
          title: string;
          position: number | null;
          content_path: string | null;
          estimated_minutes: number | null;
          published: boolean | null;
          summary: string | null;
          summary_es: string | null;
          title_es: string | null;
          required_for_pathway: boolean | null;
        };
        Insert: {
          id?: string;
          module_id: string;
          slug: string;
          title: string;
          position?: number | null;
          content_path?: string | null;
          estimated_minutes?: number | null;
          published?: boolean | null;
          summary?: string | null;
          summary_es?: string | null;
          title_es?: string | null;
          required_for_pathway?: boolean | null;
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "lessons_module_id_fkey"; columns: ["module_id"]; referencedRelation: "modules"; referencedColumns: ["id"] },
        ];
      };
      lesson_index: {
        Row: {
          id: string;
          lesson_id: string;
          content: string | null;
          language: string | null;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          content?: string | null;
          language?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_index"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "lesson_index_lesson_id_fkey"; columns: ["lesson_id"]; referencedRelation: "lessons"; referencedColumns: ["id"] },
        ];
      };
      live_sessions: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          starts_at: string | null;
          join_url: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          starts_at?: string | null;
          join_url?: string | null;
          description?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["live_sessions"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "live_sessions_course_id_fkey"; columns: ["course_id"]; referencedRelation: "courses"; referencedColumns: ["id"] },
        ];
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          position: number | null;
          summary: string | null;
          summary_es: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          position?: number | null;
          summary?: string | null;
          summary_es?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["modules"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "modules_course_id_fkey"; columns: ["course_id"]; referencedRelation: "courses"; referencedColumns: ["id"] },
        ];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          mailing_address_line1: string | null;
          mailing_address_line2: string | null;
          mailing_city: string | null;
          mailing_state: string | null;
          mailing_postal_code: string | null;
          mailing_country: string | null;
          role: "admin" | "instructor" | "faculty" | "student" | "applicant";
          created_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          mailing_address_line1?: string | null;
          mailing_address_line2?: string | null;
          mailing_city?: string | null;
          mailing_state?: string | null;
          mailing_postal_code?: string | null;
          mailing_country?: string | null;
          role?: "admin" | "instructor" | "faculty" | "student" | "applicant";
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number | null;
          responses: Json | null;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score?: number | null;
          responses?: Json | null;
          submitted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_attempts"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "quiz_attempts_quiz_id_fkey"; columns: ["quiz_id"]; referencedRelation: "quizzes"; referencedColumns: ["id"] },
          { foreignKeyName: "quiz_attempts_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      quizzes: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          schema: Json | null;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          schema?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["quizzes"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "quizzes_lesson_id_fkey"; columns: ["lesson_id"]; referencedRelation: "lessons"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin_or_instructor: {
        Args: { uid: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}
