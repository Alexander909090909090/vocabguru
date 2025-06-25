
export interface WordProfile {
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
    };
    suffix?: {
      text: string;
      meaning: string;
      origin?: string;
    };
    phonetic?: string;
  };
  
  // Etymology details
  etymology: {
    historical_origins?: string;
    language_of_origin?: string;
    word_evolution?: string;
    cultural_regional_variations?: string;
  };
  
  // Definitions structure
  definitions: {
    primary?: string;
    standard?: string[];
    extended?: string[];
    contextual?: string;
    specialized?: string;
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
    other_inflections?: string;
  };
  
  // Analysis of the word - updated to include arrays for synonyms, antonyms, etc.
  analysis: {
    parts_of_speech?: string;
    tenses_voice_mood?: string;
    articles_determiners?: string;
    sentence_positions?: string;
    sentence_structure?: string;
    contextual_usage?: string;
    synonyms_antonyms?: string;
    common_collocations?: string;
    cultural_historical_significance?: string;
    example?: string;
    // Additional array properties for enrichment
    synonyms?: string[];
    antonyms?: string[];
    usage_examples?: string[];
    collocations?: string[];
  };
}

export interface WebhookLog {
  id: string;
  source: string;
  payload: any;
  processed_at: string;
  status: 'pending' | 'processed' | 'failed';
  error_message?: string;
  word_profile_id?: string;
}

export interface CalvernWebhookPayload {
  word: string;
  morpheme_breakdown: WordProfile['morpheme_breakdown'];
  etymology: WordProfile['etymology'];
  definitions: WordProfile['definitions'];
  word_forms: WordProfile['word_forms'];
  analysis: WordProfile['analysis'];
}
