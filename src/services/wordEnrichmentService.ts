
import { supabase } from "@/integrations/supabase/client";
import { WordProfile } from "@/types/wordProfile";
import { toast } from "sonner";

export interface EnrichmentOptions {
  cleanData?: boolean;
  fillMissingFields?: boolean;
  enhanceDefinitions?: boolean;
  improveEtymology?: boolean;
  addUsageExamples?: boolean;
  generateSynonyms?: boolean;
}

export interface EnrichmentResult {
  word: string;
  success: boolean;
  changes: string[];
  quality_score: number;
  error?: string;
}

export interface BatchEnrichmentProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentWord?: string;
}

export class WordEnrichmentService {
  private static readonly DEFAULT_OPTIONS: EnrichmentOptions = {
    cleanData: true,
    fillMissingFields: true,
    enhanceDefinitions: true,
    improveEtymology: true,
    addUsageExamples: true,
    generateSynonyms: true
  };

  // Data cleaning utilities
  static cleanWordData(wordProfile: WordProfile): WordProfile {
    const cleaned = { ...wordProfile };
    
    // Clean word text
    cleaned.word = cleaned.word?.trim().toLowerCase() || '';
    
    // Clean definitions
    if (cleaned.definitions) {
      if (cleaned.definitions.primary) {
        cleaned.definitions.primary = this.cleanText(cleaned.definitions.primary);
      }
      if (Array.isArray(cleaned.definitions.standard)) {
        cleaned.definitions.standard = cleaned.definitions.standard
          .map(def => this.cleanText(def))
          .filter(def => def.length > 0);
      }
    }
    
    // Clean morpheme breakdown
    if (cleaned.morpheme_breakdown) {
      if (cleaned.morpheme_breakdown.prefix?.text) {
        cleaned.morpheme_breakdown.prefix.text = this.cleanText(cleaned.morpheme_breakdown.prefix.text);
      }
      if (cleaned.morpheme_breakdown.root?.text) {
        cleaned.morpheme_breakdown.root.text = this.cleanText(cleaned.morpheme_breakdown.root.text);
      }
      if (cleaned.morpheme_breakdown.suffix?.text) {
        cleaned.morpheme_breakdown.suffix.text = this.cleanText(cleaned.morpheme_breakdown.suffix.text);
      }
    }
    
    // Clean analysis arrays
    if (cleaned.analysis) {
      if (Array.isArray(cleaned.analysis.synonyms)) {
        cleaned.analysis.synonyms = this.cleanArray(cleaned.analysis.synonyms);
      }
      if (Array.isArray(cleaned.analysis.antonyms)) {
        cleaned.analysis.antonyms = this.cleanArray(cleaned.analysis.antonyms);
      }
      if (Array.isArray(cleaned.analysis.usage_examples)) {
        cleaned.analysis.usage_examples = this.cleanArray(cleaned.analysis.usage_examples);
      }
    }
    
    return cleaned;
  }

