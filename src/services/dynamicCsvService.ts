import { WordRepositoryService } from './wordRepositoryService';
import { EnhancedDictionaryService } from './enhancedDictionaryService';
import { supabase } from '@/integrations/supabase/client';

interface CsvColumnMapping {
  word?: number;
  definition?: number;
  partOfSpeech?: number;
  etymology?: number;
  pronunciation?: number;
  morphemePrefix?: number;
  morphemeRoot?: number;
  morphemeSuffix?: number;
  [key: string]: number | undefined;
}

interface CsvAnalysisResult {
  mappings: CsvColumnMapping;
  confidence: number;
  recommendations: string[];
  preview: any[];
}

// Dynamic CSV intelligence service with AI-powered column detection
export class DynamicCsvService {
  
  // Analyze CSV structure and auto-detect column mappings
  static analyzeCsvStructure(headers: string[], sampleRows: string[][]): CsvAnalysisResult {
    console.log('🔍 Analyzing CSV structure with headers:', headers);
    
    const mappings: CsvColumnMapping = {};
    const recommendations: string[] = [];
    let confidence = 0;
    
    // Enhanced column detection patterns
    const columnPatterns = {
      word: [
        /^(word|term|vocabulary|lexeme|entry|headword|lemma)$/i,
        /^(word_?name|term_?name|vocab_?word)$/i,
        /^(english|word_?english|term_?english)$/i
      ],
      definition: [
        /^(definition|meaning|description|explanation|gloss)$/i,
        /^(def|defn|word_?definition|term_?definition)$/i,
        /^(sense|primary_?meaning|main_?definition)$/i
      ],
      partOfSpeech: [
        /^(part_?of_?speech|pos|word_?class|grammatical_?category)$/i,
        /^(type|category|class|speech_?part)$/i,
        /^(noun|verb|adjective|adverb|grammar_?type)$/i
      ],
      etymology: [
        /^(etymology|origin|word_?origin|linguistic_?origin)$/i,
        /^(language_?origin|source_?language|derived_?from)$/i,
        /^(historical_?origin|etymological_?root)$/i
      ],
      pronunciation: [
        /^(pronunciation|phonetic|ipa|phonetics)$/i,
        /^(pronounce|phone|sound|phonemic)$/i,
        /^(pronunciation_?guide|how_?to_?pronounce)$/i
      ],
      morphemePrefix: [
        /^(prefix|word_?prefix|morpheme_?prefix)$/i,
        /^(pre_?fix|beginning|start_?morpheme)$/i
      ],
      morphemeRoot: [
        /^(root|word_?root|morpheme_?root|stem)$/i,
        /^(base|core|main_?part|root_?word)$/i
      ],
      morphemeSuffix: [
        /^(suffix|word_?suffix|morpheme_?suffix)$/i,
        /^(suf_?fix|ending|end_?morpheme)$/i
      ]
    };
    
    // Analyze each header
    headers.forEach((header, index) => {
      const cleanHeader = header.trim();
      let bestMatch = '';
      let bestScore = 0;
      
      // Check against all patterns
      Object.entries(columnPatterns).forEach(([fieldType, patterns]) => {
        patterns.forEach(pattern => {
          if (pattern.test(cleanHeader)) {
            const score = this.calculateMatchScore(cleanHeader, pattern);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = fieldType;
            }
          }
        });
      });
      
      if (bestMatch && bestScore > 0.7) {
        mappings[bestMatch] = index;
        confidence += bestScore;
        recommendations.push(`✅ Detected "${cleanHeader}" as ${bestMatch} (${Math.round(bestScore * 100)}% confidence)`);
      } else if (cleanHeader) {
        // Store unmapped columns for potential future use
        mappings[`custom_${cleanHeader.toLowerCase().replace(/\s+/g, '_')}`] = index;
        recommendations.push(`📝 Unmapped column: "${cleanHeader}" - will be stored as custom field`);
      }
    });
    
    // Normalize confidence
    confidence = confidence / Object.keys(columnPatterns).length;
    
    // Generate preview with mappings
    const preview = sampleRows.slice(0, 3).map(row => {
      const mapped: any = {};
      Object.entries(mappings).forEach(([field, colIndex]) => {
        if (colIndex !== undefined && row[colIndex]) {
          mapped[field] = row[colIndex];
        }
      });
      return mapped;
    });
    
    // Add recommendations for missing critical fields
    if (!mappings.word) {
      recommendations.push('⚠️ No word column detected - this is required for import');
      confidence *= 0.5;
    }
    if (!mappings.definition) {
      recommendations.push('⚠️ No definition column detected - definitions will be fetched from dictionary');
    }
    
    console.log('📊 CSV Analysis Results:', { mappings, confidence, recommendations });
    
