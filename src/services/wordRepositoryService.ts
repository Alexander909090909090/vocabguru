import { supabase } from "@/integrations/supabase/client";

export interface WordRepositoryEntry {
  id: string;
  word: string;
  phonetic?: string;
  audio_url?: string;
  morpheme_breakdown: {
    prefix?: { text: string; meaning: string; origin?: string };
    root: { text: string; meaning: string; origin?: string };
    suffix?: { text: string; meaning: string; origin?: string };
  };
  etymology: {
    historical_origins?: string;
    language_of_origin?: string;
    word_evolution?: string;
    cultural_variations?: string;
  };
  definitions: {
    primary?: string;
    standard?: string[];
    extended?: string[];
    contextual?: string[];
    specialized?: string[];
  };
  word_forms: {
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
    other_inflections?: string[];
  };
  analysis: {
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

// Helper function to convert word_profiles to WordRepositoryEntry format
const convertWordProfileToEntry = (profile: any): WordRepositoryEntry => {
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
    etymology: {
      historical_origins: profile.etymology?.historical_origins || '',
      language_of_origin: profile.etymology?.language_of_origin || '',
      word_evolution: profile.etymology?.word_evolution || '',
      cultural_variations: profile.etymology?.cultural_variations || ''
    },
    definitions: {
      primary: profile.definitions?.primary || '',
      standard: profile.definitions?.standard || [],
      extended: profile.definitions?.extended || [],
      contextual: Array.isArray(profile.definitions?.contextual) ? 
        profile.definitions.contextual : 
        (profile.definitions?.contextual ? [profile.definitions.contextual] : []),
      specialized: Array.isArray(profile.definitions?.specialized) ?
        profile.definitions.specialized :
        (profile.definitions?.specialized ? [profile.definitions.specialized] : [])
    },
    word_forms: {
      base_form: profile.word_forms?.base_form || profile.word,
      verb_tenses: profile.word_forms?.verb_tenses || {},
      noun_forms: profile.word_forms?.noun_forms || {},
      adjective_forms: profile.word_forms?.adjective_forms || {},
      adverb_form: profile.word_forms?.adverb_form || '',
      other_inflections: Array.isArray(profile.word_forms?.other_inflections) ?
        profile.word_forms.other_inflections :
        (profile.word_forms?.other_inflections ? [profile.word_forms.other_inflections] : [])
    },
    analysis: {
      parts_of_speech: profile.analysis?.parts_of_speech || '',
      usage_examples: profile.analysis?.usage_examples || [],
      synonyms: profile.analysis?.synonyms || [],
      antonyms: profile.analysis?.antonyms || [],
      collocations: Array.isArray(profile.analysis?.common_collocations) ?
        profile.analysis.common_collocations :
        (profile.analysis?.common_collocations ? 
          profile.analysis.common_collocations.split(',').map((s: string) => s.trim()) : []),
      cultural_significance: profile.analysis?.cultural_significance || '',
      example_sentence: profile.analysis?.example_sentence || ''
    },
    source_apis: ['word_profiles'], // Temporary until we have the new table
    frequency_score: 0,
    difficulty_level: 'medium',
    created_at: profile.created_at,
    updated_at: profile.updated_at
  };
};

export class WordRepositoryService {
  static async getWordsWithPagination(
    page: number = 0,
    limit: number = 20,
    searchQuery?: string
  ): Promise<{ words: WordRepositoryEntry[]; hasMore: boolean }> {
    let query = supabase
      .from('word_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (searchQuery) {
      query = query.ilike('word', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching words:', error);
      throw error;
    }

    const words = (data || []).map(convertWordProfileToEntry);

    return {
      words,
      hasMore: words.length === limit
    };
  }

  static async searchWords(query: string): Promise<WordRepositoryEntry[]> {
    const { data, error } = await supabase
      .from('word_profiles')
      .select('*')
      .or(`word.ilike.%${query}%,definitions->>primary.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error searching words:', error);
      throw error;
    }

    return (data || []).map(convertWordProfileToEntry);
  }

  static async getWordByName(word: string): Promise<WordRepositoryEntry | null> {
    const { data, error } = await supabase
      .from('word_profiles')
      .select('*')
      .eq('word', word.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error fetching word:', error);
      throw error;
    }

    return data ? convertWordProfileToEntry(data) : null;
  }

  // Temporary methods until we have the new user_word_library table
  static async addToUserLibrary(wordId: string, notes?: string): Promise<void> {
    console.log('Add to library functionality will be available after database migration');
    // This will be implemented once the user_word_library table is created
  }

  static async getUserLibrary(userId: string): Promise<UserWordLibrary[]> {
    console.log('User library functionality will be available after database migration');
    return [];
  }

  static async removeFromUserLibrary(wordId: string): Promise<void> {
    console.log('Remove from library functionality will be available after database migration');
  }

  static async updateMasteryLevel(wordId: string, level: number): Promise<void> {
    console.log('Mastery level functionality will be available after database migration');
  }

  static async addQueryToHistory(query: string, resultWordId?: string): Promise<void> {
    console.log('Query history functionality will be available after database migration');
  }

  static async getQueryHistory(limit: number = 10): Promise<any[]> {
    console.log('Query history functionality will be available after database migration');
    return [];
  }
}
