
// Comprehensive linguistic analysis types
export interface MorphologicalComponent {
  id?: string;
  word_profile_id?: string;
  component_type: 'prefix' | 'root' | 'suffix' | 'infix';
  text: string;
  meaning?: string;
  origin_language?: string;
  allomorphs?: string[];
  boundary_position?: number;
  semantic_function?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EtymologyChain {
  id?: string;
  word_profile_id?: string;
  language_family?: string;
  source_language?: string;
  borrowed_from?: string;
  first_attestation_date?: string;
  semantic_evolution?: string;
  borrowing_path?: Array<{
    language: string;
    form: string;
    date?: string;
    meaning?: string;
  }>;
  historical_forms?: Array<{
    period: string;
    form: string;
    meaning?: string;
  }>;
  cognates?: Array<{
    language: string;
    word: string;
    meaning?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface PhoneticData {
  id?: string;
  word_profile_id?: string;
  ipa_transcription?: string;
  phonemes?: Array<{
    symbol: string;
    description: string;
    position: number;
  }>;
  syllable_structure?: string;
  stress_pattern?: string;
  syllable_count?: number;
  rhyme_scheme?: string;
  sound_changes?: Array<{
    type: string;
    description: string;
    historical_period?: string;
  }>;
  regional_pronunciations?: Array<{
    region: string;
    ipa: string;
    notes?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface SemanticRelationship {
  id?: string;
  word_profile_id?: string;
  semantic_field?: string;
  conceptual_domain?: string;
  connotation?: 'positive' | 'negative' | 'neutral';
  register_level?: 'formal' | 'informal' | 'technical' | 'colloquial' | 'academic';
  frequency_score?: number;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  cultural_context?: string;
  social_associations?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface WordRelationship {
  id?: string;
  source_word_id?: string;
  target_word_id?: string;
  relationship_type: 'synonym' | 'antonym' | 'hypernym' | 'hyponym' | 'meronym' | 'holonym' | 'cognate';
  strength?: number;
  context?: string;
  confidence_score?: number;
  target_word?: string;
  created_at?: string;
}

export interface UsageContext {
  id?: string;
  word_profile_id?: string;
  context_type?: 'formal' | 'informal' | 'academic' | 'technical' | 'literary' | 'colloquial';
  example_sentence: string;
  source?: string;
  frequency_score?: number;
  regional_usage?: string;
  time_period?: string;
  explanation?: string;
  created_at?: string;
}

export interface LinguisticAnalysisMetadata {
  id?: string;
  word_profile_id?: string;
  analysis_version?: string;
  processing_models?: string[];
  confidence_scores?: {
    morphological?: number;
    etymological?: number;
    phonetic?: number;
    semantic?: number;
    overall?: number;
  };
  quality_metrics?: {
    completeness?: number;
    accuracy?: number;
    consistency?: number;
  };
  analysis_duration_ms?: number;
  completeness_score?: number;
  accuracy_score?: number;
  last_enrichment_date?: string;
  enrichment_source?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ComprehensiveLinguisticAnalysis {
  word_profile: any;
  morphological_components?: MorphologicalComponent[];
  etymology_chain?: EtymologyChain;
  phonetic_data?: PhoneticData;
  semantic_relationships?: SemanticRelationship[];
  word_relationships?: WordRelationship[];
  usage_contexts?: UsageContext[];
  analysis_metadata?: LinguisticAnalysisMetadata;
}

export interface LinguisticAnalysisRequest {
  word: string;
  options?: {
    includeMorphological?: boolean;
    includeEtymology?: boolean;
    includePhonetic?: boolean;
    includeSemantic?: boolean;
    includeRelationships?: boolean;
    includeUsageContexts?: boolean;
  };
}

export interface LinguisticAnalysisResult {
  success: boolean;
  analysis?: ComprehensiveLinguisticAnalysis;
  metadata?: {
    processing_time_ms: number;
    models_used: string[];
    confidence_score: number;
    completeness_score: number;
  };
  error?: string;
}
