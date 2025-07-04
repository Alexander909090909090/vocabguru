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
  aiEnhancements: string[];
}

// AI-powered Dynamic CSV intelligence service
export class DynamicCsvService {
  
  // AI-powered CSV structure analysis
  static async analyzeCsvStructure(headers: string[], sampleRows: string[][]): Promise<CsvAnalysisResult> {
    console.log('🧠 AI-powered CSV analysis for headers:', headers);
    
    try {
      // Try AI analysis first
      const { data: aiResult, error } = await supabase.functions.invoke('ai-csv-analyzer', {
        body: { headers, sampleRows }
      });

      if (!error && aiResult) {
        console.log('✅ AI analysis successful:', aiResult);
        return aiResult;
      } else {
        console.warn('AI analysis failed, falling back to pattern matching:', error);
      }
    } catch (error) {
      console.warn('AI analysis error, using fallback:', error);
    }

    // Fallback to pattern-based analysis
    return this.fallbackAnalyzeCsvStructure(headers, sampleRows);
  }

  // Fallback pattern-based analysis
  private static fallbackAnalyzeCsvStructure(headers: string[], sampleRows: string[][]): CsvAnalysisResult {
    console.log('🔍 Fallback: Analyzing CSV structure with headers:', headers);
    
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
    
    // Add AI enhancement recommendations
    const aiEnhancements = ['definition', 'morpheme_breakdown', 'etymology', 'synonyms', 'usage_examples'];
    aiEnhancements.forEach(enhancement => {
      recommendations.push(`🤖 AI will generate missing: ${enhancement}`);
    });
    
    console.log('📊 Fallback CSV Analysis Results:', { mappings, confidence, recommendations });
    
    return { mappings, confidence, recommendations, preview, aiEnhancements };
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
  
  // Process CSV data with AI-powered dynamic mappings
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
    const { skipFirstRow = true, enrichMissingData = true, batchSize = 5 } = options;
    const dataRows = skipFirstRow ? rows.slice(1) : rows;
    
    console.log(`📥 AI-powered processing ${dataRows.length} CSV rows with mappings:`, mappings);
    
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
      successful: [] as string[]
    };
    
    // Process in smaller batches to handle AI enrichment
    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      const batchPromises = batch.map(row => this.processRow(row, mappings, enrichMissingData));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        const rowIndex = i + index + (skipFirstRow ? 2 : 1);
        
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
      
      // Longer delay between batches for AI processing
      if (i + batchSize < dataRows.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log('📊 AI-Enhanced CSV Processing Results:', results);
    return results;
  }
  
  // Find word column with flexible matching
  private static findWordColumn(row: string[], mappings: CsvColumnMapping): number | undefined {
    // Try to find any non-empty column that could be a word
    for (let i = 0; i < row.length; i++) {
      const value = row[i]?.trim();
      if (value && value.length > 0 && value.length < 50 && !value.includes(' ')) {
        return i;
      }
    }
    return undefined;
  }
  
