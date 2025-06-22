
import { Word } from "@/data/words";
import { EnhancedWordProfile } from "@/types/enhancedWordProfile";

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const generateResponseText = async (
  userMessage: string, 
  targetWord?: Word | EnhancedWordProfile
): Promise<string> => {
  // Enhanced comprehensive breakdown detection
  const isComprehensiveRequest = userMessage.toLowerCase().includes('comprehensive breakdown') ||
                                userMessage.toLowerCase().includes('complete analysis') ||
                                userMessage.toLowerCase().includes('deep dive') ||
                                userMessage.toLowerCase().includes('detailed breakdown');

  // Enhanced morphological analysis detection
  const isMorphologicalRequest = userMessage.toLowerCase().includes('morpheme') ||
                               userMessage.toLowerCase().includes('prefix') ||
                               userMessage.toLowerCase().includes('suffix') ||
                               userMessage.toLowerCase().includes('root word') ||
                               userMessage.toLowerCase().includes('word parts');

  // Etymology request detection
  const isEtymologyRequest = userMessage.toLowerCase().includes('etymology') ||
                           userMessage.toLowerCase().includes('origin') ||
                           userMessage.toLowerCase().includes('history') ||
                           userMessage.toLowerCase().includes('evolution');

  if (targetWord && isComprehensiveRequest) {
    return generateComprehensiveAnalysis(targetWord);
  }
  
  if (targetWord && isMorphologicalRequest) {
    return generateMorphologicalAnalysis(targetWord);
  }
  
  if (targetWord && isEtymologyRequest) {
    return generateEtymologyAnalysis(targetWord);
  }
  
  if (targetWord) {
    return generateWordSpecificResponse(targetWord, userMessage);
  }
  
  return generateGeneralLinguisticResponse(userMessage);
};

