
/**
 * Utility functions for validating words before adding them to the database
 */

/**
 * Checks if a word appears to be nonsensical by:
 * 1. Ensuring it has vowels (most real words have vowels)
 * 2. Checking for excessive repeated characters
 * 3. Ensuring minimum length
 * 4. Validating against common word patterns
 */
export const isNonsenseWord = (word: string): boolean => {
  // Normalize the word for checking
  const normalizedWord = word.trim().toLowerCase();
  
  // Empty strings aren't valid words
  if (!normalizedWord) return true;
  
  // Most real words in English should be at least 2 characters
  if (normalizedWord.length < 2) return true;
  
  // Most real words contain vowels
  const hasVowels = /[aeiouy]/i.test(normalizedWord);
  if (!hasVowels) return true;
  
  // Check for excessive repetition of the same character
  const repeatedCharsPattern = /(.)\1{3,}/;
  if (repeatedCharsPattern.test(normalizedWord)) return true;
  
  // Random keysmashing often contains unusual character combinations
  const unusualCombinations = /[qwzx]{3,}|[^a-z]/;
  if (unusualCombinations.test(normalizedWord)) return true;
  
  // Word looks valid
  return false;
};

/**
 * Checks if a word has detailed enough information to be valuable 
 * in the vocabulary database
 */
export const hasMinimumWordDetails = (definition: string): boolean => {
  // Definition should be meaningful (not too short)
  if (!definition || definition.length < 10) return false;
  
  // Avoid generic placeholder definitions
  if (definition.includes("Definition not available") || 
      definition.includes("No information") ||
      definition === "No official definition available for this word.") {
    return false;
  }
  
  return true;
};
