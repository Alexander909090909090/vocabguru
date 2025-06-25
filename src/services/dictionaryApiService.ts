
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
      console.log(`Fetching word "${word}" from Free Dictionary API`);
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        console.log(`Free Dictionary API returned ${response.status} for word "${word}"`);
        return null;
      }
      
      const data = await response.json();
      const entry = data[0];
      
      console.log(`Successfully fetched "${word}" from Free Dictionary API`);
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
      console.log(`Fetching word "${word}" from Wiktionary API`);
      const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${word}`);
      if (!response.ok) {
        console.log(`Wiktionary API returned ${response.status} for word "${word}"`);
        return null;
      }
      
      const data = await response.json();
      const definitions = data.en || [];
      
      console.log(`Successfully fetched "${word}" from Wiktionary API`);
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
      console.log(`Fetching word "${word}" from Datamuse API`);
      const response = await fetch(`https://api.datamuse.com/words?sp=${word}&md=dpr&max=1`);
      if (!response.ok) {
        console.log(`Datamuse API returned ${response.status} for word "${word}"`);
        return null;
      }
      
      const data = await response.json();
      const entry = data[0];
      
      if (!entry) {
        console.log(`No data found for "${word}" in Datamuse API`);
        return null;
      }
      
      console.log(`Successfully fetched "${word}" from Datamuse API`);
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
    console.log(`Starting comprehensive fetch for word: "${word}"`);
    
    const apis = [
      () => this.fetchFromFreeDictionary(word),
      () => this.fetchFromWiktionary(word),
      () => this.fetchFromDatamuse(word)
    ];

    for (const apiFetch of apis) {
      try {
        const result = await apiFetch();
        if (result && result.meanings.length > 0) {
          console.log(`Successfully found data for "${word}"`);
          return result;
        }
      } catch (error) {
        console.error('API fetch error:', error);
        continue;
      }
    }

    console.log(`No data found for word "${word}" in any API`);
    return null;
  }

  // Store word data in word_profiles table with enhanced logging
  static async storeWordData(apiResponse: DictionaryApiResponse): Promise<void> {
    try {
      console.log(`Storing word data for: "${apiResponse.word}"`);
      
      const wordData = {
        word: apiResponse.word.toLowerCase(),
        morpheme_breakdown: {
          phonetic: apiResponse.phonetic || '',
          audio_url: apiResponse.audio || '',
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

      console.log('Word data prepared:', JSON.stringify(wordData, null, 2));

      const { data, error } = await supabase
        .from('word_profiles')
        .upsert(wordData, { onConflict: 'word' })
        .select();

      if (error) {
        console.error('Supabase error storing word data:', error);
        throw error;
      }

      console.log(`Successfully stored word "${apiResponse.word}" in Supabase:`, data);
    } catch (error) {
      console.error('Error in storeWordData:', error);
      throw error;
    }
  }

  // Fetch and store word data with comprehensive logging
  static async fetchAndStoreWord(word: string): Promise<boolean> {
    try {
      console.log(`=== Starting fetchAndStoreWord for: "${word}" ===`);
      
      // Check if word already exists
      const { data: existingWord } = await supabase
        .from('word_profiles')
        .select('word')
        .eq('word', word.toLowerCase())
        .maybeSingle();

      if (existingWord) {
        console.log(`Word "${word}" already exists in database`);
        return true;
      }

      console.log(`Word "${word}" not found in database, fetching from APIs...`);
      
      const apiResponse = await this.fetchWordData(word);
      if (apiResponse) {
        await this.storeWordData(apiResponse);
        console.log(`=== Successfully processed word: "${word}" ===`);
        return true;
      } else {
        console.log(`=== Failed to find data for word: "${word}" ===`);
        return false;
      }
    } catch (error) {
      console.error(`=== Error in fetchAndStoreWord for "${word}":`, error);
      return false;
    }
  }

  // Seed database with common words
  static async seedCommonWords(): Promise<void> {
    const commonWords = [
      'hello', 'world', 'computer', 'science', 'language', 'vocabulary', 'learning',
      'education', 'knowledge', 'wisdom', 'intelligence', 'artificial', 'natural',
      'communication', 'information', 'understanding', 'comprehension', 'analysis',
      'synthesis', 'research', 'study', 'academic', 'professional', 'development'
    ];

    console.log(`Starting to seed ${commonWords.length} common words...`);

    for (const word of commonWords) {
      try {
        await this.fetchAndStoreWord(word);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to seed word "${word}":`, error);
      }
    }

    console.log('Completed seeding common words');
  }
}
