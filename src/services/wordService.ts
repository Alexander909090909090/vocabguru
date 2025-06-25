
import { supabase } from "@/integrations/supabase/client";
import { Word, WordConverter, DictionaryEntry } from "@/types/word";
import { toast } from "sonner";

// Unified Word Service - Single source of truth for all word operations
export class WordService {
  // Auto-initialize database with sample words
  static async initializeDatabase(): Promise<void> {
    try {
      const { count, error: countError } = await supabase
        .from('word_profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error checking database status:', countError);
        return;
      }

      if (count === 0) {
        console.log('Database is empty, initializing with sample words...');
        await this.seedSampleWords();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  // Get all words with pagination
  static async getWords(
    page: number = 0,
    limit: number = 20,
    searchQuery?: string
  ): Promise<{ words: Word[]; hasMore: boolean }> {
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

      const words = (data || []).map(WordConverter.toWord);

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
  static async searchWords(query: string, options?: { limit?: number }): Promise<Word[]> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .or(`word.ilike.%${query}%,definitions->>primary.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 10);

      if (error) throw error;

      return (data || []).map(WordConverter.toWord);
    } catch (error) {
      console.error('Error searching words:', error);
      return [];
    }
  }

  // Get word by name
  static async getWordByName(word: string): Promise<Word | null> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .eq('word', word.toLowerCase())
        .maybeSingle();

      if (error) throw error;

      return data ? WordConverter.toWord(data) : null;
    } catch (error) {
      console.error('Error fetching word:', error);
      return null;
    }
  }

  // Get word by ID
  static async getWordById(id: string): Promise<Word | null> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      return data ? WordConverter.toWord(data) : null;
    } catch (error) {
      console.error('Error fetching word by ID:', error);
      return null;
    }
  }

  // Get words for study
  static async getWordsForStudy(options?: { 
    difficultyLevel?: string; 
    partOfSpeech?: string; 
    limit?: number; 
  }): Promise<Word[]> {
    try {
      let query = supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(options?.limit || 20);

      if (options?.partOfSpeech) {
        query = query.eq('analysis->>parts_of_speech', options.partOfSpeech);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(WordConverter.toWord);
    } catch (error) {
      console.error('Error getting words for study:', error);
      return [];
    }
  }

  // Create new word profile (now public access)
  static async createWord(word: Partial<Word> | DictionaryEntry): Promise<Word | null> {
    try {
      let wordData: Word;
      
      if ('meanings' in word) {
        // It's a DictionaryEntry
        wordData = WordConverter.fromDictionaryEntry(word);
      } else {
        // It's a partial Word
        wordData = WordConverter.toWord(word);
      }

      const { data, error } = await supabase
        .from('word_profiles')
        .insert({
          word: wordData.word,
          morpheme_breakdown: wordData.morpheme_breakdown,
          etymology: wordData.etymology,
          definitions: wordData.definitions,
          word_forms: wordData.word_forms,
          analysis: wordData.analysis
        })
        .select()
        .single();

      if (error) throw error;

      return WordConverter.toWord(data);
    } catch (error) {
      console.error('Error creating word:', error);
      toast.error('Failed to create word');
      return null;
    }
  }

  // Seed sample words
  private static async seedSampleWords(): Promise<void> {
    const sampleWords = [
      {
        word: 'metamorphosis',
        morpheme_breakdown: {
          prefix: { text: 'meta', meaning: 'change, beyond' },
          root: { text: 'morph', meaning: 'form, shape' },
          suffix: { text: 'osis', meaning: 'process, condition' }
        },
        etymology: {
          language_of_origin: 'Greek',
          historical_origins: 'From Greek metamorphōsis, from metamorphoun (to transform)'
        },
        definitions: {
          primary: 'A change of the form or nature of a thing or person into a completely different one',
          standard: [
            'A transformation',
            'A biological process of change in form'
          ]
        },
        word_forms: {
          base_form: 'metamorphosis',
          verb_tenses: { present: 'metamorphose', past: 'metamorphosed' },
          noun_forms: { singular: 'metamorphosis', plural: 'metamorphoses' }
        },
        analysis: {
          parts_of_speech: 'noun',
          synonyms: ['transformation', 'change', 'evolution'],
          collocations: ['complete metamorphosis', 'undergo metamorphosis'],
          example_sentence: 'The caterpillar undergoes metamorphosis to become a butterfly.'
        }
      },
      {
        word: 'serendipity',
        morpheme_breakdown: {
          root: { text: 'serendipity', meaning: 'pleasant surprise' }
        },
        etymology: {
          language_of_origin: 'English',
          historical_origins: 'Coined by Horace Walpole in 1754 from the Persian fairy tale "The Three Princes of Serendip"'
        },
        definitions: {
          primary: 'The occurrence and development of events by chance in a happy or beneficial way',
          standard: [
            'A pleasant surprise',
            'Fortunate accident'
          ]
        },
        word_forms: {
          base_form: 'serendipity',
          adjective_forms: { positive: 'serendipitous' },
          adverb_form: 'serendipitously'
        },
        analysis: {
          parts_of_speech: 'noun',
          synonyms: ['chance', 'fortune', 'luck'],
          collocations: ['pure serendipity', 'moment of serendipity'],
          example_sentence: 'Meeting my future business partner at that coffee shop was pure serendipity.'
        }
      },
      {
        word: 'ubiquitous',
        morpheme_breakdown: {
          root: { text: 'ubique', meaning: 'everywhere' },
          suffix: { text: 'ous', meaning: 'having the quality of' }
        },
        etymology: {
          language_of_origin: 'Latin',
          historical_origins: 'From Latin ubique meaning everywhere'
        },
        definitions: {
          primary: 'Present, appearing, or found everywhere',
          standard: ['Omnipresent', 'Universal', 'Pervasive']
        },
        word_forms: {
          base_form: 'ubiquitous',
          adverb_form: 'ubiquitously'
        },
        analysis: {
          parts_of_speech: 'adjective',
          synonyms: ['omnipresent', 'universal', 'widespread'],
          collocations: ['ubiquitous technology', 'ubiquitous presence'],
          example_sentence: 'Smartphones have become ubiquitous in modern society.'
        }
      }
    ];

    for (const word of sampleWords) {
      try {
        await this.createWord(word);
        console.log(`Seeded word: ${word.word}`);
      } catch (error) {
        console.error(`Failed to seed word ${word.word}:`, error);
      }
    }

    toast.success('Database initialized with sample words!');
  }
}
