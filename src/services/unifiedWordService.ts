
import { supabase } from "@/integrations/supabase/client";
import { UnifiedWord, WordTypeConverter } from "@/types/unifiedWord";
import { Word } from "@/data/words";
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
      console.log(`Getting words: page=${page}, limit=${limit}, query=${searchQuery || 'none'}`);
      
      let query = supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (searchQuery) {
        query = query.or(`word.ilike.%${searchQuery}%,definitions->>primary.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching words:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} words from database`);
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
      console.log(`Searching words with query: "${query}"`);
      
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .or(`word.ilike.%${query}%,definitions->>primary.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 10);

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      console.log(`Search found ${data?.length || 0} results`);
      return (data || []).map(WordTypeConverter.toUnifiedWord);
    } catch (error) {
      console.error('Error searching words:', error);
      return [];
    }
  }

  // Get word by name
  static async getWordByName(word: string): Promise<UnifiedWord | null> {
    try {
      console.log(`Getting word by name: "${word}"`);
      
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .eq('word', word.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error fetching word by name:', error);
        throw error;
      }

      if (data) {
        console.log(`Found word by name:`, data);
        return WordTypeConverter.toUnifiedWord(data);
      }
      
      console.log(`No word found with name: "${word}"`);
      return null;
    } catch (error) {
      console.error('Error fetching word:', error);
      return null;
    }
  }

  // Get word by ID
  static async getWordById(id: string): Promise<UnifiedWord | null> {
    try {
      console.log(`Getting word by ID: ${id}`);
      
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching word by ID:', error);
        throw error;
      }

      if (data) {
        console.log(`Found word by ID:`, data);
        return WordTypeConverter.toUnifiedWord(data);
      }
      
      console.log(`No word found with ID: ${id}`);
      return null;
    } catch (error) {
      console.error('Error fetching word by ID:', error);
      return null;
    }
  }

  // Create new word
  static async createWord(word: Partial<UnifiedWord>): Promise<UnifiedWord | null> {
    try {
      console.log(`Creating word:`, word);
      
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

      if (error) {
        console.error('Error creating word:', error);
        throw error;
      }

      console.log(`Created word:`, data);
      toast.success(`Word "${word.word}" created successfully`);
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
      console.log(`Updating word ${id}:`, updates);
      
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

      if (error) {
        console.error('Error updating word:', error);
        throw error;
      }

      console.log(`Updated word:`, data);
      toast.success('Word updated successfully');
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
      console.log(`Deleting word: ${id}`);
      
      const { error } = await supabase
        .from('word_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting word:', error);
        throw error;
      }

      console.log(`Deleted word: ${id}`);
      toast.success('Word deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting word:', error);
      toast.error('Failed to delete word');
      return false;
    }
  }

  // Get words for study with filtering criteria
  static async getWordsForStudy(criteria: {
    difficultyLevel?: string;
    partOfSpeech?: string;
    limit?: number;
  } = {}): Promise<UnifiedWord[]> {
    try {
      console.log(`Getting words for study:`, criteria);
      
      const { limit = 20, difficultyLevel, partOfSpeech } = criteria;
      
      let query = supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Add filters if provided
      if (difficultyLevel) {
        query = query.eq('analysis->>difficulty_level', difficultyLevel);
      }
      
      if (partOfSpeech) {
        query = query.eq('analysis->>parts_of_speech', partOfSpeech);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching words for study:', error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} words for study`);
      return (data || []).map(WordTypeConverter.toUnifiedWord);
    } catch (error) {
      console.error('Error fetching words for study:', error);
      return [];
    }
  }

  // Combined search (database + legacy)
  static async searchAllWords(query: string, limit: number = 10): Promise<UnifiedWord[]> {
    console.log(`Performing combined search for: "${query}"`);
    
    const results: UnifiedWord[] = [];
    
    // Search database words
    const dbWords = await this.searchWords(query, { limit });
    results.push(...dbWords);
    
    // If we need more results, search legacy words
    if (results.length < limit) {
      try {
        console.log('Database search incomplete, would search legacy words if available');
        // This would need to be called from a component context
        // For now, we'll skip legacy search in the service
      } catch (error) {
        console.error('Error searching legacy words:', error);
      }
    }
    
    console.log(`Combined search returned ${results.length} results`);
    return results.slice(0, limit);
  }
}