    return { mappings, confidence, recommendations, preview };
  }
  
  // Calculate match score for header patterns
  private static calculateMatchScore(header: string, pattern: RegExp): number {
    if (pattern.test(header)) {
      // Exact match gets highest score
      const exactMatch = header.toLowerCase().replace(/[_\s]/g, '');
      const patternSource = pattern.source.toLowerCase().replace(/[\[\]()\\^$.*+?|]/g, '');
      
      if (exactMatch === patternSource.replace(/[_\s]/g, '')) {
        return 1.0;
      }
      
      // Partial match gets lower score based on similarity
      const similarity = this.stringSimilarity(exactMatch, patternSource);
      return 0.7 + (similarity * 0.3);
    }
    return 0;
  }
  
  // Simple string similarity calculation
  private static stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  // Levenshtein distance calculation
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  // Process CSV data with dynamic mappings
  static async processCsvData(
    rows: string[][],
    mappings: CsvColumnMapping,
    options: {
      skipFirstRow?: boolean;
      enrichMissingData?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
    successful: string[];
  }> {
    const { skipFirstRow = true, enrichMissingData = true, batchSize = 10 } = options;
    const dataRows = skipFirstRow ? rows.slice(1) : rows;
    
    console.log(`📥 Processing ${dataRows.length} CSV rows with mappings:`, mappings);
    
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
      successful: [] as string[]
    };
    
    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      const batchPromises = batch.map(row => this.processRow(row, mappings, enrichMissingData));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        const rowIndex = i + index + (skipFirstRow ? 2 : 1); // +2 for header and 1-based indexing
        
        if (result.status === 'fulfilled' && result.value.success) {
          results.imported++;
          results.successful.push(`Row ${rowIndex}: ${result.value.word}`);
        } else {
          results.skipped++;
          const error = result.status === 'rejected' 
            ? result.reason.message 
            : result.value.error;
          results.errors.push(`Row ${rowIndex}: ${error}`);
        }
      });
      
      // Small delay between batches
      if (i + batchSize < dataRows.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('📊 CSV Processing Results:', results);
    return results;
  }
  
  // Process individual row
  private static async processRow(
    row: string[],
    mappings: CsvColumnMapping,
    enrichMissingData: boolean
  ): Promise<{ success: boolean; word?: string; error?: string }> {
    try {
      // Extract word - this is required
      const wordCol = mappings.word;
      if (wordCol === undefined || !row[wordCol]?.trim()) {
        return { success: false, error: 'Missing word column or empty word' };
      }
      
      const word = row[wordCol].trim().toLowerCase();
      
      // Check if word already exists
      const existingWord = await WordRepositoryService.getWordByName(word);
      if (existingWord) {
        return { success: false, error: `Word "${word}" already exists` };
      }
      
      // Build word profile from CSV data
      const wordProfile = {
        word,
        definitions: {
          primary: mappings.definition !== undefined ? row[mappings.definition]?.trim() : '',
          standard: [],
          extended: [],
          contextual: [],
          specialized: []
        },
        morpheme_breakdown: {
          prefix: mappings.morphemePrefix !== undefined && row[mappings.morphemePrefix] 
            ? { text: row[mappings.morphemePrefix], meaning: 'prefix meaning' }
            : undefined,
          root: {
            text: mappings.morphemeRoot !== undefined ? row[mappings.morphemeRoot] : word,
            meaning: 'root meaning'
          },
          suffix: mappings.morphemeSuffix !== undefined && row[mappings.morphemeSuffix]
            ? { text: row[mappings.morphemeSuffix], meaning: 'suffix meaning' }
            : undefined
        },
        etymology: {
          language_of_origin: mappings.etymology !== undefined ? row[mappings.etymology] : 'Unknown',
          historical_origins: 'Imported from CSV',
          word_evolution: 'Evolution details pending enrichment',
          cultural_variations: []
        },
        word_forms: {
          base_form: word,
          noun_forms: {},
          verb_tenses: {},
          adjective_forms: {},
          adverb_form: '',
          other_inflections: []
        },
        analysis: {
          parts_of_speech: mappings.partOfSpeech !== undefined ? row[mappings.partOfSpeech] : 'noun',
          synonyms: [],
          antonyms: [],
          collocations: [],
          usage_examples: [],
          example_sentence: `The word "${word}" can be used in various contexts.`
        },
        source_apis: ['csv_import'],
        frequency_score: 50,
        difficulty_level: 'intermediate',
        phonetic: mappings.pronunciation !== undefined ? row[mappings.pronunciation] : ''
      };
      
      // Add custom fields from unmapped columns
      Object.entries(mappings).forEach(([field, colIndex]) => {
        if (field.startsWith('custom_') && colIndex !== undefined && row[colIndex]) {
          (wordProfile as any)[field] = row[colIndex];
        }
      });
      
      // Store the word profile using supabase directly
      const { data: result, error } = await supabase
        .from('word_profiles')
        .insert([wordProfile])
        .select()
        .single();
      
      if (!error && result) {
        // If enrichment is enabled and definition is missing, try to enrich
        if (enrichMissingData && !wordProfile.definitions.primary) {
          try {
            await EnhancedDictionaryService.searchAndStoreWord(word);
          } catch (enrichError) {
            console.warn(`Failed to enrich word "${word}":`, enrichError);
          }
        }
        
        return { success: true, word };
      } else {
        return { success: false, error: 'Failed to store word profile' };
      }
      
    } catch (error) {
      console.error('Row processing error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown processing error' 
      };
    }
  }
}