  private static cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,;:!?'"()]/g, '')
      .trim();
  }

  private static cleanArray(arr: string[]): string[] {
    return arr
      .map(item => this.cleanText(item))
      .filter(item => item.length > 0)
      .filter((item, index, self) => self.indexOf(item) === index); // Remove duplicates
  }

  // Quality assessment
  static assessWordQuality(wordProfile: WordProfile): number {
    let score = 0;
    let maxScore = 0;

    // Essential fields (40 points)
    maxScore += 40;
    if (wordProfile.word) score += 10;
    if (wordProfile.definitions?.primary) score += 15;
    if (wordProfile.etymology?.language_of_origin) score += 10;
    if (wordProfile.analysis?.parts_of_speech) score += 5;

    // Morpheme breakdown (25 points)
    maxScore += 25;
    if (wordProfile.morpheme_breakdown?.root?.text) score += 10;
    if (wordProfile.morpheme_breakdown?.root?.meaning) score += 8;
    if (wordProfile.morpheme_breakdown?.prefix || wordProfile.morpheme_breakdown?.suffix) score += 7;

    // Enhanced content (25 points)
    maxScore += 25;
    if (wordProfile.analysis?.synonyms?.length > 0) score += 8;
    if (wordProfile.analysis?.usage_examples?.length > 0) score += 8;
    if (wordProfile.definitions?.standard?.length > 1) score += 9;

    // Etymology richness (10 points)
    maxScore += 10;
    if (wordProfile.etymology?.historical_origins) score += 5;
    if (wordProfile.etymology?.word_evolution) score += 5;

    return Math.round((score / maxScore) * 100);
  }

  // Identify missing fields
  static identifyMissingFields(wordProfile: WordProfile): string[] {
    const missing: string[] = [];

    if (!wordProfile.definitions?.primary) missing.push('primary_definition');
    if (!wordProfile.morpheme_breakdown?.root?.meaning) missing.push('root_meaning');
    if (!wordProfile.etymology?.language_of_origin) missing.push('language_origin');
    if (!wordProfile.analysis?.parts_of_speech) missing.push('parts_of_speech');
    if (!wordProfile.analysis?.synonyms?.length) missing.push('synonyms');
    if (!wordProfile.analysis?.usage_examples?.length) missing.push('usage_examples');
    if (!wordProfile.etymology?.historical_origins) missing.push('etymology');

    return missing;
  }

  // Single word enrichment via Edge Function
  static async enrichWord(
    wordId: string, 
    options: EnrichmentOptions = this.DEFAULT_OPTIONS
  ): Promise<EnrichmentResult> {
    try {
      console.log(`Starting enrichment for word ID: ${wordId}`);

      const { data, error } = await supabase.functions.invoke('enrich-word', {
        body: { wordId, options }
      });

      if (error) {
        console.error('Enrichment error:', error);
        throw error;
      }

      console.log(`Enrichment completed for word ID: ${wordId}`, data);
      return data;
    } catch (error) {
      console.error('Error enriching word:', error);
      return {
        word: wordId,
        success: false,
        changes: [],
        quality_score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Batch enrichment with progress tracking
  static async enrichWordsBatch(
    wordIds: string[],
    options: EnrichmentOptions = this.DEFAULT_OPTIONS,
    onProgress?: (progress: BatchEnrichmentProgress) => void
  ): Promise<EnrichmentResult[]> {
    const results: EnrichmentResult[] = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < wordIds.length; i++) {
      const wordId = wordIds[i];
      
      if (onProgress) {
        onProgress({
          total: wordIds.length,
          processed: i,
          successful,
          failed,
          currentWord: wordId
        });
      }

      try {
        const result = await this.enrichWord(wordId, options);
        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
        }

        // Rate limiting - wait between requests
        if (i < wordIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to enrich word ${wordId}:`, error);
        results.push({
          word: wordId,
          success: false,
          changes: [],
          quality_score: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failed++;
      }
    }

    // Final progress update
    if (onProgress) {
      onProgress({
        total: wordIds.length,
        processed: wordIds.length,
        successful,
        failed
      });
    }

    return results;
  }

  // Get words that need enrichment
  static async getWordsNeedingEnrichment(limit: number = 50): Promise<WordProfile[]> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Filter words with low quality scores
      return (data || []).filter(word => {
        const quality = this.assessWordQuality(word);
        return quality < 70; // Enrich words with quality score below 70%
      });
    } catch (error) {
      console.error('Error fetching words for enrichment:', error);
      return [];
    }
  }

  // Auto-enrichment initialization
  static async initializeAutoEnrichment(): Promise<void> {
    try {
      const wordsToEnrich = await this.getWordsNeedingEnrichment(20);
      
      if (wordsToEnrich.length === 0) {
        console.log('No words need enrichment');
        return;
      }

      console.log(`Found ${wordsToEnrich.length} words that need enrichment`);
      
      const wordIds = wordsToEnrich.map(word => word.id);
      const results = await this.enrichWordsBatch(wordIds);
      
      const successCount = results.filter(r => r.success).length;
      
      toast.success(`Enriched ${successCount}/${wordsToEnrich.length} words`);
    } catch (error) {
      console.error('Auto-enrichment failed:', error);
      toast.error('Failed to auto-enrich words');
    }
  }
}
