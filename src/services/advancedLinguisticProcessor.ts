
import { supabase } from "@/integrations/supabase/client";
import { WordProfile } from "@/types/wordProfile";
import {
  LinguisticAnalysisRequest,
  LinguisticAnalysisResult,
  ComprehensiveLinguisticAnalysis,
  MorphologicalComponent,
  EtymologyChain,
  PhoneticData,
  SemanticRelationship,
  WordRelationship,
  UsageContext,
  LinguisticAnalysisMetadata
} from "@/types/linguisticAnalysis";
import { toast } from "sonner";

export class AdvancedLinguisticProcessor {
  private static readonly API_BASE_URL = "https://api.huggingface.co/models";
  private static readonly SPACY_API_URL = "https://spacy.io/api/lemmatizer"; // Placeholder
  private static readonly MODELS = {
    MORPHOLOGY: "spacy/en_core_web_sm",
    SEMANTICS: "roberta-base",
    CONTEXT: "microsoft/deberta-v3-base",
    RELATIONSHIPS: "bert-base-uncased"
  };

  // Main analysis pipeline
  static async analyzeWord(request: LinguisticAnalysisRequest): Promise<LinguisticAnalysisResult> {
    const startTime = Date.now();
    console.log(`Starting comprehensive analysis for word: ${request.word}`);

    try {
      // Get or create word profile
      const wordProfile = await this.getOrCreateWordProfile(request.word);
      if (!wordProfile) {
        return {
          success: false,
          error: "Failed to create or retrieve word profile"
        };
      }

      // Run parallel analysis
      const analysisPromises = [];
      const modelsUsed: string[] = [];

      if (request.options?.includeMorphological !== false) {
        analysisPromises.push(this.analyzeMorphology(request.word, wordProfile.id));
        modelsUsed.push(this.MODELS.MORPHOLOGY);
      }

      if (request.options?.includeEtymology !== false) {
        analysisPromises.push(this.analyzeEtymology(request.word, wordProfile.id));
        modelsUsed.push("etymology_service");
      }

      if (request.options?.includePhonetic !== false) {
        analysisPromises.push(this.analyzePhonetics(request.word, wordProfile.id));
        modelsUsed.push("phonetic_service");
      }

      if (request.options?.includeSemantic !== false) {
        analysisPromises.push(this.analyzeSemantics(request.word, wordProfile.id));
        modelsUsed.push(this.MODELS.SEMANTICS);
      }

      if (request.options?.includeRelationships !== false) {
        analysisPromises.push(this.analyzeWordRelationships(request.word, wordProfile.id));
        modelsUsed.push(this.MODELS.RELATIONSHIPS);
      }

      if (request.options?.includeUsageContexts !== false) {
        analysisPromises.push(this.generateUsageContexts(request.word, wordProfile.id));
        modelsUsed.push(this.MODELS.CONTEXT);
      }

      // Execute all analyses in parallel
      await Promise.allSettled(analysisPromises);

      // Generate metadata
      const processingTime = Date.now() - startTime;
      await this.saveAnalysisMetadata(wordProfile.id, {
        analysis_version: "2.0",
        processing_models: modelsUsed,
        analysis_duration_ms: processingTime,
        enrichment_source: "comprehensive_pipeline"
      });

      // Retrieve comprehensive analysis
      const analysis = await this.getComprehensiveAnalysis(wordProfile.id);

      // Calculate metrics
      const metadata = {
        processing_time_ms: processingTime,
        models_used: modelsUsed,
        confidence_score: this.calculateConfidenceScore(analysis),
        completeness_score: this.calculateCompletenessScore(analysis)
      };

      console.log(`Comprehensive analysis completed for ${request.word} in ${processingTime}ms`);

      return {
        success: true,
        analysis,
        metadata
      };

    } catch (error) {
      console.error('Comprehensive linguistic analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Morphological analysis using AI-powered decomposition
  private static async analyzeMorphology(word: string, wordProfileId: string): Promise<void> {
    try {
      console.log(`Analyzing morphology for: ${word}`);
      
      // Use Groq API for morphological analysis
      const { data, error } = await supabase.functions.invoke('ai-word-analysis', {
        body: { 
          word,
          analysisType: 'morphology',
          includeComponents: true
        }
      });

      if (error) throw error;

      const components = this.parseMorphologicalComponents(data, word);
      
      // Save components to database
      for (const component of components) {
        await this.saveMorphologicalComponent(wordProfileId, component);
      }

    } catch (error) {
      console.error(`Morphological analysis failed for ${word}:`, error);
    }
  }

  // Etymology analysis with historical development
  private static async analyzeEtymology(word: string, wordProfileId: string): Promise<void> {
    try {
      console.log(`Analyzing etymology for: ${word}`);

      const { data, error } = await supabase.functions.invoke('ai-word-analysis', {
        body: { 
          word,
          analysisType: 'etymology',
          includeHistory: true
        }
      });

      if (error) throw error;

      const etymologyData = this.parseEtymologyData(data);
      await this.saveEtymologyChain(wordProfileId, etymologyData);

    } catch (error) {
      console.error(`Etymology analysis failed for ${word}:`, error);
    }
  }

  // Phonetic and phonological analysis
  private static async analyzePhonetics(word: string, wordProfileId: string): Promise<void> {
    try {
      console.log(`Analyzing phonetics for: ${word}`);

      const { data, error } = await supabase.functions.invoke('ai-word-analysis', {
        body: { 
          word,
          analysisType: 'phonetic',
          includeIPA: true
        }
      });

      if (error) throw error;

      const phoneticData = this.parsePhoneticData(data);
      await this.savePhoneticData(wordProfileId, phoneticData);

    } catch (error) {
      console.error(`Phonetic analysis failed for ${word}:`, error);
    }
  }

  // Semantic field and relationship analysis
  private static async analyzeSemantics(word: string, wordProfileId: string): Promise<void> {
    try {
      console.log(`Analyzing semantics for: ${word}`);

      const { data, error } = await supabase.functions.invoke('ai-word-analysis', {
        body: { 
          word,
          analysisType: 'semantic',
          includeFields: true
        }
      });

      if (error) throw error;

      const semanticData = this.parseSemanticData(data);
      await this.saveSemanticRelationship(wordProfileId, semanticData);

    } catch (error) {
      console.error(`Semantic analysis failed for ${word}:`, error);
    }
  }

  // Word relationship analysis (synonyms, antonyms, etc.)
  private static async analyzeWordRelationships(word: string, wordProfileId: string): Promise<void> {
    try {
      console.log(`Analyzing word relationships for: ${word}`);

      const { data, error } = await supabase.functions.invoke('suggest-related-words', {
        body: { 
          word,
          includeRelationshipTypes: ['synonym', 'antonym', 'hypernym', 'hyponym']
        }
      });

      if (error) throw error;

      const relationships = this.parseWordRelationships(data, wordProfileId);
      
      for (const relationship of relationships) {
        await this.saveWordRelationship(relationship);
      }

    } catch (error) {
      console.error(`Word relationship analysis failed for ${word}:`, error);
    }
  }

  // Generate contextual usage examples
  private static async generateUsageContexts(word: string, wordProfileId: string): Promise<void> {
    try {
      console.log(`Generating usage contexts for: ${word}`);

      const { data, error } = await supabase.functions.invoke('generate-contextual-examples', {
        body: { 
          word,
          contexts: ['formal', 'informal', 'academic', 'technical', 'literary'],
          examplesPerContext: 2
        }
      });

      if (error) throw error;

      const contexts = this.parseUsageContexts(data, wordProfileId);
      
      for (const context of contexts) {
        await this.saveUsageContext(context);
      }

    } catch (error) {
      console.error(`Usage context generation failed for ${word}:`, error);
    }
  }

  // Database operations
  private static async getOrCreateWordProfile(word: string): Promise<WordProfile | null> {
    try {
      // Try to get existing profile
      const { data: existing } = await supabase
        .from('word_profiles')
        .select('*')
        .eq('word', word.toLowerCase())
        .maybeSingle();

      if (existing) return existing;

      // Create new profile
      const { data: newProfile, error } = await supabase
        .from('word_profiles')
        .insert({
          word: word.toLowerCase(),
          morpheme_breakdown: {},
          etymology: {},
          definitions: {},
          word_forms: {},
          analysis: {}
        })
        .select()
        .single();

      if (error) throw error;
      return newProfile;

    } catch (error) {
      console.error('Error getting or creating word profile:', error);
      return null;
    }
  }

  private static async saveMorphologicalComponent(wordProfileId: string, component: Omit<MorphologicalComponent, 'word_profile_id'>): Promise<void> {
    const { error } = await supabase
      .from('morphological_components')
      .insert({
        word_profile_id: wordProfileId,
        ...component
      });

    if (error) throw error;
  }

  private static async saveEtymologyChain(wordProfileId: string, etymology: Omit<EtymologyChain, 'word_profile_id'>): Promise<void> {
    const { error } = await supabase
      .from('etymology_chains')
      .insert({
        word_profile_id: wordProfileId,
        ...etymology
      });

    if (error) throw error;
  }

  private static async savePhoneticData(wordProfileId: string, phonetic: Omit<PhoneticData, 'word_profile_id'>): Promise<void> {
    const { error } = await supabase
      .from('phonetic_data')
      .insert({
        word_profile_id: wordProfileId,
        ...phonetic
      });

    if (error) throw error;
  }

  private static async saveSemanticRelationship(wordProfileId: string, semantic: Omit<SemanticRelationship, 'word_profile_id'>): Promise<void> {
    const { error } = await supabase
      .from('semantic_relationships')
      .insert({
        word_profile_id: wordProfileId,
        ...semantic
      });

    if (error) throw error;
  }

  private static async saveWordRelationship(relationship: WordRelationship): Promise<void> {
    const { error } = await supabase
      .from('word_relationships')
      .upsert(relationship, {
        onConflict: 'source_word_id,target_word_id,relationship_type'
      });

    if (error) throw error;
  }

  private static async saveUsageContext(context: UsageContext): Promise<void> {
    const { error } = await supabase
      .from('usage_contexts')
      .insert(context);

    if (error) throw error;
  }

  private static async saveAnalysisMetadata(wordProfileId: string, metadata: Partial<LinguisticAnalysisMetadata>): Promise<void> {
    const { error } = await supabase
      .from('linguistic_analysis_metadata')
      .upsert({
        word_profile_id: wordProfileId,
        ...metadata
      });

    if (error) throw error;
  }

  // Get comprehensive analysis from database
  static async getComprehensiveAnalysis(wordProfileId: string): Promise<ComprehensiveLinguisticAnalysis | null> {
    try {
      const { data, error } = await supabase.rpc('get_comprehensive_word_analysis', {
        word_id: wordProfileId
      });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error getting comprehensive analysis:', error);
      return null;
    }
  }

  // Data parsing methods
  private static parseMorphologicalComponents(data: any, word: string): MorphologicalComponent[] {
    const components: MorphologicalComponent[] = [];
    
    // Parse AI response and extract morphological components
    if (data.morpheme_breakdown) {
      const breakdown = data.morpheme_breakdown;
      
      if (breakdown.prefix) {
        components.push({
          component_type: 'prefix',
          text: breakdown.prefix.text,
          meaning: breakdown.prefix.meaning,
          origin_language: breakdown.prefix.origin
        });
      }
      
      if (breakdown.root) {
        components.push({
          component_type: 'root',
          text: breakdown.root.text,
          meaning: breakdown.root.meaning
        });
      }
      
      if (breakdown.suffix) {
        components.push({
          component_type: 'suffix',
          text: breakdown.suffix.text,
          meaning: breakdown.suffix.meaning,
          origin_language: breakdown.suffix.origin
        });
      }
    }
    
    return components;
  }

  private static parseEtymologyData(data: any): EtymologyChain {
    return {
      language_family: data.etymology?.language_family,
      source_language: data.etymology?.language_of_origin,
      borrowed_from: data.etymology?.borrowed_from,
      first_attestation_date: data.etymology?.first_attestation,
      semantic_evolution: data.etymology?.word_evolution,
      borrowing_path: data.etymology?.borrowing_path || [],
      historical_forms: data.etymology?.historical_forms || [],
      cognates: data.etymology?.cognates || []
    };
  }

  private static parsePhoneticData(data: any): PhoneticData {
    return {
      ipa_transcription: data.phonetic?.ipa,
      phonemes: data.phonetic?.phonemes || [],
      syllable_structure: data.phonetic?.syllable_structure,
      stress_pattern: data.phonetic?.stress_pattern,
      syllable_count: data.phonetic?.syllable_count,
      sound_changes: data.phonetic?.sound_changes || [],
      regional_pronunciations: data.phonetic?.regional_pronunciations || []
    };
  }

  private static parseSemanticData(data: any): SemanticRelationship {
    return {
      semantic_field: data.semantic?.field,
      conceptual_domain: data.semantic?.domain,
      connotation: data.semantic?.connotation as 'positive' | 'negative' | 'neutral',
      register_level: data.semantic?.register as 'formal' | 'informal' | 'technical' | 'colloquial' | 'academic',
      frequency_score: data.semantic?.frequency,
      difficulty_level: data.semantic?.difficulty as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      cultural_context: data.semantic?.cultural_context,
      social_associations: data.semantic?.social_associations || []
    };
  }

  private static parseWordRelationships(data: any, sourceWordId: string): WordRelationship[] {
    const relationships: WordRelationship[] = [];
    
    if (data.relationships) {
      for (const [type, words] of Object.entries(data.relationships)) {
        if (Array.isArray(words)) {
          for (const word of words) {
            relationships.push({
              source_word_id: sourceWordId,
              relationship_type: type as any,
              target_word: word.word || word,
              strength: word.strength || 0.5,
              confidence_score: word.confidence || 0.5,
              context: word.context
            });
          }
        }
      }
    }
    
    return relationships;
  }

  private static parseUsageContexts(data: any, wordProfileId: string): UsageContext[] {
    const contexts: UsageContext[] = [];
    
    if (data.usage_examples) {
      for (const example of data.usage_examples) {
        contexts.push({
          word_profile_id: wordProfileId,
          context_type: example.context_type as any,
          example_sentence: example.sentence,
          source: example.source,
          explanation: example.explanation,
          regional_usage: example.regional_usage,
          time_period: example.time_period
        });
      }
    }
    
    return contexts;
  }

  // Quality scoring methods
  private static calculateConfidenceScore(analysis: ComprehensiveLinguisticAnalysis | null): number {
    if (!analysis) return 0;
    
    let totalScore = 0;
    let components = 0;
    
    if (analysis.morphological_components?.length) {
      totalScore += 0.9;
      components++;
    }
    
    if (analysis.etymology_chain) {
      totalScore += 0.8;
      components++;
    }
    
    if (analysis.phonetic_data) {
      totalScore += 0.85;
      components++;
    }
    
    if (analysis.semantic_relationships?.length) {
      totalScore += 0.88;
      components++;
    }
    
    if (analysis.word_relationships?.length) {
      totalScore += 0.82;
      components++;
    }
    
    if (analysis.usage_contexts?.length) {
      totalScore += 0.87;
      components++;
    }
    
    return components > 0 ? totalScore / components : 0;
  }

  private static calculateCompletenessScore(analysis: ComprehensiveLinguisticAnalysis | null): number {
    if (!analysis) return 0;
    
    const maxComponents = 6;
    let completedComponents = 0;
    
    if (analysis.morphological_components?.length) completedComponents++;
    if (analysis.etymology_chain) completedComponents++;
    if (analysis.phonetic_data) completedComponents++;
    if (analysis.semantic_relationships?.length) completedComponents++;
    if (analysis.word_relationships?.length) completedComponents++;
    if (analysis.usage_contexts?.length) completedComponents++;
    
    return (completedComponents / maxComponents) * 100;
  }

  // Batch processing for multiple words
  static async batchAnalyze(words: string[], progressCallback?: (progress: number, current: string) => void): Promise<LinguisticAnalysisResult[]> {
    const results: LinguisticAnalysisResult[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      if (progressCallback) {
        progressCallback((i / words.length) * 100, word);
      }
      
      const result = await this.analyzeWord({ word });
      results.push(result);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (progressCallback) {
      progressCallback(100, 'Complete');
    }
    
    return results;
  }
}
