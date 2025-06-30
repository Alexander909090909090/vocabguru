import { supabase } from "@/integrations/supabase/client";
import { WordProfile, WebhookLog } from "@/types/wordProfile";
import { RoleService } from "./roleService";
import { PerformanceOptimizationService } from "./performanceOptimizationService";
import { QualityAssuranceService } from "./qualityAssuranceService";
import { PersonalizationService } from "./personalizationService";
import { toast } from "sonner";

// Helper function to safely parse JSON fields
const parseJsonField = <T>(field: any, fallback: T): T => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return fallback;
    }
  }
  return field || fallback;
};

// Helper function to convert database row to WordProfile
const convertToWordProfile = (row: any): WordProfile => {
  return {
    ...row,
    morpheme_breakdown: parseJsonField(row.morpheme_breakdown, {}),
    etymology: parseJsonField(row.etymology, {}),
    definitions: parseJsonField(row.definitions, {}),
    word_forms: parseJsonField(row.word_forms, {}),
    analysis: parseJsonField(row.analysis, {})
  };
};

export class WordProfileService {
  static async getAllWordProfiles(): Promise<WordProfile[]> {
    try {
      // Try cache first
      const cached = PerformanceOptimizationService.getCache<WordProfile[]>('all_word_profiles');
      if (cached) return cached;

      const { data, error } = await supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const profiles = (data || []).map(convertToWordProfile);
      
      // Cache for 10 minutes
      PerformanceOptimizationService.setCache('all_word_profiles', profiles, 10);
      
      return profiles;
    } catch (error) {
      console.error('Error fetching word profiles:', error);
      throw error;
    }
  }

  static async getWordProfile(word: string): Promise<WordProfile | null> {
    try {
      // Use optimized search
      const results = await PerformanceOptimizationService.getCachedSearchResults(word, 1);
      return results.length > 0 ? convertToWordProfile(results[0]) : null;
    } catch (error) {
      console.error('Error fetching word profile:', error);
      throw error;
    }
  }

  static async getWordProfileById(id: string): Promise<WordProfile | null> {
    try {
      // Use optimized loading
      const data = await PerformanceOptimizationService.optimizedWordProfileLoad(id);
      return data ? convertToWordProfile(data) : null;
    } catch (error) {
      console.error('Error fetching word profile:', error);
      throw error;
    }
  }

  static async searchWords(query: string): Promise<WordProfile[]> {
    try {
      // Use cached search
      const results = await PerformanceOptimizationService.getCachedSearchResults(query, 20);
      return results.map(convertToWordProfile);
    } catch (error) {
      console.error('Error searching words:', error);
      throw error;
    }
  }

  static async createWordProfile(profile: Partial<WordProfile>): Promise<WordProfile> {
    const isAdmin = await RoleService.hasRole('admin');
    if (!isAdmin) {
      toast.error('Only administrators can create word profiles');
      throw new Error('Insufficient permissions');
    }

    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .insert({
          word: profile.word,
          morpheme_breakdown: profile.morpheme_breakdown || {},
          etymology: profile.etymology || {},
          definitions: profile.definitions || {},
          word_forms: profile.word_forms || {},
          analysis: profile.analysis || {}
        })
        .select()
        .single();

      if (error) throw error;

      const newProfile = convertToWordProfile(data);

      // Clear relevant caches
      PerformanceOptimizationService.clearCache('all_word_profiles');
      PerformanceOptimizationService.clearCache(`search_.*`);

      // Queue for quality assessment
      PerformanceOptimizationService.addBackgroundTask(
        'quality_assessment',
        { wordId: newProfile.id },
        2
      );

      return newProfile;
    } catch (error) {
      console.error('Error creating word profile:', error);
      throw error;
    }
  }

  static async updateWordProfile(id: string, updates: Partial<WordProfile>): Promise<WordProfile> {
    const isAdmin = await RoleService.hasRole('admin');
    if (!isAdmin) {
      toast.error('Only administrators can update word profiles');
      throw new Error('Insufficient permissions');
    }

    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .update({
          morpheme_breakdown: updates.morpheme_breakdown,
          etymology: updates.etymology,
          definitions: updates.definitions,
          word_forms: updates.word_forms,
          analysis: updates.analysis
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedProfile = convertToWordProfile(data);

      // Clear relevant caches
      PerformanceOptimizationService.clearCache(`word_profile_${id}`);
      PerformanceOptimizationService.clearCache('all_word_profiles');
      PerformanceOptimizationService.clearCache(`search_.*`);

      // Queue for quality re-assessment
      PerformanceOptimizationService.addBackgroundTask(
        'quality_assessment',
        { wordId: id },
        2
      );

      return updatedProfile;
    } catch (error) {
      console.error('Error updating word profile:', error);
      throw error;
    }
  }

  static async deleteWordProfile(id: string): Promise<void> {
    const isAdmin = await RoleService.hasRole('admin');
    if (!isAdmin) {
      toast.error('Only administrators can delete word profiles');
      throw new Error('Insufficient permissions');
    }

    try {
      const { error } = await supabase
        .from('word_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Clear relevant caches
      PerformanceOptimizationService.clearCache(`word_profile_${id}`);
      PerformanceOptimizationService.clearCache('all_word_profiles');
      PerformanceOptimizationService.clearCache(`search_.*`);
    } catch (error) {
      console.error('Error deleting word profile:', error);
      throw error;
    }
  }

  static async getPersonalizedWords(userId: string, limit: number = 10): Promise<WordProfile[]> {
    try {
      const cacheKey = `personalized_words_${userId}_${limit}`;
      let cached = PerformanceOptimizationService.getCache<WordProfile[]>(cacheKey);
      
      if (!cached) {
        const recommendations = await PersonalizationService.getPersonalizedRecommendations(userId, limit);
        const wordIds = recommendations.map(r => r.wordId);
        
        const { data, error } = await supabase
          .from('word_profiles')
          .select('*')
          .in('id', wordIds);

        if (error) throw error;

        cached = (data || []).map(convertToWordProfile);
        PerformanceOptimizationService.setCache(cacheKey, cached, 30); // Cache for 30 minutes
      }

      return cached;
    } catch (error) {
      console.error('Error fetching personalized words:', error);
      return [];
    }
  }

  static async getQualityReport(wordId: string): Promise<any> {
    try {
      const cacheKey = `quality_report_${wordId}`;
      let report = PerformanceOptimizationService.getCache(cacheKey);
      
      if (!report) {
        report = await QualityAssuranceService.performQualityAssessment(wordId);
        PerformanceOptimizationService.setCache(cacheKey, report, 60); // Cache for 1 hour
      }

      return report;
    } catch (error) {
      console.error('Error getting quality report:', error);
      return null;
    }
  }

  static async processWebhook(source: string, payload: any): Promise<void> {
    const { data, error } = await supabase.functions.invoke('process-word-webhook', {
      body: { source, payload }
    });

    if (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }

    return data;
  }

  static async getWebhookLogs(): Promise<WebhookLog[]> {
    const isAdmin = await RoleService.hasRole('admin');
    if (!isAdmin) {
      toast.error('Only administrators can view webhook logs');
      return [];
    }

    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('processed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching webhook logs:', error);
      throw error;
    }

    return (data || []).map(row => ({
      ...row,
      status: row.status as 'pending' | 'processed' | 'failed',
      payload: parseJsonField<any>(row.payload, {})
    }));
  }
}
