
import { Word } from "@/data/words";

export const generateMorphemeBreakdownText = (word: Word): string => {
  let text = "";
  
  if (word.morphemeBreakdown.prefix) {
    text += `• Prefix: ${word.morphemeBreakdown.prefix.text} - ${word.morphemeBreakdown.prefix.meaning}\n\n`;
  }
  
  text += `• Root Word: ${word.morphemeBreakdown.root.text} - ${word.morphemeBreakdown.root.meaning}\n\n`;
  
  if (word.morphemeBreakdown.suffix) {
    text += `• Suffix: ${word.morphemeBreakdown.suffix.text} - ${word.morphemeBreakdown.suffix.meaning}`;
  }
  
  return text;
};

export const generateResponseText = (inputValue: string, currentWord?: Word): string => {
  // Check if the message is asking about etymology or morphological breakdown
  const lowerCaseInput = inputValue.toLowerCase();
  
  if ((lowerCaseInput.includes("etymology") || 
       lowerCaseInput.includes("morpheme") || 
       lowerCaseInput.includes("breakdown") || 
       lowerCaseInput.includes("analyze") || 
       lowerCaseInput.includes("analyse")) && 
      currentWord) {
    return `Certainly! Let's break down the word "${currentWord.word.toLowerCase()}" according to its morphological components:\n\n${generateMorphemeBreakdownText(currentWord)}`;
  } else if (lowerCaseInput.includes("meaning") || lowerCaseInput.includes("definition")) {
    return `The word "${currentWord?.word || "this word"}" means:\n\n${currentWord?.definitions.map(def => `• ${def.text}`).join('\n\n') || "I don't have the definition for this word."}`;
  } else if (lowerCaseInput.includes("origin") || lowerCaseInput.includes("history")) {
    return `The origin of "${currentWord?.word || "this word"}" is:\n\n${currentWord?.etymology.origin || "I don't have the origin information for this word."}\n\n${currentWord?.etymology.evolution || ""}`;
  } else if (lowerCaseInput.includes("example") || lowerCaseInput.includes("sentence") || lowerCaseInput.includes("usage")) {
    return `Here's an example of how to use "${currentWord?.word || "this word"}" in a sentence:\n\n"${currentWord?.usage.exampleSentence || "I don't have an example sentence for this word."}"`;
  } else {
    return `I'd be happy to help with that! What specific aspect of "${currentWord?.word || "this word"}" would you like to explore further? You can ask about:\n\n• Etymology and origin\n• Morphological breakdown\n• Definitions and meanings\n• Example sentences\n• Synonyms and antonyms`;
  }
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};
