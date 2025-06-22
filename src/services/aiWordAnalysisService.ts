
// AI-powered word analysis service for deep morphological insights
import { supabase } from "@/integrations/supabase/client";

export interface AIWordAnalysis {
  word: string;
  morphological_breakdown: {
    prefix?: { text: string; meaning: string; origin: string };
    root: { text: string; meaning: string; origin: string };
    suffix?: { text: string; meaning: string; origin: string };
  };
  semantic_analysis: {
    core_meaning: string;
    conceptual_metaphors: string[];
    semantic_field: string;
    related_concepts: string[];
  };
  etymology_deep_dive: {
    historical_development: string;
    language_family: string;
    cognates: { language: string; word: string; meaning: string }[];
    semantic_evolution: string;
  };
  contextual_usage: {
    register_levels: string[];
    discourse_patterns: string[];
    collocational_strength: { word: string; score: number }[];
    pragmatic_functions: string[];
  };
  learning_insights: {
    difficulty_factors: string[];
    memory_anchors: string[];
    learning_strategies: string[];
    common_errors: string[];
  };
}

export class AIWordAnalysisService {
  static async analyzeWord(word: string): Promise<AIWordAnalysis> {
    try {
      // Call our AI analysis edge function
      const { data, error } = await supabase.functions.invoke('ai-word-analysis', {
        body: { word }
      });

      if (error) {
        console.error('AI analysis error:', error);
        return this.getFallbackAnalysis(word);
      }

      return data;
    } catch (error) {
      console.error('Error in AI word analysis:', error);
      return this.getFallbackAnalysis(word);
    }
  }

  static async generateSemanticMap(word: string): Promise<{
    central_concept: string;
    related_words: { word: string; relationship: string; strength: number }[];
    conceptual_domains: string[];
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-semantic-map', {
        body: { word }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating semantic map:', error);
      return {
        central_concept: word,
        related_words: [],
        conceptual_domains: []
      };
    }
  }

  static async generateContextualExamples(word: string, context: string): Promise<{
    examples: { sentence: string; context_type: string; explanation: string }[];
    usage_patterns: string[];
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-contextual-examples', {
        body: { word, context }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating contextual examples:', error);
      return {
        examples: [],
        usage_patterns: []
      };
    }
  }

  private static getFallbackAnalysis(word: string): AIWordAnalysis {
    return {
      word,
      morphological_breakdown: {
        root: { text: word, meaning: "Core meaning unavailable", origin: "Unknown" }
      },
      semantic_analysis: {
        core_meaning: "Analysis temporarily unavailable",
        conceptual_metaphors: [],
        semantic_field: "General",
        related_concepts: []
      },
      etymology_deep_dive: {
        historical_development: "Etymology data unavailable",
        language_family: "Unknown",
        cognates: [],
        semantic_evolution: "Evolution data unavailable"
      },
      contextual_usage: {
        register_levels: ["Standard"],
        discourse_patterns: [],
        collocational_strength: [],
        pragmatic_functions: []
      },
      learning_insights: {
        difficulty_factors: [],
        memory_anchors: [],
        learning_strategies: [],
        common_errors: []
      }
    };
  }
}
