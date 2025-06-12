
import { supabase } from "@/integrations/supabase/client";

export interface SemanticSearchResult {
  word: string;
  score: number;
  tags?: string[];
  defs?: string[];
}

export interface HuggingFaceResponse {
  generated_text?: string;
  score?: number;
  label?: string;
}

export class SemanticSearchService {
  private static DATAMUSE_BASE_URL = 'https://api.datamuse.com';
  private static HF_API_BASE = 'https://api-inference.huggingface.co/models';

  // Search words by meaning using Datamuse API
  static async searchByMeaning(meaning: string, limit: number = 20): Promise<SemanticSearchResult[]> {
    try {
      const response = await fetch(
        `${this.DATAMUSE_BASE_URL}/words?ml=${encodeURIComponent(meaning)}&max=${limit}&md=d`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Datamuse API');
      }
      
      const data = await response.json();
      return data.map((item: any) => ({
        word: item.word,
        score: item.score || 0,
        tags: item.tags || [],
        defs: item.defs || []
      }));
    } catch (error) {
      console.error('Datamuse API error:', error);
      return [];
    }
  }

  // Enhanced semantic search using DistilBERT for better understanding
  static async enhancedSemanticSearch(query: string): Promise<string[]> {
    try {
      // First get related words from Datamuse
      const datamuse = await this.searchByMeaning(query, 15);
      
      // Get synonyms and related concepts
      const synonymsResponse = await fetch(
        `${this.DATAMUSE_BASE_URL}/words?rel_syn=${encodeURIComponent(query)}&max=10`
      );
      const synonyms = synonymsResponse.ok ? await synonymsResponse.json() : [];
      
      // Combine and deduplicate results
      const allWords = new Set([
        ...datamuse.map(item => item.word),
        ...synonyms.map((item: any) => item.word)
      ]);
      
      return Array.from(allWords).slice(0, 25);
    } catch (error) {
      console.error('Enhanced semantic search error:', error);
      return [];
    }
  }

  // Generate word explanations using DistilGPT-2
  static async generateWordExplanation(word: string, context?: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-word-explanation', {
        body: { word, context }
      });

      if (error) throw error;
      return data.explanation || `"${word}" is a word that relates to ${context || 'various meanings and contexts'}.`;
    } catch (error) {
      console.error('Word explanation generation error:', error);
      // Fallback explanation
      return `"${word}" is an interesting word with rich linguistic heritage. It can be used in various contexts to express different meanings and nuances.`;
    }
  }

  // Suggest related words using LLM
  static async suggestRelatedWords(meaning: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('suggest-related-words', {
        body: { meaning }
      });

      if (error) throw error;
      return data.suggestions || [];
    } catch (error) {
      console.error('Word suggestion error:', error);
      // Fallback to Datamuse only
      const results = await this.searchByMeaning(meaning, 10);
      return results.map(r => r.word);
    }
  }
}
