
export interface CleaningResult {
  originalData: any;
  cleanedData: any;
  changes: string[];
  qualityImprovement: number;
}

export class IntelligentDataCleaningService {
  // Main cleaning pipeline
  static async cleanAndNormalizeData(wordData: any): Promise<CleaningResult> {
    console.log('Starting intelligent data cleaning...');
    
    const originalData = JSON.parse(JSON.stringify(wordData));
    const cleanedData = JSON.parse(JSON.stringify(wordData));
    const changes: string[] = [];

    // 1. Clean word field
    if (cleanedData.word) {
      const originalWord = cleanedData.word;
      cleanedData.word = this.normalizeWord(cleanedData.word);
      if (originalWord !== cleanedData.word) {
        changes.push('normalized_word_format');
      }
    }

    // 2. Clean and deduplicate definitions
    if (cleanedData.definitions) {
      const defResult = this.cleanDefinitions(cleanedData.definitions);
      cleanedData.definitions = defResult.cleaned;
      changes.push(...defResult.changes);
    }

    // 3. Clean etymology data
    if (cleanedData.etymology) {
      const etymResult = this.cleanEtymology(cleanedData.etymology);
      cleanedData.etymology = etymResult.cleaned;
      changes.push(...etymResult.changes);
    }

    // 4. Clean morpheme breakdown
    if (cleanedData.morpheme_breakdown) {
      const morphResult = this.cleanMorphemeBreakdown(cleanedData.morpheme_breakdown);
      cleanedData.morpheme_breakdown = morphResult.cleaned;
      changes.push(...morphResult.changes);
    }

    // 5. Clean analysis data
    if (cleanedData.analysis) {
      const analysisResult = this.cleanAnalysis(cleanedData.analysis);
      cleanedData.analysis = analysisResult.cleaned;
      changes.push(...analysisResult.changes);
    }

    // 6. Clean word forms
    if (cleanedData.word_forms) {
      const formsResult = this.cleanWordForms(cleanedData.word_forms);
      cleanedData.word_forms = formsResult.cleaned;
      changes.push(...formsResult.changes);
    }

    // Calculate quality improvement
    const qualityImprovement = this.calculateQualityImprovement(originalData, cleanedData);

    return {
      originalData,
      cleanedData,
      changes,
      qualityImprovement
    };
  }

