
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

export const generateComprehensiveBreakdown = (word: Word): string => {
  // Start with a header
  let breakdown = `## Comprehensive Breakdown: ${word.word}\n\n---\n\n`;
  
  // Morpheme Breakdown
  breakdown += `## Morpheme Breakdown\n\n`;
  if (word.morphemeBreakdown.prefix) {
    breakdown += `* **Prefix:** ${word.morphemeBreakdown.prefix.text} - ${word.languageOrigin}, meaning "${word.morphemeBreakdown.prefix.meaning}"\n`;
  }
  breakdown += `* **Root Word:** ${word.morphemeBreakdown.root.text} - ${word.languageOrigin}, meaning "${word.morphemeBreakdown.root.meaning}"\n`;
  if (word.morphemeBreakdown.suffix) {
    breakdown += `* **Suffix:** ${word.morphemeBreakdown.suffix.text} - ${word.languageOrigin}, forming ${word.partOfSpeech}s, typically meaning "${word.morphemeBreakdown.suffix.meaning}"\n`;
  }
  
  breakdown += `\n---\n\n`;
  
  // Etymology
  breakdown += `## Etymology\n\n`;
  breakdown += `* **Historical Origins:** ${word.etymology.origin}\n`;
  breakdown += `* **Language of Origin:** ${word.languageOrigin}\n`;
  breakdown += `* **Word Evolution:** ${word.etymology.evolution}\n`;
  if (word.etymology.culturalVariations) {
    breakdown += `* **Cultural & Regional Variations:** ${word.etymology.culturalVariations}\n`;
  }
  
  breakdown += `\n---\n\n`;
  
  // Definitions
  breakdown += `## Definitions\n\n`;
  
  if (word.definitions.length > 0) {
    breakdown += `* **Primary Definition:**\n    * ${word.definitions[0].text}\n\n`;
    
    if (word.definitions.length > 1) {
      breakdown += `* **Standard Definitions:**\n`;
      for (let i = 1; i < Math.min(4, word.definitions.length); i++) {
        breakdown += `    * **Definition ${i}:** ${word.definitions[i].text}\n`;
      }
      breakdown += `\n`;
    }
    
    // Add contextual usage
    breakdown += `* **Contextual Usage:**\n`;
    breakdown += `    * ${word.usage.contextualUsage}\n\n`;
  }
  
  breakdown += `\n---\n\n`;
  
  // Word Forms & Inflections
  breakdown += `## Word Forms & Inflections\n\n`;
  
  // Handle different forms based on part of speech
  const forms = word.forms;
  
  if (word.partOfSpeech === "verb") {
    breakdown += `* **Base Form:** ${word.word}\n`;
    if (forms.verb) {
      breakdown += `* **Other Verb Forms:** ${forms.verb}\n`;
    }
  } else if (word.partOfSpeech === "noun") {
    breakdown += `* **Singular:** ${word.word}\n`;
    if (forms.noun) {
      breakdown += `* **Plural:** ${forms.noun}\n`;
    }
  } else if (word.partOfSpeech === "adjective") {
    breakdown += `* **Positive:** ${word.word}\n`;
    if (forms.adjective) {
      breakdown += `* **Other Forms:** ${forms.adjective}\n`;
    }
    breakdown += `* **Comparative:** More ${word.word.toLowerCase()}\n`;
    breakdown += `* **Superlative:** Most ${word.word.toLowerCase()}\n`;
  } else if (word.partOfSpeech === "adverb") {
    breakdown += `* **Adverb Form:** ${word.word}\n`;
    if (forms.adverb) {
      breakdown += `* **Other Forms:** ${forms.adverb}\n`;
    }
  }
  
  // Add related forms for all parts of speech
  Object.entries(forms).forEach(([type, form]) => {
    if (type !== word.partOfSpeech && form) {
      breakdown += `* **${type.charAt(0).toUpperCase() + type.slice(1)} Form:** ${form}\n`;
    }
  });
  
  breakdown += `\n---\n\n`;
  
  // Analysis of the Word
  breakdown += `## Analysis of the Word\n\n`;
  breakdown += `* **Parts of Speech**: ${word.word} is primarily a ${word.partOfSpeech}, used to ${word.partOfSpeech === "adjective" ? "describe something" : word.partOfSpeech === "verb" ? "express an action" : word.partOfSpeech === "noun" ? "name a person, place, or thing" : "modify a verb, adjective, or other adverb"}.\n`;
  breakdown += `* **Sentence Structure**: ${word.partOfSpeech === "adjective" ? "Adjective in nature, can modify nouns directly or be part of a larger descriptive phrase." : word.partOfSpeech === "verb" ? "Functions as the main action word in sentences." : word.partOfSpeech === "noun" ? "Typically serves as the subject or object in a sentence." : "Modifies other words to indicate manner, place, time, or degree."}\n`;
  breakdown += `* **Contextual Usage**: ${word.usage.contextualUsage}\n`;
  
  // Synonyms & Antonyms
  if (word.synonymsAntonyms && (word.synonymsAntonyms.synonyms.length > 0 || word.synonymsAntonyms.antonyms.length > 0)) {
    breakdown += `* **Synonyms & Antonyms**: `;
    
    if (word.synonymsAntonyms.synonyms.length > 0) {
      breakdown += `Synonyms include ${word.synonymsAntonyms.synonyms.slice(0, 3).join(', ')}; `;
    }
    
    if (word.synonymsAntonyms.antonyms.length > 0) {
      breakdown += `Antonyms include ${word.synonymsAntonyms.antonyms.slice(0, 3).join(', ')}.`;
    }
    
    breakdown += `\n`;
  }
  
  // Common Collocations
  if (word.usage.commonCollocations && word.usage.commonCollocations.length > 0) {
    breakdown += `* **Common Collocations**: ${word.usage.commonCollocations.join(', ')}.\n`;
  }
  
  // Example
  if (word.usage.exampleSentence) {
    breakdown += `* **Example**: ${word.usage.exampleSentence}\n`;
  }
  
  return breakdown;
};

