import { toast } from "@/components/ui/use-toast";
import { Word, MorphemeBreakdown, WordDefinition } from "@/data/words";

// Using Free Dictionary API - no API key required
const DICTIONARY_API_BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

export interface DictionaryApiWord {
  word: string;
  phonetic?: string;
  phonetics: {
    text?: string;
    audio?: string;
  }[];
  origin?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
  }[];
  sourceUrls?: string[];
}

export const searchDictionaryWord = async (word: string): Promise<Word | null> => {
  try {
    const response = await fetch(`${DICTIONARY_API_BASE_URL}${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // For 404s, try to create a basic word entry with minimal information
        const basicWord = createBasicWordEntry(word);
        toast({
          title: "Limited information available",
          description: `Creating a basic entry for "${word}". Some details may be missing.`,
          variant: "default",
        });
        return basicWord;
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json() as DictionaryApiWord[];
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Map the dictionary API response to our Word format
    return mapDictionaryResponseToWord(data[0]);
  } catch (error) {
    console.error("Error fetching dictionary data:", error);
    toast({
      title: "Error",
      description: "Failed to fetch dictionary data. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

// Create a basic word entry when the API doesn't find the word
const createBasicWordEntry = (word: string): Word => {
  return {
    id: word.toLowerCase(),
    word: word,
    pronunciation: undefined,
    description: "No official definition available for this word.",
    languageOrigin: "Unknown",
    partOfSpeech: "unknown",
    morphemeBreakdown: attemptMorphemeBreakdown(word),
    etymology: {
      origin: "Etymology information not available",
      evolution: "No information on word evolution available",
    },
    definitions: [
      {
        type: "primary",
        text: "No official definition available for this word."
      }
    ],
    forms: {},
    usage: {
      commonCollocations: [],
      contextualUsage: "Contextual usage information not available",
      exampleSentence: "Example sentence not available",
    },
    synonymsAntonyms: {
      synonyms: [],
      antonyms: [],
    },
    images: [
      {
        id: `${word.toLowerCase()}-1`,
        url: `https://source.unsplash.com/featured/?${encodeURIComponent(word)}`,
        alt: `Image representing ${word}`,
      }
    ],
  };
};

export const mapDictionaryResponseToWord = (dictWord: DictionaryApiWord): Word => {
  // Extract definitions
  const definitions: WordDefinition[] = [];
  let exampleSentence = "";
  
  dictWord.meanings.forEach((meaning, index) => {
    if (meaning.definitions.length > 0) {
      // Add primary definition from first meaning
      if (index === 0) {
        definitions.push({
          type: "primary",
          text: meaning.definitions[0].definition
        });
        
        // Get first example if available
        if (meaning.definitions[0].example) {
          exampleSentence = meaning.definitions[0].example;
        }
      } else {
        // Add other definitions as standard
        meaning.definitions.forEach(def => {
          definitions.push({
            type: "standard",
            text: def.definition
          });
          
          // If we don't have an example yet, use this one
          if (!exampleSentence && def.example) {
            exampleSentence = def.example;
          }
        });
      }
    }
  });
  
  // Extract synonyms and antonyms
  const synonyms: string[] = [];
  const antonyms: string[] = [];
  
  dictWord.meanings.forEach(meaning => {
    meaning.definitions.forEach(def => {
      if (def.synonyms && def.synonyms.length > 0) {
        synonyms.push(...def.synonyms.slice(0, 5)); // Limit to 5 synonyms per definition
      }
      if (def.antonyms && def.antonyms.length > 0) {
        antonyms.push(...def.antonyms.slice(0, 5)); // Limit to 5 antonyms per definition
      }
    });
  });
  
  // Get unique synonyms and antonyms
  const uniqueSynonyms = [...new Set(synonyms)].slice(0, 10);
  const uniqueAntonyms = [...new Set(antonyms)].slice(0, 10);
  
  // Extract phonetics
  const pronunciation = dictWord.phonetic || 
    (dictWord.phonetics.length > 0 ? dictWord.phonetics[0].text : undefined);
  
  // Try to determine morpheme breakdown
  // This is simplified - a real implementation would need a dedicated morphology service
  const morphemeBreakdown: MorphemeBreakdown = attemptMorphemeBreakdown(dictWord.word);
  
  return {
    id: dictWord.word.toLowerCase(),
    word: dictWord.word,
    pronunciation: pronunciation,
    description: definitions.length > 0 ? definitions[0].text : "No definition available",
    languageOrigin: dictWord.origin || "English",
    partOfSpeech: dictWord.meanings.length > 0 ? dictWord.meanings[0].partOfSpeech : "unknown",
    morphemeBreakdown,
    etymology: {
      origin: dictWord.origin || "Unknown origin",
      evolution: "Etymology details not available from this API",
      culturalVariations: undefined,
    },
    definitions,
    forms: {
      // Dictionary API doesn't provide word forms directly
    },
    usage: {
      commonCollocations: [],
      contextualUsage: "Contextual usage not available from this API",
      exampleSentence: exampleSentence || "Example not available",
    },
    synonymsAntonyms: {
      synonyms: uniqueSynonyms,
      antonyms: uniqueAntonyms,
    },
    images: [
      {
        id: `${dictWord.word.toLowerCase()}-1`,
        url: `https://source.unsplash.com/featured/?${encodeURIComponent(dictWord.word)}`,
        alt: `Image representing ${dictWord.word}`,
      }
    ],
  };
};

// A simplified function to attempt morpheme breakdown
// This is a placeholder - a real implementation would need a morphology database
const attemptMorphemeBreakdown = (word: string): MorphemeBreakdown => {
  // Common prefixes and suffixes - this is a simplified approach
  const commonPrefixes = ['un', 're', 'dis', 'in', 'im', 'il', 'ir', 'pre', 'post', 'anti', 'auto', 'bi', 'co', 'de', 'en', 'ex', 'extra', 'hyper', 'inter', 'intra', 'micro', 'mid', 'mis', 'non', 'over', 'poly', 'pro', 'semi', 'sub', 'super', 'trans', 'under'];
  const commonSuffixes = ['able', 'al', 'ance', 'ary', 'ate', 'dom', 'ed', 'en', 'ence', 'er', 'est', 'ful', 'hood', 'ian', 'ible', 'ic', 'ify', 'ing', 'ion', 'ious', 'ish', 'ism', 'ist', 'ity', 'ive', 'ize', 'less', 'ly', 'ment', 'ness', 'or', 'ous', 'ship', 'sion', 'tion', 'ty', 'y'];
  
  let prefix: { text: string; meaning: string } | undefined;
  let suffix: { text: string; meaning: string } | undefined;
  let root = { text: word, meaning: "Base word" };
  
  // Check for prefixes
  for (const pre of commonPrefixes) {
    if (word.toLowerCase().startsWith(pre) && word.length > pre.length + 2) {
      prefix = { text: pre, meaning: `Common prefix meaning varies (e.g., "${pre}-" can indicate negation, repetition, etc.)` };
      root.text = word.slice(pre.length);
      break;
    }
  }
  
  // Check for suffixes
  for (const suf of commonSuffixes) {
    if (word.toLowerCase().endsWith(suf) && word.length > suf.length + 2) {
      suffix = { text: suf, meaning: `Common suffix meaning varies (e.g., "-${suf}" can indicate state, quality, etc.)` };
      if (root.text === word) {
        root.text = word.slice(0, word.length - suf.length);
      } else {
        // If we already found a prefix, adjust the root
        root.text = root.text.slice(0, root.text.length - suf.length);
      }
      break;
    }
  }
  
  return {
    prefix,
    root,
    suffix
  };
};
