import { WordRepositoryService } from './wordRepositoryService';
import { DictionaryApiService } from './dictionaryApiService';
import { supabase } from '@/integrations/supabase/client';

// Enhanced dictionary service with full linguistic analysis and database integration
export class EnhancedDictionaryService {
  
  // Main search function that integrates with database storage
  static async searchAndStoreWord(word: string): Promise<{
    success: boolean;
    wordId?: string;
    message: string;
    wordProfile?: any;
  }> {
    const normalizedWord = word.trim().toLowerCase();
    
    try {
      console.log(`🔍 Enhanced search for: "${normalizedWord}"`);
      
      // First check if word already exists in database
      const existingWord = await WordRepositoryService.getWordByName(normalizedWord);
      if (existingWord) {
        console.log(`✅ Word "${normalizedWord}" already in database`);
        return {
          success: true,
          wordId: existingWord.id,
          message: `Word "${normalizedWord}" found in database`,
          wordProfile: existingWord
        };
      }
      
      // Fetch from dictionary API with enhanced analysis
      const success = await DictionaryApiService.fetchAndStoreWord(normalizedWord);
      
      if (success) {
        // Get the newly stored word
        const newWord = await WordRepositoryService.getWordByName(normalizedWord);
        if (newWord) {
          // Trigger background enrichment for comprehensive analysis
          await this.triggerLinguisticEnrichment(newWord.id);
          
          console.log(`✅ Word "${normalizedWord}" successfully added with enhanced analysis`);
          return {
            success: true,
            wordId: newWord.id,
            message: `Word "${normalizedWord}" added to database with comprehensive analysis`,
            wordProfile: newWord
          };
        }
      }
      
      return {
        success: false,
        message: `Could not find or analyze word "${normalizedWord}"`
      };
      
    } catch (error) {
      console.error('Enhanced dictionary search error:', error);
      return {
        success: false,
        message: `Error analyzing word "${normalizedWord}": ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  // Trigger comprehensive linguistic enrichment
  private static async triggerLinguisticEnrichment(wordId: string): Promise<void> {
    try {
      console.log(`🧠 Triggering linguistic enrichment for word ID: ${wordId}`);
      
      // Call the deep linguistic enrichment function
      const { data, error } = await supabase.functions.invoke('deep-linguistic-enrichment', {
        body: { wordId }
      });
      
      if (error) {
        console.warn('Enrichment warning:', error);
      } else {
        console.log('✅ Linguistic enrichment completed');
      }
    } catch (error) {
      console.warn('Background enrichment failed:', error);
      // Don't throw error as this is background processing
    }
  }
  
  // Enhanced morphological analysis
  static async performMorphologicalAnalysis(word: string): Promise<{
    prefix?: { text: string; meaning: string };
    root: { text: string; meaning: string };
    suffix?: { text: string; meaning: string };
  }> {
    const normalizedWord = word.toLowerCase();
    
    // Enhanced morpheme detection rules
    const morphemeRules = {
      prefixes: {
        'un': 'not, opposite of',
        're': 'again, back',
        'pre': 'before',
        'dis': 'apart, away',
        'mis': 'wrongly',
        'over': 'excessive',
        'under': 'insufficient',
        'sub': 'under, below',
        'inter': 'between',
        'trans': 'across',
        'anti': 'against',
        'pro': 'forward, in favor of',
        'de': 'remove, reverse',
        'ex': 'out of, former',
        'non': 'not',
        'auto': 'self',
        'co': 'together',
        'counter': 'against'
      },
      suffixes: {
        'ing': 'action, process',
        'ed': 'past action',
        'er': 'one who does',
        'est': 'most',
        'ly': 'in a manner',
        'tion': 'action, state',
        'sion': 'action, state',
        'ness': 'state of being',
        'ment': 'result, action',
        'ful': 'full of',
        'less': 'without',
        'able': 'capable of',
        'ible': 'capable of',
        'ous': 'having the quality',
        'ious': 'having the quality',
        'al': 'relating to',
        'ic': 'relating to',
        'ive': 'having the nature of',
        'ize': 'to make',
        'ise': 'to make'
      }
    };
    
    let prefix, suffix, root;
    let wordRemainder = normalizedWord;
    
    // Detect prefix
    for (const [prefixText, meaning] of Object.entries(morphemeRules.prefixes)) {
      if (normalizedWord.startsWith(prefixText) && normalizedWord.length > prefixText.length + 2) {
        prefix = { text: prefixText, meaning };
        wordRemainder = normalizedWord.slice(prefixText.length);
        break;
      }
    }
    
    // Detect suffix
    for (const [suffixText, meaning] of Object.entries(morphemeRules.suffixes)) {
      if (wordRemainder.endsWith(suffixText) && wordRemainder.length > suffixText.length + 2) {
        suffix = { text: suffixText, meaning };
        wordRemainder = wordRemainder.slice(0, -suffixText.length);
        break;
      }
    }
    
    // Root is what remains
    root = {
      text: wordRemainder,
      meaning: `core meaning of ${word}`
    };
    
    return { prefix, root, suffix };
  }
  
  // Generate quality scoring for word profiles
  static calculateWordQualityScore(wordData: any): number {
    let score = 0;
    const maxScore = 100;
    
    // Essential fields (40 points)
    if (wordData.word) score += 15;
    if (wordData.definitions?.primary) score += 15;
    if (wordData.etymology?.language_of_origin) score += 10;
    
    // Morpheme breakdown (25 points)
    if (wordData.morpheme_breakdown?.root) score += 10;
    if (wordData.morpheme_breakdown?.root?.meaning) score += 8;
    if (wordData.morpheme_breakdown?.prefix || wordData.morpheme_breakdown?.suffix) score += 7;
    
    // Definitions richness (20 points)
    if (wordData.definitions?.standard?.length > 1) score += 10;
    if (wordData.definitions?.contextual?.length > 0) score += 10;
    
    // Analysis depth (15 points)
    if (wordData.analysis?.synonyms?.length > 0) score += 5;
    if (wordData.analysis?.usage_examples?.length > 0) score += 5;
    if (wordData.analysis?.collocations?.length > 0) score += 5;
    
    return Math.round((score / maxScore) * 100);
  }
}