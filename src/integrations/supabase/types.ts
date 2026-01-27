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
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_data: Json | null
          event_name: string
          id: string
          ip_address: unknown
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          ip_address?: unknown
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          ip_address?: unknown
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_rate_limits: {
        Row: {
          created_at: string
          event_count: number
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          created_at?: string
          event_count?: number
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          created_at?: string
          event_count?: number
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      analytics_sessions: {
        Row: {
          browser: string | null
          country: string | null
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          entry_page: string | null
          exit_page: string | null
          id: string
          page_views: number | null
          session_id: string
          started_at: string
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          page_views?: number | null
          session_id: string
          started_at?: string
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          page_views?: number | null
          session_id?: string
          started_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          purchase_date: string
          purchase_price: number
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          purchase_price: number
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          purchase_price?: number
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          created_at: string
          holdings_data: Json
          id: string
          snapshot_date: string
          total_cost: number
          total_profit_loss: number
          total_value: number
          user_id: string
        }
        Insert: {
          created_at?: string
          holdings_data?: Json
          id?: string
          snapshot_date: string
          total_cost?: number
          total_profit_loss?: number
          total_value?: number
          user_id: string
        }
        Update: {
          created_at?: string
          holdings_data?: Json
          id?: string
          snapshot_date?: string
          total_cost?: number
          total_profit_loss?: number
          total_value?: number
          user_id?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          condition: string
          created_at: string
          email_sent: boolean | null
          id: string
          is_active: boolean
          notification_method: string
          symbol: string
          target_price: number
          triggered_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          email_sent?: boolean | null
          id?: string
          is_active?: boolean
          notification_method?: string
          symbol: string
          target_price: number
          triggered_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          email_sent?: boolean | null
          id?: string
          is_active?: boolean
          notification_method?: string
          symbol?: string
          target_price?: number
          triggered_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quantum_transfer_history: {
        Row: {
          amount: number
          blockchain_hash: string | null
          completed_at: string | null
          created_at: string
          data_payload: string | null
          entanglement_pairs: number | null
          id: string
          layer_results: Json | null
          layers_passed: number | null
          network_nodes: Json | null
          quantum_fidelity: number | null
          receiver_address: string
          security_score: number | null
          sender_address: string
          session_id: string
          started_at: string
          total_layers: number | null
          transfer_status: string | null
        }
        Insert: {
          amount: number
          blockchain_hash?: string | null
          completed_at?: string | null
          created_at?: string
          data_payload?: string | null
          entanglement_pairs?: number | null
          id?: string
          layer_results?: Json | null
          layers_passed?: number | null
          network_nodes?: Json | null
          quantum_fidelity?: number | null
          receiver_address: string
          security_score?: number | null
          sender_address: string
          session_id: string
          started_at?: string
          total_layers?: number | null
          transfer_status?: string | null
        }
        Update: {
          amount?: number
          blockchain_hash?: string | null
          completed_at?: string | null
          created_at?: string
          data_payload?: string | null
          entanglement_pairs?: number | null
          id?: string
          layer_results?: Json | null
          layers_passed?: number | null
          network_nodes?: Json | null
          quantum_fidelity?: number | null
          receiver_address?: string
          security_score?: number | null
          sender_address?: string
          session_id?: string
          started_at?: string
          total_layers?: number | null
          transfer_status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          added_at: string
          id: string
          notes: string | null
          symbol: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          notes?: string | null
          symbol: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          notes?: string | null
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      analytics_daily_summary: {
        Row: {
          date: string | null
          events_breakdown: Json | null
          page_views: number | null
          total_events: number | null
          unique_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_analytics_rate_limit: {
        Args: {
          p_identifier: string
          p_max_events?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      get_user_analytics_summary: {
        Args: { target_user_id?: string }
        Returns: {
          total_events: number
          total_sessions: number
          unique_pages: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refresh_analytics_summary: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
