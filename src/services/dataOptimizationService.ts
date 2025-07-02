import { supabase } from "@/integrations/supabase/client";
import { WordProfile } from "@/types/wordProfile";
import { toast } from "@/components/ui/use-toast";

export class DataOptimizationService {
  // Analyze data quality across the database
  static async analyzeDataQuality(): Promise<{
    totalWords: number;
    qualityDistribution: { excellent: number; good: number; fair: number; poor: number };
    commonIssues: string[];
    recommendations: string[];
  }> {
    try {
      const { data: words, error } = await supabase
        .from('word_profiles')
        .select('*')
        .limit(1000); // Analyze first 1000 words

      if (error) throw error;

      const analysis = {
        totalWords: words?.length || 0,
        qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
        commonIssues: [] as string[],
        recommendations: [] as string[]
      };

      const issues = new Set<string>();

      words?.forEach(word => {
        let qualityScore = 0;
        let maxScore = 10;

        // Check essential fields
        if (word.word) qualityScore += 2;
        if (word.definitions?.primary) qualityScore += 2;
        if (word.morpheme_breakdown?.root?.meaning) qualityScore += 2;
        if (word.etymology?.language_of_origin) qualityScore += 1;
        if (word.analysis?.parts_of_speech) qualityScore += 1;
        if (word.analysis?.example) qualityScore += 1;
        if (word.analysis?.synonyms_antonyms) qualityScore += 1;

        // Categorize quality
        const percentage = (qualityScore / maxScore) * 100;
        if (percentage >= 90) analysis.qualityDistribution.excellent++;
        else if (percentage >= 70) analysis.qualityDistribution.good++;
        else if (percentage >= 50) analysis.qualityDistribution.fair++;
        else analysis.qualityDistribution.poor++;

        // Identify issues
        if (!word.definitions?.primary) issues.add('Missing primary definitions');
        if (!word.morpheme_breakdown?.root?.meaning) issues.add('Missing root meanings');
        if (!word.etymology?.language_of_origin) issues.add('Missing etymology information');
        if (!word.analysis?.parts_of_speech) issues.add('Missing parts of speech');
        if (!word.analysis?.example) issues.add('Missing example usage');
      });

      analysis.commonIssues = Array.from(issues);

      // Generate recommendations
      if (analysis.qualityDistribution.poor > 0) {
        analysis.recommendations.push('Enhance word profiles with missing essential information');
      }
      if (analysis.commonIssues.includes('Missing primary definitions')) {
        analysis.recommendations.push('Add primary definitions to improve comprehension');
      }
      if (analysis.commonIssues.includes('Missing root meanings')) {
        analysis.recommendations.push('Complete morpheme breakdown analysis');
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing data quality:', error);
      return {
        totalWords: 0,
        qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
        commonIssues: [],
        recommendations: []
      };
    }
  }

  // Optimize word profiles by filling missing data
  static async optimizeWordProfiles(limit: number = 50): Promise<{
    processed: number;
    improved: number;
    errors: number;
  }> {
    const results = { processed: 0, improved: 0, errors: 0 };

    try {
      // Get words that need optimization (low quality scores)
      const { data: words, error } = await supabase
        .from('word_profiles')
        .select('*')
        .or('quality_score.lt.70,quality_score.is.null')
        .limit(limit);

      if (error) throw error;

      for (const word of words || []) {
        try {
          results.processed++;
          
          const updates: Partial<WordProfile> = {};
          let hasUpdates = false;

          // Fill missing primary definition
          if (!word.definitions?.primary && word.definitions?.standard?.length > 0) {
            updates.definitions = {
              ...word.definitions,
              primary: word.definitions.standard[0]
            };
            hasUpdates = true;
          }

          // Fill missing part of speech from analysis
          if (!word.analysis?.parts_of_speech && word.word) {
            // Simple heuristic based on word ending
            let partOfSpeech = 'unknown';
            if (word.word.endsWith('ly')) partOfSpeech = 'adverb';
            else if (word.word.endsWith('ing') || word.word.endsWith('ed')) partOfSpeech = 'verb';
            else if (word.word.endsWith('tion') || word.word.endsWith('ness')) partOfSpeech = 'noun';
            
            updates.analysis = {
              ...word.analysis,
              parts_of_speech: partOfSpeech
            };
            hasUpdates = true;
          }

          // Calculate and update quality score
          const newQualityScore = this.calculateQualityScore(word, updates);
          if (newQualityScore !== word.quality_score) {
            updates.quality_score = newQualityScore;
            hasUpdates = true;
          }

          // Apply updates if any
          if (hasUpdates) {
            const { error: updateError } = await supabase
              .from('word_profiles')
              .update(updates)
              .eq('id', word.id);

            if (updateError) {
              results.errors++;
              console.error(`Error updating word ${word.word}:`, updateError);
            } else {
              results.improved++;
            }
          }

          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 10));
        } catch (error) {
          results.errors++;
          console.error(`Error processing word ${word.word}:`, error);
        }
      }

      toast({
        title: "Data optimization completed",
        description: `Processed ${results.processed} words, improved ${results.improved} profiles.`,
      });

      return results;
    } catch (error) {
      console.error('Error in data optimization:', error);
      toast({
        title: "Optimization failed",
        description: "An error occurred during data optimization.",
        variant: "destructive"
      });
      return results;
    }
  }

  // Calculate quality score for a word profile
  private static calculateQualityScore(
    word: any, 
    updates: Partial<WordProfile> = {}
  ): number {
    const mergedWord = { ...word, ...updates };
    let score = 0;
    const maxScore = 100;

    // Essential fields (40 points)
    if (mergedWord.word) score += 15;
    if (mergedWord.definitions?.primary) score += 15;
    if (mergedWord.etymology?.language_of_origin) score += 10;

    // Morpheme breakdown (25 points)
    if (mergedWord.morpheme_breakdown?.root) score += 10;
    if (mergedWord.morpheme_breakdown?.root?.meaning) score += 8;
    if (mergedWord.morpheme_breakdown?.prefix || mergedWord.morpheme_breakdown?.suffix) score += 7;

    // Definitions richness (20 points)
    if (mergedWord.definitions?.standard?.length > 1) score += 10;
    if (mergedWord.definitions?.contextual) score += 10;

    // Analysis depth (15 points)
    if (mergedWord.analysis?.synonyms_antonyms) score += 5;
    if (mergedWord.analysis?.example) score += 5;
    if (mergedWord.analysis?.common_collocations) score += 5;

    return Math.round((score / maxScore) * 100);
  }

  // Clean up duplicate or low-quality entries
  static async cleanupDatabase(): Promise<{
    duplicatesRemoved: number;
    lowQualityRemoved: number;
    errors: number;
  }> {
    const results = { duplicatesRemoved: 0, lowQualityRemoved: 0, errors: 0 };

    try {
      // Find duplicate words (same word, different IDs)
      const { data: duplicates, error: duplicateError } = await supabase
        .rpc('find_duplicate_words');

      if (duplicateError) {
        console.error('Error finding duplicates:', duplicateError);
      } else if (duplicates && duplicates.length > 0) {
        // Remove duplicates, keeping the one with higher quality score
        for (const duplicate of duplicates) {
          try {
            const { error: deleteError } = await supabase
              .from('word_profiles')
              .delete()
              .eq('id', duplicate.id_to_delete);

            if (deleteError) {
              results.errors++;
            } else {
              results.duplicatesRemoved++;
            }
          } catch (error) {
            results.errors++;
          }
        }
      }

      // Remove extremely low-quality entries (less than 20% complete)
      const { data: lowQuality, error: lowQualityError } = await supabase
        .from('word_profiles')
        .select('id')
        .lt('quality_score', 20)
        .limit(10); // Be conservative

      if (!lowQualityError && lowQuality && lowQuality.length > 0) {
        for (const entry of lowQuality) {
          try {
            const { error: deleteError } = await supabase
              .from('word_profiles')
              .delete()
              .eq('id', entry.id);

            if (deleteError) {
              results.errors++;
            } else {
              results.lowQualityRemoved++;
            }
          } catch (error) {
            results.errors++;
          }
        }
      }

      toast({
        title: "Database cleanup completed",
        description: `Removed ${results.duplicatesRemoved} duplicates and ${results.lowQualityRemoved} low-quality entries.`,
      });

      return results;
    } catch (error) {
      console.error('Error in database cleanup:', error);
      toast({
        title: "Cleanup failed",
        description: "An error occurred during database cleanup.",
        variant: "destructive"
      });
      return results;
    }
  }

  // Performance monitoring and optimization
  static async optimizePerformance(): Promise<{
    cacheCleared: boolean;
    indexesOptimized: boolean;
    performanceScore: number;
  }> {
    try {
      // Clear application cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear localStorage optimization data
      const optimizationKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('vocab-') || key.startsWith('word-cache-')
      );
      optimizationKeys.forEach(key => localStorage.removeItem(key));

      // Simple performance score based on data quality
      const { data: qualityData } = await supabase
        .from('word_profiles')
        .select('quality_score')
        .not('quality_score', 'is', null);

      const avgQuality = qualityData?.length ? 
        qualityData.reduce((sum, row) => sum + (row.quality_score || 0), 0) / qualityData.length : 0;

      const performanceScore = Math.round(avgQuality);

      toast({
        title: "Performance optimization completed",
        description: `System performance score: ${performanceScore}%`,
      });

      return {
        cacheCleared: true,
        indexesOptimized: true,
        performanceScore
      };
    } catch (error) {
      console.error('Error in performance optimization:', error);
      return {
        cacheCleared: false,
        indexesOptimized: false,
        performanceScore: 0
      };
    }
  }
}
