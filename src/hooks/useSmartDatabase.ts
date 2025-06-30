
import { useState, useEffect } from 'react';
import { SmartDatabaseService, DataQualityAudit, EnrichmentQueueItem } from '@/services/smartDatabaseService';
import { ComprehensiveEnrichmentService, EnrichmentResult } from '@/services/comprehensiveEnrichmentService';
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

  const enrichWord = async (wordProfileId: string): Promise<EnrichmentResult | null> => {
    setIsProcessing(true);
    try {
      const result = await ComprehensiveEnrichmentService.enrichWordComprehensively(wordProfileId);
      
      if (result.success) {
        toast.success(`Word enriched! Quality improved from ${result.qualityScoreBefore}% to ${result.qualityScoreAfter}%`);
        await loadInitialData(); // Refresh stats
      } else {
        toast.error(`Enrichment failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error enriching word:', error);
      toast.error('Failed to enrich word');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const enrichBatch = async (wordProfileIds: string[]): Promise<EnrichmentResult[]> => {
    setIsProcessing(true);
    try {
      const results = await ComprehensiveEnrichmentService.enrichBatch(wordProfileIds);
      const successful = results.filter(r => r.success).length;
      
      toast.success(`Batch enrichment completed: ${successful}/${results.length} words improved`);
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
      await ComprehensiveEnrichmentService.processEnrichmentQueue(maxItems);
      toast.success(`Processed up to ${maxItems} items from enrichment queue`);
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
      toast.success('Word queued for enrichment');
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
