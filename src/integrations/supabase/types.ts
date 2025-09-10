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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agi_workflow_executions: {
        Row: {
          agi_model_used: string | null
          blockchain_verification_hash: string | null
          circuit_id: string | null
          completed_at: string | null
          created_at: string
          execution_status: string | null
          execution_time_ms: number | null
          id: string
          optimization_improvements: Json | null
          quantum_advantage_achieved: boolean | null
          started_at: string | null
          superintelligence_score: number | null
          updated_at: string
          user_id: string | null
          workflow_name: string
        }
        Insert: {
          agi_model_used?: string | null
          blockchain_verification_hash?: string | null
          circuit_id?: string | null
          completed_at?: string | null
          created_at?: string
          execution_status?: string | null
          execution_time_ms?: number | null
          id?: string
          optimization_improvements?: Json | null
          quantum_advantage_achieved?: boolean | null
          started_at?: string | null
          superintelligence_score?: number | null
          updated_at?: string
          user_id?: string | null
          workflow_name: string
        }
        Update: {
          agi_model_used?: string | null
          blockchain_verification_hash?: string | null
          circuit_id?: string | null
          completed_at?: string | null
          created_at?: string
          execution_status?: string | null
          execution_time_ms?: number | null
          id?: string
          optimization_improvements?: Json | null
          quantum_advantage_achieved?: boolean | null
          started_at?: string | null
          superintelligence_score?: number | null
          updated_at?: string
          user_id?: string | null
          workflow_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "agi_workflow_executions_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "quantum_circuits"
            referencedColumns: ["id"]
          },
        ]
      }
      blockchain_quantum_records: {
        Row: {
          block_hash: string
          block_timestamp: string
          circuit_id: string | null
          consensus_algorithm: string | null
          created_at: string
          crypto_protocol_id: string | null
          id: string
          merkle_root: string
          mining_difficulty: number | null
          previous_block_hash: string | null
          quantum_proof: Json
          quantum_resistance_verified: boolean | null
          quantum_signature: string
          user_id: string | null
          validation_status: string | null
        }
        Insert: {
          block_hash: string
          block_timestamp?: string
          circuit_id?: string | null
          consensus_algorithm?: string | null
          created_at?: string
          crypto_protocol_id?: string | null
          id?: string
          merkle_root: string
          mining_difficulty?: number | null
          previous_block_hash?: string | null
          quantum_proof: Json
          quantum_resistance_verified?: boolean | null
          quantum_signature: string
          user_id?: string | null
          validation_status?: string | null
        }
        Update: {
          block_hash?: string
          block_timestamp?: string
          circuit_id?: string | null
          consensus_algorithm?: string | null
          created_at?: string
          crypto_protocol_id?: string | null
          id?: string
          merkle_root?: string
          mining_difficulty?: number | null
          previous_block_hash?: string | null
          quantum_proof?: Json
          quantum_resistance_verified?: boolean | null
          quantum_signature?: string
          user_id?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_quantum_records_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "quantum_circuits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blockchain_quantum_records_crypto_protocol_id_fkey"
            columns: ["crypto_protocol_id"]
            isOneToOne: false
            referencedRelation: "quantum_crypto_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_circuits: {
        Row: {
          agi_optimization_applied: boolean | null
          blockchain_hash: string | null
          circuit_data: Json
          circuit_depth: number | null
          created_at: string
          cryptographic_strength: string | null
          description: string | null
          entanglement_score: number | null
          error_correction_applied: boolean | null
          fidelity_score: number | null
          gate_count: number | null
          id: string
          name: string
          optimization_level: number | null
          quantum_resistance_level: number | null
          quantum_supremacy_achieved: boolean | null
          qubit_count: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agi_optimization_applied?: boolean | null
          blockchain_hash?: string | null
          circuit_data: Json
          circuit_depth?: number | null
          created_at?: string
          cryptographic_strength?: string | null
          description?: string | null
          entanglement_score?: number | null
          error_correction_applied?: boolean | null
          fidelity_score?: number | null
          gate_count?: number | null
          id?: string
          name: string
          optimization_level?: number | null
          quantum_resistance_level?: number | null
          quantum_supremacy_achieved?: boolean | null
          qubit_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agi_optimization_applied?: boolean | null
          blockchain_hash?: string | null
          circuit_data?: Json
          circuit_depth?: number | null
          created_at?: string
          cryptographic_strength?: string | null
          description?: string | null
          entanglement_score?: number | null
          error_correction_applied?: boolean | null
          fidelity_score?: number | null
          gate_count?: number | null
          id?: string
          name?: string
          optimization_level?: number | null
          quantum_resistance_level?: number | null
          quantum_supremacy_achieved?: boolean | null
          qubit_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      quantum_crypto_protocols: {
        Row: {
          blockchain_integration: boolean | null
          circuit_id: string | null
          created_at: string
          id: string
          implementation_status: string | null
          key_length: number | null
          protocol_config: Json | null
          protocol_name: string
          protocol_type: string
          quantum_resistance_rating: number | null
          security_level: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          blockchain_integration?: boolean | null
          circuit_id?: string | null
          created_at?: string
          id?: string
          implementation_status?: string | null
          key_length?: number | null
          protocol_config?: Json | null
          protocol_name: string
          protocol_type: string
          quantum_resistance_rating?: number | null
          security_level?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          blockchain_integration?: boolean | null
          circuit_id?: string | null
          created_at?: string
          id?: string
          implementation_status?: string | null
          key_length?: number | null
          protocol_config?: Json | null
          protocol_name?: string
          protocol_type?: string
          quantum_resistance_rating?: number | null
          security_level?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quantum_crypto_protocols_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "quantum_circuits"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_resistance_tests: {
        Row: {
          circuit_id: string | null
          created_at: string
          id: string
          quantum_security_level: number | null
          recommendations: Json | null
          resistance_score: number | null
          test_duration_ms: number | null
          test_parameters: Json | null
          test_status: string | null
          test_type: string
          updated_at: string
          user_id: string | null
          vulnerabilities_found: Json | null
        }
        Insert: {
          circuit_id?: string | null
          created_at?: string
          id?: string
          quantum_security_level?: number | null
          recommendations?: Json | null
          resistance_score?: number | null
          test_duration_ms?: number | null
          test_parameters?: Json | null
          test_status?: string | null
          test_type: string
          updated_at?: string
          user_id?: string | null
          vulnerabilities_found?: Json | null
        }
        Update: {
          circuit_id?: string | null
          created_at?: string
          id?: string
          quantum_security_level?: number | null
          recommendations?: Json | null
          resistance_score?: number | null
          test_duration_ms?: number | null
          test_parameters?: Json | null
          test_status?: string | null
          test_type?: string
          updated_at?: string
          user_id?: string | null
          vulnerabilities_found?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "quantum_resistance_tests_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "quantum_circuits"
            referencedColumns: ["id"]
          },
        ]
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
