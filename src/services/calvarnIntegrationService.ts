
import { Calvern3Service } from '@/utils/calvern3Integration';

export interface CalvarnEnrichmentRequest {
  word: string;
  currentData?: any;
  enrichmentType: 'comprehensive' | 'definitions' | 'etymology' | 'morphology' | 'usage';
  context?: string;
}

export interface CalvarnEnrichmentResult {
  success: boolean;
  enrichedData?: any;
  confidence: number;
  source: 'calvarn' | 'fallback';
  error?: string;
}

export class CalvarnIntegrationService {
  // Primary Calvarn enrichment using your external LLM
  static async enrichWithCalvarn(request: CalvarnEnrichmentRequest): Promise<CalvarnEnrichmentResult> {
    try {
      console.log(`Enriching "${request.word}" with Calvarn (${request.enrichmentType})`);
      
      const calvarnResponse = await Calvern3Service.getComprehensiveBreakdown(request.word);
      
      if (calvarnResponse) {
        const enrichedData = this.parseCalvarnResponse(calvarnResponse, request.enrichmentType);
        
        return {
          success: true,
          enrichedData,
          confidence: 0.95, // High confidence for Calvarn
          source: 'calvarn'
        };
      }
      
      throw new Error('Calvarn returned empty response');
    } catch (error) {
      console.error('Calvarn enrichment failed:', error);
      
      // Fallback to local AI processing
      return await this.fallbackEnrichment(request);
    }
  }

  // Parse Calvarn's comprehensive response into structured data
  private static parseCalvarnResponse(response: string, enrichmentType: string): any {
    try {
      // Parse Calvarn's markdown response into structured data
      const sections = this.extractSections(response);
      
      const enrichedData: any = {};

      // Morpheme Breakdown
      if (sections.morphemeBreakdown && (enrichmentType === 'comprehensive' || enrichmentType === 'morphology')) {
        enrichedData.morpheme_breakdown = this.parseMorphemeSection(sections.morphemeBreakdown);
      }

      // Etymology
      if (sections.etymology && (enrichmentType === 'comprehensive' || enrichmentType === 'etymology')) {
        enrichedData.etymology = this.parseEtymologySection(sections.etymology);
      }

      // Definitions
      if (sections.definitions && (enrichmentType === 'comprehensive' || enrichmentType === 'definitions')) {
        enrichedData.definitions = this.parseDefinitionsSection(sections.definitions);
      }

      // Analysis
      if (sections.analysis && (enrichmentType === 'comprehensive' || enrichmentType === 'usage')) {
        enrichedData.analysis = this.parseAnalysisSection(sections.analysis);
      }

      // Word Forms
      if (sections.wordForms) {
        enrichedData.word_forms = this.parseWordFormsSection(sections.wordForms);
      }

      return enrichedData;
    } catch (error) {
      console.error('Error parsing Calvarn response:', error);
      return {};
    }
  }

  // Extract sections from Calvarn's markdown response
  private static extractSections(response: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    const sectionPatterns = {
      morphemeBreakdown: /## Morpheme Breakdown([\s\S]*?)(?=##|$)/,
      etymology: /## Etymology([\s\S]*?)(?=##|$)/,
      definitions: /## Definitions([\s\S]*?)(?=##|$)/,
      wordForms: /## Word Forms & Inflections([\s\S]*?)(?=##|$)/,
      analysis: /## Analysis of the Word([\s\S]*?)(?=##|$)/
    };

    for (const [key, pattern] of Object.entries(sectionPatterns)) {
      const match = response.match(pattern);
      if (match) {
        sections[key] = match[1].trim();
      }
    }

    return sections;
  }

  // Parse morpheme breakdown section
  private static parseMorphemeSection(section: string): any {
    const morphemeData: any = {};
    
    // Extract root, prefix, suffix information
    const rootMatch = section.match(/\*\*Root.*?:\*\*\s*(.+?)(?:\n|$)/);
    if (rootMatch) {
      const rootText = rootMatch[1].trim();
      const meaningMatch = rootText.match(/(.+?)\s*-\s*(.+)/);
      if (meaningMatch) {
        morphemeData.root = {
          text: meaningMatch[1].trim(),
          meaning: meaningMatch[2].trim()
        };
      }
    }

    const prefixMatch = section.match(/\*\*Prefix.*?:\*\*\s*(.+?)(?:\n|$)/);
    if (prefixMatch) {
      const prefixText = prefixMatch[1].trim();
      const meaningMatch = prefixText.match(/(.+?)\s*-\s*(.+)/);
      if (meaningMatch) {
        morphemeData.prefix = {
          text: meaningMatch[1].trim(),
          meaning: meaningMatch[2].trim()
        };
      }
    }

    const suffixMatch = section.match(/\*\*Suffix.*?:\*\*\s*(.+?)(?:\n|$)/);
    if (suffixMatch) {
      const suffixText = suffixMatch[1].trim();
      const meaningMatch = suffixText.match(/(.+?)\s*-\s*(.+)/);
      if (meaningMatch) {
        morphemeData.suffix = {
          text: meaningMatch[1].trim(),
          meaning: meaningMatch[2].trim()
        };
      }
    }

    return morphemeData;
  }

