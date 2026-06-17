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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ivr_calls: {
        Row: {
          call_sid: string | null
          campaign_id: string | null
          created_at: string | null
          farmer_name: string
          id: string
          job_budget: string | null
          job_date: string | null
          job_hours: string | null
          job_location: string | null
          job_title: string
          language_selected: string | null
          retry_count: number | null
          status: string
          updated_at: string | null
          worker_name: string
          worker_phone: string
        }
        Insert: {
          call_sid?: string | null
          campaign_id?: string | null
          created_at?: string | null
          farmer_name: string
          id?: string
          job_budget?: string | null
          job_date?: string | null
          job_hours?: string | null
          job_location?: string | null
          job_title: string
          language_selected?: string | null
          retry_count?: number | null
          status?: string
          updated_at?: string | null
          worker_name: string
          worker_phone: string
        }
        Update: {
          call_sid?: string | null
          campaign_id?: string | null
          created_at?: string | null
          farmer_name?: string
          id?: string
          job_budget?: string | null
          job_date?: string | null
          job_hours?: string | null
          job_location?: string | null
          job_title?: string
          language_selected?: string | null
          retry_count?: number | null
          status?: string
          updated_at?: string | null
          worker_name?: string
          worker_phone?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applied_at: string | null
          farmer_notes: string | null
          id: string
          job_id: string
          responded_at: string | null
          status: string
          worker_id: string
          worker_notes: string | null
        }
        Insert: {
          applied_at?: string | null
          farmer_notes?: string | null
          id?: string
          job_id: string
          responded_at?: string | null
          status?: string
          worker_id: string
          worker_notes?: string | null
        }
        Update: {
          applied_at?: string | null
          farmer_notes?: string | null
          id?: string
          job_id?: string
          responded_at?: string | null
          status?: string
          worker_id?: string
          worker_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          crop_type: string
          district: string | null
          duration: string | null
          experience_pref: string | null
          farmer_id: string
          food_included: boolean | null
          gender_pref: string | null
          id: string
          notes: string | null
          start_time: string | null
          state: string | null
          status: string
          title: string
          tools_provided: boolean | null
          transport_included: boolean | null
          updated_at: string | null
          urgency: string
          village: string | null
          wage_amount: number
          wage_type: string
          work_date: string | null
          work_type: string
          workers_accepted: number
          workers_needed: number
        }
        Insert: {
          created_at?: string | null
          crop_type: string
          district?: string | null
          duration?: string | null
          experience_pref?: string | null
          farmer_id: string
          food_included?: boolean | null
          gender_pref?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          state?: string | null
          status?: string
          title: string
          tools_provided?: boolean | null
          transport_included?: boolean | null
          updated_at?: string | null
          urgency?: string
          village?: string | null
          wage_amount?: number
          wage_type?: string
          work_date?: string | null
          work_type: string
          workers_accepted?: number
          workers_needed?: number
        }
        Update: {
          created_at?: string | null
          crop_type?: string
          district?: string | null
          duration?: string | null
          experience_pref?: string | null
          farmer_id?: string
          food_included?: boolean | null
          gender_pref?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          state?: string | null
          status?: string
          title?: string
          tools_provided?: boolean | null
          transport_included?: boolean | null
          updated_at?: string | null
          urgency?: string
          village?: string | null
          wage_amount?: number
          wage_type?: string
          work_date?: string | null
          work_type?: string
          workers_accepted?: number
          workers_needed?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          daily_wage: number | null
          district: string | null
          email: string | null
          experience_years: number | null
          full_name: string
          id: string
          language: string | null
          phone: string | null
          primary_crops: string | null
          rating: number | null
          review_count: number | null
          role: string
          skills: string | null
          state: string | null
          taluka: string | null
          updated_at: string | null
          verified: boolean | null
          village: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          daily_wage?: number | null
          district?: string | null
          email?: string | null
          experience_years?: number | null
          full_name?: string
          id: string
          language?: string | null
          phone?: string | null
          primary_crops?: string | null
          rating?: number | null
          review_count?: number | null
          role?: string
          skills?: string | null
          state?: string | null
          taluka?: string | null
          updated_at?: string | null
          verified?: boolean | null
          village?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          daily_wage?: number | null
          district?: string | null
          email?: string | null
          experience_years?: number | null
          full_name?: string
          id?: string
          language?: string | null
          phone?: string | null
          primary_crops?: string | null
          rating?: number | null
          review_count?: number | null
          role?: string
          skills?: string | null
          state?: string | null
          taluka?: string | null
          updated_at?: string | null
          verified?: boolean | null
          village?: string | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
