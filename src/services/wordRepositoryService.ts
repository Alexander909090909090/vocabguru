
import { supabase } from "@/integrations/supabase/client";

export interface WordRepositoryEntry {
  id: string;
  word: string;
  phonetic?: string;
  audio_url?: string;
  morpheme_data: {
    prefix?: { text: string; meaning: string };
    root: { text: string; meaning: string };
    suffix?: { text: string; meaning: string };
  };
  etymology_data: {
    historical_origins?: string;
    language_of_origin?: string;
    word_evolution?: string;
    cultural_variations?: string;
  };
  definitions_data: {
    primary?: string;
    standard?: string[];
    extended?: string[];
    contextual?: string;
    specialized?: string;
  };
  word_forms_data: {
    base_form?: string;
    verb_tenses?: {
      present?: string;
      past?: string;
      future?: string;
      present_participle?: string;
      past_participle?: string;
    };
    noun_forms?: {
      singular?: string;
      plural?: string;
    };
    adjective_forms?: {
      positive?: string;
      comparative?: string;
      superlative?: string;
    };
    adverb_form?: string;
  };
  analysis_data: {
    parts_of_speech?: string;
    usage_examples?: string[];
    synonyms?: string[];
    antonyms?: string[];
    collocations?: string[];
    cultural_significance?: string;
    example_sentence?: string;
  };
  source_apis: string[];
  frequency_score: number;
  difficulty_level: string;
  created_at: string;
  updated_at: string;
}

export interface UserWordLibrary {
  id: string;
  user_id: string;
  word_id: string;
  added_at: string;
  notes?: string;
  mastery_level: number;
  word?: WordRepositoryEntry;
}

export class WordRepositoryService {
  static async getWordsWithPagination(
    page: number = 0,
    limit: number = 20,
    searchQuery?: string
  ): Promise<{ words: WordRepositoryEntry[]; hasMore: boolean }> {
    let query = supabase
      .from('word_repository')
      .select('*')
      .order('frequency_score', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (searchQuery) {
      query = query.ilike('word', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching words:', error);
      throw error;
    }

    return {
      words: data || [],
      hasMore: (data || []).length === limit
    };
  }

  static async searchWords(query: string): Promise<WordRepositoryEntry[]> {
    const { data, error } = await supabase
      .from('word_repository')
      .select('*')
      .or(`word.ilike.%${query}%,definitions_data->>primary.ilike.%${query}%`)
      .order('frequency_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error searching words:', error);
      throw error;
    }

    return data || [];
  }

  static async getWordByName(word: string): Promise<WordRepositoryEntry | null> {
    const { data, error } = await supabase
      .from('word_repository')
      .select('*')
      .eq('word', word.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error fetching word:', error);
      throw error;
    }

    return data;
  }

  static async addToUserLibrary(wordId: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('user_word_library')
      .insert({
        word_id: wordId,
        notes,
        mastery_level: 1
      });

    if (error) {
      console.error('Error adding to library:', error);
      throw error;
    }
  }

  static async getUserLibrary(userId: string): Promise<UserWordLibrary[]> {
    const { data, error } = await supabase
      .from('user_word_library')
      .select(`
        *,
        word:word_repository(*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching user library:', error);
      throw error;
    }

    return data || [];
  }

  static async removeFromUserLibrary(wordId: string): Promise<void> {
    const { error } = await supabase
      .from('user_word_library')
      .delete()
      .eq('word_id', wordId);

    if (error) {
      console.error('Error removing from library:', error);
      throw error;
    }
  }

  static async updateMasteryLevel(wordId: string, level: number): Promise<void> {
    const { error } = await supabase
      .from('user_word_library')
      .update({ mastery_level: level })
      .eq('word_id', wordId);

    if (error) {
      console.error('Error updating mastery level:', error);
      throw error;
    }
  }

  static async addQueryToHistory(query: string, resultWordId?: string): Promise<void> {
    const { error } = await supabase
      .from('user_query_history')
      .insert({
        query,
        result_word_id: resultWordId
      });

    if (error) {
      console.error('Error adding query to history:', error);
      throw error;
    }
  }

  static async getQueryHistory(limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_query_history')
      .select('*')
      .order('queried_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching query history:', error);
      throw error;
    }

    return data || [];
  }
}
