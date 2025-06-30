
import { supabase } from "@/integrations/supabase/client";
import { UnifiedWord, WordTypeConverter } from "@/types/unifiedWord";
import { Word } from "@/data/words";
import { useWords } from "@/context/WordsContext";
import { toast } from "sonner";

// Unified Word Service - Single source of truth for all word operations
export class UnifiedWordService {
  // Get all words with pagination
  static async getWords(
    page: number = 0,
    limit: number = 20,
    searchQuery?: string
  ): Promise<{ words: UnifiedWord[]; hasMore: boolean }> {
    try {
      let query = supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (searchQuery) {
        query = query.or(`word.ilike.%${searchQuery}%,definitions->>primary.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const words = (data || []).map(WordTypeConverter.toUnifiedWord);

      return {
        words,
        hasMore: words.length === limit
      };
    } catch (error) {
      console.error('Error fetching words:', error);
      return { words: [], hasMore: false };
    }
  }

  // Search words
  static async searchWords(query: string, options?: { limit?: number }): Promise<UnifiedWord[]> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .or(`word.ilike.%${query}%,definitions->>primary.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 10);

      if (error) throw error;

      return (data || []).map(WordTypeConverter.toUnifiedWord);
    } catch (error) {
      console.error('Error searching words:', error);
      return [];
    }
  }

  // Get word by name
  static async getWordByName(word: string): Promise<UnifiedWord | null> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .eq('word', word.toLowerCase())
        .maybeSingle();

      if (error) throw error;

      return data ? WordTypeConverter.toUnifiedWord(data) : null;
    } catch (error) {
      console.error('Error fetching word:', error);
      return null;
    }
  }

  // Get word by ID
  static async getWordById(id: string): Promise<UnifiedWord | null> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      return data ? WordTypeConverter.toUnifiedWord(data) : null;
    } catch (error) {
      console.error('Error fetching word by ID:', error);
      return null;
    }
  }

  // Create new word
  static async createWord(word: Partial<UnifiedWord>): Promise<UnifiedWord | null> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .insert({
          word: word.word,
          morpheme_breakdown: word.morpheme_breakdown || {},
          etymology: word.etymology || {},
          definitions: word.definitions || {},
          word_forms: word.word_forms || {},
          analysis: word.analysis || {}
        })
        .select()
        .single();

      if (error) throw error;

      return WordTypeConverter.toUnifiedWord(data);
    } catch (error) {
      console.error('Error creating word:', error);
      toast.error('Failed to create word');
      return null;
    }
  }

  // Update word
  static async updateWord(id: string, updates: Partial<UnifiedWord>): Promise<UnifiedWord | null> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .update({
          morpheme_breakdown: updates.morpheme_breakdown,
          etymology: updates.etymology,
          definitions: updates.definitions,
          word_forms: updates.word_forms,
          analysis: updates.analysis
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return WordTypeConverter.toUnifiedWord(data);
    } catch (error) {
      console.error('Error updating word:', error);
      toast.error('Failed to update word');
      return null;
    }
  }

  // Delete word
  static async deleteWord(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('word_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting word:', error);
      toast.error('Failed to delete word');
      return false;
    }
  }

  // Combined search (database + legacy)
  static async searchAllWords(query: string, limit: number = 10): Promise<UnifiedWord[]> {
    const results: UnifiedWord[] = [];
    
    // Search database words
    const dbWords = await this.searchWords(query, { limit });
    results.push(...dbWords);
    
    // If we need more results, search legacy words
    if (results.length < limit) {
      try {
        // This would need to be called from a component context
        // For now, we'll skip legacy search in the service
        console.log('Legacy word search not available in service context');
      } catch (error) {
        console.error('Error searching legacy words:', error);
      }
    }
    
    return results.slice(0, limit);
  }
}
