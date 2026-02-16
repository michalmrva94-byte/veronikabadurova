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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cancellation_fee: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          client_id: string
          confirmation_deadline: string | null
          created_at: string
          id: string
          is_last_minute: boolean | null
          price: number
          proposed_by: string | null
          slot_id: string
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string
        }
        Insert: {
          cancellation_fee?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_id: string
          confirmation_deadline?: string | null
          created_at?: string
          id?: string
          is_last_minute?: boolean | null
          price: number
          proposed_by?: string | null
          slot_id: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string
        }
        Update: {
          cancellation_fee?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_id?: string
          confirmation_deadline?: string | null
          created_at?: string
          id?: string
          is_last_minute?: boolean | null
          price?: number
          proposed_by?: string | null
          slot_id?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: true
            referencedRelation: "training_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_last_minute: boolean | null
          is_read: boolean | null
          message: string
          related_slot_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_last_minute?: boolean | null
          is_read?: boolean | null
          message: string
          related_slot_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_last_minute?: boolean | null
          is_read?: boolean | null
          message?: string
          related_slot_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_slot_id_fkey"
            columns: ["related_slot_id"]
            isOneToOne: false
            referencedRelation: "training_slots"
            referencedColumns: ["id"]
          },
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
          approval_status: Database["public"]["Enums"]["client_approval_status"]
          approved_at: string | null
          balance: number | null
          client_type: Database["public"]["Enums"]["client_type"] | null
          created_at: string
          email: string
          email_notifications: boolean | null
          flexibility_note: string | null
          full_name: string
          id: string
          notifications_enabled: boolean | null
          phone: string | null
          preferred_days: string | null
          referral_code: string | null
          referred_by: string | null
          training_goal: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["client_approval_status"]
          approved_at?: string | null
          balance?: number | null
          client_type?: Database["public"]["Enums"]["client_type"] | null
          created_at?: string
          email: string
          email_notifications?: boolean | null
          flexibility_note?: string | null
          full_name: string
          id?: string
          notifications_enabled?: boolean | null
          phone?: string | null
          preferred_days?: string | null
          referral_code?: string | null
          referred_by?: string | null
          training_goal?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["client_approval_status"]
          approved_at?: string | null
          balance?: number | null
          client_type?: Database["public"]["Enums"]["client_type"] | null
          created_at?: string
          email?: string
          email_notifications?: boolean | null
          flexibility_note?: string | null
          full_name?: string
          id?: string
          notifications_enabled?: boolean | null
          phone?: string | null
          preferred_days?: string | null
          referral_code?: string | null
          referred_by?: string | null
          training_goal?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          created_at: string
          first_training_completed: boolean | null
          id: string
          referred_id: string
          referrer_id: string
          reward_amount: number | null
          reward_credited: boolean | null
        }
        Insert: {
          created_at?: string
          first_training_completed?: boolean | null
          id?: string
          referred_id: string
          referrer_id: string
          reward_amount?: number | null
          reward_credited?: boolean | null
        }
        Update: {
          created_at?: string
          first_training_completed?: boolean | null
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number | null
          reward_credited?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_available: boolean | null
          is_recurring: boolean | null
          notes: string | null
          recurring_day_of_week: number | null
          recurring_end_time: string | null
          recurring_start_time: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          notes?: string | null
          recurring_day_of_week?: number | null
          recurring_end_time?: string | null
          recurring_start_time?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          notes?: string | null
          recurring_day_of_week?: number | null
          recurring_end_time?: string | null
          recurring_start_time?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number
          booking_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          balance_after: number
          booking_id?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          balance_after?: number
          booking_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_my_profile_id: { Args: never; Returns: string }
      get_referrer_name: { Args: { code: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_booking_cancellation: {
        Args: {
          p_booking_id: string
          p_cancellation_fee: number
          p_client_id: string
          p_fee_percentage: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "client" | "admin"
      booking_status:
        | "booked"
        | "cancelled"
        | "completed"
        | "no_show"
        | "pending"
        | "proposed"
        | "awaiting_confirmation"
      client_approval_status: "pending" | "approved" | "rejected"
      client_type: "fixed" | "flexible"
      transaction_type:
        | "deposit"
        | "training"
        | "cancellation"
        | "referral_bonus"
        | "manual_adjustment"
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
      app_role: ["client", "admin"],
      booking_status: [
        "booked",
        "cancelled",
        "completed",
        "no_show",
        "pending",
        "proposed",
        "awaiting_confirmation",
      ],
      client_approval_status: ["pending", "approved", "rejected"],
      client_type: ["fixed", "flexible"],
      transaction_type: [
        "deposit",
        "training",
        "cancellation",
        "referral_bonus",
        "manual_adjustment",
      ],
    },
  },
} as const
