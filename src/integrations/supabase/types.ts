export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          adjective_form: string | null
          adverb_form: string | null
          antonyms: Json | null
          common_collocations: Json | null
          contextual_usage: string | null
          created_at: string
          cultural_variations: string | null
          definitions: Json | null
          difficulty_level: string | null
          example_sentence: string | null
          frequency_score: number | null
          historical_origin: string | null
          id: string
          is_featured: boolean | null
          language_origin: string | null
          noun_form: string | null
          part_of_speech: string | null
          prefix_meaning: string | null
          prefix_text: string | null
          pronunciation: string | null
          root_meaning: string | null
          root_text: string
          sentence_structure: string | null
          suffix_meaning: string | null
          suffix_text: string | null
          synonyms: Json | null
          updated_at: string
          verb_form: string | null
          word: string
          word_evolution: string | null
        }
        Insert: {
          adjective_form?: string | null
          adverb_form?: string | null
          antonyms?: Json | null
          common_collocations?: Json | null
          contextual_usage?: string | null
          created_at?: string
          cultural_variations?: string | null
          definitions?: Json | null
          difficulty_level?: string | null
          example_sentence?: string | null
          frequency_score?: number | null
          historical_origin?: string | null
          id?: string
          is_featured?: boolean | null
          language_origin?: string | null
          noun_form?: string | null
          part_of_speech?: string | null
          prefix_meaning?: string | null
          prefix_text?: string | null
          pronunciation?: string | null
          root_meaning?: string | null
          root_text: string
          sentence_structure?: string | null
          suffix_meaning?: string | null
          suffix_text?: string | null
          synonyms?: Json | null
          updated_at?: string
          verb_form?: string | null
          word: string
          word_evolution?: string | null
        }
        Update: {
          adjective_form?: string | null
          adverb_form?: string | null
          antonyms?: Json | null
          common_collocations?: Json | null
          contextual_usage?: string | null
          created_at?: string
          cultural_variations?: string | null
          definitions?: Json | null
          difficulty_level?: string | null
          example_sentence?: string | null
          frequency_score?: number | null
          historical_origin?: string | null
          id?: string
          is_featured?: boolean | null
          language_origin?: string | null
          noun_form?: string | null
          part_of_speech?: string | null
          prefix_meaning?: string | null
          prefix_text?: string | null
          pronunciation?: string | null
          root_meaning?: string | null
          root_text?: string
          sentence_structure?: string | null
          suffix_meaning?: string | null
          suffix_text?: string | null
          synonyms?: Json | null
          updated_at?: string
          verb_form?: string | null
          word?: string
          word_evolution?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
