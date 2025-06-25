
// Unified Word Type - Single Source of Truth
// This consolidates all overlapping word interfaces into one consistent system

export interface Word {
  id: string;
  word: string;
  created_at: string;
  updated_at: string;
  
  // Core properties
  partOfSpeech: string;
  description: string;
  languageOrigin: string;
  pronunciation?: string;
  featured?: boolean;
  
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
  
  // Legacy compatibility
  morphemeBreakdown: {
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
    origin?: string;
    evolution?: string;
    culturalVariations?: string;
  };
  
  // Definitions structure
  definitions: {
    primary: string;
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
  
  // Analysis - unified collocations property
  analysis: {
    parts_of_speech?: string;
    usage_examples?: string[];
    synonyms?: string[];
    antonyms?: string[];
    collocations?: string[]; // Unified property name
    cultural_significance?: string;
    example_sentence?: string;
    example?: string;
  };
  
  // Enhanced compatibility
  synonymsAntonyms: {
    synonyms: string[];
    antonyms: string[];
  };
  
  usage: {
    commonCollocations?: string[];
    contextualUsage?: string;
    sentenceStructure?: string;
    exampleSentence?: string;
  };
  
  forms: {
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  };
  
  // Repository compatibility
  source_apis: string[];
  frequency_score: number;
  difficulty_level: string;
  
  // Image support
  images?: Array<{
    url: string;
    alt: string;
  }>;
}

// Dictionary API compatibility
export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
  }>;
  origin?: string;
}

// Conversion utilities
export class WordConverter {
  static toWord(source: any): Word {
    const primaryDefinition = source.definitions?.primary || source.description || 'No definition available';
    const synonyms = source.analysis?.synonyms || source.synonymsAntonyms?.synonyms || [];
    const antonyms = source.analysis?.antonyms || source.synonymsAntonyms?.antonyms || [];
    
    // Handle collocations from various sources
    let collocations: string[] = [];
    if (Array.isArray(source.analysis?.collocations)) {
      collocations = source.analysis.collocations;
    } else if (Array.isArray(source.analysis?.common_collocations)) {
      collocations = source.analysis.common_collocations;
    } else if (typeof source.analysis?.common_collocations === 'string') {
      collocations = source.analysis.common_collocations.split(',').map((s: string) => s.trim());
    } else if (Array.isArray(source.usage?.commonCollocations)) {
      collocations = source.usage.commonCollocations;
    }
    
    return {
      id: source.id || crypto.randomUUID(),
      word: source.word,
      created_at: source.created_at || new Date().toISOString(),
      updated_at: source.updated_at || new Date().toISOString(),
      partOfSpeech: source.analysis?.parts_of_speech || source.partOfSpeech || 'unknown',
      description: primaryDefinition,
      languageOrigin: source.etymology?.language_of_origin || source.languageOrigin || 'Unknown',
      pronunciation: source.pronunciation,
      featured: source.featured || false,
      morpheme_breakdown: source.morpheme_breakdown || {
        root: { text: source.word, meaning: 'Root meaning to be analyzed' }
      },
      morphemeBreakdown: source.morpheme_breakdown || source.morphemeBreakdown || {
        root: { text: source.word, meaning: 'Root meaning to be analyzed' }
      },
      etymology: {
        historical_origins: source.etymology?.historical_origins || source.etymology?.origin,
        language_of_origin: source.etymology?.language_of_origin || source.languageOrigin,
        word_evolution: source.etymology?.word_evolution || source.etymology?.evolution,
        cultural_variations: source.etymology?.cultural_variations || source.etymology?.culturalVariations,
        origin: source.etymology?.origin,
        evolution: source.etymology?.evolution,
        culturalVariations: source.etymology?.culturalVariations
      },
      definitions: {
        primary: primaryDefinition,
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
        parts_of_speech: source.analysis?.parts_of_speech || source.partOfSpeech || '',
        usage_examples: source.analysis?.usage_examples || [],
        synonyms: synonyms,
        antonyms: antonyms,
        collocations: collocations,
        cultural_significance: source.analysis?.cultural_significance || '',
        example_sentence: source.analysis?.example_sentence || source.analysis?.example || '',
        example: source.analysis?.example
      },
      synonymsAntonyms: {
        synonyms: synonyms,
        antonyms: antonyms
      },
      usage: {
        commonCollocations: collocations,
        contextualUsage: source.usage?.contextualUsage || source.analysis?.contextual_usage,
        sentenceStructure: source.usage?.sentenceStructure || source.analysis?.sentence_structure,
        exampleSentence: source.usage?.exampleSentence || source.analysis?.example_sentence || source.analysis?.example
      },
      forms: {
        noun: source.forms?.noun || source.word_forms?.noun_forms?.singular,
        verb: source.forms?.verb || source.word_forms?.verb_tenses?.present,
        adjective: source.forms?.adjective || source.word_forms?.adjective_forms?.positive,
        adverb: source.forms?.adverb || source.word_forms?.adverb_form
      },
      source_apis: source.source_apis || ['word_profiles'],
      frequency_score: source.frequency_score || 0,
      difficulty_level: source.difficulty_level || 'medium',
      images: source.images || []
    };
  }

  static fromDictionaryEntry(entry: DictionaryEntry): Word {
    const primaryMeaning = entry.meanings[0]?.definitions[0];
    const synonyms = primaryMeaning?.synonyms || [];
    const antonyms = primaryMeaning?.antonyms || [];
    
    return {
      id: crypto.randomUUID(),
      word: entry.word,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      partOfSpeech: entry.meanings[0]?.partOfSpeech || 'unknown',
      description: primaryMeaning?.definition || 'No definition available',
      languageOrigin: 'English',
      pronunciation: entry.phonetic,
      featured: false,
      morpheme_breakdown: {
        root: {
          text: entry.word,
          meaning: primaryMeaning?.definition || 'Definition not available'
        }
      },
      morphemeBreakdown: {
        root: {
          text: entry.word,
          meaning: primaryMeaning?.definition || 'Definition not available'
        }
      },
      etymology: {
        historical_origins: entry.origin || 'Etymology not available',
        language_of_origin: 'English',
        origin: entry.origin
      },
      definitions: {
        primary: primaryMeaning?.definition || 'No definition available',
        standard: entry.meanings.slice(0, 3).map(m => 
          m.definitions[0]?.definition || ''
        ).filter(Boolean)
      },
      word_forms: {
        base_form: entry.word
      },
      analysis: {
        parts_of_speech: entry.meanings[0]?.partOfSpeech || 'unknown',
        synonyms: synonyms,
        antonyms: antonyms,
        collocations: [],
        example_sentence: primaryMeaning?.example || 'No example available'
      },
      synonymsAntonyms: {
        synonyms: synonyms,
        antonyms: antonyms
      },
      usage: {
        commonCollocations: [],
        exampleSentence: primaryMeaning?.example || 'No example available'
      },
      forms: {},
      source_apis: ['dictionary_api'],
      frequency_score: 0,
      difficulty_level: 'medium'
    };
  }
}
