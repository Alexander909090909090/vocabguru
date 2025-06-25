
import { WordRepositoryService } from './wordRepositoryService';
import { supabase } from "@/integrations/supabase/client";

export interface DictionaryApiResponse {
  word: string;
  phonetic?: string;
  audio?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
  }>;
  etymology?: string;
}

export class DictionaryApiService {
  // Free Dictionary API
  static async fetchFromFreeDictionary(word: string): Promise<DictionaryApiResponse | null> {
    try {
      console.log(`[DictionaryAPI] Fetching word "${word}" from Free Dictionary API`);
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      
      if (!response.ok) {
        console.log(`[DictionaryAPI] Free Dictionary API returned ${response.status} for word "${word}"`);
        return null;
      }
      
      const data = await response.json();
      const entry = data[0];
      
      console.log(`[DictionaryAPI] Successfully fetched "${word}" from Free Dictionary API`);
      return {
        word: entry.word,
        phonetic: entry.phonetic,
        audio: entry.phonetics?.find((p: any) => p.audio)?.audio,
        meanings: entry.meanings || [],
        etymology: entry.origin
      };
    } catch (error) {
      console.error('[DictionaryAPI] Free Dictionary API error:', error);
      return null;
    }
  }

  // Store word data in word_profiles table with enhanced logging
  static async storeWordData(apiResponse: DictionaryApiResponse): Promise<boolean> {
    try {
      console.log(`[DatabaseStore] Starting to store word data for: "${apiResponse.word}"`);
      
      const wordData = {
        word: apiResponse.word.toLowerCase(),
        morpheme_breakdown: {
          phonetic: apiResponse.phonetic || '',
          audio_url: apiResponse.audio || '',
          root: { text: apiResponse.word, meaning: 'Core meaning' }
        },
        etymology: {
          historical_origins: apiResponse.etymology || `Etymology for "${apiResponse.word}"`,
          language_of_origin: 'English',
          word_evolution: `The word "${apiResponse.word}" has evolved through various linguistic stages.`
        },
        definitions: {
          primary: apiResponse.meanings[0]?.definitions[0]?.definition || `Primary definition of ${apiResponse.word}`,
          standard: apiResponse.meanings.slice(0, 3).map(m => 
            m.definitions[0]?.definition || ''
          ).filter(Boolean)
        },
        word_forms: {
          base_form: apiResponse.word
        },
        analysis: {
          parts_of_speech: apiResponse.meanings.map(m => m.partOfSpeech).join(', ') || 'Unknown',
          usage_examples: apiResponse.meanings.flatMap(m => 
            m.definitions.map(d => d.example).filter(Boolean)
          ).slice(0, 3),
          synonyms: apiResponse.meanings.flatMap(m => 
            m.definitions.flatMap(d => d.synonyms || [])
          ).slice(0, 5),
          antonyms: apiResponse.meanings.flatMap(m => 
            m.definitions.flatMap(d => d.antonyms || [])
          ).slice(0, 5)
        }
      };

      console.log('[DatabaseStore] Prepared word data:', {
        word: wordData.word,
        hasDefinitions: wordData.definitions.standard.length > 0,
        hasEtymology: !!wordData.etymology.historical_origins,
        partOfSpeech: wordData.analysis.parts_of_speech
      });

      const { data, error } = await supabase
        .from('word_profiles')
        .upsert(wordData, { onConflict: 'word' })
        .select();

      if (error) {
        console.error('[DatabaseStore] Supabase error storing word data:', error);
        throw error;
      }

      console.log(`[DatabaseStore] Successfully stored word "${apiResponse.word}" in database`);
      return true;
    } catch (error) {
      console.error('[DatabaseStore] Error in storeWordData:', error);
      return false;
    }
  }

  // Fetch and store word data with comprehensive logging
  static async fetchAndStoreWord(word: string): Promise<boolean> {
    try {
      console.log(`[WordProcessor] === Starting fetchAndStoreWord for: "${word}" ===`);
      
      // Check if word already exists
      const { data: existingWord, error: checkError } = await supabase
        .from('word_profiles')
        .select('word')
        .eq('word', word.toLowerCase())
        .maybeSingle();

      if (checkError) {
        console.error('[WordProcessor] Error checking existing word:', checkError);
      }

      if (existingWord) {
        console.log(`[WordProcessor] Word "${word}" already exists in database`);
        return true;
      }

      console.log(`[WordProcessor] Word "${word}" not found in database, fetching from APIs...`);
      
      const apiResponse = await this.fetchFromFreeDictionary(word);
      if (apiResponse) {
        const success = await this.storeWordData(apiResponse);
        if (success) {
          console.log(`[WordProcessor] === Successfully processed word: "${word}" ===`);
          return true;
        } else {
          console.error(`[WordProcessor] Failed to store word: "${word}"`);
          return false;
        }
      } else {
        console.log(`[WordProcessor] === Failed to find data for word: "${word}" ===`);
        return false;
      }
    } catch (error) {
      console.error(`[WordProcessor] === Error in fetchAndStoreWord for "${word}":`, error);
      return false;
    }
  }

  // Test database connection
  static async testDatabaseConnection(): Promise<boolean> {
    try {
      console.log('[DatabaseTest] Testing database connection...');
      
      const { data, error } = await supabase
        .from('word_profiles')
        .select('count(*)', { count: 'exact' });

      if (error) {
        console.error('[DatabaseTest] Database connection failed:', error);
        return false;
      }

      console.log('[DatabaseTest] Database connection successful. Word count:', data);
      return true;
    } catch (error) {
      console.error('[DatabaseTest] Database test error:', error);
      return false;
    }
  }
}