const generateComprehensiveAnalysis = (word: Word | EnhancedWordProfile): string => {
  const morphemes = 'morpheme_breakdown' in word ? word.morpheme_breakdown : word.morphemeBreakdown;
  const etymology = word.etymology;
  
  let analysis = `## Comprehensive Breakdown: "${word.word}"\n\n`;
  
  // Morphological Analysis
  analysis += `### 🔍 Morphological Structure\n\n`;
  if (morphemes?.prefix) {
    analysis += `**Prefix:** ${morphemes.prefix.text}\n`;
    analysis += `- Meaning: ${morphemes.prefix.meaning}\n`;
    analysis += `- Origin: ${morphemes.prefix.origin || 'Classical'}\n\n`;
  }
  
  if (morphemes?.root) {
    analysis += `**Root:** ${morphemes.root.text}\n`;
    analysis += `- Meaning: ${morphemes.root.meaning}\n`;
    analysis += `- Origin: ${morphemes.root.origin || 'Indo-European'}\n\n`;
  }
  
  if (morphemes?.suffix) {
    analysis += `**Suffix:** ${morphemes.suffix.text}\n`;
    analysis += `- Meaning: ${morphemes.suffix.meaning}\n`;
    analysis += `- Origin: ${morphemes.suffix.origin || 'Germanic'}\n\n`;
  }
  
  // Etymology Section
  analysis += `### 📚 Etymology & Historical Development\n\n`;
  if (etymology?.origin || etymology?.historical_origins) {
    analysis += `**Historical Origins:** ${etymology.historical_origins || etymology.origin}\n\n`;
  }
  
  if (etymology?.evolution || etymology?.word_evolution) {
    analysis += `**Word Evolution:** ${etymology.word_evolution || etymology.evolution}\n\n`;
  }
  
  if (etymology?.culturalVariations || etymology?.cultural_regional_variations) {
    analysis += `**Cultural Variations:** ${etymology.cultural_regional_variations || etymology.culturalVariations}\n\n`;
  }
  
  // Linguistic Insights
  analysis += `### 🧠 Linguistic Insights\n\n`;
  analysis += `- **Part of Speech:** ${word.partOfSpeech}\n`;
  analysis += `- **Language Origin:** ${word.languageOrigin || 'Multiple influences'}\n`;
  
  if ('pronunciation' in word && word.pronunciation) {
    analysis += `- **Pronunciation:** ${word.pronunciation}\n`;
  }
  
  // Semantic Analysis
  analysis += `\n### 💡 Semantic Analysis\n\n`;
  analysis += `The word "${word.word}" demonstrates fascinating linguistic evolution. `;
  
  if (morphemes?.prefix && morphemes?.root) {
    analysis += `The combination of the ${morphemes.prefix.text}- prefix (${morphemes.prefix.meaning}) `;
    analysis += `with the root ${morphemes.root.text} (${morphemes.root.meaning}) `;
    analysis += `creates a compound meaning that has evolved over centuries.\n\n`;
  }
  
  // Related Words and Word Family
  analysis += `### 🌟 Word Family & Related Terms\n\n`;
  analysis += `Words sharing similar morphological components:\n`;
  
  if (morphemes?.root) {
    const rootText = morphemes.root.text;
    analysis += `- Words with root "${rootText}": ${rootText}al, ${rootText}ic, ${rootText}ism\n`;
  }
  
  if (morphemes?.prefix) {
    const prefixText = morphemes.prefix.text;
    analysis += `- Words with prefix "${prefixText}-": ${prefixText}determine, ${prefixText}conceive, ${prefixText}establish\n`;
  }
  
  analysis += `\n### 🎯 Memory Techniques\n\n`;
  analysis += `**Morpheme Memory:** Break down "${word.word}" into its components:\n`;
  if (morphemes?.prefix) analysis += `- "${morphemes.prefix.text}" = ${morphemes.prefix.meaning}\n`;
  if (morphemes?.root) analysis += `- "${morphemes.root.text}" = ${morphemes.root.meaning}\n`;
  if (morphemes?.suffix) analysis += `- "${morphemes.suffix.text}" = ${morphemes.suffix.meaning}\n`;
  
  analysis += `\n**Etymology Connection:** Remember that this word comes from ${word.languageOrigin || 'ancient linguistic roots'}, `;
  analysis += `which helps explain its modern meaning and usage patterns.`;
  
  return analysis;
};

const generateMorphologicalAnalysis = (word: Word | EnhancedWordProfile): string => {
  const morphemes = 'morpheme_breakdown' in word ? word.morpheme_breakdown : word.morphemeBreakdown;
  
  let analysis = `## Morphological Analysis: "${word.word}"\n\n`;
  
  analysis += `The word "${word.word}" can be broken down into the following morphological components:\n\n`;
  
  if (morphemes?.prefix) {
    analysis += `🔸 **Prefix: ${morphemes.prefix.text}**\n`;
    analysis += `   - Meaning: ${morphemes.prefix.meaning}\n`;
    analysis += `   - Function: Modifies the root meaning\n`;
    analysis += `   - Origin: ${morphemes.prefix.origin || 'Classical languages'}\n\n`;
  }
  
  if (morphemes?.root) {
    analysis += `🔹 **Root: ${morphemes.root.text}** (Core meaning)\n`;
    analysis += `   - Meaning: ${morphemes.root.meaning}\n`;
    analysis += `   - Function: Carries the primary semantic content\n`;
    analysis += `   - Origin: ${morphemes.root.origin || 'Indo-European base'}\n\n`;
  }
  
  if (morphemes?.suffix) {
    analysis += `🔸 **Suffix: ${morphemes.suffix.text}**\n`;
    analysis += `   - Meaning: ${morphemes.suffix.meaning}\n`;
    analysis += `   - Function: Determines grammatical category\n`;
    analysis += `   - Origin: ${morphemes.suffix.origin || 'Germanic inflection'}\n\n`;
  }
  
  analysis += `### Morphological Pattern\n\n`;
  const pattern = [];
  if (morphemes?.prefix) pattern.push("PREFIX");
  pattern.push("ROOT");
  if (morphemes?.suffix) pattern.push("SUFFIX");
  
  analysis += `Structure: ${pattern.join(" + ")}\n\n`;
  
  analysis += `This morphological structure is common in ${word.languageOrigin || 'Indo-European'} languages `;
  analysis += `and demonstrates how meaning is built through systematic combination of meaningful units.`;
  
  return analysis;
};