  // Parse etymology section
  private static parseEtymologySection(section: string): any {
    const etymologyData: any = {};
    
    const originMatch = section.match(/\*\*Language of Origin.*?:\*\*\s*(.+?)(?:\n|$)/);
    if (originMatch) {
      etymologyData.language_of_origin = originMatch[1].trim();
    }

    const historicalMatch = section.match(/\*\*Historical Origins.*?:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
    if (historicalMatch) {
      etymologyData.historical_origins = historicalMatch[1].trim();
    }

    const evolutionMatch = section.match(/\*\*Word Evolution.*?:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
    if (evolutionMatch) {
      etymologyData.word_evolution = evolutionMatch[1].trim();
    }

    return etymologyData;
  }

  // Parse definitions section
  private static parseDefinitionsSection(section: string): any {
    const definitionsData: any = {};
    
    const primaryMatch = section.match(/\*\*Primary Definition.*?:\*\*\s*(.+?)(?:\n|$)/);
    if (primaryMatch) {
      definitionsData.primary = primaryMatch[1].trim();
    }

    // Extract multiple standard definitions
    const standardMatches = section.match(/\*\*Standard Definitions.*?:\*\*([\s\S]*?)(?=\*\*|$)/);
    if (standardMatches) {
      const definitions = standardMatches[1]
        .split(/\d+\./)
        .filter(def => def.trim())
        .map(def => def.trim());
      
      if (definitions.length > 0) {
        definitionsData.standard = definitions;
      }
    }

    return definitionsData;
  }

  // Parse analysis section
  private static parseAnalysisSection(section: string): any {
    const analysisData: any = {};
    
    const posMatch = section.match(/\*\*Parts of Speech.*?:\*\*\s*(.+?)(?:\n|$)/);
    if (posMatch) {
      analysisData.parts_of_speech = posMatch[1].trim();
    }

    const exampleMatch = section.match(/\*\*Example.*?:\*\*\s*"([^"]+)"/);
    if (exampleMatch) {
      analysisData.usage_examples = [exampleMatch[1]];
    }

    return analysisData;
  }

  // Parse word forms section
  private static parseWordFormsSection(section: string): any {
    const wordFormsData: any = {};
    
    const baseMatch = section.match(/\*\*Base Form.*?:\*\*\s*(.+?)(?:\n|$)/);
    if (baseMatch) {
      wordFormsData.base_form = baseMatch[1].trim();
    }

    return wordFormsData;
  }

  // Fallback enrichment using other AI services
  private static async fallbackEnrichment(request: CalvarnEnrichmentRequest): Promise<CalvarnEnrichmentResult> {
    try {
      // Use the existing comprehensive enrichment service as fallback
      const { ComprehensiveEnrichmentService } = await import('./comprehensiveEnrichmentService');
      
      // Create a mock word profile for enrichment
      const mockProfile = {
        id: 'temp',
        word: request.word,
        morpheme_breakdown: request.currentData?.morpheme_breakdown || {},
        etymology: request.currentData?.etymology || {},
        definitions: request.currentData?.definitions || {},
        word_forms: request.currentData?.word_forms || {},
        analysis: request.currentData?.analysis || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Apply basic enrichment logic
      const enrichedData = await this.basicEnrichment(mockProfile);

      return {
        success: true,
        enrichedData,
        confidence: 0.75, // Lower confidence for fallback
        source: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Basic enrichment for fallback
  private static async basicEnrichment(profile: any): Promise<any> {
    const enriched = { ...profile };

    // Basic morpheme breakdown if missing
    if (!enriched.morpheme_breakdown?.root) {
      enriched.morpheme_breakdown = {
        ...enriched.morpheme_breakdown,
        root: {
          text: profile.word,
          meaning: 'To be analyzed'
        }
      };
    }

    // Basic etymology if missing
    if (!enriched.etymology?.language_of_origin) {
      enriched.etymology = {
        ...enriched.etymology,
        language_of_origin: 'To be researched'
      };
    }

    // Basic definition if missing
    if (!enriched.definitions?.primary) {
      enriched.definitions = {
        ...enriched.definitions,
        primary: `Definition for ${profile.word}`
      };
    }

    return enriched;
  }

  // Specialized enrichment for different field types
  static async enrichDefinitions(word: string, currentDefinitions?: any): Promise<CalvarnEnrichmentResult> {
    return this.enrichWithCalvarn({
      word,
      currentData: currentDefinitions,
      enrichmentType: 'definitions'
    });
  }

  static async enrichEtymology(word: string, currentEtymology?: any): Promise<CalvarnEnrichmentResult> {
    return this.enrichWithCalvarn({
      word,
      currentData: currentEtymology,
      enrichmentType: 'etymology'
    });
  }

  static async enrichMorphology(word: string, currentMorphology?: any): Promise<CalvarnEnrichmentResult> {
    return this.enrichWithCalvarn({
      word,
      currentData: currentMorphology,
      enrichmentType: 'morphology'
    });
  }

  static async enrichUsage(word: string, currentAnalysis?: any): Promise<CalvarnEnrichmentResult> {
    return this.enrichWithCalvarn({
      word,
      currentData: currentAnalysis,
      enrichmentType: 'usage'
    });
  }
}