  // Enhanced row processing with AI enrichment
  private static async processRow(
    row: string[],
    mappings: CsvColumnMapping,
    enrichMissingData: boolean
  ): Promise<{ success: boolean; word?: string; error?: string }> {
    try {
      // Find any column that could contain a word - be flexible
      const wordCol = mappings.word ?? this.findWordColumn(row, mappings);
      if (wordCol === undefined) {
        return { success: false, error: 'No word found in any column' };
      }
      
      const word = row[wordCol].trim().toLowerCase();
      
      // Check if word already exists
      const existingWord = await WordRepositoryService.getWordByName(word);
      if (existingWord) {
        return { success: false, error: `Word "${word}" already exists` };
      }
      
      // Build flexible word profile from CSV data
      const wordProfile = this.buildWordProfile(word, row, mappings);
      
      // Store the word profile
      const { data: result, error } = await supabase
        .from('word_profiles')
        .insert([wordProfile])
        .select()
        .single();
      
      if (!error && result) {
        // Enhanced AI-powered enrichment
        if (enrichMissingData) {
          try {
            await this.aiEnhanceWordProfile(result.id, wordProfile);
          } catch (enrichError) {
            console.warn(`Failed to AI-enhance word "${word}":`, enrichError);
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

  // Build word profile with flexible data extraction
  private static buildWordProfile(word: string, row: string[], mappings: CsvColumnMapping): any {
    const getValue = (fieldName: string): string => {
      const index = mappings[fieldName];
      return (index !== undefined && row[index]) ? row[index].trim() : '';
    };

    return {
      word,
      definitions: {
        primary: getValue('definition') || `Definition for ${word}`,
        standard: [],
        extended: [],
        contextual: [],
        specialized: []
      },
      morpheme_breakdown: {
        prefix: getValue('morphemePrefix') ? { 
          text: getValue('morphemePrefix'), 
          meaning: 'prefix meaning' 
        } : undefined,
        root: {
          text: getValue('morphemeRoot') || word,
          meaning: 'root meaning'
        },
        suffix: getValue('morphemeSuffix') ? { 
          text: getValue('morphemeSuffix'), 
          meaning: 'suffix meaning' 
        } : undefined
      },
      etymology: {
        language_of_origin: getValue('etymology') || 'Unknown',
        historical_origins: 'Imported from CSV',
        word_evolution: 'Evolution details pending AI enrichment',
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
        parts_of_speech: getValue('partOfSpeech') || 'noun',
        synonyms: [],
        antonyms: [],
        collocations: [],
        usage_examples: [],
        example_sentence: `The word "${word}" can be used in various contexts.`
      },
      source_apis: ['ai_csv_import'],
      frequency_score: 50,
      difficulty_level: 'intermediate',
      phonetic: getValue('pronunciation') || '',
      quality_score: 60, // Will be improved by AI enhancement
      enrichment_status: 'pending_ai_enhancement'
    };
  }

  // AI-powered word profile enhancement
  private static async aiEnhanceWordProfile(wordId: string, existingData: any): Promise<void> {
    try {
      console.log(`🤖 AI enhancing word profile for: ${existingData.word}`);
      
      // Identify missing fields
      const missingFields = [];
      if (!existingData.definitions?.primary || existingData.definitions.primary.includes('Definition for')) {
        missingFields.push('definition');
      }
      if (!existingData.morpheme_breakdown?.root?.meaning || existingData.morpheme_breakdown.root.meaning === 'root meaning') {
        missingFields.push('morpheme_breakdown');
      }
      if (!existingData.etymology?.language_of_origin || existingData.etymology.language_of_origin === 'Unknown') {
        missingFields.push('etymology');
      }
      if (!existingData.analysis?.synonyms?.length) {
        missingFields.push('synonyms');
      }
      if (!existingData.analysis?.usage_examples?.length) {
        missingFields.push('usage_examples');
      }

      if (missingFields.length === 0) {
        console.log('✅ Word profile already complete, skipping AI enhancement');
        return;
      }

      // Call AI enhancement function
      const { data: aiResult, error } = await supabase.functions.invoke('ai-data-enhancer', {
        body: { 
          word: existingData.word, 
          existingData, 
          missingFields 
        }
      });

      if (!error && aiResult?.enhancements) {
        // Merge AI enhancements with existing data
        const enhancedData = this.mergeEnhancements(existingData, aiResult.enhancements);
        
        // Update the word profile
        const { error: updateError } = await supabase
          .from('word_profiles')
          .update({
            ...enhancedData,
            quality_score: 85,
            enrichment_status: 'ai_enhanced',
            last_enrichment_at: new Date().toISOString()
          })
          .eq('id', wordId);

        if (updateError) {
          console.error('Failed to update enhanced word profile:', updateError);
        } else {
          console.log(`✨ Successfully AI-enhanced word: ${existingData.word}`);
        }
      } else {
        console.warn('AI enhancement failed:', error);
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
    }
  }

  // Merge AI enhancements with existing data
  private static mergeEnhancements(existing: any, enhancements: any): any {
    return {
      ...existing,
      definitions: {
        ...existing.definitions,
        ...enhancements.definitions
      },
      morpheme_breakdown: {
        ...existing.morpheme_breakdown,
        ...enhancements.morpheme_breakdown
      },
      etymology: {
        ...existing.etymology,
        ...enhancements.etymology
      },
      analysis: {
        ...existing.analysis,
        parts_of_speech: enhancements.part_of_speech || existing.analysis.parts_of_speech,
        synonyms: enhancements.synonyms || existing.analysis.synonyms,
        antonyms: enhancements.antonyms || existing.analysis.antonyms,
        usage_examples: enhancements.usage_examples || existing.analysis.usage_examples,
        collocations: enhancements.collocations || existing.analysis.collocations
      },
      phonetic: enhancements.pronunciation || existing.phonetic,
      frequency_score: enhancements.frequency_score || existing.frequency_score,
      difficulty_level: enhancements.difficulty_level || existing.difficulty_level
    };
  }
}