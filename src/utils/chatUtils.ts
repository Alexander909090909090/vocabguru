import { Word } from "@/data/words";
import { SemanticSearchService } from "@/services/semanticSearchService";

// Helper function to format timestamps
export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
export const generateResponseText = async (userMessage: string, currentWord?: Word): Promise<string> => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Enhanced semantic search queries
  if (lowerMessage.includes('find words') || lowerMessage.includes('words meaning') || 
      lowerMessage.includes('similar to') || lowerMessage.includes('words like')) {
    const searchTerm = extractSearchTerm(userMessage);
    if (searchTerm) {
      try {
        const suggestions = await SemanticSearchService.suggestRelatedWords(searchTerm);
        if (suggestions.length > 0) {
          return `Here are words related to "${searchTerm}":\n\n${suggestions.slice(0, 8).map(word => `• **${word}**`).join('\n')}\n\nYou can search for any of these words using the semantic search feature above to add them to your collection!`;
        }
      } catch (error) {
        console.error('Error getting word suggestions:', error);
      }
    }
  }

  // Word explanation requests
  if (lowerMessage.includes('explain') || lowerMessage.includes('what does') || 
      lowerMessage.includes('meaning of')) {
    const wordToExplain = extractWordFromExplanationRequest(userMessage);
    if (wordToExplain) {
      try {
        const explanation = await SemanticSearchService.generateWordExplanation(wordToExplain, lowerMessage);
        return explanation;
      } catch (error) {
        console.error('Error generating explanation:', error);
      }
    }
  }

  // Enhanced comprehensive breakdown
  if (lowerMessage.includes('comprehensive breakdown') || lowerMessage.includes('detailed analysis')) {
    if (currentWord) {
      return generateComprehensiveBreakdown(currentWord);
    } else {
      return "I'd be happy to provide a comprehensive breakdown! Please specify which word you'd like me to analyze, or use the search feature to find and select a word first.";
    }
  }

  // Morpheme and etymology queries
  if (lowerMessage.includes('morpheme') || lowerMessage.includes('root') || 
      lowerMessage.includes('prefix') || lowerMessage.includes('suffix')) {
    if (currentWord) {
      return generateMorphemeAnalysis(currentWord);
    } else {
      return "Morphemes are the smallest meaningful units in language! I can analyze word structure, roots, prefixes, and suffixes. Try asking about a specific word or use the search to find one.";
    }
  }

  // Etymology questions
  if (lowerMessage.includes('etymology') || lowerMessage.includes('origin') || 
      lowerMessage.includes('history') || lowerMessage.includes('where does') ||
      lowerMessage.includes('come from')) {
    if (currentWord) {
      return generateEtymologyResponse(currentWord);
    } else {
      return "Etymology is fascinating! It reveals how words traveled through languages and cultures. I can trace word origins, historical development, and linguistic connections. Search for a word to explore its etymology!";
    }
  }

  // Usage and examples
  if (lowerMessage.includes('example') || lowerMessage.includes('how to use') || 
      lowerMessage.includes('sentence') || lowerMessage.includes('context')) {
    if (currentWord) {
      return generateUsageExamples(currentWord);
    } else {
      return "I can provide usage examples and context for words! Search for a specific word and I'll show you how to use it effectively in different situations.";
    }
  }

  // Semantic search help
  if (lowerMessage.includes('semantic search') || lowerMessage.includes('search by meaning') ||
      lowerMessage.includes('how to find')) {
    return "🔍 **Semantic Search Help**\n\nUse the 'Search by Meaning' feature to find words by describing what you're looking for:\n\n• Type meanings like 'fast', 'beautiful', 'abundant'\n• Describe concepts like 'showing happiness' or 'very large'\n• Find synonyms and related terms\n\nTry searching for concepts rather than specific words to discover new vocabulary!";
  }

  // Default responses with semantic search integration
  const responses = [
    "I'm here to help you explore language and discover new words! Try asking me to find words related to a specific meaning, or use the semantic search feature above.",
    "Would you like me to explain a word's etymology, find similar words, or analyze its morphological structure? I can also help you discover new vocabulary through meaning-based search.",
    "I can help you understand word relationships, etymologies, and meanings. Try searching by meaning using the 'Search by Meaning' feature, or ask me about specific linguistic concepts!",
    "Exploring vocabulary is exciting! I can analyze word structures, suggest related terms, and explain linguistic concepts. How can I assist your vocabulary journey?",
    "Language is full of fascinating connections! I can help you discover words, understand their origins, and explore morphological patterns. How can I assist your vocabulary journey?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Helper functions
function extractSearchTerm(message: string): string | null {
  const patterns = [
    /find words.*["']([^"']+)["']/i,
    /words meaning.*["']([^"']+)["']/i,
    /similar to.*["']([^"']+)["']/i,
    /words like.*["']([^"']+)["']/i,
    /words.*meaning\s+(.+)/i,
    /find.*words.*about\s+(.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim();
  }
  
  return null;
}

function extractWordFromExplanationRequest(message: string): string | null {
  const patterns = [
    /explain.*["']([^"']+)["']/i,
    /what does.*["']([^"']+)["']/i,
    /meaning of.*["']([^"']+)["']/i,
    /explain\s+(\w+)/i,
    /what does\s+(\w+)/i,
    /meaning of\s+(\w+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim();
  }
  
  return null;
}

// Helper function to generate comprehensive breakdown response
const generateComprehensiveBreakdown = (word: Word): string => {
  let response = `# Comprehensive Breakdown of "${word.word}"\n\n`;
  
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

// Helper function to generate morpheme analysis response
const generateMorphemeAnalysis = (word: Word): string => {
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
  
  return response;
};

// Helper function to generate etymology response
const generateEtymologyResponse = (word: Word): string => {
  let response = `# Etymology of "${word.word}"\n\n`;
  
  response += `- **Historical Origins**: "${word.word}" comes from ${word.languageOrigin} "${word.etymology.origin}"\n`;
  response += `- **Word Evolution**: ${word.etymology.evolution}\n`;
  
  if (word.etymology.culturalVariations) {
    response += `- **Cultural & Regional Variations**: ${word.etymology.culturalVariations}\n`;
  }
  
  return response;
};

// Helper function to generate usage examples
const generateUsageExamples = (word: Word): string => {
  let response = `# Usage Examples of "${word.word}"\n\n`;
  
  response += `- **Example usage of "${word.word}"**: ${word.usage.exampleSentence}\n\n`;
  response += `- **Common collocations**: ${word.usage.commonCollocations.join(", ")}\n\n`;
  response += `- **Contextual usage**: ${word.usage.contextualUsage}\n\n`;
  
  return response;
};
