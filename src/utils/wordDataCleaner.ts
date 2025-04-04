
import { Word, WordDefinition, MorphemeBreakdown } from "@/data/words";
import { v4 as uuidv4 } from "uuid";
import { normalizeText } from "@/lib/utils";

/**
 * Utility to clean and standardize word data
 */

// Clean word text (remove extra spaces, normalize capitalization)
export const cleanWordText = (text: string): string => {
  if (!text) return "";
  
  // Trim whitespace and normalize spaces
  let cleaned = text.trim().replace(/\s+/g, " ");
  
  // Capitalize first letter, lowercase the rest
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

// Clean and standardize morpheme breakdown
export const cleanMorphemeBreakdown = (breakdown: Partial<MorphemeBreakdown>): MorphemeBreakdown => {
  // Ensure root is always present
  if (!breakdown.root || !breakdown.root.text) {
    throw new Error("Word must have a root morpheme");
  }
  
  const result: MorphemeBreakdown = {
    root: {
      text: breakdown.root.text.trim().toLowerCase(),
      meaning: breakdown.root.meaning?.trim() || "Core meaning not specified"
    }
  };
  
  // Add prefix if it exists
  if (breakdown.prefix && breakdown.prefix.text) {
    result.prefix = {
      text: breakdown.prefix.text.trim().toLowerCase(),
      meaning: breakdown.prefix.meaning?.trim() || "Prefix meaning not specified"
    };
  }
  
  // Add suffix if it exists
  if (breakdown.suffix && breakdown.suffix.text) {
    result.suffix = {
      text: breakdown.suffix.text.trim().toLowerCase(),
      meaning: breakdown.suffix.meaning?.trim() || "Suffix meaning not specified"
    };
  }
  
  return result;
};

// Clean word definitions
export const cleanDefinitions = (definitions: WordDefinition[]): WordDefinition[] => {
  if (!definitions || definitions.length === 0) {
    return [{
      type: "primary",
      text: "Definition not available"
    }];
  }
  
  return definitions.map(def => ({
    type: def.type || "standard",
    text: def.text.trim()
  }));
};

// Ensure a word has all required fields
export const sanitizeWordData = (wordData: Partial<Word>): Word => {
  if (!wordData.word) {
    throw new Error("Word must have a text value");
  }
  
  const cleanedWord: Word = {
    id: wordData.id || wordData.word.toLowerCase().replace(/\s+/g, "-") || uuidv4(),
    word: cleanWordText(wordData.word),
    pronunciation: wordData.pronunciation?.trim() || `/${wordData.word.toLowerCase()}/`,
    description: wordData.description?.trim() || `Definition for ${wordData.word}`,
    languageOrigin: wordData.languageOrigin?.trim() || "Unknown",
    partOfSpeech: wordData.partOfSpeech?.trim().toLowerCase() || "noun",
    
    // Clean morpheme breakdown
    morphemeBreakdown: wordData.morphemeBreakdown ? 
      cleanMorphemeBreakdown(wordData.morphemeBreakdown) : 
      { root: { text: wordData.word.toLowerCase(), meaning: "Not analyzed" } },
    
    // Clean etymology
    etymology: {
      origin: wordData.etymology?.origin?.trim() || `Origin information not available for ${wordData.word}`,
      evolution: wordData.etymology?.evolution?.trim() || "Evolution information not available",
      culturalVariations: wordData.etymology?.culturalVariations?.trim()
    },
    
    // Clean definitions
    definitions: wordData.definitions ? 
      cleanDefinitions(wordData.definitions) : 
      [{ type: "primary", text: wordData.description || `Definition for ${wordData.word}` }],
    
    // Clean word forms
    forms: wordData.forms || {},
    
    // Clean usage
    usage: {
      commonCollocations: wordData.usage?.commonCollocations || [],
      contextualUsage: wordData.usage?.contextualUsage?.trim() || "Contextual usage information not available",
      sentenceStructure: wordData.usage?.sentenceStructure?.trim(),
      exampleSentence: wordData.usage?.exampleSentence?.trim() || `Example sentence with "${wordData.word}" not available.`
    },
    
    // Clean synonyms/antonyms
    synonymsAntonyms: {
      synonyms: wordData.synonymsAntonyms?.synonyms || [],
      antonyms: wordData.synonymsAntonyms?.antonyms || []
    },
    
    // Clean images
    images: wordData.images || []
  };
  
  return cleanedWord;
};

// Add a new word to the repository with proper cleaning
export const prepareWordForRepository = (wordData: Partial<Word>): Word => {
  try {
    return sanitizeWordData(wordData);
  } catch (error) {
    console.error("Error preparing word data:", error);
    throw error;
  }
};
