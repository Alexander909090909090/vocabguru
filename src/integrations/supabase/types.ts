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
      api_source_data: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          raw_data: Json
          source_name: string
          word_profile_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          raw_data: Json
          source_name: string
          word_profile_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          raw_data?: Json
          source_name?: string
          word_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_source_data_word_profile_id_fkey"
            columns: ["word_profile_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_quality_audits: {
        Row: {
          audit_type: string
          created_at: string
          id: string
          missing_fields: Json | null
          quality_score: number
          suggestions: Json | null
          validation_errors: Json | null
          word_profile_id: string | null
        }
        Insert: {
          audit_type: string
          created_at?: string
          id?: string
          missing_fields?: Json | null
          quality_score: number
          suggestions?: Json | null
          validation_errors?: Json | null
          word_profile_id?: string | null
        }
        Update: {
          audit_type?: string
          created_at?: string
          id?: string
          missing_fields?: Json | null
          quality_score?: number
          suggestions?: Json | null
          validation_errors?: Json | null
          word_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_audits_word_profile_id_fkey"
            columns: ["word_profile_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrichment_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          priority: number | null
          retry_count: number | null
          started_at: string | null
          status: string | null
          word_profile_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          priority?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          word_profile_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          priority?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          word_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrichment_queue_word_profile_id_fkey"
            columns: ["word_profile_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      etymology_chains: {
        Row: {
          borrowed_from: string | null
          borrowing_path: Json | null
          cognates: Json | null
          created_at: string | null
          first_attestation_date: string | null
          historical_forms: Json | null
          id: string
          language_family: string | null
          semantic_evolution: string | null
          source_language: string | null
          updated_at: string | null
          word_profile_id: string | null
        }
        Insert: {
          borrowed_from?: string | null
          borrowing_path?: Json | null
          cognates?: Json | null
          created_at?: string | null
          first_attestation_date?: string | null
          historical_forms?: Json | null
          id?: string
          language_family?: string | null
          semantic_evolution?: string | null
          source_language?: string | null
          updated_at?: string | null
          word_profile_id?: string | null
        }
        Update: {
          borrowed_from?: string | null
          borrowing_path?: Json | null
          cognates?: Json | null
          created_at?: string | null
          first_attestation_date?: string | null
          historical_forms?: Json | null
          id?: string
          language_family?: string | null
          semantic_evolution?: string | null
          source_language?: string | null
          updated_at?: string | null
          word_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etymology_chains_word_profile_id_fkey"
            columns: ["word_profile_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      linguistic_analysis_metadata: {
        Row: {
          accuracy_score: number | null
          analysis_duration_ms: number | null
          analysis_version: string | null
          completeness_score: number | null
          confidence_scores: Json | null
          created_at: string | null
          enrichment_source: string | null
          id: string
          last_enrichment_date: string | null
          processing_models: Json | null
          quality_metrics: Json | null
          updated_at: string | null
          word_profile_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          analysis_duration_ms?: number | null
          analysis_version?: string | null
          completeness_score?: number | null
          confidence_scores?: Json | null
          created_at?: string | null
          enrichment_source?: string | null
          id?: string
          last_enrichment_date?: string | null
          processing_models?: Json | null
          quality_metrics?: Json | null
          updated_at?: string | null
          word_profile_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          analysis_duration_ms?: number | null
          analysis_version?: string | null
          completeness_score?: number | null
          confidence_scores?: Json | null
          created_at?: string | null
          enrichment_source?: string | null
          id?: string
          last_enrichment_date?: string | null
          processing_models?: Json | null
          quality_metrics?: Json | null
          updated_at?: string | null
          word_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linguistic_analysis_metadata_word_profile_id_fkey"
            columns: ["word_profile_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      morphological_components: {
        Row: {
          allomorphs: Json | null
          boundary_position: number | null
          component_type: string
          created_at: string | null
          id: string
          meaning: string | null
          origin_language: string | null
          semantic_function: string | null
          text: string
          updated_at: string | null
          word_profile_id: string | null
        }
        Insert: {
          allomorphs?: Json | null
          boundary_position?: number | null
          component_type: string
          created_at?: string | null
          id?: string
          meaning?: string | null
          origin_language?: string | null
          semantic_function?: string | null
          text: string
          updated_at?: string | null
          word_profile_id?: string | null
        }
        Update: {
          allomorphs?: Json | null
          boundary_position?: number | null
          component_type?: string
          created_at?: string | null
          id?: string
          meaning?: string | null
          origin_language?: string | null
          semantic_function?: string | null
          text?: string
          updated_at?: string | null
          word_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "morphological_components_word_profile_id_fkey"
            columns: ["word_profile_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      phonetic_data: {
        Row: {
          created_at: string | null
          id: string
          ipa_transcription: string | null
          phonemes: Json | null
          regional_pronunciations: Json | null
          rhyme_scheme: string | null
          sound_changes: Json | null
          stress_pattern: string | null
          syllable_count: number | null
          syllable_structure: string | null
          updated_at: string | null
          word_profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ipa_transcription?: string | null
          phonemes?: Json | null
          regional_pronunciations?: Json | null
          rhyme_scheme?: string | null
          sound_changes?: Json | null
          stress_pattern?: string | null
          syllable_count?: number | null
          syllable_structure?: string | null
          updated_at?: string | null
          word_profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ipa_transcription?: string | null
          phonemes?: Json | null
          regional_pronunciations?: Json | null
          rhyme_scheme?: string | null
          sound_changes?: Json | null
          stress_pattern?: string | null
          syllable_count?: number | null
          syllable_structure?: string | null
          updated_at?: string | null
          word_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phonetic_data_word_profile_id_fkey"
            columns: ["word_profile_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      semantic_relationships: {
        Row: {
          conceptual_domain: string | null
          connotation: string | null
          created_at: string | null
          cultural_context: string | null
          difficulty_level: string | null
          frequency_score: number | null
          id: string
          register_level: string | null
          semantic_field: string | null
          social_associations: Json | null
          updated_at: string | null
          word_profile_id: string | null
        }
        Insert: {
          conceptual_domain?: string | null
          connotation?: string | null
          created_at?: string | null
          cultural_context?: string | null
          difficulty_level?: string | null
          frequency_score?: number | null
          id?: string
          register_level?: string | null
          semantic_field?: string | null
          social_associations?: Json | null
          updated_at?: string | null
          word_profile_id?: string | null
        }
        Update: {
          conceptual_domain?: string | null
          connotation?: string | null
          created_at?: string | null
          cultural_context?: string | null
          difficulty_level?: string | null
          frequency_score?: number | null
          id?: string
          register_level?: string | null
          semantic_field?: string | null
          social_associations?: Json | null
          updated_at?: string | null
          word_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semantic_relationships_word_profile_id_fkey"
            columns: ["word_profile_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_contexts: {
        Row: {
          context_type: string | null
          created_at: string | null
          example_sentence: string
          explanation: string | null
          frequency_score: number | null
          id: string
          regional_usage: string | null
          source: string | null
          time_period: string | null
          word_profile_id: string | null
        }
        Insert: {
          context_type?: string | null
          created_at?: string | null
          example_sentence: string
          explanation?: string | null
          frequency_score?: number | null
          id?: string
          regional_usage?: string | null
          source?: string | null
          time_period?: string | null
          word_profile_id?: string | null
        }
        Update: {
          context_type?: string | null
          created_at?: string | null
          example_sentence?: string
          explanation?: string | null
          frequency_score?: number | null
          id?: string
          regional_usage?: string | null
          source?: string | null
          time_period?: string | null
          word_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_contexts_word_profile_id_fkey"
            columns: ["word_profile_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          achievements: Json | null
          avatar_url: string | null
          created_at: string
          daily_goal: number | null
          full_name: string | null
          id: string
          learning_level: string | null
          streak_count: number | null
          total_words_learned: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          achievements?: Json | null
          avatar_url?: string | null
          created_at?: string
          daily_goal?: number | null
          full_name?: string | null
          id: string
          learning_level?: string | null
          streak_count?: number | null
          total_words_learned?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          achievements?: Json | null
          avatar_url?: string | null
          created_at?: string
          daily_goal?: number | null
          full_name?: string | null
          id?: string
          learning_level?: string | null
          streak_count?: number | null
          total_words_learned?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
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
      webhook_logs: {
        Row: {
          error_message: string | null
          id: string
          payload: Json
          processed_at: string | null
          source: string
          status: string | null
          word_profile_id: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          payload: Json
          processed_at?: string | null
          source: string
          status?: string | null
          word_profile_id?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          source?: string
          status?: string | null
          word_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_word_profile_id_fkey"
            columns: ["word_profile_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      word_profiles: {
        Row: {
          analysis: Json | null
          completeness_score: number | null
          created_at: string
          data_sources: Json | null
          definitions: Json | null
          enrichment_status: string | null
          etymology: Json | null
          id: string
          last_enrichment_at: string | null
          morpheme_breakdown: Json | null
          quality_score: number | null
          updated_at: string
          word: string
          word_forms: Json | null
        }
        Insert: {
          analysis?: Json | null
          completeness_score?: number | null
          created_at?: string
          data_sources?: Json | null
          definitions?: Json | null
          enrichment_status?: string | null
          etymology?: Json | null
          id?: string
          last_enrichment_at?: string | null
          morpheme_breakdown?: Json | null
          quality_score?: number | null
          updated_at?: string
          word: string
          word_forms?: Json | null
        }
        Update: {
          analysis?: Json | null
          completeness_score?: number | null
          created_at?: string
          data_sources?: Json | null
          definitions?: Json | null
          enrichment_status?: string | null
          etymology?: Json | null
          id?: string
          last_enrichment_at?: string | null
          morpheme_breakdown?: Json | null
          quality_score?: number | null
          updated_at?: string
          word?: string
          word_forms?: Json | null
        }
        Relationships: []
      }
      word_relationships: {
        Row: {
          confidence_score: number | null
          context: string | null
          created_at: string | null
          id: string
          relationship_type: string
          source_word_id: string | null
          strength: number | null
          target_word_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          context?: string | null
          created_at?: string | null
          id?: string
          relationship_type: string
          source_word_id?: string | null
          strength?: number | null
          target_word_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          context?: string | null
          created_at?: string | null
          id?: string
          relationship_type?: string
          source_word_id?: string | null
          strength?: number | null
          target_word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "word_relationships_source_word_id_fkey"
            columns: ["source_word_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_relationships_target_word_id_fkey"
            columns: ["target_word_id"]
            isOneToOne: false
            referencedRelation: "word_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_word_completeness: {
        Args: {
          analysis_data: Json
          definitions_data: Json
          etymology_data: Json
          word_data: Json
        }
        Returns: number
      }
      get_comprehensive_word_analysis: {
        Args: { word_id: string }
        Returns: Json
      }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      identify_missing_fields: {
        Args: { word_profile_id: string }
        Returns: Json
      }
      queue_word_for_enrichment: {
        Args: { enrichment_priority?: number; word_profile_id: string }
        Returns: undefined
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
