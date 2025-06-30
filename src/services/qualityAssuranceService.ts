
import { supabase } from "@/integrations/supabase/client";
import { SmartDatabaseService } from "./smartDatabaseService";
import { CalvarnIntegrationService } from "./calvarnIntegrationService";
import { MultiSourceDataService } from "./multiSourceDataService";
import { toast } from "sonner";

export interface QualityCheck {
  id: string;
  type: 'accuracy' | 'completeness' | 'consistency' | 'freshness';
  score: number;
  issues: string[];
  recommendations: string[];
  passed: boolean;
}

export interface ValidationRule {
  name: string;
  type: 'required' | 'format' | 'range' | 'custom';
  field: string;
  validator: (value: any) => { valid: boolean; message?: string };
}

export interface QualityReport {
  wordProfileId: string;
  overallScore: number;
  checks: QualityCheck[];
  validationResults: Array<{ rule: string; passed: boolean; message?: string }>;
  recommendations: string[];
  timestamp: string;
}

export class QualityAssuranceService {
  
  private static validationRules: ValidationRule[] = [
    {
      name: 'Word Required',
      type: 'required',
      field: 'word',
      validator: (value) => ({ valid: !!value && value.trim().length > 0 })
    },
    {
      name: 'Primary Definition Required',
      type: 'required',
      field: 'definitions.primary',
      validator: (value) => ({ valid: !!value && value.trim().length > 0 })
    },
    {
      name: 'Root Morpheme Required',
      type: 'required',
      field: 'morpheme_breakdown.root',
      validator: (value) => ({ valid: !!value && !!value.text && !!value.meaning })
    },
    {
      name: 'Etymology Language Origin',
      type: 'required',
      field: 'etymology.language_of_origin',
      validator: (value) => ({ valid: !!value && value.trim().length > 0 })
    },
    {
      name: 'Parts of Speech',
      type: 'required',
      field: 'analysis.parts_of_speech',
      validator: (value) => ({ valid: !!value && value.trim().length > 0 })
    },
    {
      name: 'Definition Length',
      type: 'range',
      field: 'definitions.primary',
      validator: (value) => ({
        valid: !!value && value.length >= 10 && value.length <= 500,
        message: 'Primary definition should be 10-500 characters'
      })
    },
    {
      name: 'Morpheme Meaning Quality',
      type: 'custom',
      field: 'morpheme_breakdown.root.meaning',
      validator: (value) => ({
        valid: !!value && value.length >= 5 && !value.toLowerCase().includes('not available'),
        message: 'Root meaning should be descriptive and informative'
      })
    }
  ];

  // Comprehensive quality assessment
  static async performQualityAssessment(wordProfileId: string): Promise<QualityReport> {
    try {
      const wordProfile = await SmartDatabaseService.getWordProfile(wordProfileId);
      if (!wordProfile) {
        throw new Error('Word profile not found');
      }

      const checks: QualityCheck[] = [];
      const validationResults: Array<{ rule: string; passed: boolean; message?: string }> = [];
      const recommendations: string[] = [];

      // 1. Accuracy Check
      const accuracyCheck = await this.checkAccuracy(wordProfile);
      checks.push(accuracyCheck);

      // 2. Completeness Check
      const completenessCheck = await this.checkCompleteness(wordProfile);
      checks.push(completenessCheck);

      // 3. Consistency Check
      const consistencyCheck = await this.checkConsistency(wordProfile);
      checks.push(consistencyCheck);

      // 4. Freshness Check
      const freshnessCheck = await this.checkFreshness(wordProfile);
      checks.push(freshnessCheck);

      // 5. Validation Rules
      for (const rule of this.validationRules) {
        const result = this.validateField(wordProfile, rule);
        validationResults.push({
          rule: rule.name,
          passed: result.valid,
          message: result.message
        });

        if (!result.valid && result.message) {
          recommendations.push(`${rule.name}: ${result.message}`);
        }
      }

      // Calculate overall score
      const checkScores = checks.map(c => c.score);
      const validationScore = (validationResults.filter(v => v.passed).length / validationResults.length) * 100;
      const overallScore = (checkScores.reduce((sum, score) => sum + score, 0) + validationScore) / (checkScores.length + 1);

      // Compile recommendations
      checks.forEach(check => {
        recommendations.push(...check.recommendations);
      });

      const report: QualityReport = {
        wordProfileId,
        overallScore: Math.round(overallScore),
        checks,
        validationResults,
        recommendations: [...new Set(recommendations)], // Remove duplicates
        timestamp: new Date().toISOString()
      };

      // Store the quality report
      await this.storeQualityReport(report);

      return report;
    } catch (error) {
      console.error('Error performing quality assessment:', error);
      throw error;
    }
  }

  // Check accuracy using multiple sources
  private static async checkAccuracy(wordProfile: any): Promise<QualityCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // Cross-reference with multiple data sources
      const sourceData = await MultiSourceDataService.aggregateFromAllSources(wordProfile.word);
      
      // Check definition accuracy
      if (sourceData.mergedData.definitions?.primary) {
        const similarity = this.calculateSimilarity(
          wordProfile.definitions?.primary || '',
          sourceData.mergedData.definitions.primary
        );
        
        if (similarity < 0.5) {
          score -= 30;
          issues.push('Definition may not be accurate compared to authoritative sources');
          recommendations.push('Review and update primary definition');
        }
      }

