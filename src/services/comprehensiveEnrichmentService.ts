
import { supabase } from "@/integrations/supabase/client";
import { WordProfile } from "@/types/wordProfile";
import { SmartDatabaseService } from "./smartDatabaseService";
import { toast } from "sonner";

export interface EnrichmentResult {
  success: boolean;
  wordProfileId: string;
  qualityScoreBefore: number;
  qualityScoreAfter: number;
  fieldsEnriched: string[];
  sourcesUsed: string[];
  error?: string;
}

export interface MultiSourceData {
  wiktionary?: any;
  wordnet?: any;
  merriamWebster?: any;
  datamuse?: any;
  aiGenerated?: any;
}

export class ComprehensiveEnrichmentService {
  private static readonly AI_MODEL_PREFERENCES = [
    'gpt-4.1-2025-04-14',
    'o4-mini-2025-04-16',
    'gpt-4.1-mini-2025-04-14'
  ];

  // Main enrichment orchestrator
  static async enrichWordComprehensively(wordProfileId: string): Promise<EnrichmentResult> {
    const startTime = Date.now();
    let qualityScoreBefore = 0;
    let qualityScoreAfter = 0;
    const fieldsEnriched: string[] = [];
    const sourcesUsed: string[] = [];

    try {
      // Get current word profile
      const { data: currentProfile, error: profileError } = await supabase
        .from('word_profiles')
        .select('*')
        .eq('id', wordProfileId)
        .single();

      if (profileError) throw profileError;

      qualityScoreBefore = await SmartDatabaseService.calculateWordQuality(wordProfileId);
      const missingFields = await SmartDatabaseService.identifyMissingFields(wordProfileId);

      console.log(`Starting enrichment for "${currentProfile.word}" - Quality: ${qualityScoreBefore}%`);
      console.log('Missing fields:', missingFields);

      // Gather data from multiple sources
      const multiSourceData = await this.gatherMultiSourceData(currentProfile.word);
      
      // Merge and normalize data
      const enrichedData = await this.mergeAndNormalizeData(currentProfile, multiSourceData, missingFields);

      // Apply AI enhancement for remaining gaps
      const aiEnhancedData = await this.applyAIEnhancement(enrichedData, missingFields);

      // Update word profile with enriched data
      const { error: updateError } = await supabase
        .from('word_profiles')
        .update({
          ...aiEnhancedData,
          last_enrichment_at: new Date().toISOString(),
          enrichment_status: 'completed',
          data_sources: [...(currentProfile.data_sources || []), ...sourcesUsed]
        })
        .eq('id', wordProfileId);

      if (updateError) throw updateError;

      // Calculate new quality score
      qualityScoreAfter = await SmartDatabaseService.calculateWordQuality(wordProfileId);

      // Save source data for transparency
      for (const [sourceName, sourceData] of Object.entries(multiSourceData)) {
        if (sourceData) {
          await SmartDatabaseService.saveApiSourceData(
            wordProfileId,
            sourceName,
            sourceData,
            this.calculateSourceConfidence(sourceName, sourceData)
          );
          sourcesUsed.push(sourceName);
        }
      }

      // Audit the enriched profile
      await SmartDatabaseService.auditWordProfile(wordProfileId);

      console.log(`Enrichment completed for "${currentProfile.word}" - New Quality: ${qualityScoreAfter}%`);

      return {
        success: true,
        wordProfileId,
        qualityScoreBefore,
        qualityScoreAfter,
        fieldsEnriched,
        sourcesUsed
      };

    } catch (error) {
      console.error('Comprehensive enrichment failed:', error);
      
      return {
        success: false,
        wordProfileId,
        qualityScoreBefore,
        qualityScoreAfter: qualityScoreBefore,
        fieldsEnriched,
        sourcesUsed,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Multi-source data gathering
  private static async gatherMultiSourceData(word: string): Promise<MultiSourceData> {
    const sources: MultiSourceData = {};

    // Parallel data fetching from multiple sources
    const dataPromises = [
      this.fetchWiktionaryData(word).then(data => { sources.wiktionary = data; }),
      this.fetchWordNetData(word).then(data => { sources.wordnet = data; }),
      this.fetchMerriamWebsterData(word).then(data => { sources.merriamWebster = data; }),
      this.fetchDatamuseData(word).then(data => { sources.datamuse = data; })
    ];

    // Wait for all sources with timeout
    await Promise.allSettled(dataPromises);

    return sources;
  }

  // Individual source fetchers
  private static async fetchWiktionaryData(word: string): Promise<any> {
    try {
      const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Wiktionary fetch failed:', error);
    }
    return null;
  }

  private static async fetchWordNetData(word: string): Promise<any> {
    try {
      // WordNet API or similar service
      const response = await fetch(`https://api.wordnik.com/v4/word.json/${encodeURIComponent(word)}/definitions?limit=5&includeRelated=true&useCanonical=false&includeTags=false&api_key=public`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('WordNet fetch failed:', error);
    }
    return null;
  }

  private static async fetchMerriamWebsterData(word: string): Promise<any> {
    try {
      // Free Merriam-Webster Dictionary API
      const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}?key=public`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Merriam-Webster fetch failed:', error);
    }
    return null;
  }

  private static async fetchDatamuseData(word: string): Promise<any> {
    try {
      const [synonyms, rhymes, related] = await Promise.all([
        fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`).then(r => r.json()),
        fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=5`).then(r => r.json()),
        fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=10`).then(r => r.json())
      ]);

      return { synonyms, rhymes, related };
    } catch (error) {
      console.log('Datamuse fetch failed:', error);
    }
    return null;
  }

  // Data merging and normalization
  private static async mergeAndNormalizeData(
    currentProfile: WordProfile,
    multiSourceData: MultiSourceData,
    missingFields: string[]
  ): Promise<Partial<WordProfile>> {
    const enrichedData: Partial<WordProfile> = { ...currentProfile };

    // Merge definitions from multiple sources
    if (missingFields.includes('primary_definition') || !currentProfile.definitions?.primary) {
      enrichedData.definitions = this.mergeDefinitions(currentProfile.definitions, multiSourceData);
    }

    // Enhance etymology from multiple sources
    if (missingFields.includes('language_origin') || !currentProfile.etymology?.language_of_origin) {
      enrichedData.etymology = this.mergeEtymology(currentProfile.etymology, multiSourceData);
    }

    // Enrich analysis data
    if (missingFields.includes('synonyms') || missingFields.includes('usage_examples')) {
      enrichedData.analysis = this.mergeAnalysis(currentProfile.analysis, multiSourceData);
    }

    return enrichedData;
  }

  private static mergeDefinitions(current: any, sources: MultiSourceData): any {
    const definitions = current || {};
    const definitionsList: string[] = [];

    // Extract definitions from various sources
    if (sources.wiktionary?.en) {
      sources.wiktionary.en.forEach((entry: any) => {
        if (entry.definitions) {
          entry.definitions.forEach((def: any) => {
            if (def.definition && typeof def.definition === 'string') {
              definitionsList.push(def.definition.replace(/[{}]/g, ''));
            }
          });
        }
      });
    }

    if (sources.wordnet && Array.isArray(sources.wordnet)) {
      sources.wordnet.forEach((def: any) => {
        if (def.text) {
          definitionsList.push(def.text);
        }
      });
    }

    // Set primary definition if missing
    if (!definitions.primary && definitionsList.length > 0) {
      definitions.primary = definitionsList[0];
    }

    // Set standard definitions
    if (!definitions.standard || definitions.standard.length === 0) {
      definitions.standard = definitionsList.slice(0, 5).filter(def => def !== definitions.primary);
    }

    return definitions;
  }

  private static mergeEtymology(current: any, sources: MultiSourceData): any {
    const etymology = current || {};

    // Try to extract etymology from sources
    if (sources.wiktionary?.en) {
      sources.wiktionary.en.forEach((entry: any) => {
        if (entry.etymology && !etymology.historical_origins) {
          etymology.historical_origins = entry.etymology;
        }
      });
    }

    return etymology;
  }

  private static mergeAnalysis(current: any, sources: MultiSourceData): any {
    const analysis = current || {};

    // Add synonyms from Datamuse
    if (sources.datamuse?.synonyms && (!analysis.synonyms || analysis.synonyms.length === 0)) {
      analysis.synonyms = sources.datamuse.synonyms.map((syn: any) => syn.word).slice(0, 8);
    }

    return analysis;
  }

  // AI Enhancement for remaining gaps
  private static async applyAIEnhancement(
    enrichedData: Partial<WordProfile>,
    missingFields: string[]
  ): Promise<Partial<WordProfile>> {
    try {
      // Use existing enrich-word edge function for AI enhancement
      const { data: aiEnhancement, error } = await supabase.functions.invoke('enrich-word', {
        body: {
          word: enrichedData.word,
          currentData: enrichedData,
          missingFields,
          enhancementLevel: 'comprehensive'
        }
      });

      if (error) {
        console.error('AI enhancement failed:', error);
        return enrichedData;
      }

      // Merge AI enhancements with existing data
      return this.mergeAIEnhancements(enrichedData, aiEnhancement);

    } catch (error) {
      console.error('AI enhancement error:', error);
      return enrichedData;
    }
  }

  private static mergeAIEnhancements(current: Partial<WordProfile>, aiData: any): Partial<WordProfile> {
    const merged = { ...current };

    // Intelligently merge AI-generated data
    if (aiData.definitions && (!merged.definitions?.primary || merged.definitions.primary.length < 10)) {
      merged.definitions = { ...merged.definitions, ...aiData.definitions };
    }

    if (aiData.morpheme_breakdown && Object.keys(merged.morpheme_breakdown || {}).length < 2) {
      merged.morpheme_breakdown = { ...merged.morpheme_breakdown, ...aiData.morpheme_breakdown };
    }

    if (aiData.etymology && (!merged.etymology?.language_of_origin || merged.etymology.language_of_origin === 'Unknown')) {
      merged.etymology = { ...merged.etymology, ...aiData.etymology };
    }

    if (aiData.analysis) {
      merged.analysis = { ...merged.analysis, ...aiData.analysis };
    }

    return merged;
  }

  // Batch enrichment methods
  static async enrichBatch(wordProfileIds: string[], batchSize: number = 5): Promise<EnrichmentResult[]> {
    const results: EnrichmentResult[] = [];
    
    for (let i = 0; i < wordProfileIds.length; i += batchSize) {
      const batch = wordProfileIds.slice(i, i + batchSize);
      const batchPromises = batch.map(id => this.enrichWordComprehensively(id));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });

      // Brief pause between batches to avoid overwhelming APIs
      if (i + batchSize < wordProfileIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  static async processEnrichmentQueue(maxItems: number = 10): Promise<void> {
    try {
      const queueItems = await SmartDatabaseService.getEnrichmentQueue(maxItems);
      const pendingItems = queueItems.filter(item => item.status === 'pending');

      console.log(`Processing ${pendingItems.length} items from enrichment queue`);

      for (const item of pendingItems) {
        try {
          await SmartDatabaseService.updateEnrichmentStatus(item.id, 'processing');
          const result = await this.enrichWordComprehensively(item.word_profile_id);
          
          if (result.success) {
            await SmartDatabaseService.updateEnrichmentStatus(item.id, 'completed');
          } else {
            await SmartDatabaseService.updateEnrichmentStatus(item.id, 'failed', result.error);
          }
        } catch (error) {
          await SmartDatabaseService.updateEnrichmentStatus(
            item.id, 
            'failed', 
            error instanceof Error ? error.message : 'Processing failed'
          );
        }
      }

    } catch (error) {
      console.error('Error processing enrichment queue:', error);
    }
  }

  // Utility methods
  private static calculateSourceConfidence(sourceName: string, sourceData: any): number {
    if (!sourceData) return 0;

    switch (sourceName) {
      case 'wiktionary':
        return sourceData.en && sourceData.en.length > 0 ? 0.8 : 0.3;
      case 'wordnet':
        return Array.isArray(sourceData) && sourceData.length > 0 ? 0.9 : 0.3;
      case 'merriamWebster':
        return Array.isArray(sourceData) && sourceData.length > 0 ? 0.95 : 0.3;
      case 'datamuse':
        return sourceData.synonyms && sourceData.synonyms.length > 0 ? 0.7 : 0.3;
      default:
        return 0.5;
    }
  }
}
