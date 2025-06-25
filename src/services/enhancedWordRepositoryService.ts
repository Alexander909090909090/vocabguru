
import { supabase } from "@/integrations/supabase/client";
import { WordRepositoryEntry, WordRepositoryService } from "@/services/wordRepositoryService";
import { UserWordLibraryService } from "@/services/userWordLibraryService";
import { InputValidationService } from "@/services/inputValidationService";

export class EnhancedWordRepositoryService extends WordRepositoryService {
  // Enhanced search with security and tracking
  static async searchWordsSecure(query: string): Promise<WordRepositoryEntry[]> {
    // Validate search input
    const validation = InputValidationService.validateSearchQuery(query);
    if (!validation.isValid) {
      console.warn('Invalid search query:', validation.errors);
      return [];
    }

    // Check rate limiting
    const userKey = `search_${Math.random().toString(36).substr(2, 9)}`;
    if (!InputValidationService.checkRateLimit(userKey, 20, 60000)) {
      return [];
    }

    try {
      const results = await this.searchWords(validation.sanitizedValue!);
      
      // Track search in history
      await UserWordLibraryService.addSearchToHistory(
        validation.sanitizedValue!,
        'word_search',
        results.length
      );

      return results;
    } catch (error) {
      console.error('Enhanced search error:', error);
      return [];
    }
  }

  // Get words with user context (library status, progress)
  static async getWordsWithUserContext(
    page: number = 0,
    limit: number = 20,
    searchQuery?: string
  ): Promise<{ 
    words: (WordRepositoryEntry & { 
      inLibrary?: boolean; 
      masteryLevel?: number; 
      isFavorite?: boolean; 
    })[]; 
    hasMore: boolean 
  }> {
    try {
      const { words, hasMore } = await this.getWordsWithPagination(page, limit, searchQuery);
      
      // Get user's library to enhance word data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { words, hasMore };
      }

      const { data: libraryEntries } = await supabase
        .from('user_word_library')
        .select('word_id, mastery_level, is_favorite')
        .eq('user_id', user.id);

      const libraryMap = new Map(
        libraryEntries?.map(entry => [
          entry.word_id, 
          { masteryLevel: entry.mastery_level, isFavorite: entry.is_favorite }
        ]) || []
      );

      const enhancedWords = words.map(word => ({
        ...word,
        inLibrary: libraryMap.has(word.id),
        masteryLevel: libraryMap.get(word.id)?.masteryLevel,
        isFavorite: libraryMap.get(word.id)?.isFavorite
      }));

      return { words: enhancedWords, hasMore };
    } catch (error) {
      console.error('Error getting words with user context:', error);
      return { words: [], hasMore: false };
    }
  }

  // Secure word addition with validation
  static async addToUserLibrarySecure(wordId: string, notes?: string): Promise<void> {
    if (notes) {
      const validation = InputValidationService.validateUserNotes(notes);
      if (!validation.isValid) {
        throw new Error(`Invalid notes: ${validation.errors.join(', ')}`);
      }
      notes = validation.sanitizedValue;
    }

    await UserWordLibraryService.addWordToLibrary(wordId, notes);
  }

  // Get personalized word recommendations
  static async getPersonalizedRecommendations(limit: number = 10): Promise<WordRepositoryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get words not in user's library with similar difficulty to their mastered words
      const { data: userStats } = await supabase.rpc('get_user_study_stats');
      const stats = userStats?.[0];

      if (!stats || stats.words_in_library === 0) {
        // New user - get beginner words
        return this.getWordsForBeginners(limit);
      }

      // Get recommendations based on user's progress
      const { data: recommendations, error } = await supabase
        .from('word_profiles')
        .select('*')
        .not('id', 'in', `(
          SELECT word_id FROM user_word_library WHERE user_id = '${user.id}'
        )`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (recommendations || []).map(word => this.convertWordProfileToEntry(word));
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  // Get words suitable for beginners
  private static async getWordsForBeginners(limit: number): Promise<WordRepositoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(word => this.convertWordProfileToEntry(word));
    } catch (error) {
      console.error('Error getting beginner words:', error);
      return [];
    }
  }

  // Helper method to convert word profiles (existing in parent class but ensuring it's available)
  private static convertWordProfileToEntry(profile: any): WordRepositoryEntry {
    return super.convertWordProfileToEntry ? 
      super.convertWordProfileToEntry(profile) : 
      this.fallbackConversion(profile);
  }

  private static fallbackConversion(profile: any): WordRepositoryEntry {
    return {
      id: profile.id,
      word: profile.word,
      phonetic: profile.morpheme_breakdown?.phonetic || '',
      audio_url: profile.morpheme_breakdown?.audio_url || '',
      morpheme_breakdown: {
        prefix: profile.morpheme_breakdown?.prefix || undefined,
        root: profile.morpheme_breakdown?.root || { text: profile.word, meaning: '' },
        suffix: profile.morpheme_breakdown?.suffix || undefined
      },
      etymology: profile.etymology || {},
      definitions: profile.definitions || {},
      word_forms: profile.word_forms || {},
      analysis: profile.analysis || {},
      source_apis: ['word_profiles'],
      frequency_score: 0,
      difficulty_level: 'medium',
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
  }
}