const generateEtymologyAnalysis = (word: Word | EnhancedWordProfile): string => {
  const etymology = word.etymology;
  
  let analysis = `## Etymology of "${word.word}"\n\n`;
  
  analysis += `### Historical Development\n\n`;
  
  if (etymology?.historical_origins || etymology?.origin) {
    analysis += `**Origins:** ${etymology.historical_origins || etymology.origin}\n\n`;
  }
  
  if (etymology?.word_evolution || etymology?.evolution) {
    analysis += `**Evolution:** ${etymology.word_evolution || etymology.evolution}\n\n`;
  }
  
  analysis += `### Language Journey\n\n`;
  analysis += `The word "${word.word}" has traveled through multiple languages before reaching modern English:\n\n`;
  
  analysis += `1. **Original Form:** Proto-${word.languageOrigin || 'Indo-European'}\n`;
  analysis += `2. **Classical Period:** Adapted into Latin/Greek scholarly usage\n`;
  analysis += `3. **Medieval Period:** Entered Old French or Medieval Latin\n`;
  analysis += `4. **Modern English:** Standardized during the Renaissance\n\n`;
  
  if (etymology?.cultural_regional_variations || etymology?.culturalVariations) {
    analysis += `### Cultural Context\n\n`;
    analysis += `${etymology.cultural_regional_variations || etymology.culturalVariations}\n\n`;
  }
  
  analysis += `### Linguistic Significance\n\n`;
  analysis += `This etymology demonstrates the international nature of English vocabulary `;
  analysis += `and shows how words acquire layers of meaning through historical usage.`;
  
  return analysis;
};

const generateWordSpecificResponse = (word: Word | EnhancedWordProfile, userMessage: string): string => {
  const responses = [
    `Great question about "${word.word}"! This ${word.partOfSpeech} has fascinating linguistic properties. ${word.description}`,
    
    `The word "${word.word}" is particularly interesting from a morphological perspective. Its structure reveals ${word.languageOrigin || 'classical'} influences in modern English.`,
    
    `"${word.word}" demonstrates how ${word.languageOrigin || 'ancient'} roots continue to shape contemporary vocabulary. The word's semantic development shows typical patterns of language evolution.`,
    
    `From a linguistic standpoint, "${word.word}" exemplifies the layered nature of English vocabulary, combining elements from ${word.languageOrigin || 'multiple language families'}.`
  ];
  
  let response = responses[Math.floor(Math.random() * responses.length)];
  
  // Add morpheme information if available
  const morphemes = 'morpheme_breakdown' in word ? word.morpheme_breakdown : word.morphemeBreakdown;
  if (morphemes?.root) {
    response += `\n\nThe root "${morphemes.root.text}" (meaning: ${morphemes.root.meaning}) is the semantic core of this word.`;
  }
  
  return response;
};

const generateGeneralLinguisticResponse = (userMessage: string): string => {
  const linguisticResponses = [
    "That's a fascinating linguistic question! Language evolution demonstrates how human communication adapts and develops over centuries.",
    
    "From a morphological perspective, this touches on how words are constructed from meaningful units called morphemes.",
    
    "Etymology reveals the historical journey of words through different languages and cultures, showing how meaning evolves over time.",
    
    "This relates to fundamental principles of historical linguistics and how languages influence each other through contact and borrowing.",
    
    "Morphological analysis helps us understand how prefixes, roots, and suffixes combine to create complex meanings in systematic ways."
  ];
  
  return linguisticResponses[Math.floor(Math.random() * linguisticResponses.length)];
};
