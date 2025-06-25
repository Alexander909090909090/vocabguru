
// Unified Word Type System - Single Source of Truth
// This consolidates all the overlapping word interfaces into one consistent system

export interface UnifiedWord {
  id: string;
  word: string;
  created_at: string;
  updated_at: string;
  
  // Morpheme breakdown
  morpheme_breakdown: {
    prefix?: {
      text: string;
      meaning: string;
      origin?: string;
    };
    root: {
      text: string;
      meaning: string;
      origin?: string;
    };
    suffix?: {
      text: string;
      meaning: string;
      origin?: string;
    };
  };
  
  // Etymology details
  etymology: {
    historical_origins?: string;
    language_of_origin?: string;
    word_evolution?: string;
    cultural_variations?: string;
  };
  
  // Definitions structure
  definitions: {
    primary?: string;
    standard?: string[];
    extended?: string[];
    contextual?: string[];
    specialized?: string[];
  };
  
  // Word forms and inflections
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
  
  // Analysis of the word - UNIFIED INTERFACE
  analysis: {
    parts_of_speech?: string;
    usage_examples?: string[];
    synonyms?: string[];
    antonyms?: string[];
    collocations?: string[]; // UNIFIED: Always use 'collocations', not 'common_collocations'
    cultural_significance?: string;
    example_sentence?: string;
  };
  
  // Additional metadata
  source_apis?: string[];
  frequency_score?: number;
  difficulty_level?: string;
}

// Conversion utilities for backward compatibility
export class WordTypeConverter {
  static toUnifiedWord(source: any): UnifiedWord {
    return {
      id: source.id,
      word: source.word,
      created_at: source.created_at,
      updated_at: source.updated_at,
      morpheme_breakdown: source.morpheme_breakdown || {
        root: { text: source.word, meaning: 'Root meaning to be analyzed' }
      },
      etymology: source.etymology || {},
      definitions: {
        primary: source.definitions?.primary,
        standard: source.definitions?.standard || [],
        extended: source.definitions?.extended || [],
        contextual: Array.isArray(source.definitions?.contextual) ? 
          source.definitions.contextual : 
          (source.definitions?.contextual ? [source.definitions.contextual] : []),
        specialized: Array.isArray(source.definitions?.specialized) ?
          source.definitions.specialized :
          (source.definitions?.specialized ? [source.definitions.specialized] : [])
      },
      word_forms: {
        base_form: source.word_forms?.base_form || source.word,
        verb_tenses: source.word_forms?.verb_tenses || {},
        noun_forms: source.word_forms?.noun_forms || {},
        adjective_forms: source.word_forms?.adjective_forms || {},
        adverb_form: source.word_forms?.adverb_form || '',
        other_inflections: Array.isArray(source.word_forms?.other_inflections) ?
          source.word_forms.other_inflections :
          (source.word_forms?.other_inflections ? [source.word_forms.other_inflections] : [])
      },
      analysis: {
        parts_of_speech: source.analysis?.parts_of_speech || '',
        usage_examples: source.analysis?.usage_examples || [],
        synonyms: source.analysis?.synonyms || [],
        antonyms: source.analysis?.antonyms || [],
        // Handle both 'collocations' and 'common_collocations' properties
        collocations: source.analysis?.collocations || 
          (Array.isArray(source.analysis?.common_collocations) ?
            source.analysis.common_collocations :
            (typeof source.analysis?.common_collocations === 'string' ? 
              source.analysis.common_collocations.split(',').map((s: string) => s.trim()) : 
              [])),
        cultural_significance: source.analysis?.cultural_significance || '',
        example_sentence: source.analysis?.example_sentence || source.analysis?.example || ''
      },
      source_apis: source.source_apis || ['word_profiles'],
      frequency_score: source.frequency_score || 0,
      difficulty_level: source.difficulty_level || 'medium'
    };
  }
}
