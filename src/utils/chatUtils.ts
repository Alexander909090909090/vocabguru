import { Word } from "@/data/words";
import { SemanticSearchService } from "@/services/semanticSearchService";
import { Calvern3Service } from "./calvern3Integration";

// Helper function to format timestamps
export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Generate response based on user input and current word
export const generateResponseText = async (userMessage: string, currentWord?: Word): Promise<string> => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for comprehensive breakdown requests
  if (lowerMessage.includes('comprehensive breakdown') || lowerMessage.includes('detailed analysis') || lowerMessage.includes('deep analysis')) {
    // Extract word from message if no current word
    const wordToAnalyze = currentWord?.word || extractWordFromMessage(userMessage);
    
    if (wordToAnalyze) {
      try {
        const comprehensiveBreakdown = await Calvern3Service.getComprehensiveBreakdown(wordToAnalyze);
        return comprehensiveBreakdown;
      } catch (error) {
        console.error('Error getting comprehensive breakdown:', error);
        return Calvern3Service.createFallbackBreakdown(wordToAnalyze);
      }
    } else {
      return "I'd be happy to provide a comprehensive breakdown! Please specify which word you'd like me to analyze, or use the search feature to find and select a word first.";
    }
  }

  // Enhanced semantic search queries
  if (lowerMessage.includes('find words') || lowerMessage.includes('words meaning') || 
      lowerMessage.includes('similar to') || lowerMessage.includes('words like')) {
    const searchTerm = extractSearchTerm(userMessage);
    if (searchTerm) {
      try {
        const suggestions = await SemanticSearchService.suggestRelatedWords(searchTerm);
        if (suggestions.length > 0) {
          return `Here are words related to "${searchTerm}":\n\n${suggestions.slice(0, 8).map(word => `• **${word}**`).join('\n')}\n\nYou can ask for a "comprehensive breakdown" of any of these words!`;
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
        // Use Calvern 3.0 for explanation
        const explanation = await Calvern3Service.getChatResponse(userMessage);
        return explanation;
      } catch (error) {
        console.error('Error generating explanation:', error);
        // Fallback to semantic search
        try {
          const explanation = await SemanticSearchService.generateWordExplanation(wordToExplain, lowerMessage);
          return explanation;
        } catch (fallbackError) {
          return `I'd be happy to explain "${wordToExplain}"! For a detailed analysis, try asking for a "comprehensive breakdown of ${wordToExplain}".`;
        }
      }
    }
  }

  // For general questions, try Calvern 3.0 first
  try {
    const chatResponse = await Calvern3Service.getChatResponse(userMessage);
    return chatResponse;
  } catch (error) {
    console.error('Error with Calvern 3.0 chat:', error);
    
    // Fallback to local responses
    return generateFallbackResponse(userMessage, currentWord);
  }
};

// Helper function to extract word from various message formats
function extractWordFromMessage(message: string): string | null {
  const patterns = [
    /breakdown.*of.*["']([^"']+)["']/i,
    /breakdown.*["']([^"']+)["']/i,
    /analysis.*of.*["']([^"']+)["']/i,
    /analysis.*["']([^"']+)["']/i,
    /analyze.*["']([^"']+)["']/i,
    /breakdown\s+(\w+)/i,
    /analysis\s+(\w+)/i,
    /analyze\s+(\w+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim();
  }
  
  return null;
}

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

function generateFallbackResponse(userMessage: string, currentWord?: Word): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Morpheme and etymology queries
  if (lowerMessage.includes('morpheme') || lowerMessage.includes('root') || 
      lowerMessage.includes('prefix') || lowerMessage.includes('suffix')) {
    if (currentWord) {
      return generateMorphemeAnalysis(currentWord);
    } else {
      return "Morphemes are the smallest meaningful units in language! I can analyze word structure, roots, prefixes, and suffixes. Try asking for a comprehensive breakdown of a specific word.";
    }
  }

  // Etymology questions
  if (lowerMessage.includes('etymology') || lowerMessage.includes('origin') || 
      lowerMessage.includes('history') || lowerMessage.includes('where does') ||
      lowerMessage.includes('come from')) {
    if (currentWord) {
      return generateEtymologyResponse(currentWord);
    } else {
      return "Etymology is fascinating! It reveals how words traveled through languages and cultures. I can trace word origins, historical development, and linguistic connections. Ask for a comprehensive breakdown of any word!";
    }
  }

  // Default responses with Calvern 3.0 integration
  const responses = [
    "I'm Calvern, your AI linguistics expert! Ask me for a 'comprehensive breakdown' of any word for detailed morphological analysis, etymology, and usage patterns.",
    "Try asking me to analyze specific words with phrases like 'comprehensive breakdown of [word]' or 'explain [word]' for detailed linguistic insights.",
    "I can provide deep linguistic analysis! Ask about word origins, morphology, or request a comprehensive breakdown of any vocabulary term.",
    "Ready to explore language with you! Try 'comprehensive breakdown of superfluous' or ask me to explain any linguistic concept.",
    "I'm here to help with advanced vocabulary analysis! Request comprehensive breakdowns, etymology explanations, or morphological insights for any word."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

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
