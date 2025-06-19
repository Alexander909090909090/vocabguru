
// Free Dictionary API service for word data fetching
export interface DictionaryApiResponse {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
  }>;
  origin?: string;
}

export class DictionaryApiService {
  // Free Dictionary API (no key required)
  static async fetchFromFreeDictionary(word: string): Promise<DictionaryApiResponse | null> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Free Dictionary API error:', error);
      return null;
    }
  }

  // Datamuse API (no key required)
  static async fetchFromDatamuse(word: string) {
    try {
      const [definitions, related, frequency] = await Promise.all([
        fetch(`https://api.datamuse.com/words?sp=${word}&md=d&max=1`),
        fetch(`https://api.datamuse.com/words?ml=${word}&max=10`),
        fetch(`https://api.datamuse.com/words?sp=${word}&md=f&max=1`)
      ]);

      const [defData, relData, freqData] = await Promise.all([
        definitions.json(),
        related.json(),
        frequency.json()
      ]);

      return {
        definitions: defData,
        related: relData,
        frequency: freqData
      };
    } catch (error) {
      console.error('Datamuse API error:', error);
      return null;
    }
  }

  // WordsAPI (RapidAPI - free tier available)
  static async fetchFromWordsApi(word: string, apiKey?: string) {
    if (!apiKey) return null;
    
    try {
      const response = await fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
      });
      
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('WordsAPI error:', error);
      return null;
    }
  }

  // Comprehensive word data compilation
  static async getComprehensiveWordData(word: string, apiKeys?: { wordsApi?: string }) {
    try {
      const [freeDictData, datamuse, wordsApi] = await Promise.all([
        this.fetchFromFreeDictionary(word),
        this.fetchFromDatamuse(word),
        this.fetchFromWordsApi(word, apiKeys?.wordsApi)
      ]);

      // Compile comprehensive data structure
      const result = {
        word: word.toLowerCase(),
        phonetic: freeDictData?.phonetic || freeDictData?.phonetics?.[0]?.text,
        audio_url: freeDictData?.phonetics?.find(p => p.audio)?.audio,
        
        morpheme_data: {
          root: { text: word, meaning: "Base form" }
        },
        
        etymology_data: {
          historical_origins: freeDictData?.origin || "",
          language_of_origin: "English"
        },
        
        definitions_data: {
          primary: freeDictData?.meanings?.[0]?.definitions?.[0]?.definition || "",
          standard: freeDictData?.meanings?.flatMap(m => 
            m.definitions.slice(0, 3).map(d => d.definition)
          ) || [],
          extended: freeDictData?.meanings?.flatMap(m => 
            m.definitions.slice(3).map(d => d.definition)
          ) || []
        },
        
        word_forms_data: {
          base_form: word
        },
        
        analysis_data: {
          parts_of_speech: freeDictData?.meanings?.map(m => m.partOfSpeech).join(", ") || "",
          usage_examples: freeDictData?.meanings?.flatMap(m => 
            m.definitions.map(d => d.example).filter(Boolean)
          ) || [],
          synonyms: freeDictData?.meanings?.flatMap(m => 
            m.definitions.flatMap(d => d.synonyms || [])
          ) || [],
          antonyms: freeDictData?.meanings?.flatMap(m => 
            m.definitions.flatMap(d => d.antonyms || [])
          ) || []
        },
        
        source_apis: [
          freeDictData ? "free-dictionary" : null,
          datamuse ? "datamuse" : null,
          wordsApi ? "words-api" : null
        ].filter(Boolean),
        
        frequency_score: datamuse?.frequency?.[0]?.tags?.find((t: string) => t.startsWith('f:'))?.substring(2) || 0,
        difficulty_level: "medium"
      };

      return result;
    } catch (error) {
      console.error('Error compiling word data:', error);
      return null;
    }
  }
}
