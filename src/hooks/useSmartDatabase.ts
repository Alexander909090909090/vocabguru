
import { useState, useEffect } from 'react';
import { SmartDatabaseService, DataQualityAudit, EnrichmentQueueItem } from '@/services/smartDatabaseService';
import { ComprehensiveEnrichmentService, EnrichmentResult } from '@/services/comprehensiveEnrichmentService';
import { CalvarnIntegrationService } from '@/services/calvarnIntegrationService';
import { MultiSourceDataService } from '@/services/multiSourceDataService';
import { IntelligentDataCleaningService } from '@/services/intelligentDataCleaningService';
import { WordProfile } from '@/types/wordProfile';
import { toast } from 'sonner';

export function useSmartDatabase() {
  const [qualityStats, setQualityStats] = useState({
    totalWords: 0,
    highQuality: 0,
    mediumQuality: 0,
    lowQuality: 0,
    averageScore: 0
  });
  const [enrichmentQueue, setEnrichmentQueue] = useState<EnrichmentQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [stats, queue] = await Promise.all([
        SmartDatabaseService.getQualityStatistics(),
        SmartDatabaseService.getEnrichmentQueue(20)
      ]);
      
      setQualityStats(stats);
      setEnrichmentQueue(queue);
    } catch (error) {
      console.error('Error loading smart database data:', error);
      toast.error('Failed to load database statistics');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced enrichment with Calvarn integration
  const enrichWord = async (wordProfileId: string): Promise<EnrichmentResult | null> => {
    setIsProcessing(true);
    try {
      // Get current word data
      const currentData = await SmartDatabaseService.getWordProfile(wordProfileId);
      if (!currentData) {
        throw new Error('Word profile not found');
      }

      console.log(`Starting enhanced enrichment for "${currentData.word}"`);

      // Step 1: Multi-source data aggregation
      const aggregatedData = await MultiSourceDataService.aggregateFromAllSources(currentData.word);
      
      // Step 2: Intelligent data cleaning
      const cleaningResult = await IntelligentDataCleaningService.cleanAndNormalizeData({
        ...currentData,
        ...aggregatedData.mergedData
      });

      // Step 3: Calvarn AI enhancement
      const calvarnResult = await CalvarnIntegrationService.enrichWithCalvarn({
        word: currentData.word,
        currentData: cleaningResult.cleanedData,
        enrichmentType: 'comprehensive'
      });

      let finalEnrichedData = cleaningResult.cleanedData;
      let aiSource = 'cleaning_only';

      // If Calvarn enrichment was successful, merge its data
      if (calvarnResult.success && calvarnResult.enrichedData) {
        finalEnrichedData = {
          ...finalEnrichedData,
          ...calvarnResult.enrichedData
        };
        aiSource = calvarnResult.source;
      }

      // Step 4: Final comprehensive enrichment (fallback/enhancement)
      const result = await ComprehensiveEnrichmentService.enrichWordComprehensively(wordProfileId, {
        enhancedData: finalEnrichedData,
        skipBasicEnrichment: true
      });
      
      if (result.success) {
        toast.success(`Word enriched with ${aiSource}! Quality improved from ${result.qualityScoreBefore}% to ${result.qualityScoreAfter}%`);
        await loadInitialData(); // Refresh stats
        
        // Log the enrichment sources used
        console.log(`Enrichment completed for "${currentData.word}":`, {
          sources: aggregatedData.sources.map(s => s.name),
          cleaningChanges: cleaningResult.changes,
          aiSource,
          qualityImprovement: result.qualityScoreAfter - result.qualityScoreBefore
        });
      } else {
        toast.error(`Enrichment failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error in enhanced enrichment:', error);
      toast.error('Failed to enrich word');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const enrichBatch = async (wordProfileIds: string[]): Promise<EnrichmentResult[]> => {
    setIsProcessing(true);
    try {
      const results: EnrichmentResult[] = [];
      
      // Process in smaller batches to avoid overwhelming the system
      const batchSize = 3;
      for (let i = 0; i < wordProfileIds.length; i += batchSize) {
        const batch = wordProfileIds.slice(i, i + batchSize);
        
        const batchResults = await Promise.all(
          batch.map(id => enrichWord(id))
        );
        
        results.push(...batchResults.filter(Boolean) as EnrichmentResult[]);
        
        // Small delay between batches
        if (i + batchSize < wordProfileIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      const successful = results.filter(r => r.success).length;
      toast.success(`Enhanced batch enrichment completed: ${successful}/${results.length} words improved`);
      await loadInitialData(); // Refresh stats
      
      return results;
    } catch (error) {
      console.error('Error in batch enrichment:', error);
      toast.error('Batch enrichment failed');
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const processQueue = async (maxItems: number = 10): Promise<void> => {
    setIsProcessing(true);
    try {
      const queueItems = await SmartDatabaseService.getEnrichmentQueue(maxItems);
      const results: EnrichmentResult[] = [];
      
      for (const item of queueItems) {
        if (item.word_profile_id) {
          const result = await enrichWord(item.word_profile_id);
          if (result) {
            results.push(result);
          }
        }
      }
      
      const successful = results.filter(r => r.success).length;
      toast.success(`Processed ${successful}/${queueItems.length} items from enrichment queue`);
      await loadInitialData(); // Refresh stats
    } catch (error) {
      console.error('Error processing queue:', error);
      toast.error('Failed to process enrichment queue');
    } finally {
      setIsProcessing(false);
    }
  };

  const queueWordForEnrichment = async (wordProfileId: string, priority: number = 1): Promise<void> => {
    try {
      await SmartDatabaseService.queueWordForEnrichment(wordProfileId, priority);
      toast.success('Word queued for enhanced enrichment');
      await loadInitialData(); // Refresh queue
    } catch (error) {
      console.error('Error queuing word:', error);
      toast.error('Failed to queue word for enrichment');
    }
  };

  const auditWord = async (wordProfileId: string): Promise<DataQualityAudit | null> => {
    try {
      const audit = await SmartDatabaseService.auditWordProfile(wordProfileId);
      if (audit) {
        toast.success(`Word audit completed - Quality: ${audit.quality_score}%`);
      }
      return audit;
    } catch (error) {
      console.error('Error auditing word:', error);
      toast.error('Failed to audit word');
      return null;
    }
  };

  const getWordsNeedingEnrichment = async (limit: number = 50): Promise<WordProfile[]> => {
    try {
      return await SmartDatabaseService.getWordsNeedingEnrichment(limit);
    } catch (error) {
      console.error('Error fetching words needing enrichment:', error);
      return [];
    }
  };

  // New method for Calvarn-specific enrichment
  const enrichWithCalvarn = async (wordProfileId: string): Promise<EnrichmentResult | null> => {
    setIsProcessing(true);
    try {
      const currentData = await SmartDatabaseService.getWordProfile(wordProfileId);
      if (!currentData) {
        throw new Error('Word profile not found');
      }

      const calvarnResult = await CalvarnIntegrationService.enrichWithCalvarn({
        word: currentData.word,
        currentData,
        enrichmentType: 'comprehensive'
      });

      if (calvarnResult.success) {
        // Apply the Calvarn enrichment to the database
        const result = await ComprehensiveEnrichmentService.enrichWordComprehensively(wordProfileId, {
          enhancedData: calvarnResult.enrichedData,
          skipBasicEnrichment: true
        });

        if (result.success) {
          toast.success(`Calvarn enrichment completed! Quality: ${result.qualityScoreAfter}%`);
          await loadInitialData();
        }

        return result;
      } else {
        toast.error(`Calvarn enrichment failed: ${calvarnResult.error}`);
        return null;
      }
    } catch (error) {
      console.error('Error in Calvarn enrichment:', error);
      toast.error('Failed to enrich with Calvarn');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    // Data
    qualityStats,
    enrichmentQueue,
    loading,
    isProcessing,
    
    // Actions
    enrichWord,
    enrichBatch,
    processQueue,
    queueWordForEnrichment,
    auditWord,
    getWordsNeedingEnrichment,
    enrichWithCalvarn,
    refreshData: loadInitialData
  };
}

export function useWordQuality(wordProfileId: string) {
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wordProfileId) {
      loadWordQuality();
    }
  }, [wordProfileId]);

  const loadWordQuality = async () => {
    setLoading(true);
    try {
      const [score, missing] = await Promise.all([
        SmartDatabaseService.calculateWordQuality(wordProfileId),
        SmartDatabaseService.identifyMissingFields(wordProfileId)
      ]);
      
      setQualityScore(score);
      setMissingFields(missing);
    } catch (error) {
      console.error('Error loading word quality:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshQuality = () => {
    loadWordQuality();
  };

  return {
    qualityScore,
    missingFields,
    loading,
    refreshQuality
  };
}
