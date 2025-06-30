
import { supabase } from "@/integrations/supabase/client";
import { WordProfile } from "@/types/wordProfile";
import { toast } from "sonner";

export interface DataQualityAudit {
  id: string;
  word_profile_id: string;
  audit_type: string;
  quality_score: number;
  missing_fields: string[];
  validation_errors: string[];
  suggestions: string[];
  created_at: string;
}

export interface EnrichmentQueueItem {
  id: string;
  word_profile_id: string;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface ApiSourceData {
  id: string;
  word_profile_id: string;
  source_name: string;
  raw_data: any;
  confidence_score: number;
  created_at: string;
}

export class SmartDatabaseService {
  // Quality Assessment Methods
  static async calculateWordQuality(wordProfileId: string): Promise<number> {
    try {
      const { data: profile, error } = await supabase
        .from('word_profiles')
        .select('*')
        .eq('id', wordProfileId)
        .single();

      if (error) throw error;

      const { data: qualityScore, error: calcError } = await supabase
        .rpc('calculate_word_completeness', {
          word_data: profile.morpheme_breakdown || {},
          definitions_data: profile.definitions || {},
          etymology_data: profile.etymology || {},
          analysis_data: profile.analysis || {}
        });

      if (calcError) throw calcError;

      return qualityScore || 0;
    } catch (error) {
      console.error('Error calculating word quality:', error);
      return 0;
    }
  }

  static async identifyMissingFields(wordProfileId: string): Promise<string[]> {
    try {
      const { data: missingFields, error } = await supabase
        .rpc('identify_missing_fields', { word_profile_id: wordProfileId });

      if (error) throw error;

      return missingFields || [];
    } catch (error) {
      console.error('Error identifying missing fields:', error);
      return [];
    }
  }

  static async auditWordProfile(wordProfileId: string): Promise<DataQualityAudit | null> {
    try {
      const qualityScore = await this.calculateWordQuality(wordProfileId);
      const missingFields = await this.identifyMissingFields(wordProfileId);

      const { data, error } = await supabase
        .from('data_quality_audits')
        .insert({
          word_profile_id: wordProfileId,
          audit_type: 'comprehensive',
          quality_score: qualityScore,
          missing_fields: missingFields,
          validation_errors: [],
          suggestions: this.generateSuggestions(missingFields, qualityScore)
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error auditing word profile:', error);
      return null;
    }
  }

  // Enrichment Queue Management
  static async queueWordForEnrichment(wordProfileId: string, priority: number = 1): Promise<void> {
    try {
      await supabase.rpc('queue_word_for_enrichment', {
        word_profile_id: wordProfileId,
        enrichment_priority: priority
      });
    } catch (error) {
      console.error('Error queuing word for enrichment:', error);
      throw error;
    }
  }

  static async getEnrichmentQueue(limit: number = 50): Promise<EnrichmentQueueItem[]> {
    try {
      const { data, error } = await supabase
        .from('enrichment_queue')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching enrichment queue:', error);
      return [];
    }
  }

  static async updateEnrichmentStatus(queueId: string, status: string, errorMessage?: string): Promise<void> {
    try {
      const updateData: any = { status };
      
      if (status === 'processing') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed' || status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      const { error } = await supabase
        .from('enrichment_queue')
        .update(updateData)
        .eq('id', queueId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating enrichment status:', error);
      throw error;
    }
  }

  // API Source Data Management
  static async saveApiSourceData(
    wordProfileId: string,
    sourceName: string,
    rawData: any,
    confidenceScore: number = 0.5
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_source_data')
        .insert({
          word_profile_id: wordProfileId,
          source_name: sourceName,
          raw_data: rawData,
          confidence_score: confidenceScore
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving API source data:', error);
      throw error;
    }
  }

  static async getApiSourceData(wordProfileId: string): Promise<ApiSourceData[]> {
    try {
      const { data, error } = await supabase
        .from('api_source_data')
        .select('*')
        .eq('word_profile_id', wordProfileId)
        .order('confidence_score', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching API source data:', error);
      return [];
    }
  }

  // Batch Operations
  static async batchAuditWords(wordProfileIds: string[]): Promise<void> {
    const auditPromises = wordProfileIds.map(id => this.auditWordProfile(id));
    await Promise.allSettled(auditPromises);
  }

  static async getWordsNeedingEnrichment(limit: number = 100): Promise<WordProfile[]> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .or('quality_score.lt.70,completeness_score.lt.80,enrichment_status.eq.pending')
        .order('quality_score', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching words needing enrichment:', error);
      return [];
    }
  }

  // Utility Methods
  private static generateSuggestions(missingFields: string[], qualityScore: number): string[] {
    const suggestions: string[] = [];

    if (missingFields.includes('primary_definition')) {
      suggestions.push('Add a clear primary definition');
    }
    if (missingFields.includes('root_meaning')) {
      suggestions.push('Provide morphological root meaning');
    }
    if (missingFields.includes('language_origin')) {
      suggestions.push('Research etymological origins');
    }
    if (missingFields.includes('synonyms')) {
      suggestions.push('Add relevant synonyms');
    }
    if (missingFields.includes('usage_examples')) {
      suggestions.push('Include contextual usage examples');
    }

    if (qualityScore < 50) {
      suggestions.push('Priority enrichment needed - missing critical data');
    } else if (qualityScore < 80) {
      suggestions.push('Moderate enrichment needed - some fields incomplete');
    }

    return suggestions;
  }

  static async getQualityStatistics(): Promise<{
    totalWords: number;
    highQuality: number;
    mediumQuality: number;
    lowQuality: number;
    averageScore: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('quality_score')
        .not('quality_score', 'is', null);

      if (error) throw error;

      const scores = data.map(item => item.quality_score || 0);
      const totalWords = scores.length;
      const highQuality = scores.filter(score => score >= 80).length;
      const mediumQuality = scores.filter(score => score >= 50 && score < 80).length;
      const lowQuality = scores.filter(score => score < 50).length;
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalWords;

      return {
        totalWords,
        highQuality,
        mediumQuality,
        lowQuality,
        averageScore: Math.round(averageScore * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating quality statistics:', error);
      return {
        totalWords: 0,
        highQuality: 0,
        mediumQuality: 0,
        lowQuality: 0,
        averageScore: 0
      };
    }
  }
}
