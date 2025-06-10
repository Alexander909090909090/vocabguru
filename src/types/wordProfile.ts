
export interface WordProfile {
  id: string;
  word: string;
  pronunciation?: string;
  part_of_speech?: string;
  language_origin?: string;
  created_at: string;
  updated_at: string;
  
  // Morpheme breakdown
  prefix_text?: string;
  prefix_meaning?: string;
  root_text: string;
  root_meaning?: string;
  suffix_text?: string;
  suffix_meaning?: string;
  
  // Etymology details
  historical_origin?: string;
  word_evolution?: string;
  cultural_variations?: string;
  
  // Definitions (JSON array)
  definitions: Definition[];
  
  // Word forms
  noun_form?: string;
  verb_form?: string;
  adjective_form?: string;
  adverb_form?: string;
  
  // Usage information
  common_collocations: string[];
  contextual_usage?: string;
  sentence_structure?: string;
  example_sentence?: string;
  
  // Synonyms and antonyms
  synonyms: string[];
  antonyms: string[];
  
  // Additional metadata
  frequency_score: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_featured: boolean;
}

export interface Definition {
  type: 'primary' | 'standard' | 'extended' | 'contextual';
  text: string;
  example?: string;
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

export interface CalvinWebhookPayload {
  word: string;
  morphemes: {
    prefix?: { text: string; meaning: string };
    root: { text: string; meaning: string };
    suffix?: { text: string; meaning: string };
  };
  definitions: Definition[];
  etymology?: {
    origin: string;
    evolution: string;
    cultural_variations?: string;
  };
  forms?: {
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  };
  usage?: {
    collocations: string[];
    contextual_usage: string;
    example_sentence: string;
  };
  synonyms?: string[];
  antonyms?: string[];
  metadata?: {
    frequency_score: number;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    language_origin: string;
    part_of_speech: string;
    pronunciation: string;
  };
}