      // Check etymology accuracy
      if (sourceData.mergedData.etymology?.language_of_origin) {
        if (wordProfile.etymology?.language_of_origin !== sourceData.mergedData.etymology.language_of_origin) {
          score -= 20;
          issues.push('Etymology language origin discrepancy detected');
          recommendations.push('Verify etymology with authoritative sources');
        }
      }

    } catch (error) {
      score -= 10;
      issues.push('Unable to verify accuracy with external sources');
    }

    return {
      id: `accuracy_${Date.now()}`,
      type: 'accuracy',
      score: Math.max(0, score),
      issues,
      recommendations,
      passed: score >= 70
    };
  }

  // Check completeness
  private static async checkCompleteness(wordProfile: any): Promise<QualityCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Essential fields
    const essentialFields = [
      { field: 'word', weight: 20 },
      { field: 'definitions.primary', weight: 20 },
      { field: 'morpheme_breakdown.root.text', weight: 15 },
      { field: 'morpheme_breakdown.root.meaning', weight: 15 },
      { field: 'etymology.language_of_origin', weight: 10 },
      { field: 'analysis.parts_of_speech', weight: 10 },
      { field: 'definitions.standard', weight: 10 }
    ];

    for (const { field, weight } of essentialFields) {
      const value = this.getNestedValue(wordProfile, field);
      if (!value || (Array.isArray(value) && value.length === 0)) {
        score -= weight;
        issues.push(`Missing required field: ${field}`);
        recommendations.push(`Add ${field.replace(/\./g, ' ')}`);
      }
    }

    return {
      id: `completeness_${Date.now()}`,
      type: 'completeness',
      score: Math.max(0, score),
      issues,
      recommendations,
      passed: score >= 80
    };
  }

  // Check consistency
  private static async checkConsistency(wordProfile: any): Promise<QualityCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check morpheme consistency
    const root = wordProfile.morpheme_breakdown?.root?.text;
    const word = wordProfile.word;
    
    if (root && word && !word.toLowerCase().includes(root.toLowerCase())) {
      score -= 25;
      issues.push('Root morpheme not found in word');
      recommendations.push('Verify morpheme breakdown accuracy');
    }

    // Check definition consistency with parts of speech
    const pos = wordProfile.analysis?.parts_of_speech;
    const definition = wordProfile.definitions?.primary;
    
    if (pos && definition) {
      const posIndicators = {
        'noun': ['person', 'place', 'thing', 'concept', 'entity'],
        'verb': ['action', 'process', 'state', 'occur', 'happen'],
        'adjective': ['describing', 'quality', 'characteristic', 'attribute'],
        'adverb': ['manner', 'way', 'how', 'when', 'where']
      };

      const indicators = posIndicators[pos.toLowerCase()];
      if (indicators && !indicators.some(indicator => 
        definition.toLowerCase().includes(indicator))) {
        score -= 15;
        issues.push('Definition may not match parts of speech');
        recommendations.push('Review definition alignment with grammatical role');
      }
    }

    return {
      id: `consistency_${Date.now()}`,
      type: 'consistency',
      score: Math.max(0, score),
      issues,
      recommendations,
      passed: score >= 75
    };
  }

  // Check data freshness
  private static async checkFreshness(wordProfile: any): Promise<QualityCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const lastEnrichment = wordProfile.last_enrichment_at;
    const lastUpdate = wordProfile.updated_at;
    
    if (lastEnrichment) {
      const daysSinceEnrichment = Math.floor(
        (Date.now() - new Date(lastEnrichment).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceEnrichment > 90) {
        score -= 30;
        issues.push('Data has not been enriched recently');
        recommendations.push('Consider re-enriching with latest sources');
      } else if (daysSinceEnrichment > 30) {
        score -= 15;
        issues.push('Data enrichment is somewhat outdated');
      }
    } else {
      score -= 20;
      issues.push('No enrichment history found');
      recommendations.push('Perform initial AI enrichment');
    }

    return {
      id: `freshness_${Date.now()}`,
      type: 'freshness',
      score: Math.max(0, score),
      issues,
      recommendations,
      passed: score >= 70
    };
  }

  // Validate individual field
  private static validateField(wordProfile: any, rule: ValidationRule): { valid: boolean; message?: string } {
    const value = this.getNestedValue(wordProfile, rule.field);
    return rule.validator(value);
  }

  // Helper to get nested object values
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Calculate text similarity (simple implementation)
  private static calculateSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  // Store quality report in database
  private static async storeQualityReport(report: QualityReport): Promise<void> {
    try {
      const { error } = await supabase
        .from('data_quality_audits')
        .insert({
          word_profile_id: report.wordProfileId,
          audit_type: 'comprehensive_qa',
          quality_score: report.overallScore,
          missing_fields: report.validationResults
            .filter(v => !v.passed)
            .map(v => v.rule),
          validation_errors: report.checks
            .filter(c => !c.passed)
            .map(c => c.issues)
            .flat(),
          suggestions: report.recommendations
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing quality report:', error);
    }
  }

  // Batch quality assessment
  static async batchQualityAssessment(wordProfileIds: string[]): Promise<QualityReport[]> {
    const reports: QualityReport[] = [];
    
    for (const id of wordProfileIds) {
      try {
        const report = await this.performQualityAssessment(id);
        reports.push(report);
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Quality assessment failed for word ${id}:`, error);
      }
    }
    
    return reports;
  }

  // Get quality trends
  static async getQualityTrends(wordProfileId: string, days: number = 30): Promise<Array<{ date: string; score: number }>> {
    try {
      const { data, error } = await supabase
        .from('data_quality_audits')
        .select('created_at, quality_score')
        .eq('word_profile_id', wordProfileId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(row => ({
        date: row.created_at,
        score: row.quality_score
      }));
    } catch (error) {
      console.error('Error fetching quality trends:', error);
      return [];
    }
  }
}
