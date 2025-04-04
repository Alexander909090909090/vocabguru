
import { Word } from "@/data/words";

// Helper function to format timestamps
export const formatTimestamp = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Helper function to generate morphological breakdown response
const generateMorphologicalBreakdown = (word: Word): string => {
  let response = `# Morphological Analysis of "${word.word}"\n\n`;
  
  // Add Morpheme Breakdown section
  response += "## Morpheme Breakdown\n\n";
  
  if (word.morphemeBreakdown.prefix) {
    response += `- **Prefix: ${word.morphemeBreakdown.prefix.text}** - ${word.morphemeBreakdown.prefix.meaning}\n`;
  }
  
  response += `- **Root Word: ${word.morphemeBreakdown.root.text}** - ${word.morphemeBreakdown.root.meaning}\n`;
  
  if (word.morphemeBreakdown.suffix) {
    response += `- **Suffix: ${word.morphemeBreakdown.suffix.text}** - ${word.morphemeBreakdown.suffix.meaning}\n`;
  }
  
  response += "\n## Etymology\n\n";
  response += `- **Historical Origins**: "${word.word}" comes from ${word.languageOrigin} "${word.etymology.origin}"\n`;
  response += `- **Word Evolution**: ${word.etymology.evolution}\n`;
  
  if (word.etymology.culturalVariations) {
    response += `- **Cultural & Regional Variations**: ${word.etymology.culturalVariations}\n`;
  }
  
  // Add combined meaning explanation
  response += "\n## How the Morphemes Combine\n\n";
  const prefix = word.morphemeBreakdown.prefix ? `"${word.morphemeBreakdown.prefix.text}" (${word.morphemeBreakdown.prefix.meaning})` : "";
  const root = `"${word.morphemeBreakdown.root.text}" (${word.morphemeBreakdown.root.meaning})`;
  const suffix = word.morphemeBreakdown.suffix ? `"${word.morphemeBreakdown.suffix.text}" (${word.morphemeBreakdown.suffix.meaning})` : "";
  
  if (prefix && suffix) {
    response += `When the prefix ${prefix} combines with the root ${root} and the suffix ${suffix}, it creates the meaning "${word.definitions.find(d => d.type === 'primary')?.text || word.description}".\n\n`;
  } else if (prefix) {
    response += `When the prefix ${prefix} combines with the root ${root}, it creates the meaning "${word.definitions.find(d => d.type === 'primary')?.text || word.description}".\n\n`;
  } else if (suffix) {
    response += `When the root ${root} combines with the suffix ${suffix}, it creates the meaning "${word.definitions.find(d => d.type === 'primary')?.text || word.description}".\n\n`;
  } else {
    response += `The root ${root} directly provides the meaning "${word.definitions.find(d => d.type === 'primary')?.text || word.description}".\n\n`;
  }
  
  return response;
};

// Generate response based on user input and current word
export const generateResponseText = (userInput: string, currentWord?: Word): string => {
  const input = userInput.toLowerCase();
  
  // If no current word, give a generic response
  if (!currentWord) {
    return "I need a specific word to analyze. You can search for a word using the search bar above.";
  }
  
  // Handle specific prompts about morphological analysis
  if (input.includes("comprehensive breakdown") || 
      input.includes("morphological analysis") || 
      input.includes("morphological breakdown") ||
      input.includes("detailed analysis") ||
      input.includes("analyze this word")) {
    return generateMorphologicalBreakdown(currentWord);
  }
  
  // Handle questions about prefix
  if (input.includes("prefix") && currentWord.morphemeBreakdown.prefix) {
    return `The prefix "${currentWord.morphemeBreakdown.prefix.text}" in "${currentWord.word}" means "${currentWord.morphemeBreakdown.prefix.meaning}". This prefix is from ${currentWord.languageOrigin} and contributes to the overall meaning by adding the concept of "${currentWord.morphemeBreakdown.prefix.meaning}" to the root.`;
  }
  
  // Handle questions about root
  if (input.includes("root")) {
    return `The root "${currentWord.morphemeBreakdown.root.text}" in "${currentWord.word}" means "${currentWord.morphemeBreakdown.root.meaning}". This root comes from ${currentWord.languageOrigin} and forms the core meaning of the word.`;
  }
  
  // Handle questions about suffix
  if (input.includes("suffix") && currentWord.morphemeBreakdown.suffix) {
    return `The suffix "${currentWord.morphemeBreakdown.suffix.text}" in "${currentWord.word}" means "${currentWord.morphemeBreakdown.suffix.meaning}". This suffix modifies the root by ${currentWord.morphemeBreakdown.suffix.meaning}.`;
  }
  
  // Handle etymology questions
  if (input.includes("etymology") || input.includes("origin") || input.includes("history")) {
    return `# Etymology of "${currentWord.word}"\n\n${currentWord.word} comes from ${currentWord.languageOrigin}. ${currentWord.etymology.origin}\n\n**Word Evolution**: ${currentWord.etymology.evolution}${currentWord.etymology.culturalVariations ? `\n\n**Cultural Context**: ${currentWord.etymology.culturalVariations}` : ''}`;
  }
  
  // Handle definition requests
  if (input.includes("define") || input.includes("meaning") || input.includes("definition")) {
    let response = `# Definitions of "${currentWord.word}"\n\n`;
    
    if (currentWord.definitions.find(d => d.type === 'primary')) {
      response += `**Primary Definition**: ${currentWord.definitions.find(d => d.type === 'primary')?.text}\n\n`;
    }
    
    const standardDefs = currentWord.definitions.filter(d => d.type === 'standard');
    if (standardDefs.length > 0) {
      response += "**Standard Definitions**:\n";
      standardDefs.forEach((def, i) => {
        response += `${i+1}. ${def.text}\n`;
      });
      response += "\n";
    }
    
    const extendedDefs = currentWord.definitions.filter(d => d.type === 'extended');
    if (extendedDefs.length > 0) {
      response += "**Extended Definitions**:\n";
      extendedDefs.forEach((def, i) => {
        response += `${i+1}. ${def.text}\n`;
      });
    }
    
    return response;
  }
  
  // Handle questions about parts of speech
  if (input.includes("part of speech") || input.includes("pos")) {
    return `"${currentWord.word}" is a ${currentWord.partOfSpeech}.`;
  }
  
  // Handle questions about synonyms/antonyms
  if (input.includes("synonym") || input.includes("similar")) {
    return `**Synonyms for "${currentWord.word}"**: ${currentWord.synonymsAntonyms.synonyms.join(", ") || "No synonyms available."}`;
  }
  
  if (input.includes("antonym") || input.includes("opposite")) {
    return `**Antonyms for "${currentWord.word}"**: ${currentWord.synonymsAntonyms.antonyms.join(", ") || "No antonyms available."}`;
  }
  
  // Handle questions about usage
  if (input.includes("usage") || input.includes("use in a sentence") || input.includes("example sentence")) {
    return `**Example usage of "${currentWord.word}"**: ${currentWord.usage.exampleSentence}\n\n**Common collocations**: ${currentWord.usage.commonCollocations.join(", ")}\n\n**Contextual usage**: ${currentWord.usage.contextualUsage}`;
  }
  
  // Default response for other queries
  return `I can provide information about the word "${currentWord.word}". You can ask about its morphological structure, etymology, definitions, usage, or synonyms/antonyms. Try asking for a "comprehensive breakdown" to see all the details!`;
};
