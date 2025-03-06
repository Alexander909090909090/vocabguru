
import { toast } from "@/components/ui/use-toast";
import { Word, MorphemeBreakdown, WordDefinition } from "@/data/words";

// Merriam-Webster API endpoints
const DICTIONARY_API_BASE_URL = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
const THESAURUS_API_BASE_URL = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/";

// The API key should be replaced with your actual Merriam-Webster API key
// For this implementation, we're using a placeholder
const DICTIONARY_API_KEY = "your-dictionary-api-key"; // Users will need to replace this with their actual key
const THESAURUS_API_KEY = "your-thesaurus-api-key"; // Users will need to replace this with their actual key

// Interfaces for Merriam-Webster API responses
interface MWDefinition {
  sseq: Array<Array<Array<any>>>;
  dt: Array<Array<string | Array<any>>>;
}

interface MWEntry {
  meta: {
    id: string;
    uuid: string;
    src: string;
    stems: string[];
    offensive: boolean;
  };
  hwi: {
    hw: string; // Headword
    prs?: Array<{
      mw: string; // Pronunciation
      sound?: {
        audio: string;
      };
    }>;
  };
  fl: string; // Functional label (part of speech)
  def?: MWDefinition[];
  et?: Array<Array<string | Array<any>>>; // Etymology
  date?: string; // First known use date
  shortdef: string[]; // Short definitions
}

/**
 * Search for a word in the Merriam-Webster Dictionary API
 */
export const searchMerriamWebsterWord = async (word: string): Promise<Word | null> => {
  try {
    // Get dictionary data
    const dictionaryResponse = await fetch(
      `${DICTIONARY_API_BASE_URL}${encodeURIComponent(word)}?key=${DICTIONARY_API_KEY}`
    );
    
    if (!dictionaryResponse.ok) {
      throw new Error(`Dictionary API Error: ${dictionaryResponse.status}`);
    }
    
    const dictionaryData = await dictionaryResponse.json();
    
    // If the response is an array of strings, it means no exact match was found
    // but suggestions are available
    if (dictionaryData.length > 0 && typeof dictionaryData[0] === 'string') {
      toast({
        title: "Word not found",
        description: `"${word}" not found. Did you mean: ${dictionaryData.slice(0, 3).join(', ')}?`,
        variant: "destructive",
      });
      return null;
    }
    
    // If no data or empty array
    if (!dictionaryData || dictionaryData.length === 0) {
      toast({
        title: "Word not found",
        description: `No information found for "${word}".`,
        variant: "destructive",
      });
      return null;
    }
    
    // Get thesaurus data for synonyms and antonyms
    let synonyms: string[] = [];
    let antonyms: string[] = [];
    
    try {
      const thesaurusResponse = await fetch(
        `${THESAURUS_API_BASE_URL}${encodeURIComponent(word)}?key=${THESAURUS_API_KEY}`
      );
      
      if (thesaurusResponse.ok) {
        const thesaurusData = await thesaurusResponse.json();
        
        if (thesaurusData.length > 0 && typeof thesaurusData[0] !== 'string') {
          // Extract synonyms and antonyms
          thesaurusData.forEach((entry: any) => {
            if (entry.meta && entry.meta.syns) {
              entry.meta.syns.forEach((synArray: string[]) => {
                synonyms = [...synonyms, ...synArray];
              });
            }
            
            if (entry.meta && entry.meta.ants) {
              entry.meta.ants.forEach((antArray: string[]) => {
                antonyms = [...antonyms, ...antArray];
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching thesaurus data:", error);
      // Continue with dictionary data only
    }
    
    // Map the Merriam-Webster response to our Word format
    return mapMerriamWebsterResponseToWord(dictionaryData[0], synonyms, antonyms);
  } catch (error) {
    console.error("Error fetching Merriam-Webster data:", error);
    toast({
      title: "Error",
      description: "Failed to fetch word data. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Map Merriam-Webster API response to our Word format
 */
const mapMerriamWebsterResponseToWord = (
  entry: MWEntry, 
  synonyms: string[] = [],
  antonyms: string[] = []
): Word => {
  // Extract word
  const word = entry.meta.id.split(':')[0];
  
  // Extract pronunciation
  const pronunciation = entry.hwi.prs ? entry.hwi.prs[0].mw : undefined;
  
  // Extract part of speech
  const partOfSpeech = entry.fl || "unknown";
  
  // Extract definitions
  const definitions: WordDefinition[] = [];
  
  if (entry.shortdef && entry.shortdef.length > 0) {
    // Add primary definition
    definitions.push({
      type: "primary",
      text: entry.shortdef[0]
    });
    
    // Add other definitions
    for (let i = 1; i < entry.shortdef.length; i++) {
      definitions.push({
        type: "standard",
        text: entry.shortdef[i]
      });
    }
  }
  
  // Try to extract etymology
  let etymologyText = "Etymology information not available";
  if (entry.et && entry.et.length > 0) {
    const etArray = entry.et[0];
    // The etymology is typically in the format [label, text]
    if (etArray.length > 1 && typeof etArray[1] === 'string') {
      etymologyText = etArray[1].replace(/\{[^}]+\}/g, ''); // Remove MW formatting codes
    }
  }
  
  // Get unique synonyms and antonyms (limit to 10 each)
  const uniqueSynonyms = [...new Set(synonyms)].slice(0, 10);
  const uniqueAntonyms = [...new Set(antonyms)].slice(0, 10);
  
  // Determine language origin from etymology
  let languageOrigin = "English";
  if (etymologyText.toLowerCase().includes("latin")) {
    languageOrigin = "Latin";
  } else if (etymologyText.toLowerCase().includes("greek")) {
    languageOrigin = "Greek";
  } else if (etymologyText.toLowerCase().includes("french")) {
    languageOrigin = "French";
  } else if (etymologyText.toLowerCase().includes("german")) {
    languageOrigin = "German";
  }
  
  // Try to determine morpheme breakdown
  const morphemeBreakdown: MorphemeBreakdown = attemptMorphemeBreakdown(word);
  
  return {
    id: word.toLowerCase(),
    word: word,
    pronunciation: pronunciation,
    description: definitions.length > 0 ? definitions[0].text : "No definition available",
    languageOrigin: languageOrigin,
    partOfSpeech: partOfSpeech,
    morphemeBreakdown,
    etymology: {
      origin: languageOrigin,
      evolution: etymologyText,
    },
    definitions,
    forms: {
      // MW API doesn't provide word forms directly
    },
    usage: {
      commonCollocations: [],
      contextualUsage: "Contextual usage information not available",
      exampleSentence: "Example sentence not available",
    },
    synonymsAntonyms: {
      synonyms: uniqueSynonyms,
      antonyms: uniqueAntonyms,
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

// Re-use the morpheme breakdown function from the original dictionary API
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
