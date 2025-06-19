
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
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const entry = data[0];
      
      return {
        word: entry.word,
        phonetic: entry.phonetic,
        audio: entry.phonetics?.find((p: any) => p.audio)?.audio,
        meanings: entry.meanings || [],
        etymology: entry.origin
      };
    } catch (error) {
      console.error('Free Dictionary API error:', error);
      return null;
    }
  }

  // Wiktionary API (simplified)
  static async fetchFromWiktionary(word: string): Promise<DictionaryApiResponse | null> {
    try {
      const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${word}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const definitions = data.en || [];
      
      return {
        word,
        meanings: definitions.map((def: any) => ({
          partOfSpeech: def.partOfSpeech || 'unknown',
          definitions: def.definitions?.map((d: any) => ({
            definition: d.definition || d.text,
            example: d.examples?.[0]
          })) || []
        }))
      };
    } catch (error) {
      console.error('Wiktionary API error:', error);
      return null;
    }
  }

  // Datamuse API
  static async fetchFromDatamuse(word: string): Promise<DictionaryApiResponse | null> {
    try {
      const response = await fetch(`https://api.datamuse.com/words?sp=${word}&md=dpr&max=1`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const entry = data[0];
      
      if (!entry) return null;
      
      return {
        word: entry.word,
        meanings: entry.defs?.map((def: string) => {
          const [partOfSpeech, definition] = def.split('\t');
          return {
            partOfSpeech: partOfSpeech || 'unknown',
            definitions: [{ definition: definition || def }]
          };
        }) || []
      };
    } catch (error) {
      console.error('Datamuse API error:', error);
      return null;
    }
  }

  // Aggregate data from multiple APIs
  static async fetchWordData(word: string): Promise<DictionaryApiResponse | null> {
    const apis = [
      () => this.fetchFromFreeDictionary(word),
      () => this.fetchFromWiktionary(word),
      () => this.fetchFromDatamuse(word)
    ];

    for (const apiFetch of apis) {
      try {
        const result = await apiFetch();
        if (result && result.meanings.length > 0) {
          return result;
        }
      } catch (error) {
        console.error('API fetch error:', error);
        continue;
      }
    }

    return null;
  }

  // Store word data in word_profiles table
  static async storeWordData(apiResponse: DictionaryApiResponse): Promise<void> {
    try {
      const wordData = {
        word: apiResponse.word.toLowerCase(),
        morpheme_breakdown: {
          phonetic: apiResponse.phonetic,
          audio_url: apiResponse.audio,
          root: { text: apiResponse.word, meaning: '' }
        },
        etymology: {
          historical_origins: apiResponse.etymology || '',
          language_of_origin: 'English'
        },
        definitions: {
          primary: apiResponse.meanings[0]?.definitions[0]?.definition || '',
          standard: apiResponse.meanings.slice(0, 3).map(m => 
            m.definitions[0]?.definition || ''
          ).filter(Boolean)
        },
        word_forms: {
          base_form: apiResponse.word
        },
        analysis: {
          parts_of_speech: apiResponse.meanings.map(m => m.partOfSpeech).join(', '),
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

      const { error } = await supabase
        .from('word_profiles')
        .upsert(wordData, { onConflict: 'word' });

      if (error) {
        console.error('Error storing word data:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in storeWordData:', error);
      throw error;
    }
  }

  // Fetch and store word data
  static async fetchAndStoreWord(word: string): Promise<boolean> {
    try {
      const apiResponse = await this.fetchWordData(word);
      if (apiResponse) {
        await this.storeWordData(apiResponse);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in fetchAndStoreWord:', error);
      return false;
    }
  }
}
