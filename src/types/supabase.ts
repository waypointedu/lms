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
      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          language: string | null;
          published: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          language?: string | null;
          published?: boolean | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          status: "active" | "completed" | "paused";
          enrolled_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          status?: "active" | "completed" | "paused";
          enrolled_at?: string | null;
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
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "lessons_module_id_fkey"; columns: ["module_id"]; referencedRelation: "modules"; referencedColumns: ["id"] },
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
          created_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          position?: number | null;
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
          role: "admin" | "instructor" | "student" | "applicant";
          created_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          role?: "admin" | "instructor" | "student" | "applicant";
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
