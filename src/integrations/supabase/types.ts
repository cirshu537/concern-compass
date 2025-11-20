export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      complaint_reviews: {
        Row: {
          comment: string | null
          complaint_id: string
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          reviewer_role: string
        }
        Insert: {
          comment?: string | null
          complaint_id: string
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          reviewer_role: string
        }
        Update: {
          comment?: string | null
          complaint_id?: string
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          reviewer_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_reviews_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          anonymous: boolean
          assigned_staff_id: string | null
          assigned_trainer_id: string | null
          branch: string
          category: Database["public"]["Enums"]["complaint_category"]
          created_at: string
          description: string
          id: string
          identity_revealed: boolean
          program: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          student_id: string
          student_type: Database["public"]["Enums"]["student_type"]
          title: string
          updated_at: string
        }
        Insert: {
          anonymous?: boolean
          assigned_staff_id?: string | null
          assigned_trainer_id?: string | null
          branch: string
          category: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          description: string
          id?: string
          identity_revealed?: boolean
          program?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id: string
          student_type: Database["public"]["Enums"]["student_type"]
          title: string
          updated_at?: string
        }
        Update: {
          anonymous?: boolean
          assigned_staff_id?: string | null
          assigned_trainer_id?: string | null
          branch?: string
          category?: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          description?: string
          id?: string
          identity_revealed?: boolean
          program?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id?: string
          student_type?: Database["public"]["Enums"]["student_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_assigned_trainer_id_fkey"
            columns: ["assigned_trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          branch: string | null
          closed_at: string | null
          complaint_id: string
          created_at: string
          id: string
          is_closed: boolean
          started_by_id: string
          type: Database["public"]["Enums"]["conversation_type"]
        }
        Insert: {
          branch?: string | null
          closed_at?: string | null
          complaint_id: string
          created_at?: string
          id?: string
          is_closed?: boolean
          started_by_id: string
          type: Database["public"]["Enums"]["conversation_type"]
        }
        Update: {
          branch?: string | null
          closed_at?: string | null
          complaint_id?: string
          created_at?: string
          id?: string
          is_closed?: boolean
          started_by_id?: string
          type?: Database["public"]["Enums"]["conversation_type"]
        }
        Relationships: [
          {
            foreignKeyName: "conversations_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_started_by_id_fkey"
            columns: ["started_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_awards: {
        Row: {
          awarded: boolean
          complaint_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          awarded?: boolean
          complaint_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          awarded?: boolean
          complaint_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_awards_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      negative_events: {
        Row: {
          complaint_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negative_events_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negative_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          read: boolean
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          banned_from_raise: boolean
          branch: string | null
          created_at: string
          credits: number
          email: string
          full_name: string
          high_alert: boolean
          id: string
          negative_count_lifetime: number
          program: string | null
          role: Database["public"]["Enums"]["app_role"]
          student_type: Database["public"]["Enums"]["student_type"]
        }
        Insert: {
          banned_from_raise?: boolean
          branch?: string | null
          created_at?: string
          credits?: number
          email: string
          full_name: string
          high_alert?: boolean
          id: string
          negative_count_lifetime?: number
          program?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          student_type?: Database["public"]["Enums"]["student_type"]
        }
        Update: {
          banned_from_raise?: boolean
          branch?: string | null
          created_at?: string
          credits?: number
          email?: string
          full_name?: string
          high_alert?: boolean
          id?: string
          negative_count_lifetime?: number
          program?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          student_type?: Database["public"]["Enums"]["student_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "student" | "trainer" | "staff" | "branch_admin" | "main_admin"
      complaint_category:
        | "facility_campus"
        | "trainer_related"
        | "personal_institute"
        | "content_quality"
        | "platform_issue"
        | "payment_membership"
        | "support_communication"
        | "safety_wellbeing"
      complaint_status:
        | "logged"
        | "in_process"
        | "fixed"
        | "cancelled"
        | "rejected"
      conversation_type:
        | "main_to_branch"
        | "branch_to_staff_group"
        | "branch_to_staff_direct"
      student_type: "brocamp" | "exclusive" | "none"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "trainer", "staff", "branch_admin", "main_admin"],
      complaint_category: [
        "facility_campus",
        "trainer_related",
        "personal_institute",
        "content_quality",
        "platform_issue",
        "payment_membership",
        "support_communication",
        "safety_wellbeing",
      ],
      complaint_status: [
        "logged",
        "in_process",
        "fixed",
        "cancelled",
        "rejected",
      ],
      conversation_type: [
        "main_to_branch",
        "branch_to_staff_group",
        "branch_to_staff_direct",
      ],
      student_type: ["brocamp", "exclusive", "none"],
    },
  },
} as const
