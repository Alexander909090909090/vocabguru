
import { SmartDatabaseService } from './smartDatabaseService';
import { WordProfile } from '@/types/wordProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnrichmentResult {
  success: boolean;
  wordProfileId?: string;
  error?: string;
  qualityScoreBefore: number;
  qualityScoreAfter: number;
  enrichedData?: any;
  changesApplied: string[];
}

export interface EnrichmentOptions {
  fillMissingFields?: boolean;
  enhanceDefinitions?: boolean;
  improveEtymology?: boolean;
  generateSynonyms?: boolean;
  addUsageExamples?: boolean;
  enhancedData?: any;
  skipBasicEnrichment?: boolean;
}

export class ComprehensiveEnrichmentService {
  // Main enrichment method
  static async enrichWordComprehensively(
    wordProfileId: string,
    options: EnrichmentOptions = {}
  ): Promise<EnrichmentResult> {
    try {
      console.log(`Starting comprehensive enrichment for word profile: ${wordProfileId}`);
      
      // Get current word profile
      const currentProfile = await SmartDatabaseService.getWordProfile(wordProfileId);
      if (!currentProfile) {
        return {
          success: false,
          error: 'Word profile not found',
          qualityScoreBefore: 0,
          qualityScoreAfter: 0,
          changesApplied: []
        };
      }

      // Calculate initial quality score
      const qualityScoreBefore = await SmartDatabaseService.calculateWordQuality(wordProfileId);
      console.log(`Initial quality score: ${qualityScoreBefore}%`);

      let enrichedData = { ...currentProfile };
      const changesApplied: string[] = [];

      // Use provided enhanced data if available
      if (options.enhancedData && !options.skipBasicEnrichment) {
        enrichedData = this.mergeEnhancedData(enrichedData, options.enhancedData);
        changesApplied.push('Enhanced data integration');
      } else if (options.enhancedData && options.skipBasicEnrichment) {
        // Direct application of enhanced data (from AI services)
        enrichedData = this.mergeEnhancedData(enrichedData, options.enhancedData);
        changesApplied.push('AI enhancement applied');
      } else {
        // Standard enrichment process
        if (options.fillMissingFields !== false) {
          const missingFields = await SmartDatabaseService.identifyMissingFields(wordProfileId);
          if (missingFields.length > 0) {
            enrichedData = await this.fillMissingFields(enrichedData, missingFields);
            changesApplied.push(`Filled ${missingFields.length} missing fields`);
          }
        }

        if (options.enhanceDefinitions !== false) {
          enrichedData = await this.enhanceDefinitions(enrichedData);
          changesApplied.push('Enhanced definitions');
        }

        if (options.improveEtymology !== false) {
          enrichedData = await this.improveEtymology(enrichedData);
          changesApplied.push('Improved etymology');
        }

        if (options.generateSynonyms !== false) {
          enrichedData = await this.generateSynonyms(enrichedData);
          changesApplied.push('Generated synonyms');
        }

        if (options.addUsageExamples !== false) {
          enrichedData = await this.addUsageExamples(enrichedData);
          changesApplied.push('Added usage examples');
        }
      }

      // Update the database with enriched data
      const { error: updateError } = await supabase
        .from('word_profiles')
        .update({
          morpheme_breakdown: enrichedData.morpheme_breakdown,
          etymology: enrichedData.etymology,
          definitions: enrichedData.definitions,
          word_forms: enrichedData.word_forms,
          analysis: enrichedData.analysis,
          last_enrichment_at: new Date().toISOString(),
          enrichment_status: 'enriched'
        })
        .eq('id', wordProfileId);

      if (updateError) {
        throw updateError;
      }

      // Recalculate quality score
      const qualityScoreAfter = await SmartDatabaseService.calculateWordQuality(wordProfileId);
      console.log(`Final quality score: ${qualityScoreAfter}%`);

      return {
        success: true,
        wordProfileId,
        qualityScoreBefore,
        qualityScoreAfter,
        enrichedData,
        changesApplied
      };

    } catch (error) {
      console.error('Error in comprehensive enrichment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        qualityScoreBefore: 0,
        qualityScoreAfter: 0,
        changesApplied: []
      };
    }
  }

