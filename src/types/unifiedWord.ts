
export interface UnifiedWord {
  id: string;
  word: string;
  created_at: string;
  updated_at: string;
  
  // Morphological data
  morpheme_breakdown: {
    prefix?: { text: string; meaning: string; origin?: string };
    root: { text: string; meaning: string; origin?: string };
    suffix?: { text: string; meaning: string; origin?: string };
  };
  
  // Etymology
  etymology: {
    historical_origins?: string;
    language_of_origin?: string;
    word_evolution?: string;
    cultural_regional_variations?: string;
  };
  
  // Definitions
  definitions: {
    primary?: string;
    standard?: string[];
    extended?: string[];
    contextual?: string[];
    specialized?: string[];
  };
  
  // Word forms
  word_forms: {
    base_form?: string;
    verb_tenses?: {
      present?: string;
      past?: string;
      future?: string;
      present_participle?: string;
      past_participle?: string;
    };
    noun_forms?: {
      singular?: string;
      plural?: string;
    };
    adjective_forms?: {
      positive?: string;
      comparative?: string;
      superlative?: string;
    };
    adverb_form?: string;
    other_inflections?: string[];
  };
  
  // Analysis
  analysis: {
    parts_of_speech?: string;
    usage_examples?: string[];
    synonyms?: string[];
    antonyms?: string[];
    common_collocations?: string[];
    cultural_historical_significance?: string;
    contextual_usage?: string;
    sentence_structure?: string;
    example?: string;
  };
  
  // Quality metrics
  quality_score?: number;
  completeness_score?: number;
  enrichment_status?: string;
  
  // Metadata
  data_sources?: string[];
  last_enrichment_at?: string;
}

export class WordTypeConverter {
  static toUnifiedWord(dbRow: any): UnifiedWord {
    return {
      id: dbRow.id,
      word: dbRow.word,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      morpheme_breakdown: this.parseJsonField(dbRow.morpheme_breakdown, {
        root: { text: dbRow.word, meaning: 'Root meaning not available' }
      }),
      etymology: this.parseJsonField(dbRow.etymology, {}),
      definitions: this.parseJsonField(dbRow.definitions, {}),
      word_forms: this.parseJsonField(dbRow.word_forms, {}),
      analysis: this.parseJsonField(dbRow.analysis, {}),
      quality_score: dbRow.quality_score || 0,
      completeness_score: dbRow.completeness_score || 0,
      enrichment_status: dbRow.enrichment_status || 'pending',
      data_sources: this.parseJsonField(dbRow.data_sources, []),
      last_enrichment_at: dbRow.last_enrichment_at
    };
  }
  
  private static parseJsonField<T>(field: any, fallback: T): T {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return fallback;
      }
    }
    return field || fallback;
  }
}
