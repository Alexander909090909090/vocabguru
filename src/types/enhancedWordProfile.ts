
export interface EnhancedWordProfile {
  id: string;
  word: string;
  created_at: string;
  updated_at: string;
  
  // Basic word information
  pronunciation?: string;
  partOfSpeech: string;
  languageOrigin?: string;
  description: string;
  featured?: boolean;
  
  // Morpheme breakdown with origins
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
  
  // Comprehensive etymology
  etymology: {
    historical_origins?: string;
    language_of_origin?: string;
    word_evolution?: string;
    cultural_regional_variations?: string;
    first_documented_usage?: string;
  };
  
  // Multiple definition types
  definitions: {
    primary?: string;
    standard?: string[];
    extended?: string[];
    contextual?: string[];
    specialized?: string[];
  };
  
  // Complete word forms and inflections
  word_forms: {
    base_form?: string;
    verb_tenses?: {
      present?: string;
      past?: string;
      future?: string;
      present_participle?: string;
      past_participle?: string;
      other?: string;
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
  
  // Comprehensive analysis
  analysis: {
    parts_of_speech?: string;
    tenses_voice_mood?: string;
    articles_determiners?: string;
    sentence_positions?: string;
    sentence_structure?: string;
    contextual_usage?: string;
    synonyms_antonyms?: string;
    common_collocations?: string[];
    cultural_historical_significance?: string;
    example?: string;
  };
  
  // Additional fields for compatibility
  images?: Array<{
    url: string;
    alt: string;
  }>;
  
  // Derived from analysis for compatibility
  synonymsAntonyms: {
    synonyms?: string[];
    antonyms?: string[];
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
}
