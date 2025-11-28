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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_match_results: {
        Row: {
          child_resume_id: string | null
          created_at: string | null
          highlights: Json | null
          id: string
          match_score: number | null
          parent_id: string | null
          resume_library_id: string | null
        }
        Insert: {
          child_resume_id?: string | null
          created_at?: string | null
          highlights?: Json | null
          id?: string
          match_score?: number | null
          parent_id?: string | null
          resume_library_id?: string | null
        }
        Update: {
          child_resume_id?: string | null
          created_at?: string | null
          highlights?: Json | null
          id?: string
          match_score?: number | null
          parent_id?: string | null
          resume_library_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_match_results_child_resume_id_fkey"
            columns: ["child_resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_match_results_resume_library_id_fkey"
            columns: ["resume_library_id"]
            isOneToOne: false
            referencedRelation: "resume_library"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profiles: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string | null
          resume_id: string | null
          summary: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id?: string | null
          resume_id?: string | null
          summary: string
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string | null
          resume_id?: string | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profiles_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resume_library"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          scheduled_at: string | null
          session_type: string | null
          shadchan_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          session_type?: string | null
          shadchan_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          session_type?: string | null
          shadchan_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      collaborations: {
        Row: {
          comment_thread: Json | null
          created_at: string | null
          id: string
          permission: string | null
          receiver_id: string | null
          sender_id: string | null
          shared_resume_id: string | null
        }
        Insert: {
          comment_thread?: Json | null
          created_at?: string | null
          id?: string
          permission?: string | null
          receiver_id?: string | null
          sender_id?: string | null
          shared_resume_id?: string | null
        }
        Update: {
          comment_thread?: Json | null
          created_at?: string | null
          id?: string
          permission?: string | null
          receiver_id?: string | null
          sender_id?: string | null
          shared_resume_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_shared_resume_id_fkey"
            columns: ["shared_resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      match_suggestions: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string | null
          parent_notes: string | null
          parent_status: string | null
          resume_id: string | null
          shadchan_id: string | null
          shadchan_notes: string | null
          shadchan_status: string | null
          suggested_resume_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id?: string | null
          parent_notes?: string | null
          parent_status?: string | null
          resume_id?: string | null
          shadchan_id?: string | null
          shadchan_notes?: string | null
          shadchan_status?: string | null
          suggested_resume_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string | null
          parent_notes?: string | null
          parent_status?: string | null
          resume_id?: string | null
          shadchan_id?: string | null
          shadchan_notes?: string | null
          shadchan_status?: string | null
          suggested_resume_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_suggestions_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_suggestions_suggested_resume_id_fkey"
            columns: ["suggested_resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          id: string
          receiver_id: string | null
          sender_id: string | null
          sent_at: string | null
        }
        Insert: {
          content?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_private: boolean | null
          resume_id: string | null
          tags: string[] | null
          title: string | null
          transcript: string | null
          user_id: string | null
          voice_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          resume_id?: string | null
          tags?: string[] | null
          title?: string | null
          transcript?: string | null
          user_id?: string | null
          voice_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          resume_id?: string | null
          tags?: string[] | null
          title?: string | null
          transcript?: string | null
          user_id?: string | null
          voice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resume_library"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          confirmation_sent: boolean | null
          created_at: string | null
          from_user: string | null
          id: string
          message: string | null
          to_user: string | null
        }
        Insert: {
          amount?: number | null
          confirmation_sent?: boolean | null
          created_at?: string | null
          from_user?: string | null
          id?: string
          message?: string | null
          to_user?: string | null
        }
        Update: {
          amount?: number | null
          confirmation_sent?: boolean | null
          created_at?: string | null
          from_user?: string | null
          id?: string
          message?: string | null
          to_user?: string | null
        }
        Relationships: []
      }
      premium_access: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          plan_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string | null
          name: string | null
          phone: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_library: {
        Row: {
          created_at: string | null
          id: string
          parsed_data: Json | null
          tags: string[] | null
          uploaded_by: string | null
          uploaded_for: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          parsed_data?: Json | null
          tags?: string[] | null
          uploaded_by?: string | null
          uploaded_for?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          parsed_data?: Json | null
          tags?: string[] | null
          uploaded_by?: string | null
          uploaded_for?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          age: number | null
          background: string | null
          contact_info: Json | null
          created_at: string | null
          education: string | null
          family_info: Json | null
          gender: string | null
          hashkafa: string | null
          id: string
          location: string | null
          name: string
          occupation: string | null
          pdf_url: string | null
          photo_url: string | null
          reference_list: Json | null
          user_id: string | null
        }
        Insert: {
          age?: number | null
          background?: string | null
          contact_info?: Json | null
          created_at?: string | null
          education?: string | null
          family_info?: Json | null
          gender?: string | null
          hashkafa?: string | null
          id?: string
          location?: string | null
          name: string
          occupation?: string | null
          pdf_url?: string | null
          photo_url?: string | null
          reference_list?: Json | null
          user_id?: string | null
        }
        Update: {
          age?: number | null
          background?: string | null
          contact_info?: Json | null
          created_at?: string | null
          education?: string | null
          family_info?: Json | null
          gender?: string | null
          hashkafa?: string | null
          id?: string
          location?: string | null
          name?: string
          occupation?: string | null
          pdf_url?: string | null
          photo_url?: string | null
          reference_list?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      shadchan_payment_details: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          preferred_contact: string | null
          updated_at: string
          user_id: string
          zelle_email: string | null
          zelle_phone: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_contact?: string | null
          updated_at?: string
          user_id: string
          zelle_email?: string | null
          zelle_phone?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_contact?: string | null
          updated_at?: string
          user_id?: string
          zelle_email?: string | null
          zelle_phone?: string | null
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