  // Normalize word format
  private static normalizeWord(word: string): string {
    return word
      .trim()
      .toLowerCase()
      .replace(/[^\w\s'-]/g, '') // Remove special characters except apostrophes and hyphens
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  // Clean definitions with deduplication and formatting
  private static cleanDefinitions(definitions: any): { cleaned: any; changes: string[] } {
    const cleaned = { ...definitions };
    const changes: string[] = [];

    // Clean primary definition
    if (cleaned.primary) {
      const original = cleaned.primary;
      cleaned.primary = this.normalizeText(cleaned.primary);
      if (original !== cleaned.primary) {
        changes.push('cleaned_primary_definition');
      }
    }

    // Clean and deduplicate standard definitions
    if (cleaned.standard && Array.isArray(cleaned.standard)) {
      const originalLength = cleaned.standard.length;
      cleaned.standard = this.deduplicateAndCleanArray(cleaned.standard);
      
      if (cleaned.standard.length !== originalLength) {
        changes.push('deduplicated_standard_definitions');
      }
    }

    // Clean contextual definitions
    if (cleaned.contextual && Array.isArray(cleaned.contextual)) {
      const originalLength = cleaned.contextual.length;
      cleaned.contextual = this.deduplicateAndCleanArray(cleaned.contextual);
      
      if (cleaned.contextual.length !== originalLength) {
        changes.push('deduplicated_contextual_definitions');
      }
    }

    // Clean extended definitions
    if (cleaned.extended && Array.isArray(cleaned.extended)) {
      const originalLength = cleaned.extended.length;
      cleaned.extended = this.deduplicateAndCleanArray(cleaned.extended);
      
      if (cleaned.extended.length !== originalLength) {
        changes.push('deduplicated_extended_definitions');
      }
    }

    return { cleaned, changes };
  }

  // Clean etymology data
  private static cleanEtymology(etymology: any): { cleaned: any; changes: string[] } {
    const cleaned = { ...etymology };
    const changes: string[] = [];

    // Normalize language of origin
    if (cleaned.language_of_origin) {
      const original = cleaned.language_of_origin;
      cleaned.language_of_origin = this.normalizeLanguageName(cleaned.language_of_origin);
      if (original !== cleaned.language_of_origin) {
        changes.push('normalized_language_origin');
      }
    }

    // Clean historical origins text
    if (cleaned.historical_origins) {
      const original = cleaned.historical_origins;
      cleaned.historical_origins = this.normalizeText(cleaned.historical_origins);
      if (original !== cleaned.historical_origins) {
        changes.push('cleaned_historical_origins');
      }
    }

    // Clean word evolution text
    if (cleaned.word_evolution) {
      const original = cleaned.word_evolution;
      cleaned.word_evolution = this.normalizeText(cleaned.word_evolution);
      if (original !== cleaned.word_evolution) {
        changes.push('cleaned_word_evolution');
      }
    }

    return { cleaned, changes };
  }

  // Clean morpheme breakdown
  private static cleanMorphemeBreakdown(morpheme: any): { cleaned: any; changes: string[] } {
    const cleaned = { ...morpheme };
    const changes: string[] = [];

    // Clean each morpheme component
    ['root', 'prefix', 'suffix'].forEach(component => {
      if (cleaned[component]) {
        const original = JSON.stringify(cleaned[component]);
        
        if (cleaned[component].text) {
          cleaned[component].text = this.normalizeText(cleaned[component].text);
        }
        if (cleaned[component].meaning) {
          cleaned[component].meaning = this.normalizeText(cleaned[component].meaning);
        }
        if (cleaned[component].origin) {
          cleaned[component].origin = this.normalizeLanguageName(cleaned[component].origin);
        }

        if (original !== JSON.stringify(cleaned[component])) {
          changes.push(`cleaned_${component}_morpheme`);
        }
      }
    });

    return { cleaned, changes };
  }

  // Clean analysis data
  private static cleanAnalysis(analysis: any): { cleaned: any; changes: string[] } {
    const cleaned = { ...analysis };
    const changes: string[] = [];

    // Clean parts of speech
    if (cleaned.parts_of_speech) {
      const original = cleaned.parts_of_speech;
      cleaned.parts_of_speech = this.normalizePartsOfSpeech(cleaned.parts_of_speech);
      if (original !== cleaned.parts_of_speech) {
        changes.push('normalized_parts_of_speech');
      }
    }

    // Deduplicate synonyms
    if (cleaned.synonyms && Array.isArray(cleaned.synonyms)) {
      const originalLength = cleaned.synonyms.length;
      cleaned.synonyms = this.deduplicateAndCleanArray(cleaned.synonyms);
      
      if (cleaned.synonyms.length !== originalLength) {
        changes.push('deduplicated_synonyms');
      }
    }

    // Deduplicate antonyms
    if (cleaned.antonyms && Array.isArray(cleaned.antonyms)) {
      const originalLength = cleaned.antonyms.length;
      cleaned.antonyms = this.deduplicateAndCleanArray(cleaned.antonyms);
      
      if (cleaned.antonyms.length !== originalLength) {
        changes.push('deduplicated_antonyms');
      }
    }

    // Clean usage examples
    if (cleaned.usage_examples && Array.isArray(cleaned.usage_examples)) {
      const originalLength = cleaned.usage_examples.length;
      cleaned.usage_examples = this.deduplicateAndCleanArray(cleaned.usage_examples);
      
      if (cleaned.usage_examples.length !== originalLength) {
        changes.push('deduplicated_usage_examples');
      }
    }

    return { cleaned, changes };
  }

  // Clean word forms
  private static cleanWordForms(wordForms: any): { cleaned: any; changes: string[] } {
    const cleaned = { ...wordForms };
    const changes: string[] = [];

    // Clean each form category
    Object.keys(cleaned).forEach(formType => {
      if (cleaned[formType] && typeof cleaned[formType] === 'object') {
        const original = JSON.stringify(cleaned[formType]);
        
        Object.keys(cleaned[formType]).forEach(formKey => {
          if (typeof cleaned[formType][formKey] === 'string') {
            cleaned[formType][formKey] = this.normalizeText(cleaned[formType][formKey]);
          }
        });

        if (original !== JSON.stringify(cleaned[formType])) {
          changes.push(`cleaned_${formType}_forms`);
        }
      }
    });

    return { cleaned, changes };
  }

  // Utility functions
  private static normalizeText(text: string): string {
    if (!text || typeof text !== 'string') return text;
    
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[""]/g, '"') // Normalize quotes
      .replace(/['']/g, "'") // Normalize apostrophes
      .replace(/…/g, '...') // Normalize ellipsis
      .replace(/\u00A0/g, ' '); // Replace non-breaking spaces
  }

  private static normalizeLanguageName(language: string): string {
    if (!language || typeof language !== 'string') return language;
    
    const languageMap: Record<string, string> = {
      'latin': 'Latin',
      'greek': 'Greek',
      'ancient greek': 'Ancient Greek',
      'old english': 'Old English',
      'middle english': 'Middle English',
      'french': 'French',
      'german': 'German',
      'spanish': 'Spanish',
      'italian': 'Italian',
      'portuguese': 'Portuguese',
      'dutch': 'Dutch',
      'norse': 'Old Norse',
      'old norse': 'Old Norse',
      'proto-indo-european': 'Proto-Indo-European'
    };

    const normalized = language.toLowerCase().trim();
    return languageMap[normalized] || this.capitalizeFirstLetter(normalized);
  }

  private static normalizePartsOfSpeech(pos: string): string {
    if (!pos || typeof pos !== 'string') return pos;
    
    const posMap: Record<string, string> = {
      'n': 'noun',
      'v': 'verb',
      'adj': 'adjective',
      'adv': 'adverb',
      'prep': 'preposition',
      'conj': 'conjunction',
      'interj': 'interjection',
      'pron': 'pronoun',
      'det': 'determiner'
    };

    const normalized = pos.toLowerCase().trim();
    return posMap[normalized] || normalized;
  }

  private static deduplicateAndCleanArray(arr: string[]): string[] {
    if (!Array.isArray(arr)) return arr;
    
    const cleaned = arr
      .map(item => this.normalizeText(item))
      .filter(item => item && item.length > 0);
    
    // Remove duplicates using Set
    const unique = Array.from(new Set(cleaned));
    
    // Remove items that are substrings of other items
    return unique.filter((item, index) => {
      return !unique.some((otherItem, otherIndex) => 
        index !== otherIndex && 
        otherItem.length > item.length && 
        otherItem.toLowerCase().includes(item.toLowerCase())
      );
    });
  }

  private static capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Calculate quality improvement score
  private static calculateQualityImprovement(original: any, cleaned: any): number {
    let improvements = 0;
    let totalChecks = 0;

    // Check each major field for improvements
    const fields = ['definitions', 'etymology', 'morpheme_breakdown', 'analysis', 'word_forms'];
    
    fields.forEach(field => {
      if (original[field] && cleaned[field]) {
        totalChecks++;
        
        // Simple heuristic: cleaned data should be more consistent and normalized
        const originalStr = JSON.stringify(original[field]);
        const cleanedStr = JSON.stringify(cleaned[field]);
        
        // If cleaned version is different and not longer (indicating normalization, not addition)
        if (originalStr !== cleanedStr && cleanedStr.length <= originalStr.length * 1.1) {
          improvements++;
        }
      }
    });

    return totalChecks > 0 ? Math.round((improvements / totalChecks) * 100) : 0;
  }
}