export const generateResponseText = (inputValue: string, currentWord?: Word): string => {
  // Check if the message is asking about etymology or morphological breakdown
  const lowerCaseInput = inputValue.toLowerCase();
  
  // Request for comprehensive breakdown
  if ((lowerCaseInput.includes("comprehensive") || 
       lowerCaseInput.includes("complete") || 
       lowerCaseInput.includes("full")) && 
      (lowerCaseInput.includes("breakdown") || 
       lowerCaseInput.includes("analysis")) && 
      currentWord) {
    return generateComprehensiveBreakdown(currentWord);
  }
  
  // More specific requests
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
    // More dynamic responses for general questions
    const responses = [
      `I'd be happy to help with that! What specific aspect of "${currentWord?.word || "this word"}" would you like to explore further? You can ask about:\n\n• Etymology and origin\n• Morphological breakdown\n• Definitions and meanings\n• Example sentences\n• Synonyms and antonyms\n\nOr, ask for a "comprehensive breakdown" for a complete analysis!`,
      `Great question! I can provide information about "${currentWord?.word || "words"}" in various ways. Would you like to know about its:\n\n• Historical origins and evolution\n• Component parts (prefix, root, suffix)\n• Precise definitions and usage\n• Similar and opposite words\n\nFor a complete analysis, just ask for a "comprehensive breakdown"!`,
      `I'm Calvern, your linguistics expert. I can help you understand "${currentWord?.word || "words"}" from multiple angles:\n\n• Etymology - where the word comes from\n• Morphology - how the word is constructed\n• Semantics - what the word means in different contexts\n• Usage - how to use the word effectively\n\nAsk for a "comprehensive breakdown" if you'd like the full analysis!`
    ];
    
    // Select a random response for variety
    return responses[Math.floor(Math.random() * responses.length)];
  }
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};
