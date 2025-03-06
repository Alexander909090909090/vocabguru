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
      toast({
        title: "Word not found",
        description: `No information found for "${word}".`,
        variant: "destructive",
      });
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
    (dictWord.phonetics.length > 0 && dictWord.phonetics[0].text ? dictWord.phonetics[0].text : undefined);
  
  // Try to determine morpheme breakdown
  const morphemeBreakdown: MorphemeBreakdown = attemptMorphemeBreakdown(dictWord.word);
  
  // Try to extract common collocations from examples
  const collocations: string[] = [];
  dictWord.meanings.forEach(meaning => {
    meaning.definitions.forEach(def => {
      if (def.example) {
        // Extract potential collocations from examples
        const words = def.example.split(/\s+/);
        const wordIndex = words.findIndex(w => 
          w.toLowerCase().includes(dictWord.word.toLowerCase())
        );
        
        if (wordIndex >= 0) {
          // Get words before and after the target word
          if (wordIndex > 0) {
            collocations.push(`${words[wordIndex-1]} ${dictWord.word}`);
          }
          if (wordIndex < words.length - 1) {
            collocations.push(`${dictWord.word} ${words[wordIndex+1]}`);
          }
        }
      }
    });
  });
  
  // Get unique collocations
  const uniqueCollocations = [...new Set(collocations)].slice(0, 5);
  
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
      // Try to derive forms based on meanings
      noun: dictWord.meanings.some(m => m.partOfSpeech === "noun") ? dictWord.word : undefined,
      verb: dictWord.meanings.some(m => m.partOfSpeech === "verb") ? dictWord.word : undefined,
      adjective: dictWord.meanings.some(m => m.partOfSpeech === "adjective") ? dictWord.word : undefined,
      adverb: dictWord.meanings.some(m => m.partOfSpeech === "adverb") ? dictWord.word : undefined,
    },
    usage: {
      commonCollocations: uniqueCollocations,
      contextualUsage: definitions.length > 1 ? 
        `${dictWord.word} is frequently used in contexts relating to ${definitions[1].text.split(' ').slice(0, 5).join(' ')}...` : 
        "Contextual usage information not available from this API",
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

// An enhanced function to attempt morpheme breakdown
// This provides a more detailed analysis of possible word components
const attemptMorphemeBreakdown = (word: string): MorphemeBreakdown => {
  // Extended common prefixes and suffixes for better morpheme detection
  const commonPrefixes = [
    { text: 'a', meaning: 'not, without' },
    { text: 'ab', meaning: 'away from' },
    { text: 'ad', meaning: 'to, toward' },
    { text: 'an', meaning: 'not, without' },
    { text: 'anti', meaning: 'against, opposed to' },
    { text: 'auto', meaning: 'self, same' },
    { text: 'bi', meaning: 'two, twice' },
    { text: 'bio', meaning: 'life' },
    { text: 'co', meaning: 'together, with' },
    { text: 'com', meaning: 'with, together' },
    { text: 'con', meaning: 'with, together' },
    { text: 'de', meaning: 'down, from, away' },
    { text: 'dis', meaning: 'not, apart, away' },
    { text: 'en', meaning: 'in, into, within' },
    { text: 'ex', meaning: 'out of, former' },
    { text: 'extra', meaning: 'beyond, outside' },
    { text: 'geo', meaning: 'earth' },
    { text: 'hyper', meaning: 'over, excessive' },
    { text: 'il', meaning: 'not' },
    { text: 'im', meaning: 'not' },
    { text: 'in', meaning: 'not, in, into' },
    { text: 'inter', meaning: 'between, among' },
    { text: 'intra', meaning: 'within' },
    { text: 'ir', meaning: 'not' },
    { text: 'macro', meaning: 'large' },
    { text: 'micro', meaning: 'small' },
    { text: 'mid', meaning: 'middle' },
    { text: 'mis', meaning: 'wrong, badly' },
    { text: 'mono', meaning: 'one, single' },
    { text: 'non', meaning: 'not' },
    { text: 'omni', meaning: 'all, every' },
    { text: 'over', meaning: 'excessive, above' },
    { text: 'poly', meaning: 'many' },
    { text: 'post', meaning: 'after' },
    { text: 'pre', meaning: 'before' },
    { text: 'pro', meaning: 'forward, for' },
    { text: 're', meaning: 'again, back' },
    { text: 'semi', meaning: 'half, partly' },
    { text: 'sub', meaning: 'under, below' },
    { text: 'super', meaning: 'above, beyond' },
    { text: 'syn', meaning: 'together' },
    { text: 'tele', meaning: 'distant' },
    { text: 'trans', meaning: 'across, beyond' },
    { text: 'tri', meaning: 'three' },
    { text: 'un', meaning: 'not, opposite of' },
    { text: 'uni', meaning: 'one' },
  ];
  
  const commonSuffixes = [
    { text: 'able', meaning: 'capable of, tendency to' },
    { text: 'ac', meaning: 'pertaining to' },
    { text: 'al', meaning: 'relating to, process of' },
    { text: 'ance', meaning: 'state, quality of' },
    { text: 'ant', meaning: 'performing, agent' },
    { text: 'ar', meaning: 'relating to' },
    { text: 'ary', meaning: 'relating to, connected with' },
    { text: 'ate', meaning: 'to make, having the quality of' },
    { text: 'cian', meaning: 'person skilled in' },
    { text: 'cy', meaning: 'state, condition' },
    { text: 'dom', meaning: 'state of being, realm' },
    { text: 'ed', meaning: 'past tense, having' },
    { text: 'ee', meaning: 'recipient, patient' },
    { text: 'en', meaning: 'made of, to make' },
    { text: 'ence', meaning: 'action, state, quality' },
    { text: 'ent', meaning: 'performing, having the quality of' },
    { text: 'er', meaning: 'one who, that which' },
    { text: 'ery', meaning: 'collective, place of' },
    { text: 'ese', meaning: 'native to, language' },
    { text: 'esque', meaning: 'in the style of' },
    { text: 'ess', meaning: 'female' },
    { text: 'est', meaning: 'superlative' },
    { text: 'ful', meaning: 'full of, characterized by' },
    { text: 'hood', meaning: 'state, condition, quality' },
    { text: 'ian', meaning: 'belonging to, specialist' },
    { text: 'ible', meaning: 'capable of, tendency to' },
    { text: 'ic', meaning: 'relating to, nature of' },
    { text: 'ical', meaning: 'relating to, characterized by' },
    { text: 'ify', meaning: 'to make, become' },
    { text: 'ing', meaning: 'action, material' },
    { text: 'ion', meaning: 'act, result, state' },
    { text: 'ious', meaning: 'characterized by, full of' },
    { text: 'ish', meaning: 'origin, nature, resembling' },
    { text: 'ism', meaning: 'doctrine, belief' },
    { text: 'ist', meaning: 'one who, practitioner' },
    { text: 'ite', meaning: 'resident, follower' },
    { text: 'ity', meaning: 'quality, state' },
    { text: 'ive', meaning: 'quality, relation' },
    { text: 'ize', meaning: 'to make, to conform to' },
    { text: 'less', meaning: 'without, unable to' },
    { text: 'like', meaning: 'resembling, similar' },
    { text: 'ly', meaning: 'characteristic of, manner' },
    { text: 'ment', meaning: 'act, result, means' },
    { text: 'ness', meaning: 'state, quality' },
    { text: 'or', meaning: 'one who, that which' },
    { text: 'ory', meaning: 'place for, relating to' },
    { text: 'ous', meaning: 'full of, having' },
    { text: 'ship', meaning: 'state, quality, skill' },
    { text: 'sion', meaning: 'state, act, result' },
    { text: 'some', meaning: 'characterized by, apt to' },
    { text: 'tion', meaning: 'action, state, result' },
    { text: 'ty', meaning: 'state, quality' },
    { text: 'ure', meaning: 'action, process, function' },
    { text: 'ward', meaning: 'in the direction of' },
    { text: 'ways', meaning: 'in this manner' },
    { text: 'wise', meaning: 'manner, direction' },
    { text: 'y', meaning: 'characterized by, inclined to' },
  ];
  
  // Match the longest possible prefix and suffix
  let prefix: { text: string; meaning: string } | undefined;
  let suffix: { text: string; meaning: string } | undefined;
  let root = { text: word, meaning: "Base word" };
  
  // Sort prefixes by length (longest first) for better matching
  const sortedPrefixes = [...commonPrefixes].sort((a, b) => b.text.length - a.text.length);
  const sortedSuffixes = [...commonSuffixes].sort((a, b) => b.text.length - a.text.length);
  
  // Check for prefixes
  for (const pre of sortedPrefixes) {
    if (word.toLowerCase().startsWith(pre.text) && word.length > pre.text.length + 2) {
      prefix = { text: pre.text, meaning: pre.meaning };
      root.text = word.slice(pre.text.length);
      break;
    }
  }
  
  // Check for suffixes
  for (const suf of sortedSuffixes) {
    if (word.toLowerCase().endsWith(suf.text) && word.length > suf.text.length + 2) {
      suffix = { text: suf.text, meaning: suf.meaning };
      if (root.text === word) {
        root.text = word.slice(0, word.length - suf.text.length);
      } else {
        // If we already found a prefix, adjust the root
        root.text = root.text.slice(0, root.text.length - suf.text.length);
      }
      break;
    }
  }
  
  // Add a more detailed root meaning if possible
  if (root.text !== word) {
    root.meaning = `Core meaning of "${root.text}"`;
  } else {
    root.meaning = "This word doesn't appear to have common prefixes or suffixes";
  }
  
  // For compound words, attempt to identify components
  if (!prefix && !suffix && root.text.length > 6) {
    // Simple heuristic for compound words - check if we can split it meaningfully
    const midpoint = Math.floor(root.text.length / 2);
    const possibleCompound = [
      root.text.slice(0, midpoint), 
      root.text.slice(midpoint)
    ];
    
    // Only suggest as compound if both parts are reasonably sized
    if (possibleCompound[0].length > 2 && possibleCompound[1].length > 2) {
      root.meaning = `Possibly a compound word made of "${possibleCompound[0]}" and "${possibleCompound[1]}"`;
    }
  }
  
  return {
    prefix,
    root,
    suffix
  };
};