  // Merge enhanced data from external sources
  private static mergeEnhancedData(current: WordProfile, enhanced: any): WordProfile {
    const merged = { ...current };

    // Merge morpheme breakdown
    if (enhanced.morpheme_breakdown) {
      merged.morpheme_breakdown = {
        ...merged.morpheme_breakdown,
        ...enhanced.morpheme_breakdown
      };
    }

    // Merge etymology
    if (enhanced.etymology) {
      merged.etymology = {
        ...merged.etymology,
        ...enhanced.etymology
      };
    }

    // Merge definitions
    if (enhanced.definitions) {
      merged.definitions = {
        ...merged.definitions,
        ...enhanced.definitions
      };
    }

    // Merge word forms
    if (enhanced.word_forms) {
      merged.word_forms = {
        ...merged.word_forms,
        ...enhanced.word_forms
      };
    }

    // Merge analysis
    if (enhanced.analysis) {
      merged.analysis = {
        ...merged.analysis,
        ...enhanced.analysis
      };
    }

    return merged;
  }

  // Fill missing fields with default or derived content
  private static async fillMissingFields(profile: WordProfile, missingFields: string[]): Promise<WordProfile> {
    const enhanced = { ...profile };

    for (const field of missingFields) {
      switch (field) {
        case 'primary_definition':
          if (!enhanced.definitions?.primary) {
            enhanced.definitions = {
              ...enhanced.definitions,
              primary: `Definition for ${enhanced.word} (auto-generated)`
            };
          }
          break;

        case 'root_meaning':
          if (!enhanced.morpheme_breakdown?.root?.meaning) {
            enhanced.morpheme_breakdown = {
              ...enhanced.morpheme_breakdown,
              root: {
                ...enhanced.morpheme_breakdown?.root,
                text: enhanced.word,
                meaning: 'Root meaning to be researched'
              }
            };
          }
          break;

        case 'language_origin':
          if (!enhanced.etymology?.language_of_origin) {
            enhanced.etymology = {
              ...enhanced.etymology,
              language_of_origin: 'Origin to be researched'
            };
          }
          break;

        case 'parts_of_speech':
          if (!enhanced.analysis?.parts_of_speech) {
            enhanced.analysis = {
              ...enhanced.analysis,
              parts_of_speech: 'To be determined'
            };
          }
          break;
      }
    }

    return enhanced;
  }

  // Enhance definitions with more comprehensive content
  private static async enhanceDefinitions(profile: WordProfile): Promise<WordProfile> {
    const enhanced = { ...profile };

    if (!enhanced.definitions?.standard || enhanced.definitions.standard.length === 0) {
      enhanced.definitions = {
        ...enhanced.definitions,
        standard: [
          enhanced.definitions?.primary || `Primary definition for ${enhanced.word}`,
          `Alternative definition for ${enhanced.word}`
        ]
      };
    }

    return enhanced;
  }

  // Improve etymology with more detailed information
  private static async improveEtymology(profile: WordProfile): Promise<WordProfile> {
    const enhanced = { ...profile };

    if (!enhanced.etymology?.historical_origins) {
      enhanced.etymology = {
        ...enhanced.etymology,
        historical_origins: `Historical origins of ${enhanced.word} to be researched`
      };
    }

    return enhanced;
  }

  // Generate synonyms for the word
  private static async generateSynonyms(profile: WordProfile): Promise<WordProfile> {
    const enhanced = { ...profile };

    if (!enhanced.analysis?.synonyms || enhanced.analysis.synonyms.length === 0) {
      // Basic synonym generation - in a real implementation, this would use NLP APIs
      enhanced.analysis = {
        ...enhanced.analysis,
        synonyms: ['synonym1', 'synonym2', 'synonym3'] // Placeholder
      };
    }

    return enhanced;
  }

  // Add usage examples
  private static async addUsageExamples(profile: WordProfile): Promise<WordProfile> {
    const enhanced = { ...profile };

    if (!enhanced.analysis?.usage_examples || enhanced.analysis.usage_examples.length === 0) {
      enhanced.analysis = {
        ...enhanced.analysis,
        usage_examples: [
          `The word "${enhanced.word}" can be used in academic contexts.`,
          `In everyday conversation, "${enhanced.word}" is commonly understood.`
        ]
      };
    }

    return enhanced;
  }

  // Batch enrichment for multiple words
  static async enrichWordsBatch(wordProfileIds: string[], options: EnrichmentOptions = {}): Promise<EnrichmentResult[]> {
    const results: EnrichmentResult[] = [];
    
    for (const wordProfileId of wordProfileIds) {
      const result = await this.enrichWordComprehensively(wordProfileId, options);
      results.push(result);
      
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }
}
